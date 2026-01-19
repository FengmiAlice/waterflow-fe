import  { useEffect, useState,useRef } from 'react';
import { Button, Switch, Avatar, Flex, Spin, Space,message,} from 'antd';
import { Bubble,Conversations,Sender,Welcome } from "@ant-design/x";
import { 
  CopyOutlined,
  DeleteOutlined,
  DislikeOutlined,
  EditOutlined,
  LikeOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  ShareAltOutlined,
  EllipsisOutlined
  } from '@ant-design/icons';
import store from '../../store';

const AiAnswer = () => {
    const [inputValue, setInputValue] = useState("");
    const [messageHistory, setMessageHistory] = useState({});
    const [conversations, setConversations] = useState([]);
    const [curConversation, setCurConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deepThink, setDeepThink] = useState(true);


    // 获取store数据
    const { userStore } = store;
    const abortController = useRef(null);
    const listRef = useRef(null);
    const senderRef = useRef(null);
     // 生成默认的会话标签
    const generateDefaultLabel = (userInput) => {
        if (!userInput) return '新对话';
        return userInput.length > 20 
            ? userInput.substring(0, 20) + '...' 
            : userInput;
    };
    // ==================== request 配置 ====================
    // 创建请求实例
    const chatRequest = {
         create: async (data, options = {}) => {
        const response = await fetch('http://waterflow-cloud.cn/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userStore.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: JSON.stringify({
                model: 'Qwen3-8B',
                ...data
            }),
            signal: options.signal
        });
        
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}: ${await response.text()}`);
            error.status = response.status;
            throw error;
        }
        
        return response.json();
    }
    }
   // ==================== 请求处理函数 ====================
    const onRequest = async (userInput) => {
         // 确保 userInput 是字符串
    if (typeof userInput !== 'string') {
      console.error('userInput 不是字符串:', userInput);
      return;
    }
      if (!userInput || loading) return;
   
     // 检查Token是否存在
    if (!userStore.token) {
        message.error('请先登录获取Token');
        return;
      }
    // 如果没有当前会话，创建一个新会话
    if (!curConversation) {
        createNewConversation(userInput);
        return;
    }
    // 创建新的中止控制器
    abortController.current = new AbortController();
    try {
      setLoading(true);
      // 添加用户消息到消息列表
      const userMessage = {
        content: userInput,
        role: 'user',
          timestamp: Date.now(),
        id: Date.now() + '-user'
      };
        const updatedMessages = [...messages, userMessage];
        console.log('updatedMessages---',updatedMessages);
        setMessages(updatedMessages);
         // 更新会话标签（如果这是第一条消息）
            const currentConversation = conversations.find(c => c.key === curConversation);
            if (currentConversation && currentConversation.label === '新对话'||!currentConversation.label) {
                renameConversation(curConversation, generateDefaultLabel(userInput));
            }
      // 添加初始的助手消息（loading状态）
      const initialAssistantMessage = {
        content: '',
        role: 'assistant',
        status: 'loading',
          timestamp: Date.now() + 1,
          id: Date.now() + '-assistant'
      };
      
      setMessages(prev => [...prev, initialAssistantMessage]);
      // 构建请求参数
      const requestData = {
        stream: false,
        messages: updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
      };
      console.log('发起的请求---',requestData)
      // 使用 XRequest 发起请求
        const response = await chatRequest.create(requestData, {
            signal: abortController.current.signal,
        })

        console.log('📥 API 响应:', response);
        let responseData = response;
          // 如果响应有 data 属性
        if (response.data) {
            responseData = response.data;
            console.log('📥 从 response.data 获取数据:', responseData);
        }
      // 如果不是流式响应，直接处理结果
        const assistantResponse = responseData.choices?.[0]?.message?.content || '';
        setMessages(prev => {
          const newMessages = [...prev];
            const lastMsg = newMessages[newMessages.length - 1];
            if (lastMsg && lastMsg.status === 'loading') {
                lastMsg.content = assistantResponse;
                lastMsg.status = 'done';
                 lastMsg.id = Date.now() + '-assistant-done';
            }
            return newMessages;
        });
      
      
    } catch (error) {

      if (error.name === 'AbortError') {
        message.info('请求已取消');
        // 移除loading状态的助手消息
        setMessages(prev => prev.filter(msg => msg.status !== 'loading'));
      } else {
        // 添加错误消息
        const errorMessage = {
          content: error.message || '请求失败，请稍后重试',
          role: 'assistant',
          status: 'error',
            timestamp: Date.now(),
           id: Date.now() + '-error'
        };
        
        setMessages(prev => {
          const newMessages = [...prev];
          // 替换loading消息为错误消息
          newMessages.pop(); // 移除loading消息
          return [...newMessages, errorMessage];
        });
        
        message.error('请求失败，请检查网络连接或稍后重试');
      }
    } finally {
            setLoading(false);
            setInputValue("");
    }
  };
    // ==================== 事件处理 ====================
    const onSubmit = (val) => {
        if (!val || loading) return;
        onRequest(val);
    };
    // ==================== 会话管理 ====================
    const createNewConversation = (userInput = '') => {
        if (typeof userInput !== 'string') { 
             userInput = '';
        }
        if (loading) {
        message.error('正在请求中，请等待请求完成或取消当前请求');
        return;
        }
    
        const now = Date.now().toString();
        const newConversation = {
        key: now,
        label: generateDefaultLabel(userInput),
        group: '今天',
            timestamp: now,
        createTime: new Date().toISOString()
        };
        // 保存当前会话消息
        if (curConversation && messages.length > 0) {
            setMessageHistory(prev => ({
            ...prev,
            [curConversation]: messages
            }));
        }
        setConversations(prev => [newConversation, ...prev]);
        setCurConversation(now);
        setMessages([]);
        // 如果有用户输入，直接发送
        if (userInput) {
            setInputValue(userInput);
            onRequest(userInput);
        }
  };

  const switchConversation = (key) => {
    if (loading) {
      abortController.current?.abort();
    }
    // 保存当前会话的消息到历史记录
    if (curConversation && messages.length > 0) {
        setMessageHistory(prev => ({
                ...prev,
                [curConversation]: messages
            }));
        }
        // 切换到新会话
        setCurConversation(key);
       // 从历史记录中恢复消息
        const historyMessages = messageHistory[key] || [];
        setMessages(historyMessages);
  };
//   删除会话
  const deleteConversation = (key) => {
    const newConversations = conversations.filter(conv => conv.key !== key);
    setConversations(newConversations);
    
    // 更新消息历史
    const newMessageHistory = { ...messageHistory };
    delete newMessageHistory[key];
    setMessageHistory(newMessageHistory);
    
    if (key === curConversation) {
      const newKey = newConversations[0]?.key || null;
        setCurConversation(newKey);
        // 从历史记录恢复消息
    const historyMessages = newMessageHistory[newKey] || [];
    setMessages(historyMessages);
      // 如果没有会话了，创建一个新的
    if (!newKey) {
      createNewConversation();
    }
    }
  };
//   重命名会话
  const renameConversation = (key, newLabel) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.key === key ? { ...conv, label: newLabel } : conv
      )
    );
  };

    // ==================== 消息处理函数 ====================
    // 复制消息
  const copyMessage = (content) => {
    navigator.clipboard.writeText(content)
      .then(() => message.success('已复制到剪贴板'))
      .catch(() => message.error('复制失败'));
  };
    //重新生成
  const regenerateResponse = () => {
    if (messages.length < 2) return;
    
    // 获取最后一条用户消息
    const userMessages =  messages.filter(msg => msg.role === 'user');
      if (userMessages.length > 0) {
         const lastUserMessage = userMessages[userMessages.length - 1];
      onRequest(lastUserMessage.content);
    }
  };
    // ==================== 节点渲染 ====================
    const chatSider = (
        <div className='sider'>
            {/* 🌟 Logo */}
            <div className='logo'>
                <img
                src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                draggable={false}
                alt="logo"
                width={24}
                height={24}
                />
                <span>消息助手</span>
            </div>
              {/* 🌟 添加会话 */}
            <Button
                onClick={()=>createNewConversation()}
                type="link"
                className='addBtn'
                icon={<PlusOutlined />}
            >
                开启新对话
            </Button>
              {/* 🌟 会话管理 */}
            <Conversations
                items={conversations}
                className='conversations'
                activeKey={curConversation}
                onActiveChange={switchConversation}
                groupable
                styles={{ item: { padding: '0 8px' } }}
                menu={(conversation) => ({
                items: [
                    {
                        label: '重命名',
                        key: 'rename',
                        icon: <EditOutlined />,
                        onClick: () => {
                            const newLabel = prompt('请输入新的对话名称:', conversation.label);
                            if (newLabel) {
                            renameConversation(conversation.key, newLabel);
                            }
                        }
                    },
                    {
                    label: '删除',
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => deleteConversation(conversation.key),
                    },
                ],
                })}
            />
            <div className='siderFooter'>
                <Avatar size={24} />
                <Button type="text" icon={<QuestionCircleOutlined />} />
            </div>
        </div>
    );
    const hasMessages = messages && messages.length > 0;
    const chatList = (
        <div className='chatList'>
        {hasMessages? (
            /* 🌟 消息列表 */
                <Bubble.List
                ref={listRef}
                items={messages.map((msg, index) => ({
                        key: msg.id || msg.timestamp,
                        content: msg.content,
                        role: msg.role,
                        classNames: {
                        content: msg.status === 'loading' ? 'loadingMessage' : '',
                        },
                        typing: msg.status === 'loading' ? { 
                        step: 5, 
                        interval: 20, 
                        suffix: <>💗</> 
                        } : false,
                        // 可以根据状态添加额外样式
                        style: msg.status === 'error' ? { 
                        color: '#ff4d4f',
                        backgroundColor: '#fff2f0'
                        } : {}
                }))}
                style={{ 
                        height: '100%', 
                        maxWidth: '700px',
                        margin: '0 auto',
                        padding: '0 16px'
                    }}
                roles={{
                    assistant: {
                        placement: 'start',
                        avatar: ( <Avatar 
                            src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*eco6RrQhxbMAAAAAAAAAAAAADgCCAQ/original"
                            size="small"
                                />),
                        footer:(content) => (
                            <div style={{ display: 'flex' }}>
                            <Button type="text" size="small" icon={<ReloadOutlined />}  onClick={regenerateResponse}/>
                            <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyMessage(content)}/>
                            <Button type="text" size="small" icon={<LikeOutlined />} />
                            <Button type="text" size="small" icon={<DislikeOutlined />} />
                            </div>
                        ),
                        loadingRender: () => <Spin size="small" />,
                    },
                    user: { placement: 'end', avatar: (<Avatar src={userStore.avatar || 'https://example.com/user-avatar.png'} size="small"/>) },
                }}
            />
            ) :null}
        </div>
    );
    // const chatSender = (
    //     <>
    //     <div className='sender-container'>
    //           {/* 当没有消息时显示 Welcome 组件 */}
    //         {!hasMessages && (
    //             <div className='welcome-container'>
    //                 <Space
    //                     className='placeholder'
    //                 >
    //                     <Welcome
    //                         variant="borderless"
    //                         icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
    //                         title="今天有什么可以帮到你"
    //                     />
    //                 </Space>
    //             </div>
    //         )}
    //         <Sender
    //             value={inputValue}
    //             key={curConversation}
    //             ref={senderRef}
    //             className='sender'
    //             onSubmit={() => {
    //                 onSubmit(inputValue);
    //                 setInputValue('');
    //             }}
    //             onChange={setInputValue}
    //             onCancel={() => {
    //                 abortController.current?.abort();
    //                 setLoading(false);
    //             }}
    //             autoSize={{ minRows: 3, maxRows: 6 }}
    //             actions={(_, info) => {
    //             const { SendButton, LoadingButton } = info.components;
    //                 return (
    //                 <Flex justify="space-between" align="center">
    //                     <Flex gap="small" align="center">
    //                         <Switch
    //                             checked={deepThink}
    //                             onChange={(checked) => {
    //                                 setDeepThink(checked);
    //                             }}
    //                                             checkedChildren="深度思考"
    //                                             unCheckedChildren="普通模式"
    //                         />
    //                     </Flex>
    //                     <Flex gap={4}>
    //                         {loading ? <LoadingButton type="default"  onClick={() => abortController.current?.abort()}/> : <SendButton type="primary" />}
    //                     </Flex>
    //                 </Flex>
    //                 );
    //             }}
    //             placeholder="Press Enter to send message"
    //              disabled={loading}
    //         />
    //     </div>
    //     </>
    // );

    const chatContent = (
        <div className='chat-content'>
            {/* 无消息时显示欢迎界面和居中的输入框 */}
            {!hasMessages && (
                <div className='center-content'>
                    <div className='welcome-section'>
                        <Space
                            direction="vertical"
                            size={16}
                            style={{ width: '100%' }}
                            className='placeholder'
                        >
                            <Welcome
                                variant="borderless"
                                icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                                title="今天有什么可以帮到你"
                            />
                        </Space>
                    </div>
                    
                    {/* 居中的输入框 */}
                    <div className='center-sender'>
                        <Sender
                            value={inputValue}
                            key={curConversation + '-center'}
                            ref={senderRef}
                            className='sender-center'
                            onSubmit={() => {
                                onSubmit(inputValue);
                                setInputValue('');
                            }}
                            onChange={setInputValue}
                            onCancel={() => {
                                abortController.current?.abort();
                                setLoading(false);
                                setInputValue("");
                            }}
                            autoSize={{ minRows: 3, maxRows: 6 }}
                            actions={(_, info) => {
                                const { SendButton, LoadingButton } = info.components;
                                return (
                                    <Flex justify="space-between" align="center">
                                        <Flex gap="small" align="center">
                                            <Switch
                                                checked={deepThink}
                                                onChange={(checked) => {
                                                    setDeepThink(checked);
                                                }}
                                                checkedChildren="深度思考"
                                                unCheckedChildren="普通模式"
                                            />
                                        </Flex>
                                        <Flex gap={4}>
                                            {loading ? <LoadingButton type="default" onClick={() => abortController.current?.abort()}/> : <SendButton type="primary" />}
                                        </Flex>
                                    </Flex>
                                );
                            }}
                            placeholder="Press Enter to send message"
                            disabled={loading}
                        />
                    </div>
                </div>
            )}
            
            {/* 有消息时显示消息列表和底部输入框 */}
            {hasMessages && (
                <>
                    <div className='messages-container'>
                        {chatList}
                    </div>
                    
                    {/* 底部输入框 */}
                    <div className='bottom-sender'>
                        <Sender
                            value={inputValue}
                            key={curConversation + '-bottom'}
                            ref={senderRef}
                            className='sender-bottom'
                            onSubmit={() => {
                                onSubmit(inputValue);
                                setInputValue('');
                            }}
                            onChange={setInputValue}
                            onCancel={() => {
                                abortController.current?.abort();
                                setLoading(false);
                                setInputValue("");
                            }}
                            autoSize={{ minRows: 3, maxRows: 6 }}
                            actions={(_, info) => {
                                const { SendButton, LoadingButton } = info.components;
                                return (
                                    <Flex justify="space-between" align="center">
                                        <Flex gap="small" align="center">
                                            <Switch
                                                checked={deepThink}
                                                onChange={(checked) => {
                                                    setDeepThink(checked);
                                                }}
                                                checkedChildren="深度思考"
                                                unCheckedChildren="普通模式"
                                            />
                                        </Flex>
                                        <Flex gap={4}>
                                            {loading ? <LoadingButton type="default" onClick={() => abortController.current?.abort()}/> : <SendButton type="primary" />}
                                        </Flex>
                                    </Flex>
                                );
                            }}
                            placeholder="Press Enter to send message"
                            disabled={loading}
                        />
                    </div>
                </>
            )}
        </div>
    );
    
    useEffect(() => {
            // history mock
        if ( curConversation && messages.length > 0) {
            setMessageHistory((prev) => ({
                ...prev,
                [curConversation]: messages,
            }));
        }
        if (!userStore.token) {
            console.warn('未检测到Token，需要登录');
        }
    }, []);

    // 另一个 useEffect 用于聚焦
    useEffect(() => {
         
            // 当切换会话时，聚焦输入框
            if (senderRef.current) {
                senderRef.current.focus({ cursor: 'end' });
            }
        
    }, []); // 只在 curConversation 变化时聚焦

    useEffect(() => {
        
            // 初始化时创建一个默认对话
            if ( conversations.length === 0 && !curConversation) {
                const defaultKey = Date.now().toString();
                const defaultConversation = {
                    key: defaultKey,
                    label: '新对话',
                    group: '今天',
                    timestamp: defaultKey,
                    createTime: new Date().toISOString()
                };
                setConversations([defaultConversation]);
                setCurConversation(defaultKey);
                setMessages([]);
            }
        
     }, []);
    
    return (
        <div className='layout'>
            {chatSider}
            < div className='chat' >
                  
                    {/* {chatList}
                    {chatSender} */}
                     {chatContent}
            </div>
        </div>
    )
}
export default AiAnswer;
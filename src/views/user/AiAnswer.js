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
// ==================== 自定义打字机效果 Hook ====================
const useTypingEffect = () => {
    const timersRef = useRef(new Map());
    // 清理所有定时器
    const clearAllTimers = () => {
        timersRef.current.forEach(timerId => {
            clearTimeout(timerId);
        });
        timersRef.current.clear();
    };
    // 模拟打字机效果
    const startTypingEffect = (messageId, fullText, onUpdate, onComplete) => {
        // 清理该消息的旧定时器
        if (timersRef.current.has(messageId)) {
            clearTimeout(timersRef.current.get(messageId));
        }
        const typingSpeed = 50; // 毫秒/字符
        let currentIndex = 0;
        let displayedText = '';
        const typeNextChar = () => {
            if (currentIndex >= fullText.length) {
                // 打字完成
                timersRef.current.delete(messageId);
                onComplete && onComplete(fullText);
                return;
            }
            
            displayedText += fullText[currentIndex];
            currentIndex++;
            // 更新内容
            onUpdate && onUpdate(displayedText);
            // 设置下一个字符
            const timerId = setTimeout(typeNextChar, typingSpeed);
            timersRef.current.set(messageId, timerId);
        };
        // 开始打字
        typeNextChar();
        // 返回停止函数
        return () => {
            if (timersRef.current.has(messageId)) {
                clearTimeout(timersRef.current.get(messageId));
                timersRef.current.delete(messageId);
            }
        };
    };
    // 停止特定消息的打字效果
    const stopTypingEffect = (messageId) => {
        if (timersRef.current.has(messageId)) {
            clearTimeout(timersRef.current.get(messageId));
            timersRef.current.delete(messageId);
        }
    };
    // 组件卸载时清理
    useEffect(() => {
        return () => {
            clearAllTimers();
        };
    }, []);
    
    return {
        startTypingEffect,
        stopTypingEffect,
        clearAllTimers
    };
};

const AiAnswer = () => {
    const { startTypingEffect, stopTypingEffect } = useTypingEffect(); // 获取打字效果函数
    const [inputValue, setInputValue] = useState("");
    const [messageHistory, setMessageHistory] = useState({});
    const [conversations, setConversations] = useState([]);
    const [curConversation, setCurConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

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
        // 发送消息
        sendMessageData: async (data, options = {}) => {
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
        },
         // 获取会话列表
        getConversationsData: async (options = {}) => {
            const response = await fetch(`http://waterflow-cloud.cn/v1/chat/conversations`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userStore.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'Qwen3-8B',
                   
                }),
                signal: options.signal
            });
            
            if (!response.ok) {
                const error = new Error(`HTTP ${response.status}: ${await response.text()}`);
                error.status = response.status;
                throw error;
            }
            return response.json();
        },
        // 删除会话
        deleteConversationData: async (data, options = {}) => {
             const response = await fetch(`http://waterflow-cloud.cn/v1/chat/deleteconversations`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userStore.token}`,
                    'Content-Type': 'application/json'
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
        },
        // 更新会话标题
        updateConversationData: async (data, options = {}) => {
            const response = await fetch(`http://waterflow-cloud.cn/v1/chat/conversationsrename`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${userStore.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'Qwen3-8B',
                    ...data
                }),
                signal: options.signal
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${await response.text()}`);
            }
            
            return response.json();
        },
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
            // 添加初始的助手消息（loading状态）
            const assistantMessageId = Date.now() + '-assistant';
            const initialAssistantMessage = {
                content: '',
                role: 'assistant',
                status: 'loading',
                timestamp: Date.now() + 1,
                id: assistantMessageId
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
            // console.log('发起的请求参数---',requestData)
            // 使用 XRequest 发起请求
            const response = await chatRequest.sendMessageData(requestData, {
                signal: abortController.current.signal,
            })
            // 处理非流式响应
            await handleNonStreamResponse(response, assistantMessageId);
        }
        catch (error) {
            handleRequestError(error);
        }
        finally {
            setLoading(false);
            setInputValue("");
        }
    };
    // ==================== 非流式响应处理 ====================
    const handleNonStreamResponse = (data, messageId) => {
        return new Promise((resolve) => {
            let responseData = data;
            if (data.data) {
                responseData = data.data;
            }
            // console.log('📥 非流式 API 响应responseData:', responseData);
            // 提取完整的回复内容
            const fullResponse = responseData.choices?.[0]?.message?.content || '';
            if (!fullResponse) {
                // 如果没有内容，直接完成
                setMessages(prev => prev.map(msg => 
                    msg.id === messageId 
                        ? { ...msg, status: 'done' }
                        : msg
                ));
                resolve();
                return;
            }
             // 开始打字机效果
            const stopTyping = startTypingEffect(
                messageId,
                fullResponse,
                (displayedText) => {
                    // 更新显示的文字
                    setMessages(prev => prev.map(msg => 
                        msg.id === messageId 
                            ? { ...msg, content: displayedText }
                            : msg
                    ));
                },
                (completeText) => {
                    // 打字完成
                    setMessages(prev => prev.map(msg => 
                        msg.id === messageId 
                            ? { ...msg, status: 'done', content: completeText }
                            : msg
                    ));
                    resolve();
                }
            );
            // 保存停止函数以便取消
            abortController.current.typingStopper = stopTyping;
        });
    };
    // ==================== 请求错误处理 ====================
    const handleRequestError = (error) => {
        if (error.name === 'AbortError') {
            message.info('请求已取消');
            // 停止打字机效果
            if (abortController.current.typingStopper) {
                abortController.current.typingStopper();
            }
            // 移除 streaming 状态的消息
            setMessages(prev => prev.filter(msg => 
                msg.status !== 'streaming' && msg.status !== 'loading'
            ));
        } else {
            // 添加错误消息
            const errorMessage = {
                content: error.message || '请求失败，请稍后重试',
                role: 'assistant',
                status: 'error',
                timestamp: Date.now(),
                id: `${Date.now()}-error`
            };
            
            setMessages(prev => {
                const newMessages = [...prev];
                // 替换loading消息为错误消息
                newMessages.pop();
                return [...newMessages, errorMessage];
            });
            message.error(error.message || '请求失败，请检查网络连接或稍后重试');
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
        //    // 从历史记录中恢复消息
        //     const historyMessages = messageHistory[key] || [];
        setMessages([]);
  };
    //   删除会话
    const deleteConversation = async (key) => {
        try {
            await chatRequest.deleteConversationData(key); // 删除本地会话
            const newConversations = conversations.filter(conv => conv.key !== key);
            setConversations(newConversations);
            if (key === curConversation) {
                const newKey = newConversations[0]?.key || null;
                setCurConversation(newKey);
                setMessages([]);
                if (!newKey) {
                    // 没有会话时，清空状态
                    setCurConversation(null);
                    setMessages([]);
                }
                // 更新消息历史
                const newMessageHistory = { ...messageHistory };
                delete newMessageHistory[key];
                setMessageHistory(newMessageHistory);
            }
        } catch (error) {
            console.error('删除会话失败:', error);
        }
    };

    //   重命名会话
    const renameConversation =  (key, newLabel) => {
        // try {
        //     await chatRequest.updateConversationData(key,newLabel); // 更新本地会话
             setConversations(prev => 
                prev.map(conv => 
                    conv.key === key ? { ...conv, label: newLabel } : conv
                )
            )
        // }catch (error) {
        //     console.error('重命名会话失败:', error);
        // }
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
                <div className='leftSider'>
                    <Avatar className='userAvatar' size={24} src={userStore.avatar} />
                    <div className='userName'>{userStore.userInfo.name}</div>
                </div>
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
                        content: msg.status === 'streaming' ? 'streamingMessage' : '',
                        },
                        // 对于 streaming 状态的消息，使用打字机效果
                       typing: msg.status === 'typing' ? { step: 1, interval: 100 } : false,
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
                        footer: (content) => {
                             // 只在消息完成时显示操作按钮
                            const message = messages.find(m => m.content === content);
                            if (message && message.status === 'streaming') {
                                return null;
                            }
                            return (
                                <div style={{ display: 'flex' }}>
                                    <Button type="text" size="small" icon={<ReloadOutlined />}  onClick={regenerateResponse}/>
                                    <Button type="text" size="small" icon={<CopyOutlined />} onClick={() => copyMessage(content)}/>
                                    <Button type="text" size="small" icon={<LikeOutlined />} />
                                    <Button type="text" size="small" icon={<DislikeOutlined />} />
                                </div>
                                )
                        },
                        loadingRender: () => (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Spin size="small" />
                                <span style={{ fontSize: 12, color: '#999' }}>思考中...</span>
                            </div>
                        ),
                    },
                    user: { placement: 'end', avatar: (<Avatar src={userStore.avatar || 'https://example.com/user-avatar.png'} size="small"/>) },
                }}
            />
            ) :null}
        </div>
    );
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
                                title="今天有什么可以帮到你？"
                            />
                        </Space>
                    </div>
                    
                    {/* 居中的输入框 */}
                    <div className='center-sender-container'>
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
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            actions={(_, info) => {
                                const { SendButton, LoadingButton } = info.components;
                                return (
                               
                                        <Flex gap={4}>
                                            {loading ? <LoadingButton type="default" onClick={() => abortController.current?.abort()}/> : <SendButton type="primary" />}
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
                    <div className='bottom-sender-container'>
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
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            actions={(_, info) => {
                                const { SendButton, LoadingButton } = info.components;
                                return (
                               
                                        <Flex gap={4}>
                                            {loading ? <LoadingButton type="default" onClick={() => abortController.current?.abort()}/> : <SendButton type="primary" />}
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
    }, []); 

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
                {chatContent}
            </div>
        </div>
    )
}
export default AiAnswer;
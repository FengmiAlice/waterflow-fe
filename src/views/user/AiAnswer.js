import  { useEffect, useState,useRef,useCallback } from 'react';
import { Button, Avatar, Spin, Space,message,FloatButton,Modal,Input } from 'antd';
import { Bubble, Conversations, Sender, Welcome } from "@ant-design/x";
import { useTypingEffect } from '../../hooks/useTypingEffect';
import { 
    CopyOutlined,
    DeleteOutlined,
    DislikeOutlined,
    EditOutlined,
    LikeOutlined,
    PlusOutlined,
    ReloadOutlined,

  } from '@ant-design/icons';
import store from '../../store';
import {getPromptData,addPrompt} from '../../api/user';
const { TextArea } = Input;
// 自定义防抖 Hook
const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  
  // 更新 callbackRef 当 callback 变化时
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const debouncedFn = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
  
  // 清理函数
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedFn;
};
// 自定义节流throttleHook
const throttle=(func, wait)=> {
  let timeout = null;
  let lastArgs = null;
  let lastThis = null;
  let lastCallTime = 0;

  return function(...args) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;

    if (now - lastCallTime >= wait) {
      // 第一次或超过等待时间，立即执行
      lastCallTime = now;
      func.apply(lastThis, lastArgs);
    } else if (!timeout) {
      // 在等待时间内，设置定时器
      timeout = setTimeout(() => {
        lastCallTime = Date.now();
        timeout = null;
        func.apply(lastThis, lastArgs);
      }, wait - (now - lastCallTime));
    }
  };
}


const AiAnswer = () => {
    const { startTypingEffect, stopTypingEffect } = useTypingEffect(); // 获取打字效果函数
    const [inputValue, setInputValue] = useState("");
    const [conversations, setConversations] = useState([]);
    const [pagination, setPagination] = useState({
        pageNum: 1,
        pageSize: 10,
        total: 0,
        hasMore: true,
        loading: false,
    }); // 添加分页状态
    const [curConversation, setCurConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [siderVisible, setSiderVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);//指示词弹窗状态
    const [promptWords, setPromptWords] = useState('');//指示词
    const [renameModalVisible, setRenameModalVisible] = useState(false); // 重命名弹窗状态
    const [renamingConversation, setRenamingConversation] = useState(null); // 正在重命名的会话
    // 获取store数据
    const { userStore } = store;
    const abortController = useRef(null);
    const listRef = useRef(null);
    const senderRef = useRef(null);
    const observerRef = useRef(null);
    const loadingRef = useRef(false);//添加一个 ref 来跟踪是否正在请求
    const hasMoreRef = useRef(true);
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
        getConversationsData: async (params = {}) => { 
             // 构建查询参数
            const queryParams = new URLSearchParams();
            // 设置分页参数
            if (params.pageNum) {
                queryParams.append('pageNum', params.pageNum);
            }
            if (params.pageSize) {
                queryParams.append('pageSize', params.pageSize);
            }
            const queryString = queryParams.toString();
            const url = queryString ? `http://waterflow-cloud.cn/v1/chat/records/list?${queryString}` : 'http://waterflow-cloud.cn/v1/chat/records/list';
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userStore.token}`,
                    'Content-Type': 'application/json'
                },
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
        // 创建新的中止控制器
        abortController.current = new AbortController();
        const { signal } = abortController.current; // 将中止控制器传递给请求
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
            // console.log('updatedMessages---',updatedMessages);
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
            const response = await chatRequest.sendMessageData(requestData, { signal: signal })
             // 检查是否在请求过程中被取消
            if (signal.aborted) {
                throw new DOMException('请求已被取消', 'AbortError');
            }
            // 处理非流式响应
            await handleNonStreamResponse(response, assistantMessageId);
            setLoading(false);
        }
        catch (error) {
            handleRequestError(error);
            setLoading(false);
        }
        finally {
            setInputValue("");
        }
    };
    // ==================== 非流式响应处理 ====================
    const handleNonStreamResponse = (data, messageId) => {
        return new Promise((resolve) => {
            // 检查是否已被取消
            if (abortController.current?.signal?.aborted) {
                resolve();
                return;
            }
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
            if (abortController.current) {
                abortController.current.typingStopper = stopTyping;
            }
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
     // ==================== 停止生成函数 ====================
    const handleStopGeneration = () => {
        // 停止打字机效果
        if (abortController.current.typingStopper) {
            abortController.current.typingStopper();
            abortController.current.typingStopper = null;
        }
        // 停止 typing effect
        stopTypingEffect();
         // 中止 fetch 请求
        if (abortController.current) {
            abortController.current.abort();
            //  abortController.current = null;
        }
        // 更新消息状态
        setMessages(prev => prev.map(msg => {
            if (msg.status === 'loading' || msg.status === 'streaming') {
                    return { 
                        ...msg, 
                        status: 'stopped', 
                        content: msg.content || '生成已停止' 
                    };
            }
            return msg;
        }));
        setLoading(false);
        setInputValue('');
    };
    // ==================== 会话管理 ====================
    // 根据时间分组
    const getTimeGroup = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp);
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        const nowYear = now.getFullYear();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        if (diffDays === 0) return '今天';
        if (diffDays === 1) return '昨天';
        if (diffDays < 7) return '最近7天';
        if (diffDays < 30) return '最近30天';
        // 超过30天但在同一年内，显示月份
        if (year === nowYear) {
            return `${month}月`;
        } else {
            // 跨年显示年月
            return `${year}年${month}月`;
        }
    };
    // 渲染会话列表
    const loadConverSationList = async (pageNum = 1, append = false) => {
        if (loadingRef.current || (pagination.loading && !append)) {
            return;
        }
        try {
            loadingRef.current = true; // 设置加载状态
            setPagination(prev => ({ ...prev, loading: true }));
            // console.log(`📡 发起请求: pageNum=${pageNum}, pageSize=${pagination.pageSize}`);
            const response = await chatRequest.getConversationsData(
                {   pageNum,
                    pageSize: pagination.pageSize
                }
            );
            // console.log('获取会话列表数据response',response)
            if (response.success === true) {
                const {
                    list = [],
                    total = 0,
                    pageNum: currentPage = 1,
                    pageSize = pagination.pageSize
                } = response.page;
                // 处理空数据情况
                if (!list || list.length === 0) {
                    if (!append && conversations.length === 0) {
                        // 首次加载无数据
                        setConversations([]);
                    }
                    loadingRef.current = false;
                    hasMoreRef.current = false;
                    setPagination(prev => ({
                        ...prev,
                        pageNum:currentPage,
                        total,
                        hasMore: false,
                        loading: false
                    }));
                    return;
                }
                // 转换后端数据格式到前端格式
                const formattedConversations = list.map(conv => {
                const userMessage = conv.messages?.find(msg => msg.role === 'user');
                const label = userMessage 
                    ? (userMessage.content.length > 20 
                        ? userMessage.content.substring(0, 20) + '...' 
                        : userMessage.content)
                        : '新对话';
                    return {
                            key:  conv.recordId,
                            label: label,
                            group: getTimeGroup(conv.create_time),
                            timestamp: conv.create_time || Date.now(),
                            createTime: conv.create_time || new Date().toISOString(),
                            // 保留原始数据，便于后续使用
                            raw: conv
                    }
                });
                // console.log('格式化后的会话列表：', formattedConversations);
                // 如果是追加数据（加载更多），合并数组
                if (append) {
                    setConversations(prev => { 
                         // 防止重复数据：过滤掉已经存在的key
                        const existingKeys = new Set(prev.map(item => item.key));
                        const newItems = formattedConversations.filter(item => !existingKeys.has(item.key));
                         // 如果没有新数据，说明已经加载完了
                        if (newItems.length === 0) {
                            hasMoreRef.current = false;
                        } 
                        return [...prev, ...newItems];
                    });
                } else {
                    // 如果是刷新数据，直接替换
                    setConversations(formattedConversations);
                    // 如果是第一页，默认选择第一个会话
                    if (pageNum === 1 && formattedConversations.length > 0) {
                        setCurConversation(formattedConversations[0].key);
                    }
                }
                // 正确计算hasMore：当前页码 * 每页条数 < 总条数
                 const hasMoreData = (() => {
                    // 如果当前页数据小于pageSize，肯定没有更多了
                    if (list.length < pageSize) {
                        return false;
                    }
                    // 如果当前页码 * 每页条数 >= 总条数，没有更多了
                    if (currentPage * pageSize >= total) {
                        return false;
                    }
                    return true;
                })();
                // 更新 refs
                loadingRef.current = false;
                hasMoreRef.current = hasMoreData;
                // 更新分页信息
                setPagination(prev => ({
                    ...prev,
                    pageNum:currentPage,
                    total,
                    hasMore: hasMoreData,
                    loading: false
                }));
                
                // 如果不是追加加载，清空消息
                if (!append) {
                    setMessages([]);
                } 
            }
            
        }catch(error) {
            message.error('获取会话列表失败', error);
            loadingRef.current = false;
            setPagination(prev => ({ ...prev, loading: false }));
        }
    }
    // 加载更多函数
    const loadMoreConversations = useCallback(throttle(() => {
        //  console.log('开始加载更多，loadingRef:', loadingRef.current, 'hasMoreRef:', hasMoreRef.current);
        if (loadingRef.current || !hasMoreRef.current) {
              console.log('阻止加载: 正在加载中或没有更多数据');
            return;
        }
        const nextPage = pagination.pageNum + 1;
        loadConverSationList(nextPage, true);
    },500), [pagination.pageNum]);
    // 重置分页状态
    const resetPagination = () => {
        loadingRef.current = false;
        hasMoreRef.current = true;
        setPagination(prev => ({
            ...prev,
            pageNum: 1,
            hasMore: true,
            loading: false
        }));
    };
    // 创建会话
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
        setConversations(prev => [newConversation, ...prev]);
        setCurConversation(now);
        setMessages([]);

        // 如果有用户输入，直接发送
        if (userInput) {
            setInputValue(userInput);
            onRequest(userInput);
            resetPagination(); // 重置分页信息
            loadConverSationList(1, false);
        }
    };
    // 切换会话
    const switchConversation = (key) => {
        if (loading) {
            abortController.current?.abort();
        }
         // 从当前会话列表中找到要切换的会话
        const targetConversation = conversations.find(conv => conv.key === key);
        if (targetConversation) {
            // 如果找到了，并且有原始消息数据，则设置消息
            const rawMessages = targetConversation.raw?.messages;
            if (rawMessages) {
                setMessages(rawMessages);
            } else {
                // 如果没有，则清空消息
                setMessages([]);
            }
            // 设置当前会话
            setCurConversation(key);
        } else {
            // 如果没有找到，清空消息并设置当前会话为null
            setMessages([]);
            setCurConversation(null);
        }
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
                resetPagination(); // 重置分页信息
                loadConverSationList(1, false); // 重新加载会话列表
            }
        } catch (error) {
            console.error('删除会话失败:', error);
        }
    };
    // 重命名弹窗会话确认按钮事件
    const handleConversationConfirm = async () => {
        if (renamingConversation && renamingConversation.label.trim()) {
            await chatRequest.updateConversationData(renamingConversation.key, renamingConversation.label.trim());
            setConversations(prev => 
                prev.map(conv => 
                    conv.key === renamingConversation.key 
                        ? { ...conv, label: renamingConversation.label.trim() } 
                        : conv
                )
            );
        }
        setRenameModalVisible(false);
        setRenamingConversation(null);
   }
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
    // ==================== 指示词事件处理 ====================
    // 获取提示词数据
    function getPromptWordsData(){
        getPromptData({}).then((res) => {
            // console.log('提示词数据---',res)
            if (res.data.success === true) {
                setPromptWords(res.data.obj.prompt);
            }
        }).catch((error) => {
            console.log(error)
        })
    }
    // 打开提示词弹窗事件
    const showModal = (e) => {
         e.stopPropagation(); // 阻止事件冒泡
        // 如果有上次输入的内容，则清空
        if (promptWords) {
            setPromptWords('');
        }
        // 打开指示词模态窗
        getPromptWordsData();
        setIsModalOpen(true);
    };
    // 提示词弹窗确认按钮事件
    const handleOk = () => {
        let param = {
            prompt: promptWords,
        }
        addPrompt(param).then((res) => {
            if (res.data.success === true) {
                setIsModalOpen(false);
                  message.success("设置提示词成功");
            }
        }).catch((error)=>{
            console.log(error)
        })
    };
    // 提示词弹窗取消按钮事件
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    // 输入框change事件
    const onTextareaChange = (e) => {
        // console.log('输入的词---',e.target.value);
        setPromptWords( e.target.value)
    }

    // 使用防抖的加载更多函数
    const loadMoreConversationsDebounced = useDebounce(loadMoreConversations, 300);

    useEffect(() => {
        let isMounted = true; 
        if (isMounted) {
                getPromptWordsData();//获取提示词初始化数据
                loadConverSationList(1,false);//获取会话列表
        }
        //检查是否是移动端设备
        const checkIsMobile = () => {
            const mobile = window.innerWidth <= 576;
            setIsMobile(mobile);
            // 如果是桌面端，确保侧边栏可见
            if (!mobile) {
                setSiderVisible(true);
            } else {
                setSiderVisible(false);
            }
        };
        checkIsMobile(); // 初始化时检查一次
        window.addEventListener('resize', checkIsMobile);// 监听窗口大小变化
    
    
        // 使用 setTimeout 确保 DOM 已经渲染
        const setupScrollObserver = () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
            const observer = new IntersectionObserver(
                (entries) => {
                    const [entry] = entries;
                    if (entry.isIntersecting && !loadingRef.current && hasMoreRef.current) {
                        loadMoreConversationsDebounced();
                    }
                },
                {
                    root: null, // 使用视口作为root，监听元素是否进入视口
                    rootMargin: '0px 0px 100px 0px',//提前100px触发
                    threshold: 0.1,//// 当10%的元素可见时触发
                }
            );
            observerRef.current = observer;
        };
        setTimeout(setupScrollObserver(),300);
        return () => {
            isMounted = false;
            window.removeEventListener('resize', checkIsMobile);
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    // ==================== 节点渲染 ====================
    const chatSider = (
        <div className={`chat-sider ${isMobile ? 'mobile' : ''} ${siderVisible ? 'visible' : 'hidden'}`}>
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
                onClick={() => { createNewConversation();if (isMobile) setSiderVisible(false); }}
                type="link"
                className='addBtn'
                icon={<PlusOutlined />}
            >
                开启新对话
            </Button>
            {/* 🌟 会话管理 */}
            <div className="conversations-container">
                <Conversations
                    items={conversations}
                    className='conversations-sider'
                    activeKey={curConversation}
                    onActiveChange={(key) => { switchConversation(key); if (isMobile) setSiderVisible(false); }}
                    groupable
                    styles={{
                        item: { padding: '0 8px' },
                    }}
                    menu={(conversation) => ({
                    items: [
                        {
                            label: '重命名',
                            key: 'rename',
                            icon: <EditOutlined />,
                            onClick: () => {
                                setRenamingConversation(conversation);
                                setRenameModalVisible(true);
                                if (isMobile) setSiderVisible(false);
                            }
                        },
                        {
                            label: '删除',
                            key: 'delete',
                            icon: <DeleteOutlined />,
                            danger: true,
                            onClick: () => { deleteConversation(conversation.key);if (isMobile) setSiderVisible(false); },
                        },
                    ],
                    })}
                />
                {/* 有数据时显示加载更多 */}
                {pagination.hasMore && (
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                        <Button 
                            type="link"
                            loading={pagination.loading}
                            onClick={loadMoreConversations}
                            disabled={loadingRef.current}
                        >
                            {pagination.loading ? <Spin size="small" /> :  '加载更多'}
                        </Button>
                    </div>
                )}
                {/* 无更多数据提示 */}
                {!pagination.hasMore && conversations.length > 0 && (
                    <div className="no-more-data">---已经到底啦---</div>
                )}
                {/* 暂无数据提示 */}
                {!pagination.loading && conversations.length === 0 && (
                    <div className="no-data">暂无会话</div>
                )}
            </div>
            {/* 重命名会话弹窗*/}
            <Modal
                title="重命名会话"
                open={renameModalVisible}
                onOk={handleConversationConfirm}
                onCancel={() => {
                    setRenameModalVisible(false);
                    setRenamingConversation(null);
                }}
            >
                <Input
                    value={renamingConversation?.label || ''}
                    onChange={(e) => setRenamingConversation(prev => 
                        prev ? {...prev, label: e.target.value} : null
                    )}
                    placeholder="请输入"
                    onPressEnter={handleConversationConfirm}
                />
            </Modal>
            <div className='siderFooter'>
                <div className='leftSider'>
                    <Avatar className='userAvatar' size={24} src={userStore.avatar} />
                    <div className='userName'>{userStore.userInfo.name}</div>
                </div>
                <div className='shadowSider' onClick={showModal} title='个性提示语'>
                    <svg t="1769570579134" className="single-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2497" width="16" height="16">
                        <path d="M710.144 375.296l168.448-168.448-61.44-61.44-168.448 168.448 61.44 61.44zM967.68 206.848c0 10.24-3.584 18.944-10.24 26.112L217.088 972.8c-6.656 6.656-16.384 10.752-26.112 10.24-9.728 0.512-18.944-3.584-26.112-10.24L51.2 858.624c-6.656-6.656-10.752-16.384-10.24-26.112 0-10.24 3.584-18.944 10.24-26.112L791.552 66.56c6.656-6.656 16.384-10.752 26.112-10.24 10.24 0 18.944 3.584 26.112 10.24L957.44 180.736c6.656 6.656 10.24 15.36 10.24 26.112zM189.952 97.28l56.32 17.408-56.32 17.408-17.408 56.32-17.408-56.32-56.32-17.408 56.32-17.408 17.408-56.32 17.408 56.32z m201.728 93.184l112.64 34.304-112.64 34.304-34.304 112.64-34.304-112.64-112.64-34.304 112.64-34.304 34.304-112.64 34.304 112.64z m535.04 274.944l56.32 17.408-56.32 17.408-17.408 56.32-17.408-56.32-56.32-17.408 56.32-17.408 17.408-56.32 17.408 56.32zM558.592 97.28l56.32 17.408-56.32 17.408-17.408 56.32-17.408-56.32-56.32-17.408 56.32-17.408 17.408-56.32 17.408 56.32z m0 0" p-id="2498" fill="#0f1115"></path>
                    </svg>
                </div>
                <Modal
                    title="指示词"
                    closable
                    open={isModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    okText='保存'
                >
                    <TextArea
                        showCount
                        value={promptWords}
                        maxLength={1000}
                        onChange={onTextareaChange}
                        placeholder="请输入指示词"
                        style={{ height: 120, resize: 'none' }}
                        styles={{
                        count: {
                            position: 'absolute',
                            bottom: '8px',
                            right: '12px',
                            background: 'transparent',
                            color: 'rgba(0, 0, 0, 0.45)'
                        }
                    }}
                    className="custom-textarea-wrapper"
                        />
                </Modal>
            </div>
        </div>
    );
    // 手机端展开按钮
    const mobileToggleButton = isMobile && !siderVisible && (
        <div className='expandBtn'>
            <div className='mobile-toggle-btn'  onClick={() => setSiderVisible(true)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.2027 4.90036V6.43657H2.79727V4.90036H17.2027Z" fill="currentColor"></path>
                    <path d="M10.9604 13.0635V14.5997H2.79727V13.0635H10.9604Z" fill="currentColor"></path>
                </svg>
            </div>
        </div>
    );
    const hasMessages = messages && messages.length > 0;
    const chatList = (
        <div className='chatList'>
        {hasMessages? (
            /* 🌟 消息列表 */
                <div>
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
                    <FloatButton.BackTop />
                </div>
                
            ) : null}
           
        </div>
        
    );
    const chatContent = (
        <div className='chat-content'>
            {/* 无消息时显示欢迎界面和居中的输入框 */}
             {mobileToggleButton}
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
                            loading={loading}
                            value={inputValue}
                            key={curConversation + '-center'}
                            ref={senderRef}
                            className='sender-center'
                            onSubmit={() => {
                                onSubmit(inputValue);
                                setInputValue('');
                            }}
                            onCancel={handleStopGeneration}
                            onChange={(val)=>setInputValue(val)}
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            placeholder="Press Enter to send message"
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
                            loading={loading}
                            value={inputValue}
                            key={curConversation + '-bottom'}
                            ref={senderRef}
                            className='sender-bottom'
                            onSubmit={() => {
                                onSubmit(inputValue);
                                setInputValue('');
                            }}
                            onCancel={handleStopGeneration}
                            onChange={(val)=>setInputValue(val)}
                            autoSize={{ minRows: 2, maxRows: 4 }}
                            placeholder="Press Enter to send message"
                        />
                    </div>
                </>
            )}
        </div>
    );
    return (
        <div className='chat-layout'>
             {/* 桌面端一直显示侧边栏，手机端根据状态显示 */}
            {(!isMobile || siderVisible) && chatSider}

             {/* 手机端添加遮罩层 */}
            {isMobile && siderVisible && (
                <div className='sider-mask' onClick={() => setSiderVisible(false)} />
            )}

            <section className='chat'>
              {chatContent}
            </section>
        </div>
    )
}
export default AiAnswer;
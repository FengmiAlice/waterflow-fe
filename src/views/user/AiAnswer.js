import  { useEffect, useState,useRef } from 'react';
import { Button, Switch, Avatar, Flex, Spin, Space,message,} from 'antd';
import { Bubble,Conversations,Sender,Welcome,useXAgent,useXChat,XStream } from "@ant-design/x";
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
import dayjs from 'dayjs';
// const DEFAULT_CONVERSATIONS_ITEMS = [
//   {
//     key: 'default-0',
//     label: 'What is Ant Design X?',
//     group: 'Today',
//   },
//   {
//     key: 'default-1',
//     label: 'How to quickly install and import components?',
//     group: 'Today',
//   },
//   {
//     key: 'default-2',
//     label: 'New AGI Hybrid Interface',
//     group: 'Yesterday',
//   },
// ];
const AiAnswer = () => {
    const [inputValue, setInputValue] = useState("");
    const abortController = useRef(null);
    const [messageHistory, setMessageHistory] = useState({});
    const [conversations, setConversations] = useState();
    const [curConversation, setCurConversation] = useState();
    const [activeConversation, setActiveConversation] = useState();
    const [deepThink, setDeepThink] = useState(true);
    const listRef = useRef(null);
    const senderRef=useRef(null);
    // ==================== Runtime ====================
    const [agent] = useXAgent({
        baseURL: 'https://api.x.ant.design/api/llm_siliconflow_deepSeek-r1-distill-1wen-7b',
        model: 'qwen3',
        stream: false
    });
    const loading = agent.isRequesting();
    const { onRequest, messages, setMessages } = useXChat({
        agent,
        requestFallback: (_, { error }) => {
        if (error.name === 'AbortError') {
            return {
            content: 'Request is aborted',
            role: 'assistant',
            };
        }
        return {
            content: 'Request failed, please try again!',
            role: 'assistant',
        };
        },
        transformMessage: (info) => {
        const { originMessage, chunk } = info || {};
        let currentContent = '';
        let currentThink = '';
        try {
            if (chunk?.data && !chunk?.data.includes('DONE')) {
            const message = JSON.parse(chunk?.data);
            currentThink = message?.choices?.[0]?.delta?.reasoning_content || '';
            currentContent = message?.choices?.[0]?.delta?.content || '';
            }
        } catch (error) {
            console.error(error);
        }

        let content = '';

        if (!originMessage?.content && currentThink) {
            content = `<think>${currentThink}`;
        } else if (
            originMessage?.content?.includes('<think>') &&
            !originMessage?.content.includes('</think>') &&
            currentContent
        ) {
            content = `${originMessage?.content}</think>${currentContent}`;
        } else {
            content = `${originMessage?.content || ''}${currentThink}${currentContent}`;
        }
        return {
            content: content,
            role: 'assistant',
        };
        },
        resolveAbortController: (controller) => {
        abortController.current = controller;
        },
    });
    // ==================== Event ====================
    const onSubmit = (val) => {
        if (!val) return;

        if (loading) {
        message.error('Request is in progress, please wait for the request to complete.');
        return;
        }

        onRequest({
            stream: true,
            message: { role: 'user', content: val },
        });
    };
     // ==================== Nodes ====================
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
                <span>Ant Design X</span>
            </div>
              {/* 🌟 添加会话 */}
            <Button
                onClick={() => {
                if (agent.isRequesting()) {
                    message.error(
                    'Message is Requesting, you can create a new conversation after request done or abort it right now...',
                    );
                    return;
                }

                const now = dayjs().valueOf().toString();
                setConversations([
                    {
                    key: now,
                    label: `New Conversation ${conversations.length + 1}`,
                    group: 'Today',
                    },
                    ...conversations,
                ]);
                setCurConversation(now);
                setMessages([]);
                }}
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
                onActiveChange={async (val) => {
                    abortController.current?.abort();
                    setCurConversation(val);
                    setMessages(messageHistory?.[val] || []);
                }}
                groupable
                styles={{ item: { padding: '0 8px' } }}
                menu={(conversation) => ({
                items: [
                    {
                    label: 'Rename',
                    key: 'rename',
                    icon: <EditOutlined />,
                    },
                    {
                    label: 'Delete',
                    key: 'delete',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => {
                        const newList = conversations.filter((item) => item.key !== conversation.key);
                        const newKey = newList?.[0]?.key;
                        setConversations(newList);
                        if (conversation.key === curConversation) {
                            setCurConversation(newKey);
                            setMessages(messageHistory?.[newKey] || []);
                        }
                    },
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

    const chatList = (
        <div className='chatList'>
        {messages?.length? (
            /* 🌟 消息列表 */
                <Bubble.List
                ref={listRef}
                items={messages?.map((i) => ({
                    ...i.message, // 消息内容
                        classNames: {
                            content: i.status === 'loading' ?  'loadingMessage'  : '',
                        },
                        typing: i.status === 'loading' ? { step: 5, interval: 20, suffix: <>💗</> } : false,
                }))}
                style={{ height: '100%', paddingInline: 'calc(calc(100% - 700px) /2)' }}
                roles={{
                    assistant: {
                    placement: 'start',
                    footer: (
                        <div style={{ display: 'flex' }}>
                        <Button type="text" size="small" icon={<ReloadOutlined />} />
                        <Button type="text" size="small" icon={<CopyOutlined />} />
                        <Button type="text" size="small" icon={<LikeOutlined />} />
                        <Button type="text" size="small" icon={<DislikeOutlined />} />
                        </div>
                    ),
                    loadingRender: () => <Spin size="small" />,
                    },
                    user: { placement: 'end' },
                }}
            />
        ) : (
            <Space
            direction="vertical"
            size={16}
            style={{ paddingInline: 'calc(calc(100% - 700px) /2)' }}
            className='placeholder'
            >
            <Welcome
                variant="borderless"
                icon="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
                title="Hello, I'm Ant Design X"
                description="Base on Ant Design, AGI product interface solution, create a better intelligent vision~"
                extra={
                <Space>
                    <Button icon={<ShareAltOutlined />} />
                    <Button icon={<EllipsisOutlined />} />
                </Space>
                }
            />
            </Space>
        )}
        </div>
    );

    const chatSender = (
          /* 🌟 输入框 */
        <>
            <Sender
                value={inputValue}
                key={curConversation}
                ref={senderRef}
                className='sender'
                onSubmit={() => {
                    onSubmit(inputValue);
                    setInputValue('');
                }}
                onChange={setInputValue}
                onCancel={() => {
                    abortController.current?.abort();
                }}
                autoSize={{ minRows: 3, maxRows: 6 }}
                actions={(_, info) => {
                const { SendButton, LoadingButton } = info.components;
                    return (
                    <Flex justify="space-between" align="center">
                        <Flex gap="small" align="center">
                            <Switch
                                checked={deepThink}
                                onClick={(checked) => {
                                    setDeepThink(checked);
                                }}
                                                checkedChildren="深度思考"
                                                unCheckedChildren="普通模式"
                            />
                        </Flex>
                        <Flex gap={4}>
                            {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                        </Flex>
                    </Flex>
                    );
                }}
                placeholder="Press Enter to send message"
            />
        </>
    );

    useEffect(() => {
         // history mock
        if (messages?.length) {
            setMessageHistory((prev) => ({
                ...prev,
                [curConversation]: messages,
            }));
        }
    }, [messages, curConversation]);
    // 另一个 useEffect 用于聚焦
    useEffect(() => {
        // 当切换会话时，聚焦输入框
        if (senderRef.current) {
            senderRef.current.focus({cursor: 'end'});
        }
    }, [curConversation]); // 只在 curConversation 变化时聚焦
    return (
        <div className='layout'>
            {chatSider}
        < div className = 'chat' >
                {chatList}
                {chatSender}
            </div>
        </div>
    )
}
export default AiAnswer;
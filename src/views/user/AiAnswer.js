import  { useEffect, useState,useRef } from 'react';
import { Button,  Avatar, Flex, Spin, Space,App as AntdApp,} from 'antd';
import { Bubble,
  Conversations,
  Prompts,
  Sender,
  Welcome,
  useXAgent,
  useXChat,} from "@ant-design/x";
import {   AppstoreAddOutlined,
  CloudUploadOutlined,
  CommentOutlined,
  CopyOutlined,
  DeleteOutlined,
  DislikeOutlined,
  EditOutlined,
  EllipsisOutlined,
  FileSearchOutlined,
  HeartOutlined,
  LikeOutlined,
  PaperClipOutlined,
  PlusOutlined,
  ProductOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  ScheduleOutlined,
  ShareAltOutlined,
  SmileOutlined, } from '@ant-design/icons';

import dayjs from 'dayjs';
//  const { useToken } = theme; // 获取主题色
// const useStyle = () => { // 自定义样式
//     const {token} =useToken();
//     return {
//         layout: css`
//       width: 100%;
//       min-width: 1000px;
//       height: 100vh;
//       display: flex;
//       background: ${token.colorBgContainer};
//       font-family: AlibabaPuHuiTi, ${token.fontFamily}, sans-serif;
//     `,
//         // sider 样式
//         sider: css`
//       background: ${token.colorBgLayout}80;
//       width: 280px;
//       height: 100%;
//       display: flex;
//       flex-direction: column;
//       padding: 0 12px;
//       box-sizing: border-box;
//     `,
//         logo: css`
//       display: flex;
//       align-items: center;
//       justify-content: start;
//       padding: 0 24px;
//       box-sizing: border-box;
//       gap: 8px;
//       margin: 24px 0;

//       span {
//         font-weight: bold;
//         color: ${token.colorText};
//         font-size: 16px;
//       }
//     `,
//         addBtn: css`
//       background: #1677ff0f;
//       border: 1px solid #1677ff34;
//       height: 40px;
//     `,
//         conversations: css`
//       flex: 1;
//       overflow-y: auto;
//       margin-top: 12px;
//       padding: 0;

//       .ant-conversations-list {
//         padding-inline-start: 0;
//       }
//     `,
//         siderFooter: css`
//       border-top: 1px solid ${token.colorBorderSecondary};
//       height: 40px;
//       display: flex;
//       align-items: center;
//       justify-content: space-between;
//     `,
//         // chat list 样式
//         chat: css`
//       height: 100%;
//       width: 100%;
//       box-sizing: border-box;
//       display: flex;
//       flex-direction: column;
//       padding-block: ${token.paddingLG}px;
//       gap: 16px;
//     `,
//         chatPrompt: css`
//       .ant-prompts-label {
//         color: #000000e0 !important;
//       }
//       .ant-prompts-desc {
//         color: #000000a6 !important;
//         width: 100%;
//       }
//       .ant-prompts-icon {
//         color: #000000a6 !important;
//       }
//     `,
//         chatList: css`
//       flex: 1;
//       overflow: auto;
//     `,
//         loadingMessage: css`
//       background-image: linear-gradient(90deg, #ff6b23 0%, #af3cb8 31%, #53b6ff 89%);
//       background-size: 100% 2px;
//       background-repeat: no-repeat;
//       background-position: bottom;
//     `,
//         placeholder: css`
//       padding-top: 32px;
//     `,
//         // sender 样式
//         sender: css`
//       width: 100%;
//       max-width: 700px;
//       margin: 0 auto;
//     `,
//         speechButton: css`
//       font-size: 18px;
//       color: ${token.colorText} !important;
//     `,
//         senderPrompt: css`
//       width: 100%;
//       max-width: 700px;
//       margin: 0 auto;
//       color: ${token.colorText};
//     `,
//     }
// }
const DEFAULT_CONVERSATIONS_ITEMS = [
  {
    key: 'default-0',
    label: 'What is Ant Design X?',
    group: 'Today',
  },
  {
    key: 'default-1',
    label: 'How to quickly install and import components?',
    group: 'Today',
  },
  {
    key: 'default-2',
    label: 'New AGI Hybrid Interface',
    group: 'Yesterday',
  },
];
const AiAnswer = () => {
    // const  styles  = useStyle();
    const { message } = AntdApp.useApp();
    const [inputValue, setInputValue] = useState("");
    const abortController = useRef(null)
    const [messageHistory, setMessageHistory] = useState({})
    const [conversations, setConversations] = useState(DEFAULT_CONVERSATIONS_ITEMS)
    const [curConversation, setCurConversation] = useState(DEFAULT_CONVERSATIONS_ITEMS[0].key)
    const [attachmentsOpen, setAttachmentsOpen] = useState(false);
    // ==================== Runtime ====================
    const [agent] = useXAgent({
        baseURL: 'https://api.x.ant.design/api/llm_siliconflow_deepSeek-r1-distill-1wen-7b',
        model: 'DeepSeek-R1-Distill-Qwen-7B',
        dangerouslyApiKey: 'Bearer sk-xxxxxxxxxxxxxxxxxxxx',
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
                // The abort execution will trigger an asynchronous requestFallback, which may lead to timing issues.
                // In future versions, the sessionId capability will be added to resolve this problem.
                setTimeout(() => {
                    setCurConversation(val);
                    setMessages(messageHistory?.[val] || []);
                }, 100);
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
                        // The delete operation modifies curConversation and triggers onActiveChange, so it needs to be executed with a delay to ensure it overrides correctly at the end.
                        // This feature will be fixed in a future version.
                        setTimeout(() => {
                        if (conversation.key === curConversation) {
                            setCurConversation(newKey);
                            setMessages(messageHistory?.[newKey] || []);
                        }
                        }, 200);
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
        {messages?.length ? (
            /* 🌟 消息列表 */
            <Bubble.List
            items={messages?.map((i) => ({
                ...i.message,
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
        <>
            {/* 🌟 输入框 */}
            <Sender
                value={inputValue}
                onSubmit={() => {
                    onSubmit(inputValue);
                    setInputValue('');
                }}
                onChange={setInputValue}
                onCancel={() => {
                    abortController.current?.abort();
                }}
                prefix={
                    <Button
                        type="text"
                        icon={<PaperClipOutlined style={{ fontSize: 18 }} />}
                        onClick={() => setAttachmentsOpen(!attachmentsOpen)}
                    />
                }
                loading={loading}
                className='sender'
                allowSpeech
                actions={(_, info) => {
                    const { SendButton, LoadingButton, SpeechButton } = info.components;
                    return (
                        <Flex gap={4}>
                            <SpeechButton className='speechButton' />
                            {loading ? <LoadingButton type="default" /> : <SendButton type="primary" />}
                        </Flex>
                    );
                }}
                placeholder="给我发信息吧"
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
    },[messages]);
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
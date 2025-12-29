import {  useState } from 'react';

import { Bubble,Sender } from "@ant-design/x";


const AiAnswer = () => {
    const [value, setValue] = useState("");
    const [loading, setLoading] = useState(false);
    const messages = [
        {
            content: 'Hello, Ant Design X!',
            role: 'user',
        },
    ]
    // React.useEffect(() => {
    //     if (loading) {
    //         const timer = setTimeout(() => {
    //             setLoading(false);
    //             message.success('Send message successfully!');
    //         }, 3000);
    //         return () => clearTimeout(timer);
    //     }
    // },[loading])
    return (
    
            <div>
                <Bubble.List items={messages} />
                <Sender />
            </div> 
    )
}
export default AiAnswer;
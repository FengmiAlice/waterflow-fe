import  { useEffect,useRef } from 'react';
// ==================== 自定义打字机效果 Hook ====================
export function useTypingEffect(){
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
let conversationHistory = "";  // 用于保存动态更新的上下文

document.getElementById('chat-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;  // 不发送空消息

    // 显示用户输入的消息
    addMessage(userInput, 'user');

    // 清空输入框
    document.getElementById('user-input').value = '';

    // 更新上下文，将新的用户输入添加到历史对话中
    conversationHistory += `\nUser: ${userInput}`;  // 记录用户输入

    // 向 Hugging Face API 发送请求进行问答
    const response = await fetch('https://api-inference.huggingface.co/models/deepset/roberta-base-squad2', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer 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`, // 替换为你的 Hugging Face API 密钥
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: {
                "question": userInput,  // 用户输入的文本作为问题
                "context": conversationHistory // 动态更新的上下文
            }
        })
    });

    const data = await response.json();
    
    // 检查 API 是否返回了正确的响应
    if (data && data.answer) {
        // 显示模型的响应
        addMessage(data.answer, 'bot');
        // 将模型的回答添加到上下文
        conversationHistory += `\nBot: ${data.answer}`;  // 记录模型的回答
    } else {
        addMessage("Sorry, something went wrong.", 'bot');
    }
});

function addMessage(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = text;
    document.getElementById('chat-window').appendChild(messageElement);
    
    // 滚动到聊天窗口底部
    const chatWindow = document.getElementById('chat-window');
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

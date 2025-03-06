document.getElementById('chat-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;  // 不发送空消息

    // 显示用户输入的消息
    addMessage(userInput, 'user');

    // 清空输入框
    document.getElementById('user-input').value = '';

    // 向 Hugging Face API 发送请求进行问答
    const response = await fetch('https://api-inference.huggingface.co/models/deepset/roberta-base-squad2', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer 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`, // 替换为你的 Hugging Face API 密钥
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: {
                "question": userInput, // 用户输入的文本作为问题
                "context": "My name is Clara and I live in Berkeley." // 设置一些上下文
            }
        })
    });

    const data = await response.json();
    
    // 检查 API 是否返回了正确的响应
    if (data && data.answer) {
        // 显示模型的响应
        addMessage(data.answer, 'bot');
    } else {
        // 如果没有生成文本，显示错误信息
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

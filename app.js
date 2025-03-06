document.getElementById('chat-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;  // 不发送空消息

    // 显示用户输入的消息
    addMessage(userInput, 'user');

    // 清空输入框
    document.getElementById('user-input').value = '';

    // 向 Hugging Face API 发送请求
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer YOUR_HUGGINGFACE_API_KEY`, // 替换为你的 Hugging Face API 密钥
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: userInput
        })
    });

    const data = await response.json();
    
    // 检查 API 是否返回了正确的响应
    if (data && data[0] && data[0].generated_text) {
        // 显示模型的响应
        addMessage(data[0].generated_text, 'bot');
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

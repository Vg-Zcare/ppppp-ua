document.getElementById('chat-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const userInput = document.getElementById('user-input').value;
    if (!userInput.trim()) return;  // 不发送空消息

    // 显示用户输入的消息
    addMessage(userInput, 'user');

    // 清空输入框
    document.getElementById('user-input').value = '';

    // 向后端发送请求
    const response = await fetch('http://127.0.0.1:8000/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInput })
    });
    const data = await response.json();

    // 显示模型的响应
    addMessage(data.generated_text, 'bot');
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

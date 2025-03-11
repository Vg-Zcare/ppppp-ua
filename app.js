/**
 * app.js
 * 应用程序主入口，负责初始化和组装所有模块
 */

// 主应用模块
const App = (function() {
    // 当前删除操作的模式
    let deleteMode = ''; // 'messages' 或 'conversation'
    let deleteCallback = null;
    
    /**
     * 初始化应用程序
     */
    function init() {
        console.log('正在初始化聊天应用...');
        
        // 1. 检查用户登录状态
        const currentUser = window.Auth.checkUserLogin();
        if (!currentUser) {
            console.log('用户未登录，跳转到登录页面');
            return; // 如果未登录，Auth模块会自动重定向，这里直接返回
        }
        
        console.log(`欢迎回来，${currentUser.nickname || currentUser.username}!`);
        
        // 2. 初始化UI元素引用并绑定事件
        initUIElements();
        
        // 3. 初始化对话模块
        window.Conversation.init(currentUser.username);
        
        // 4. 初始化消息模块
        window.Message.init();
        
        // 5. 设置初始UI布局
        const sidebarElement = document.getElementById('conversations-sidebar');
        window.UI.setInitialLayout(sidebarElement);
        
        // 6. 检查并创建小助手对话，确保默认打开小助手对话
        initializeAssistantChat(currentUser.username);
        
        // 7. 添加页面可见性变化监听，确保在用户切换回页面时对话状态正确
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                // 页面重新变为可见时，确保小助手对话是打开的
                const conversations = window.Conversation.getAllConversations();
                const currentId = window.Conversation.getCurrentConversationId();
                
                // 如果没有当前对话，尝试打开小助手对话
                if (!currentId) {
                    const assistantChat = conversations.find(conv => conv.name === '小助手');
                    if (assistantChat) {
                        const messagesElement = document.getElementById('chat-messages');
                        const sidebarElement = document.getElementById('conversations-sidebar');
                        window.Conversation.switchConversation(
                            assistantChat.id, 
                            messagesElement, 
                            sidebarElement, 
                            window.Message.renderMessage
                        );
                    }
                }
            }
        });
        
        console.log('聊天应用初始化完成');
    }
    
    /**
     * 检查并为新用户创建小助手对话，同时确保默认打开小助手对话
     * @param {String} username 用户名
     */
    function initializeAssistantChat(username) {
        if (!username) return;
        
        // 获取所有对话
        const conversations = window.Conversation.getAllConversations();
        
        // 初始化小助手对话ID
        let assistantId = null;
        
        // 检查是否已存在小助手对话
        const assistantChat = conversations.find(conversation => conversation.name === '小助手');
        const assistantExists = !!assistantChat;
        
        if (assistantExists) {
            // 如果小助手对话已存在，获取其ID
            assistantId = assistantChat.id;
            console.log('找到现有小助手对话，ID:', assistantId);
        } else {
            // 如果小助手对话不存在，创建一个
            console.log('为新用户创建小助手对话...');
            
            // 创建小助手对话
            const assistantData = {
                name: '小助手',
                avatar: window.Utils.getAssistantAvatar(),
                note: '系统小助手，提供帮助和指导'
            };
            
            assistantId = window.Conversation.createNewConversation(assistantData, username);
            
            if (assistantId) {
                console.log('小助手对话创建成功，ID:', assistantId);
                
                // 创建欢迎消息和使用指南
                setTimeout(() => {
                    createWelcomeMessages(username);
                }, 500); // 短暂延迟，确保对话创建完成
            }
        }
        
        // 无论是新创建还是已存在，都确保切换到小助手对话
        if (assistantId) {
            const messagesElement = document.getElementById('chat-messages');
            const sidebarElement = document.getElementById('conversations-sidebar');
            
            // 如果是已存在的小助手对话，直接切换到该对话
            if (assistantExists) {
                setTimeout(() => {
                    window.Conversation.switchConversation(assistantId, messagesElement, sidebarElement, window.Message.renderMessage);
                    console.log('已切换到小助手对话');
                }, 300); // 短暂延迟，确保DOM已完全加载
            }
            // 如果是新创建的小助手对话，createWelcomeMessages函数会自动切换
        }
    }
    
    /**
     * 创建欢迎消息和使用指南
     * @param {String} username 用户名
     */
    function createWelcomeMessages(username) {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // 获取小助手对话
        const conversations = window.Conversation.getAllConversations();
        const assistantChat = conversations.find(conv => conv.name === '小助手');
        
        if (!assistantChat) return;
        
        // 欢迎消息
        const welcomeMessage = {
            id: window.Utils.generateId(),
            text: `👋 你好，${currentUser.nickname || currentUser.username}！\n\n欢迎使用我们的聊天应用！我是你的专属助手，很高兴认识你。我将帮助你了解如何使用这个应用的各项功能。`,
            sender: 'bot',
            timestamp: new Date().toISOString()
        };
        
        // 主要功能介绍
        const featuresMessage = {
            id: window.Utils.generateId(),
            text: `✨ **主要功能介绍**\n\n` +
                 `📱 **多对话管理**\n左侧边栏可以创建和管理多个对话，每个对话都可以有不同的设置和历史记录。\n\n` +
                 `💬 **智能回复**\n系统会根据你的设置，生成智能且个性化的回复。\n\n` +
                 `🔄 **自定义设置**\n每个对话都可以单独设置场景、行为特点等参数。\n\n` +
                 `📝 **消息管理**\n可以轻松删除单条或批量消息。`,
            sender: 'bot',
            timestamp: new Date(Date.now() + 1000).toISOString()
        };
        
        // 使用指南
        const guideMessage = {
            id: window.Utils.generateId(),
            text: `📖 **基本使用指南**\n\n` +
                 `➕ **创建对话**: 点击左上角"+"按钮\n` +
                 `✏️ **发送消息**: 在底部输入框中输入内容，按Enter或点击发送按钮\n` +
                 `🗑️ **删除消息**: 点击右上角"⋮"→"选择消息"→选中要删除的消息→"删除所选"\n` +
                 `🖼️ **更换头像**: 在对话详情中点击"更换头像"\n` +
                 `📱 **移动设备**: 点击侧边栏按钮可展开/收起对话列表`,
            sender: 'bot',
            timestamp: new Date(Date.now() + 2000).toISOString()
        };
        
        // 自定义设置说明
        const settingsMessage = {
            id: window.Utils.generateId(),
            text: `⚙️ **自定义对话设置**\n\n` +
                 `通过左侧的设置面板，你可以个性化每个对话：\n\n` +
                 `🏞️ **场景设置**：例如"咖啡厅"、"办公室"或"公园"\n` +
                 `🧠 **特定行为**：例如"十分钟前在一起吃饭"或"刚刚一起在酒吧喝酒"\n` +
                 `👤 **对方信息**：例如"年龄"、"职业"或者"性格"\n` +
                 `🔧 **自定义参数**：添加任何其他想要的设置\n\n` +
                 `这些设置会根据你的想法和要求进行分析，影响系统生成回复的风格和内容，使对话更有针对性和个性化。注：描述越详细分析越准确。`,
            sender: 'bot',
            timestamp: new Date(Date.now() + 3000).toISOString()
        };
        
        // 快捷提示
        const tipsMessage = {
            id: window.Utils.generateId(),
            text: `💡 **实用小技巧**\n\n` +
                 `⌨️ 按Shift+Enter可以在输入框中换行\n` +
                 `🔄 刷新页面不会丢失对话历史\n` +
                 `📱 移动设备上可横屏获得更好体验\n` +
                 `🔍 长按消息可以复制文本\n` +
                 `⚡ 创建多个对话来区分不同主题`,
            sender: 'bot',
            timestamp: new Date(Date.now() + 4000).toISOString()
        };
        
        // 结束语
        const endingMessage = {
            id: window.Utils.generateId(),
            text: `希望你喜欢这个应用！如果有任何问题，可以随时在这个对话中向我询问。\n\n后续会继续添加实用功能\n\n祝你使用愉快！😊\n\n——你的智能助手`,
            sender: 'bot',
            timestamp: new Date(Date.now() + 5000).toISOString()
        };
        
        // 添加所有消息
        const messages = [welcomeMessage, featuresMessage, guideMessage, settingsMessage, tipsMessage, endingMessage];
        
        // 切换到小助手对话
        const messagesElement = document.getElementById('chat-messages');
        const sidebarElement = document.getElementById('conversations-sidebar');
        window.Conversation.switchConversation(assistantChat.id, messagesElement, sidebarElement, window.Message.renderMessage);
        
        // 依次添加所有消息，模拟打字效果
        messages.forEach((message, index) => {
            setTimeout(() => {
                // 添加消息到对话
                window.Conversation.addMessage(message, username);
                
                // 渲染消息
                if (messagesElement) {
                    window.Message.renderMessage(message, messagesElement);
                    
                    // 保证滚动到最新消息
                    window.UI.adjustChatAreaHeight(messagesElement);
                }
            }, index * 800); // 每条消息间隔800毫秒，产生更自然的打字效果
        });
    }
    
    /**
     * 初始化UI元素引用并绑定事件
     */
    function initUIElements() {
        // 获取DOM元素 - 聊天功能
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        const applySettingsButton = document.getElementById('apply-settings');
        
        // 获取DOM元素 - 对话管理
        const conversationsSidebar = document.getElementById('conversations-sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const newConversationBtn = document.getElementById('new-conversation-btn');
        const newConversationModal = document.getElementById('new-conversation-modal');
        const closeNewConversationModal = document.getElementById('close-new-conversation-modal');
        const createConversationBtn = document.getElementById('create-conversation-btn');
        const cancelCreateBtn = document.getElementById('cancel-create-btn');
        const newConversationName = document.getElementById('new-conversation-name');
        const newAvatarPreview = document.getElementById('new-avatar-preview');
        const selectAvatarBtn = document.getElementById('select-avatar-btn');
        const newAvatarUpload = document.getElementById('new-avatar-upload');
        const newConversationNote = document.getElementById('new-conversation-note');
        
        // 获取DOM元素 - 对话详情
        const conversationDetails = document.getElementById('conversation-details');
        const detailsBackButton = document.getElementById('details-back-button');
        const detailsAvatar = document.getElementById('details-avatar');
        const changeAvatarBtn = document.getElementById('change-avatar-btn');
        const avatarUpload = document.getElementById('avatar-upload');
        const detailsName = document.getElementById('details-name');
        const detailsNote = document.getElementById('details-note');
        const saveDetailsBtn = document.getElementById('save-details-btn');
        const continueChatBtn = document.getElementById('continue-chat-btn');
        const viewDetailsBtn = document.getElementById('view-details-btn');
        const deleteConversationBtn = document.getElementById('delete-conversation-btn');
        
        // 获取DOM元素 - 消息操作
        const messageActionsBtn = document.getElementById('message-actions-btn');
        const messageActionsDropdown = document.getElementById('message-actions-dropdown');
        const selectMessagesBtn = document.getElementById('select-messages-btn');
        const clearAllMessagesBtn = document.getElementById('clear-all-messages-btn');
        const deleteSelectedBtn = document.getElementById('delete-selected-btn');
        const cancelSelectionBtn = document.getElementById('cancel-selection-btn');
        
        // 获取DOM元素 - 确认删除模态框
        const confirmDeleteModal = document.getElementById('confirm-delete-modal');
        const closeConfirmModal = document.getElementById('close-confirm-modal');
        const confirmDeleteMessage = document.getElementById('confirm-delete-message');
        const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
        const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
        
        // 添加事件监听器 - 聊天功能
        sendButton.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keydown', function(e) {
            // 按下回车键发送消息（不按Shift）
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // 阻止默认的换行行为
                handleSendMessage();
            }
        });
        
        applySettingsButton.addEventListener('click', handleUpdateSettings);
        
        // 添加事件监听器 - 对话管理
        sidebarToggle.addEventListener('click', function() {
            window.UI.toggleSidebar(conversationsSidebar);
        });
        newConversationBtn.addEventListener('click', function() {
            window.UI.openModal(newConversationModal);
            if (newConversationName) newConversationName.focus();
            if (newAvatarPreview) newAvatarPreview.src = window.Utils.getRandomDefaultAvatar();
        });
        closeNewConversationModal.addEventListener('click', function() {
            window.UI.closeModal(newConversationModal);
        });
        cancelCreateBtn.addEventListener('click', function() {
            window.UI.closeModal(newConversationModal);
        });
        createConversationBtn.addEventListener('click', handleCreateNewConversation);
        
        // 添加事件监听器 - 对话详情
        viewDetailsBtn.addEventListener('click', function() {
            handleShowConversationDetails(conversationDetails);
        });
        detailsBackButton.addEventListener('click', function() {
            window.UI.hidePanel(conversationDetails);
        });
        saveDetailsBtn.addEventListener('click', handleSaveConversationDetails);
        continueChatBtn.addEventListener('click', function() {
            window.UI.hidePanel(conversationDetails);
        });
        deleteConversationBtn.addEventListener('click', handleConfirmDeleteConversation);
        
        // 添加事件监听器 - 头像上传
        if (selectAvatarBtn && newAvatarUpload) {
            selectAvatarBtn.addEventListener('click', () => newAvatarUpload.click());
            newAvatarUpload.addEventListener('change', handleNewAvatarUpload);
        }
        if (changeAvatarBtn && avatarUpload) {
            changeAvatarBtn.addEventListener('click', () => avatarUpload.click());
            avatarUpload.addEventListener('change', handleAvatarUpload);
        }
        
        // 添加事件监听器 - 消息操作
        if (messageActionsBtn && messageActionsDropdown) {
            messageActionsBtn.addEventListener('click', function(event) {
                window.UI.toggleDropdown(messageActionsDropdown, event);
            });
        }
        document.addEventListener('click', function(event) {
            if (messageActionsBtn && messageActionsDropdown) {
                window.UI.closeDropdownOnClickOutside(messageActionsDropdown, messageActionsBtn, event);
            }
        });
        if (selectMessagesBtn) {
            selectMessagesBtn.addEventListener('click', function() {
                window.Message.enterSelectMode();
            });
        }
        if (clearAllMessagesBtn) {
            clearAllMessagesBtn.addEventListener('click', function() {
                window.Message.confirmClearAllMessages();
            });
        }
        if (cancelSelectionBtn) {
            cancelSelectionBtn.addEventListener('click', function() {
                window.Message.exitSelectMode();
            });
        }
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', function() {
                window.Message.deleteSelectedMessages();
            });
        }
        
        // 添加事件监听器 - 确认删除模态框
        if (closeConfirmModal) {
            closeConfirmModal.addEventListener('click', function() {
                window.UI.closeModal(confirmDeleteModal);
            });
        }
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', function() {
                window.UI.closeModal(confirmDeleteModal);
            });
        }
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', function() {
                executeDelete();
                window.UI.closeModal(confirmDeleteModal);
            });
        }
        
        // 移动端优化 - 窗口大小变化时调整布局
        window.addEventListener('resize', function() {
            const chatMessages = document.getElementById('chat-messages');
            window.UI.handleResize(conversationsSidebar, chatMessages);
        });
        
        // 移动端优化 - 修复iOS输入框问题
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && messageInput) {
            // 修复iOS键盘弹出后的滚动问题
            messageInput.addEventListener('focus', function() {
                setTimeout(function() {
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    window.scrollTo(0, 0);
                }, 300);
            });
        }
    }
    
    /**
     * 处理发送消息
     */
    function handleSendMessage() {
        const messageInput = document.getElementById('message-input');
        if (!messageInput) return;
        
        const messageText = messageInput.value.trim();
        if (messageText === '') return;
        
        // 使用Message模块发送消息
        const messageSent = window.Message.sendMessage(messageText);
        
        if (messageSent) {
            // 发送成功后处理输入框
            window.Message.afterSendMessage(messageInput);
        }
    }
    
    /**
     * 处理更新设置
     */
    function handleUpdateSettings() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // 获取设置表单的值
        const sceneInput = document.getElementById('scene');
        const behaviorInput = document.getElementById('behavior');
        const partnerInfoInput = document.getElementById('partner-info');
        const customSettingInput = document.getElementById('custom-setting');
        
        const settings = {
            scene: sceneInput ? sceneInput.value.trim() : '',
            behavior: behaviorInput ? behaviorInput.value.trim() : '',
            partnerInfo: partnerInfoInput ? partnerInfoInput.value.trim() : '',
            customSetting: customSettingInput ? customSettingInput.value.trim() : ''
        };
        
        // 使用Conversation模块更新设置
        const success = window.Conversation.updateSettings(settings, currentUser.username);
        
        if (success) {
            window.UI.showNotification('设置已更新', 'success');
        } else {
            window.UI.showNotification('更新设置失败', 'error');
        }
    }
    
    /**
     * 处理创建新对话
     */
    function handleCreateNewConversation() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        const newConversationName = document.getElementById('new-conversation-name');
        const newAvatarPreview = document.getElementById('new-avatar-preview');
        const newConversationNote = document.getElementById('new-conversation-note');
        const newConversationModal = document.getElementById('new-conversation-modal');
        
        if (!newConversationName || !newAvatarPreview) return;
        
        const name = newConversationName.value.trim();
        if (!name) {
            window.UI.showNotification('请输入对话名称', 'error');
            return;
        }
        
        // 构建新对话数据
        const conversationData = {
            name: name,
            avatar: newAvatarPreview.src,
            note: newConversationNote ? newConversationNote.value.trim() : ''
        };
        
        // 使用Conversation模块创建新对话
        const newId = window.Conversation.createNewConversation(conversationData, currentUser.username);
        
        if (newId) {
            // 关闭模态框
            window.UI.closeModal(newConversationModal);
            window.UI.showNotification('创建对话成功', 'success');
        } else {
            window.UI.showNotification('创建对话失败', 'error');
        }
    }
    
    /**
     * 处理显示对话详情
     * @param {HTMLElement} detailsPanel 详情面板元素
     */
    function handleShowConversationDetails(detailsPanel) {
        const currentConversationId = window.Conversation.getCurrentConversationId();
        if (!currentConversationId) {
            window.UI.showNotification('请先选择一个对话', 'info');
            return;
        }
        
        const currentConversation = window.Conversation.getCurrentConversation();
        if (!currentConversation) return;
        
        // 填充详情
        const detailsAvatar = document.getElementById('details-avatar');
        const detailsName = document.getElementById('details-name');
        const detailsNote = document.getElementById('details-note');
        
        if (detailsAvatar) detailsAvatar.src = currentConversation.avatar;
        if (detailsName) detailsName.value = currentConversation.name;
        if (detailsNote) detailsNote.value = currentConversation.note || '';
        
        // 显示面板
        window.UI.showPanel(detailsPanel);
    }
    
    /**
     * 处理保存对话详情
     */
    function handleSaveConversationDetails() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        const detailsAvatar = document.getElementById('details-avatar');
        const detailsName = document.getElementById('details-name');
        const detailsNote = document.getElementById('details-note');
        const conversationDetails = document.getElementById('conversation-details');
        
        if (!detailsName || !detailsAvatar) return;
        
        const name = detailsName.value.trim();
        if (!name) {
            window.UI.showNotification('对话名称不能为空', 'error');
            return;
        }
        
        // 构建对话详情数据
        const details = {
            name: name,
            avatar: detailsAvatar.src,
            note: detailsNote ? detailsNote.value : ''
        };
        
        // 使用Conversation模块保存详情
        const success = window.Conversation.saveConversationDetails(details, currentUser.username);
        
        if (success) {
            window.UI.hidePanel(conversationDetails);
            window.UI.showNotification('保存成功', 'success');
        } else {
            window.UI.showNotification('保存失败', 'error');
        }
    }
    
    /**
     * 处理确认删除对话
     */
    function handleConfirmDeleteConversation() {
        // 显示确认对话框
        showConfirmDialog('确定要删除此联系人吗？此操作将删除所有相关信息，且不可恢复。', 'conversation', handleDeleteConversation);
    }
    
    /**
     * 处理删除对话
     */
    function handleDeleteConversation() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // 使用Conversation模块删除当前对话
        const success = window.Conversation.deleteConversation(currentUser.username);
        
        if (success) {
            const conversationDetails = document.getElementById('conversation-details');
            window.UI.hidePanel(conversationDetails);
            window.UI.showNotification('删除成功', 'success');
        } else {
            window.UI.showNotification('删除失败', 'error');
        }
    }
    
    /**
     * 处理新对话头像上传
     * @param {Event} event 文件选择事件
     */
    function handleNewAvatarUpload(event) {
        const newAvatarPreview = document.getElementById('new-avatar-preview');
        if (!newAvatarPreview) return;
        
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                newAvatarPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * 处理对话详情头像上传
     * @param {Event} event 文件选择事件
     */
    function handleAvatarUpload(event) {
        const detailsAvatar = document.getElementById('details-avatar');
        if (!detailsAvatar) return;
        
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                detailsAvatar.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    }
    
    /**
     * 显示确认对话框
     * @param {String} message 确认消息
     * @param {String} mode 删除模式 ('messages' 或 'conversation')
     * @param {Function} callback 确认后的回调函数
     */
    function showConfirmDialog(message, mode, callback) {
        const confirmDeleteModal = document.getElementById('confirm-delete-modal');
        const confirmDeleteMessage = document.getElementById('confirm-delete-message');
        
        if (!confirmDeleteModal || !confirmDeleteMessage) {
            // 如果没有确认对话框元素，直接调用confirm
            if (confirm(message)) {
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
            return;
        }
        
        // 设置确认对话框内容
        confirmDeleteMessage.textContent = message;
        deleteMode = mode;
        deleteCallback = callback;
        
        // 显示确认对话框
        window.UI.openModal(confirmDeleteModal);
    }
    
    /**
     * 执行删除操作
     */
    function executeDelete() {
        if (deleteCallback && typeof deleteCallback === 'function') {
            deleteCallback();
        }
        
        // 重置状态
        deleteMode = '';
        deleteCallback = null;
    }

    /**
     * 重置小助手的所有消息
     * 当修改了欢迎消息内容后可以调用此函数重新生成
     */
    function resetAssistantMessages() {
        const currentUser = window.Auth.getCurrentUser();
        if (!currentUser) return;
        
        // 获取小助手对话
        const conversations = window.Conversation.getAllConversations();
        const assistantChat = conversations.find(conv => conv.name === '小助手');
        
        if (!assistantChat) return;
        
        // 清空小助手对话中的所有消息
        assistantChat.messages = [];
        
        // 保存更新后的对话
        window.Conversation.saveConversations(currentUser.username);
        
        // 重新创建欢迎消息
        createWelcomeMessages(currentUser.username);
        
        console.log('小助手消息已重置');
    }

    // 公开API
    return {
        init,
        showConfirmDialog,
        executeDelete,
        initializeAssistantChat,
        createWelcomeMessages,
        resetAssistantMessages
    };
})();

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 初始化应用
    window.App = App;
    App.init();
}); 
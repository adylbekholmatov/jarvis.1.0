<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JARVIS - Виртуальный Ассистент</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <style>
        .chat-container::-webkit-scrollbar {width: 8px;}
        .chat-container::-webkit-scrollbar-track {background: rgba(0,0,0,0.3); border-radius: 10px;}
        .chat-container::-webkit-scrollbar-thumb {background: #00bcd4; border-radius: 10px;}
        .chat-container::-webkit-scrollbar-thumb:hover {background: #0097a7;}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>J.A.R.V.I.S.</h1>
            <p>Виртуальный ассистент с поддержкой Mistral AI и OpenAI</p>
        </div>
        <div class="main-content">
            <div class="api-section">
                <h2><i class="fas fa-key"></i> Настройка API ключа</h2>
                <div class="provider-selector">
                    <button class="provider-btn active" id="mistralBtn">Mistral AI</button>
                    <button class="provider-btn" id="openaiBtn">OpenAI</button>
                </div>
                <div class="api-input-container">
                    <input type="password" class="api-key-input" id="apiKeyInput" placeholder="Введите ваш Mistral API ключ">
                    <button class="btn" id="saveApiKey">Сохранить</button>
                </div>
                <div class="status" id="apiKeyStatus">API ключ не сохранен</div>
                <div class="instructions">
                    <h3>Как получить Mistral API ключ:</h3>
                    <ol>
                        <li>Перейдите на <a href="https://console.mistral.ai/api-keys/" target="_blank">console.mistral.ai/api-keys</a></li>
                        <li>Войдите в свой аккаунт или создайте новый</li>
                        <li>Нажмите "Create new key"</li>
                        <li>Скопируйте ключ и вставьте в поле выше</li>
                        <li>Нажмите "Сохранить"</li>
                    </ol>
                    <p>Mistral AI предлагает бесплатные запросы для начала работы!</p>
                </div>
            </div>
            <div class="voice-settings">
                <h2><i class="fas fa-robot"></i> Настройки голоса J.A.R.V.I.S.</h2>
                <div class="settings-grid">
                    <div class="settings-label">Голос:</div>
                    <div class="settings-control">
                        <select id="voiceSelect">
                            <option value="">Загрузка голосов...</option>
                        </select>
                    </div>
                    <div class="settings-label">Скорость:</div>
                    <div class="settings-control">
                        <input type="range" id="rateInput" min="0.5" max="2" step="0.1" value="1">
                        <span class="value-display" id="rateValue">1.0</span>
                    </div>
                    <div class="settings-label">Высота тона:</div>
                    <div class="settings-control">
                        <input type="range" id="pitchInput" min="0.5" max="2" step="0.1" value="1">
                        <span class="value-display" id="pitchValue">1.0</span>
                    </div>
                    <div class="settings-label">Громкость:</div>
                    <div class="settings-control">
                        <input type="range" id="volumeInput" min="0" max="1" step="0.1" value="1">
                        <span class="value-display" id="volumeValue">1.0</span>
                    </div>
                </div>
                <button class="btn test-btn" id="testVoiceBtn">Тестировать голос</button>
            </div>
            <div class="voice-section">
                <h2>Голосовое управление</h2>
                <div class="voice-btn" id="voiceButton">
                    <i class="fas fa-microphone"></i>
                </div>
                <div class="voice-status" id="voiceStatus">Нажмите для активации микрофона</div>
                <div class="error" id="voiceError"></div>
            </div>
            <div class="chat-container" id="chatContainer">
                <div class="message jarvis-message">
                    <div class="message-text">Для начала работы сохраните ваш Mistral API ключ.</div>
                </div>
            </div>
        </div>
    </div>
    <script src="app.js"></script>
    <script>
        // Плавный автоскролл вниз при новых сообщениях
        function smoothScrollToBottom(container) {
            container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
        }
        const chatContainer = document.getElementById('chatContainer');
        const observer = new MutationObserver(() => smoothScrollToBottom(chatContainer));
        observer.observe(chatContainer, { childList: true });
        // Дополнение: проверка API ключа после сохранения
        async function validateApiKey(provider, key) {
            try {
                const url = provider === 'mistral' ?
                    'https://api.mistral.ai/v1/models' :
                    'https://api.openai.com/v1/models';
                const res = await fetch(url, {
                    headers: { 'Authorization': `Bearer ${key}` }
                });
                return res.ok;
            } catch (e) {
                return false;
            }
        }
        document.getElementById('saveApiKey').addEventListener('click', async () => {
            const provider = localStorage.getItem('aiProvider') || 'mistral';
            const key = document.getElementById('apiKeyInput').value.trim();
            if (!key) return;
            const valid = await validateApiKey(provider, key);
            if (!valid) {
                document.getElementById('apiKeyStatus').textContent = 'API ключ недействителен!';
                document.getElementById('apiKeyStatus').style.color = '#f44336';
            } else {
                document.getElementById('apiKeyStatus').textContent = 'API ключ подтвержден!';
                document.getElementById('apiKeyStatus').style.color = '#4caf50';
            }
        });
    </script>
</body>
</html>

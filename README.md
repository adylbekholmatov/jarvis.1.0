<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JARVIS - Виртуальный Ассистент с Mistral AI</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>J.A.R.V.I.S.</h1>
            <p>Виртуальный ассистент с поддержкой Mistral AI</p>
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
                <h2><i class="fas fa-voice"></i> Настройки голоса J.A.R.V.I.S.</h2>
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
    script src="app.js">    </script>
</body>
</html>

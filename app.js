const apiKeyInput = document.getElementById('apiKeyInput');
const saveApiKeyButton = document.getElementById('saveApiKey');
const apiKeyStatus = document.getElementById('apiKeyStatus');
const voiceButton = document.getElementById('voiceButton');
const voiceStatus = document.getElementById('voiceStatus');
const voiceError = document.getElementById('voiceError');
const chatContainer = document.getElementById('chatContainer');
const mistralBtn = document.getElementById('mistralBtn');
const openaiBtn = document.getElementById('openaiBtn');
const voiceSelect = document.getElementById('voiceSelect');
const rateInput = document.getElementById('rateInput');
const pitchInput = document.getElementById('pitchInput');
const volumeInput = document.getElementById('volumeInput');
const rateValue = document.getElementById('rateValue');
const pitchValue = document.getElementById('pitchValue');
const volumeValue = document.getElementById('volumeValue');
const testVoiceBtn = document.getElementById('testVoiceBtn');

let apiKey = '';
let recognition = null;
let isListening = false;
let currentProvider = 'mistral';
let synth = window.speechSynthesis || null;
let voices = [];

// Проверка поддержки Web Speech API
function isSpeechSynthesisSupported() {
    return 'speechSynthesis' in window;
}

function isSpeechRecognitionSupported() {
    return ('SpeechRecognition' in window) || ('webkitSpeechRecognition' in window);
}

function loadVoices() {
    if (!isSpeechSynthesisSupported()) {
        voiceSelect.innerHTML = '<option value="">Голосовой синтез не поддерживается</option>';
        return;
    }

    voices = synth.getVoices();
    
    // Если голоса еще не загружены, ждем события
    if (voices.length === 0) {
        voiceSelect.innerHTML = '<option value="">Загрузка голосов...</option>';
        return;
    }

    voiceSelect.innerHTML = '';
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Выберите голос...';
    voiceSelect.appendChild(defaultOption);
    
    // Фильтруем доступные голоса
    const availableVoices = voices.filter(voice => 
        voice.lang.startsWith('ru') || voice.lang.startsWith('en')
    );
    
    availableVoices.sort((a, b) => {
        if (a.lang < b.lang) return -1;
        if (a.lang > b.lang) return 1;
        return a.name.localeCompare(b.name);
    });
    
    availableVoices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        
        // Автовыбор русского голоса если есть
        if (voice.lang.startsWith('ru-RU')) {
            option.selected = true;
        }
        
        voiceSelect.appendChild(option);
    });
    
    loadVoiceSettings();
}

function loadVoiceSettings() {
    const savedVoice = localStorage.getItem('jarvisVoice');
    const savedRate = localStorage.getItem('jarvisRate') || '1';
    const savedPitch = localStorage.getItem('jarvisPitch') || '1';
    const savedVolume = localStorage.getItem('jarvisVolume') || '1';
    
    if (savedVoice && voiceSelect.querySelector(`option[value="${savedVoice}"]`)) {
        voiceSelect.value = savedVoice;
    }
    
    rateInput.value = savedRate;
    rateValue.textContent = savedRate;
    
    pitchInput.value = savedPitch;
    pitchValue.textContent = savedPitch;
    
    volumeInput.value = savedVolume;
    volumeValue.textContent = savedVolume;
}

function saveVoiceSettings() {
    localStorage.setItem('jarvisVoice', voiceSelect.value);
    localStorage.setItem('jarvisRate', rateInput.value);
    localStorage.setItem('jarvisPitch', pitchInput.value);
    localStorage.setItem('jarvisVolume', volumeInput.value);
}

function speakText(text) {
    if (!isSpeechSynthesisSupported()) {
        console.warn('Голосовой синтез не поддерживается');
        return;
    }

    if (synth.speaking) {
        synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voiceSelect.value) {
        const selectedVoice = voices.find(voice => voice.name === voiceSelect.value);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
            utterance.lang = selectedVoice.lang;
        }
    }
    
    utterance.rate = parseFloat(rateInput.value);
    utterance.pitch = parseFloat(pitchInput.value);
    utterance.volume = parseFloat(volumeInput.value);
    
    // Кросс-браузерная обработка ошибок
    utterance.onerror = function(event) {
        console.error('Ошибка воспроизведения:', event.error);
        addMessage('Ошибка воспроизведения голоса. Проверьте настройки браузера.', 'jarvis');
    };
    
    try {
        synth.speak(utterance);
    } catch (error) {
        console.error('Ошибка при воспроизведении:', error);
    }
}

function setupSpeechRecognition() {
    if (!isSpeechRecognitionSupported()) {
        voiceError.textContent = "Ваш браузер не поддерживает распознавание речи. Используйте Chrome, Edge или Safari.";
        voiceButton.style.opacity = "0.5";
        voiceButton.style.cursor = "not-allowed";
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = function() {
        isListening = true;
        voiceButton.classList.add('listening');
        voiceStatus.textContent = "Слушаю...";
        voiceError.textContent = "";
    };
    
    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        addMessage(transcript, 'user');
        processCommand(transcript);
    };
    
    recognition.onerror = function(event) {
        console.error('Ошибка распознавания:', event.error);
        let errorMessage = "Ошибка: ";
        
        switch(event.error) {
            case 'network':
                errorMessage += "проблемы с сетью";
                break;
            case 'not-allowed':
                errorMessage += "микрофон не разрешен. Разрешите доступ к микрофону в настройках браузера";
                break;
            case 'service-not-allowed':
                errorMessage += "сервис распознавания недоступен";
                break;
            default:
                errorMessage += event.error;
        }
        
        voiceError.textContent = errorMessage;
        isListening = false;
        voiceButton.classList.remove('listening');
        voiceStatus.textContent = "Нажмите для активации микрофона";
    };
    
    recognition.onend = function() {
        isListening = false;
        voiceButton.classList.remove('listening');
        voiceStatus.textContent = "Нажмите для активации микрофона";
    };
    
    return recognition;
}

// Обновленные обработчики событий
mistralBtn.addEventListener('click', () => {
    currentProvider = 'mistral';
    mistralBtn.classList.add('active');
    openaiBtn.classList.remove('active');
    apiKeyInput.placeholder = "Введите ваш Mistral API ключ";
    updateInstructions();
});

openaiBtn.addEventListener('click', () => {
    currentProvider = 'openai';
    openaiBtn.classList.add('active');
    mistralBtn.classList.remove('active');
    apiKeyInput.placeholder = "Введите ваш OpenAI API ключ";
    updateInstructions();
});

function updateInstructions() {
    const instructions = document.querySelector('.instructions');
    if (currentProvider === 'mistral') {
        instructions.innerHTML = '<h3>Как получить Mistral API ключ:</h3><ol><li>Перейдите на <a href="https://console.mistral.ai/api-keys/" target="_blank">console.mistral.ai/api-keys</a></li><li>Войдите в свой аккаунт или создайте новый</li><li>Нажмите "Create new key"</li><li>Скопируйте ключ и вставьте в поле выше</li><li>Нажмите "Сохранить"</li></ol><p>Mistral AI предлагает бесплатные запросы для начала работы!</p>';
    } else {
        instructions.innerHTML = '<h3>Как получить OpenAI API ключ:</h3><ol><li>Перейдите на <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a></li><li>Войдите в свой аккаунт OpenAI или создайте новый</li><li>Нажмите "Create new secret key"</li><li>Скопируйте ключ и вставьте в поле выше</li><li>Нажмите "Сохранить"</li></ol>';
    }
}

window.addEventListener('load', () => {
    // Проверяем поддержку API
    if (!isSpeechSynthesisSupported()) {
        voiceSelect.innerHTML = '<option value="">Голосовой синтез не поддерживается</option>';
        voiceSelect.disabled = true;
        testVoiceBtn.disabled = true;
    }

    recognition = setupSpeechRecognition();
    
    // Загружаем сохраненные данные
    const savedApiKey = localStorage.getItem('jarvisApiKey');
    const savedProvider = localStorage.getItem('aiProvider');
    
    if (savedApiKey) {
        apiKey = savedApiKey;
        apiKeyInput.value = savedApiKey;
        apiKeyStatus.textContent = "API ключ загружен";
        apiKeyStatus.style.color = "#4caf50";
        addMessage("API ключ загружен. Готов к работе.", 'jarvis');
    }
    
    if (savedProvider) {
        currentProvider = savedProvider;
        if (currentProvider === 'openai') {
            openaiBtn.click();
        } else {
            mistralBtn.click();
        }
    }
    
    // Загружаем голоса
    if (isSpeechSynthesisSupported()) {
        loadVoices();
        
        // Обработчик для загрузки голосов когда они станут доступны
        if (synth.getVoices().length === 0) {
            synth.addEventListener('voiceschanged', loadVoices);
        }
    }
});

saveApiKeyButton.addEventListener('click', () => {
    apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        localStorage.setItem('jarvisApiKey', apiKey);
        localStorage.setItem('aiProvider', currentProvider);
        apiKeyStatus.textContent = "API ключ сохранен";
        apiKeyStatus.style.color = "#4caf50";
        addMessage(`API ключ успешно сохранен для ${currentProvider === 'mistral' ? 'Mistral AI' : 'OpenAI'}. Теперь вы можете использовать голосовые команды.`, 'jarvis');
    } else {
        apiKeyStatus.textContent = "Введите действительный API ключ";
        apiKeyStatus.style.color = "#f44336";
    }
});

voiceButton.addEventListener('click', () => {
    if (!apiKey) {
        addMessage("Сначала сохраните ваш API ключ.", 'jarvis');
        return;
    }
    
    if (!recognition) {
        addMessage("Распознавание речи не поддерживается в вашем браузере.", 'jarvis');
        return;
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        try {
            recognition.start();
        } catch (error) {
            console.error('Ошибка при запуске распознавания:', error);
            voiceError.textContent = "Ошибка при запуске микрофона";
            addMessage("Ошибка доступа к микрофону. Проверьте разрешения браузера.", 'jarvis');
        }
    }
});

// Обработчики настроек
rateInput.addEventListener('input', () => {
    rateValue.textContent = rateInput.value;
    saveVoiceSettings();
});

pitchInput.addEventListener('input', () => {
    pitchValue.textContent = pitchInput.value;
    saveVoiceSettings();
});

volumeInput.addEventListener('input', () => {
    volumeValue.textContent = volumeInput.value;
    saveVoiceSettings();
});

voiceSelect.addEventListener('change', () => {
    saveVoiceSettings();
});

testVoiceBtn.addEventListener('click', () => {
    if (!isSpeechSynthesisSupported()) {
        addMessage("Голосовой синтез не поддерживается в вашем браузере.", 'jarvis');
        return;
    }
    
    if (!voiceSelect.value) {
        addMessage("Пожалуйста, выберите голос в настройках.", 'jarvis');
        return;
    }
    
    speakText("Добрый день, сэр. Я Джарвис, ваш голосовой помощник. Чем могу быть полезен?");
});

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'jarvis-message');
    
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = text;
    
    messageDiv.appendChild(messageText);
    chatContainer.appendChild(messageDiv);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    if (sender === 'jarvis' && isSpeechSynthesisSupported()) {
        speakText(text);
    }
}

// Функции API остаются без изменений
async function askMistralAI(message) {
    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты JARVIS - голосовой ассистент из вселенной Marvel. Отвечай кратко, официально и по делу, как настоящий помощник Тони Старка. Будь полезным и дружелюбным. Отвечай на русском языке.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Ошибка при запросе к Mistral AI:', error);
        throw error;
    }
}

async function askOpenAI(message) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'Ты JARVIS - голосовой ассистент из вселенной Marvel. Отвечай кратко, официально и по делу, как настоящий помощник Тони Старка. Будь полезным и дружелюбным. Отвечай на русском языке.'
                    },
                    {
                        role: 'user',
                        content: message
                    }
                ],
                max_tokens: 500,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`Ошибка API: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Ошибка при запросе к OpenAI:', error);
        throw error;
    }
}

async function processCommand(command) {
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('привет') || lowerCommand.includes('здравствуй')) {
        const response = "Привет, сэр. Чем могу помочь?";
        addMessage(response, 'jarvis');
        return;
    }
    else if (lowerCommand.includes('время')) {
        const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const response = `Сейчас ${time}`;
        addMessage(response, 'jarvis');
        return;
    }
    else if (lowerCommand.includes('дата')) {
        const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const response = `Сегодня ${date}`;
        addMessage(response, 'jarvis');
        return;
    }
    else if (lowerCommand.includes('открой google')) {
        window.open("https://google.com", "_blank");
        const response = "Открываю Google";
        addMessage(response, 'jarvis');
        return;
    }
    else if (lowerCommand.includes('открой чат')) {
        window.open("https://chat.openai.com", "_blank");
        const response = "Открываю ChatGPT";
        addMessage(response, 'jarvis');
        return;
    }
    else if (lowerCommand.includes('википедия')) {
        const query = command.replace('википедия', '').trim();
        if (query) {
            window.open(`https://ru.wikipedia.org/wiki/${encodeURIComponent(query)}`, "_blank");
            const response = `Ищу "${query}" в Википедии`;
            addMessage(response, 'jarvis');
        } else {
            const response = "Пожалуйста, уточните, что искать в Википедии";
            addMessage(response, 'jarvis');
        }
        return;
    }
    
    addMessage("Думаю...", 'jarvis');
    
    try {
        let response;
        if (currentProvider === 'mistral') {
            response = await askMistralAI(command);
        } else {
            response = await askOpenAI(command);
        }
        
        addMessage(response, 'jarvis');
    } catch (error) {
        console.error('Ошибка при запросе к AI:', error);
        let errorMessage = "Извините, произошла ошибка при обращении к AI. ";
        
        if (error.message.includes('401')) {
            errorMessage += "Неверный API ключ. Пожалуйста, проверьте и введите корректный ключ.";
        } else if (error.message.includes('429')) {
            errorMessage += "Превышен лимит запросов. Попробуйте позже.";
        } else if (error.message.includes('500') || error.message.includes('503')) {
            errorMessage += "Сервер временно недоступен. Попробуйте позже.";
        } else {
            errorMessage += "Проверьте ваш API ключ и подключение к интернету.";
        }
        
        addMessage(errorMessage, 'jarvis');
    }
}

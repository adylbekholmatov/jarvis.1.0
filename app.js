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
let synth = window.speechSynthesis;
let voices = [];
let voicesLoaded = false;

// Проверка валидности API ключа для выбранного провайдера
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

// Проверяем поддержку синтеза речи
if (!synth) {
    console.error('Браузер не поддерживает синтез речи');
    voiceSelect.disabled = true;
    testVoiceBtn.disabled = true;
}

function loadVoices() {
    voices = synth.getVoices();
    voicesLoaded = true;
    
    // Очищаем список только если есть голоса
    if (voices.length > 0) {
        voiceSelect.innerHTML = '';
        
        // Добавляем опцию по умолчанию
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Выберите голос...';
        voiceSelect.appendChild(defaultOption);
        
        // Фильтруем голоса для русского и английского
        const availableVoices = voices.filter(voice => 
            voice.lang.startsWith('ru') || voice.lang.startsWith('en')
        );
        
        // Сортируем голоса
        availableVoices.sort((a, b) => {
            if (a.lang < b.lang) return -1;
            if (a.lang > b.lang) return 1;
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return 0;
        });
        
        // Добавляем голоса в список
        availableVoices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            voiceSelect.appendChild(option);
        });
        
        loadVoiceSettings();
    }
}

function loadVoiceSettings() {
    const savedVoice = localStorage.getItem('arisVoice');
    const savedRate = localStorage.getItem('arisRate');
    const savedPitch = localStorage.getItem('arisPitch');
    const savedVolume = localStorage.getItem('arisVolume');
    
    if (savedVoice && voiceSelect.querySelector(`option[value="${savedVoice}"]`)) {
        voiceSelect.value = savedVoice;
    }
    
    if (savedRate) {
        rateInput.value = savedRate;
        rateValue.textContent = savedRate;
    }
    
    if (savedPitch) {
        pitchInput.value = savedPitch;
        pitchValue.textContent = savedPitch;
    }
    
    if (savedVolume) {
        volumeInput.value = savedVolume;
        volumeValue.textContent = savedVolume;
    }
}

function saveVoiceSettings() {
    localStorage.setItem('arisVoice', voiceSelect.value);
    localStorage.setItem('arisRate', rateInput.value);
    localStorage.setItem('arisPitch', pitchInput.value);
    localStorage.setItem('arisVolume', volumeInput.value);
}

function speakText(text) {
    if (!synth) {
        console.error('Синтез речи не поддерживается');
        return;
    }
    
    if (synth.speaking) {
        synth.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Находим выбранный голос
    if (voiceSelect.value) {
        const selectedVoice = voices.find(voice => voice.name === voiceSelect.value);
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    }
    
    // Устанавливаем параметры
    utterance.rate = parseFloat(rateInput.value);
    utterance.pitch = parseFloat(pitchInput.value);
    utterance.volume = parseFloat(volumeInput.value);
    
    // Обработчики событий для отладки
    utterance.onstart = function() {
        console.log('Начало воспроизведения');
    };
    
    utterance.onend = function() {
        console.log('Конец воспроизведения');
    };
    
    utterance.onerror = function(event) {
        console.error('Ошибка воспроизведения:', event.error);
    };
    
    synth.speak(utterance);
}

// Инициализация голосов
if (synth) {
    // Загружаем голоса сразу, если они уже доступны
    if (synth.getVoices().length > 0) {
        loadVoices();
    }
    
    // Обработчик для загрузки голосов при их готовности
    synth.onvoiceschanged = function() {
        if (!voicesLoaded) {
            loadVoices();
        }
    };
}

// Остальной код остается без изменений...
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

function checkSpeechRecognitionSupport() {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'ru-RU';  // Можно изменить на 'ky-KG' для кыргызского, если поддерживается
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
                case 'no-speech':
                    errorMessage += "Не услышал речи. Говорите громче или повторите.";
                    break;
                case 'not-allowed':
                    errorMessage += "микрофон не разрешен";
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
        
        return true;
    } else {
        voiceError.textContent = "Ваш браузер не поддерживает распознавание речи. Используйте Chrome или Edge.";
        voiceButton.style.opacity = "0.5";
        voiceButton.style.cursor = "not-allowed";
        return false;
    }
}

window.addEventListener('load', () => {
    checkSpeechRecognitionSupport();
    
    const savedApiKey = localStorage.getItem('arisApiKey');
    const savedProvider = localStorage.getItem('aiProvider');
    
    if (savedApiKey) {
        apiKey = savedApiKey;
        apiKeyInput.value = savedApiKey;
        apiKeyStatus.textContent = "API ключ загружен";
        apiKeyStatus.style.color = "#4caf50";
        addMessage("API ключ загружен. Готов к работе.", 'aris');
    }
    
    if (savedProvider) {
        currentProvider = savedProvider;
        if (currentProvider === 'openai') {
            openaiBtn.click();
        } else {
            mistralBtn.click();
        }
    }
    
    // Загружаем голоса с задержкой для обеспечения их доступности
    setTimeout(() => {
        if (synth && !voicesLoaded) {
            loadVoices();
        }
    }, 1000);
});

saveApiKeyButton.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key) {
        apiKeyStatus.textContent = "Введите действительный API ключ";
        apiKeyStatus.style.color = "#f44336";
        return;
    }

    apiKeyStatus.textContent = "Проверка ключа...";
    apiKeyStatus.style.color = "#aed0d0";

    const valid = await validateApiKey(currentProvider, key);
    if (!valid) {
        apiKeyStatus.textContent = 'API ключ недействителен!';
        apiKeyStatus.style.color = '#f44336';
        addMessage('API ключ недействителен. Пожалуйста, проверьте ключ и провайдера.', 'aris');
        return;
    }

    apiKey = key;
    localStorage.setItem('arisApiKey', apiKey);
    localStorage.setItem('aiProvider', currentProvider);
    apiKeyStatus.textContent = "API ключ сохранен";
    apiKeyStatus.style.color = "#4caf50";
    addMessage(`API ключ успешно сохранен для ${currentProvider === 'mistral' ? 'Mistral AI' : 'OpenAI'}. Теперь вы можете использовать голосовые команды.`, 'aris');
});

voiceButton.addEventListener('click', () => {
    if (!apiKey) {
        addMessage("Сначала сохраните ваш API ключ.", 'aris');
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
        }
    }
});

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
    if (!voiceSelect.value) {
        addMessage("Пожалуйста, выберите голос в настройках.", 'aris');
        return;
    }
    speakText("Добрый день. Я ARIS, ваш интеллектуальный голосовой ассистент. Чем могу быть полезен?");
});

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'aris-message');
    
    const messageText = document.createElement('div');
    messageText.classList.add('message-text');
    messageText.textContent = text;
    
    messageDiv.appendChild(messageText);
    chatContainer.appendChild(messageDiv);
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    if (sender === 'aris') {
        speakText(text);
    }
}

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
                        content: 'Ты ARIS - интеллектуальный голосовой ассистент (Audio Recognition Intelligent Support). Ты помогаешь в поиске информации, управлении устройствами, обучении и повседневных задачах. Отвечай кратко, полезно и дружелюбно. Анализируй запросы, давай точные ответы, веди диалог если нужно. Отвечай на русском языке.'
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
                        content: 'Ты ARIS - интеллектуальный голосовой ассистент (Audio Recognition Intelligent Support). Ты помогаешь в поиске информации, управлении устройствами, обучении и повседневных задачах. Отвечай кратко, полезно и дружелюбно. Анализируй запросы, давай точные ответы, веди диалог если нужно. Отвечай на русском языке.'
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
        const response = "Привет! Я ARIS, ваш интеллектуальный ассистент. Чем могу помочь?";
        addMessage(response, 'aris');
        return;
    }
    else if (lowerCommand.includes('время')) {
        const time = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const response = `Сейчас ${time}`;
        addMessage(response, 'aris');
        return;
    }
    else if (lowerCommand.includes('дата')) {
        const date = new Date().toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const response = `Сегодня ${date}`;
        addMessage(response, 'aris');
        return;
    }
    else if (lowerCommand.includes('открой google')) {
        window.open("https://google.com", "_blank");
        const response = "Открываю Google";
        addMessage(response, 'aris');
        return;
    }
    else if (lowerCommand.includes('открой чат')) {
        window.open("https://chat.openai.com", "_blank");
        const response = "Открываю ChatGPT";
        addMessage(response, 'aris');
        return;
    }
    else if (lowerCommand.includes('википедия')) {
        const query = command.replace('википедия', '').trim();
        if (query) {
            window.open(`https://ru.wikipedia.org/wiki/${encodeURIComponent(query)}`, "_blank");
            const response = `Ищу "${query}" в Википедии`;
            addMessage(response, 'aris');
        } else {
            const response = "Пожалуйста, уточните, что искать в Википедии";
            addMessage(response, 'aris');
        }
        return;
    }
    else if (lowerCommand.includes('объясни') || lowerCommand.includes('что такое')) {
        // Добавленная команда для обучения/объяснения тем
        const topic = command.replace(/объясни|что такое/i, '').trim();
        const response = `Объясняю тему "${topic}": ждите ответа от AI.`;
        addMessage(response, 'aris');
        // Передаём в AI для детального объяснения
    }
    
    addMessage("Думаю...", 'aris');
    
    try {
        let response;
        if (currentProvider === 'mistral') {
            response = await askMistralAI(command);
        } else {
            response = await askOpenAI(command);
        }
        
        addMessage(response, 'aris');
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
        
        addMessage(errorMessage, 'aris');
    }
}

// Получаем элементы DOM
const numbersList = document.getElementById('numbers-list');
const clearButton = document.getElementById('clear-button');
const toggleButton = document.getElementById('toggle-button');
const canvas = document.getElementById('numbers-chart');
const ctx = canvas.getContext('2d');

// Устанавливаем размеры канваса
canvas.width = 400;
canvas.height = 300;

// Переменная для отслеживания состояния добавления чисел
let isAddingNumbers = true;

// Функция для рисования графика
function drawChart(numbers) {
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40; // Отступы от краев
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    ctx.clearRect(0, 0, width, height);

    // Настройки графика
    const minValue = 0;
    const maxValue = 10;
    const barWidth = chartWidth / (numbers.length || 1); // Защита от деления на ноль
    const scaleY = chartHeight / (maxValue - minValue);

    // Рисуем оси
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding); // X-ось
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding); // Y-ось
    ctx.stroke();

    // Рисуем сетку и метки
    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    for (let i = minValue; i <= maxValue; i += 2) {
        const y = height - padding - (i - minValue) * scaleY;
        ctx.moveTo(padding - 5, y);
        ctx.lineTo(width - padding + 5, y);
        ctx.fillText(i, padding - 30, y + 5);
    }
    ctx.stroke();

    // Рисуем столбцы
    ctx.fillStyle = '#4CAF50'; // Цвет столбцов
    numbers.forEach((number, index) => {
        const x = padding + index * barWidth;
        const barHeight = number * scaleY;
        const y = height - padding - barHeight;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        ctx.fillStyle = '#000';
        ctx.fillText(number.toFixed(2), x + 2, y - 5);
        ctx.fillStyle = '#4CAF50'; // Вернуть цвет столбцов
    });
}

// Функция для добавления числа в список и график
function addNumberToList(number) {
    const li = document.createElement('p');
    li.textContent = number;
    numbersList.appendChild(li);
}

// Функция для обновления списка чисел и графика
function updateNumbersList() {
    chrome.storage.local.get('numbers', (result) => {
        const numbers = result.numbers || [];
        numbersList.innerHTML = ''; // Очистить список перед добавлением
        drawChart(numbers); // Отрисовать график
        numbers.forEach(addNumberToList);
    });
}

// Функция для обработки нового числа
function handleNewNumber(number) {
    chrome.storage.local.get('numbers', (data) => {
        const numbers = data.numbers || [];
        numbers.push(number);
        chrome.storage.local.set({ numbers }, () => {
            updateNumbersList();
        });
    });
}

// Функция для извлечения числа и обновления списка
function extractAndUpdateNumber() {
    if (!isAddingNumbers) return;

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: () => {
                const element = document.querySelector('.evaluation-bar-score');
                return element ? element.innerText : 'Element not found';
            }
        }, (results) => {
            const result = results[0].result;
            if (result && result !== 'Element not found') {
                const number = extractNumberFromText(result);
                if (number !== null) {
                    handleNewNumber(number);
                }
            }
        });
    });
}

// Начальная загрузка и установка интервала для извлечения чисел
updateNumbersList();
const extractionInterval = setInterval(extractAndUpdateNumber, 5000);

// Обработчик события для кнопки очистки
clearButton.addEventListener('click', () => {
    chrome.storage.local.set({ numbers: [] }, () => {
        updateNumbersList();
    });
});

// Обработчик события для кнопки переключения состояния добавления чисел
toggleButton.addEventListener('click', () => {
    isAddingNumbers = !isAddingNumbers;
    toggleButton.textContent = isAddingNumbers ? 'Stop Adding' : 'Start Adding';
});
const numbersList = document.getElementById('numbers-list');
const clearButton = document.getElementById('clear-button');
const canvas = document.getElementById('numbers-chart');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 300;

function drawChart(numbers) {
    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    ctx.clearRect(0, 0, width, height);

    const minValue = -10;
    const maxValue = 10;
    const barWidth = chartWidth / numbers.length;
    const scaleY = chartHeight / (maxValue - minValue);

    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();

    ctx.strokeStyle = '#ddd';
    ctx.beginPath();
    for (let i = minValue; i <= maxValue; i += 2) {
        const y = height - padding - (i - minValue) * scaleY;
        ctx.moveTo(padding - 5, y);
        ctx.lineTo(width - padding + 5, y);
        ctx.fillText(i, padding - 30, y + 5);
    }
    ctx.stroke();

    ctx.fillStyle = '#4CAF50';
    numbers.forEach((number, index) => {
        const x = padding + index * barWidth;
        const barHeight = number * scaleY;
        const y = height - padding - barHeight;
        ctx.fillRect(x, y, barWidth - 2, barHeight);
        ctx.fillStyle = '#000';
        ctx.fillText(number.toFixed(2), x + 2, y - 5);
        ctx.fillStyle = '#4CAF50';
    });
}

function addNumberToList(number) {
    const li = document.createElement('li');
    li.textContent = number;
    numbersList.appendChild(li);
}

function updateNumbersList() {
    chrome.storage.local.get('numbers', (result) => {
        const numbers = result.numbers || [];
        numbersList.innerHTML = '';
        drawChart(numbers);
        numbers.forEach(addNumberToList);
    });
}

updateNumbersList();

clearButton.addEventListener('click', () => {
    chrome.storage.local.set({ numbers: [] }, () => {
        updateNumbersList();
    });
});

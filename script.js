const preloader = document.getElementById('preloader');
const converterWrapper = document.querySelector('.converter-wrapper');
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const fromFlagImg = document.getElementById('from-flag');
const toFlagImg = document.getElementById('to-flag');
const swapButton = document.getElementById('swap-button');
const resultText = document.getElementById('result-text');
const lastUpdatedText = document.getElementById('last-updated');
const messageBox = document.getElementById('message-box');

const API_URL = 'https://v6.exchangerate-api.com/v6/359d654a3a9fc628df1ef398/latest/';

let conversionRates = {};

const currencies = {
    "USD": "us", "EUR": "eu", "JPY": "jp", "GBP": "gb", "AUD": "au",
    "CAD": "ca", "CHF": "ch", "CNY": "cn", "INR": "in", "BRL": "br",
    "RUB": "ru", "KRW": "kr", "MXN": "mx", "SGD": "sg", "NZD": "nz"
};

function showMessage(message, type = 'error') {
    messageBox.textContent = message;
    messageBox.className = `message-box ${type}`;
    messageBox.setAttribute('role', 'alert');
    messageBox.style.display = 'block';

    setTimeout(() => {
        messageBox.style.display = 'none';
        messageBox.removeAttribute('role');
    }, 5000);
}

function populateCurrencies() {
    for (const currency in currencies) {
        const optionFrom = document.createElement('option');
        optionFrom.value = currency;
        optionFrom.textContent = currency;
        fromCurrencySelect.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = currency;
        optionTo.textContent = currency;
        toCurrencySelect.appendChild(optionTo);
    }
    fromCurrencySelect.value = 'USD';
    toCurrencySelect.value = 'INR';
    updateFlag('from');
    updateFlag('to');
}

function updateFlag(type) {
    const select = type === 'from' ? fromCurrencySelect : toCurrencySelect;
    const img = type === 'from' ? fromFlagImg : toFlagImg;
    const countryCode = currencies[select.value];
    if (countryCode) {
        img.src = `https://flagcdn.com/48x36/${countryCode}.png`;
        img.alt = `${select.value} flag`;
    }
}

async function fetchRates(baseCurrency = 'USD') {
    resultText.style.opacity = '0.5';

    const apiKey = '359d654a3a9fc628df1ef398';
    if (apiKey === '359d654a3a9fc628df1ef398') {
        showMessage("Please add your API key in script.js to fetch live rates.");
        conversionRates = { "USD": 1, "EUR": 0.92, "JPY": 157.5, "GBP": 0.79, "AUD": 1.5, "CAD": 1.37, "CHF": 0.9, "CNY": 7.25, "INR": 83.5, "BRL": 5.4, "RUB": 88.2, "KRW": 1380, "MXN": 18.1, "SGD": 1.35, "NZD": 1.63 };
        lastUpdatedText.textContent = 'Last updated: Using mock data';
        convertCurrency();
        resultText.style.opacity = '1';
        return;
    }

    try {
        const response = await fetch(`${API_URL.replace('YOUR_API_KEY', apiKey)}${baseCurrency}`);
        if (!response.ok) throw new Error('Network response was not ok.');
        const data = await response.json();
        if (data.result === 'error') throw new Error(data['error-type']);
        
        conversionRates = data.conversion_rates;
        const date = new Date(data.time_last_update_unix * 1000);
        lastUpdatedText.textContent = `Last updated: ${date.toLocaleString()}`;
        convertCurrency();
    } catch (error) {
        console.error('Fetch error:', error);
        showMessage(`Failed to fetch rates: ${error.message}`);
        if (Object.keys(conversionRates).length > 0) {
            lastUpdatedText.textContent += ' (using stale data)';
        }
    } finally {
        resultText.style.opacity = '1';
    }
}

function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;

    if (isNaN(amount) || !conversionRates[fromCurrency] || !conversionRates[toCurrency]) {
        resultText.textContent = '...';
        return;
    }

    const rate = conversionRates[toCurrency] / conversionRates[fromCurrency];
    const convertedAmount = (amount * rate).toFixed(4);

    resultText.textContent = `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`;

    resultText.classList.remove('updated');
    void resultText.offsetWidth;
    resultText.classList.add('updated');
}

function handleSwap() {
    const tempCurrency = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = tempCurrency;

    updateFlag('from');
    updateFlag('to');
    convertCurrency();
}

window.addEventListener('load', () => {
    setTimeout(() => {
        preloader.classList.add('loaded');
    }, 3000);
});

document.addEventListener('DOMContentLoaded', () => {
    populateCurrencies();
    fetchRates(fromCurrencySelect.value);
});

amountInput.addEventListener('input', convertCurrency);
fromCurrencySelect.addEventListener('change', () => {
    updateFlag('from');
    fetchRates(fromCurrencySelect.value);
});
toCurrencySelect.addEventListener('change', () => {
    updateFlag('to');
    convertCurrency();
});
swapButton.addEventListener('click', handleSwap);
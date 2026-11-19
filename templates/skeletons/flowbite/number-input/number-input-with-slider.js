// Get the elements
var rangeInput = document.getElementById('price-range-input');
var currencyInput = document.getElementById('currency-input');

// Function to update the currency input
function updateCurrencyInput() {
currencyInput.value = rangeInput.value;
}

// Add event listener to the range input
rangeInput.addEventListener('input', updateCurrencyInput);

const sizeInputs = document.querySelectorAll('input[name="size"]');
const difficultyInputs = document.querySelectorAll('input[name="difficulty"]');
const priceValue = document.querySelector('#priceValue');
const requestQuoteBtn = document.querySelector('#requestQuoteBtn');

function getCheckedValue(inputs) {
  return Array.from(inputs).find((input) => input.checked).value;
}

function updatePrice() {
  const size = getCheckedValue(sizeInputs);
  const difficulty = getCheckedValue(difficultyInputs);
  const price = calculatePrice(size, difficulty);
  priceValue.textContent = `$${price}`;

  if (requestQuoteBtn) {
    const params = new URLSearchParams({ size, difficulty, price });
    requestQuoteBtn.href = `contacto.html?${params.toString()}`;
  }
}

if (sizeInputs.length && difficultyInputs.length && priceValue) {
  sizeInputs.forEach((input) => input.addEventListener('change', updatePrice));
  difficultyInputs.forEach((input) => input.addEventListener('change', updatePrice));
  updatePrice(); // con precios de respaldo, para que se vea algo de entrada
  pricingReady.then(updatePrice); // recalcula con los precios reales de la planilla cuando lleguen
}

// Precios "a partir de" de Office y Move In/Out, mostrados en esta misma pagina
const officePriceDisplay2 = document.querySelector('#officePriceDisplay2');
const moveOutPriceDisplay2 = document.querySelector('#moveOutPriceDisplay2');

function updateOtherPrices() {
  if (officePriceDisplay2) {
    officePriceDisplay2.textContent = `$${PRICING_CONFIG.office_starting}`;
  }
  if (moveOutPriceDisplay2) {
    moveOutPriceDisplay2.textContent = `$${PRICING_CONFIG.moveinout_starting}`;
  }
}

if (officePriceDisplay2 || moveOutPriceDisplay2) {
  updateOtherPrices();
  pricingReady.then(updateOtherPrices);
}

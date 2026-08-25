const sizeSelect = document.querySelector('#size');
const difficultySelect = document.querySelector('#difficulty');
const priceValue = document.querySelector('#priceValue');
const requestQuoteBtn = document.querySelector('#requestQuoteBtn');

function updatePrice() {
  const price = calculatePrice(sizeSelect.value, difficultySelect.value);
  priceValue.textContent = `$${price}`;

  if (requestQuoteBtn) {
    const params = new URLSearchParams({
      size: sizeSelect.value,
      difficulty: difficultySelect.value,
      price,
    });
    requestQuoteBtn.href = `contacto.html?${params.toString()}`;
  }
}

if (sizeSelect && difficultySelect && priceValue) {
  sizeSelect.addEventListener('change', updatePrice);
  difficultySelect.addEventListener('change', updatePrice);
  updatePrice(); // con precios de respaldo, para que se vea algo de entrada
  pricingReady.then(updatePrice); // recalcula con los precios reales de la planilla cuando lleguen
}

const officePriceDisplay = document.querySelector('#officePriceDisplay');
const moveOutPriceDisplay = document.querySelector('#moveOutPriceDisplay');

function updateStartingPrices() {
  if (officePriceDisplay) {
    officePriceDisplay.textContent = `$${PRICING_CONFIG.office_starting}`;
  }
  if (moveOutPriceDisplay) {
    moveOutPriceDisplay.textContent = `$${PRICING_CONFIG.moveinout_starting}`;
  }
}

if (officePriceDisplay || moveOutPriceDisplay) {
  updateStartingPrices(); // con precios de respaldo, para que se vea algo de entrada
  pricingReady.then(updateStartingPrices); // actualiza con los precios reales cuando lleguen
}

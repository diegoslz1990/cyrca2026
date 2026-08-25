const SIZE_LABELS = {
  small: 'Small Home',
  medium: 'Medium Home',
  large: 'Large Home',
};

const DIFFICULTY_LABELS = {
  light: 'Light Maintenance',
  standard: 'Standard Clean',
  deep: 'Deep Clean',
};

const generateInvoiceBtn = document.querySelector('#generateInvoiceBtn');
const printInvoiceBtn = document.querySelector('#printInvoiceBtn');
const invoicePreview = document.querySelector('#invoicePreview');
const serviceDateInput = document.querySelector('#serviceDate');

// La fecha de hoy como valor por defecto, para no tener que escribirla a mano
if (serviceDateInput) {
  serviceDateInput.value = new Date().toISOString().split('T')[0];
}

function getNextInvoiceNumber() {
  const key = 'cyrcaInvoiceCounter';
  const next = parseInt(localStorage.getItem(key) || '0', 10) + 1;
  localStorage.setItem(key, String(next));
  return `INV-${String(next).padStart(4, '0')}`;
}

if (generateInvoiceBtn) {
  generateInvoiceBtn.addEventListener('click', async () => {
    await pricingReady; // asegura que usemos los precios reales de la planilla, si ya llegaron

    const clientNameField = document.querySelector('#clientName');
    const serviceDateField = document.querySelector('#serviceDate');
    const size = document.querySelector('#invoiceSize').value;
    const difficulty = document.querySelector('#invoiceDifficulty').value;
    const notes = document.querySelector('#invoiceNotes').value.trim();

    clearError(clientNameField);
    clearError(serviceDateField);
    let isValid = true;

    if (clientNameField.value.trim() === '') {
      showError(clientNameField, 'Please enter the client name.');
      isValid = false;
    }

    if (serviceDateField.value === '') {
      showError(serviceDateField, 'Please choose a service date.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const total = calculatePrice(size, difficulty);
    const description = `Regular House Cleaning — ${SIZE_LABELS[size]}, ${DIFFICULTY_LABELS[difficulty]}`;

    document.querySelector('#invoiceNumber').textContent = getNextInvoiceNumber();
    document.querySelector('#invoiceDate').textContent = serviceDateField.value;
    document.querySelector('#invoiceClientName').textContent = clientNameField.value.trim();
    document.querySelector('#invoiceServiceDesc').textContent = description;
    document.querySelector('#invoiceServiceAmount').textContent = `$${total}`;
    document.querySelector('#invoiceTotal').textContent = `$${total}`;
    document.querySelector('#invoiceNotesDisplay').textContent = notes ? `Notes: ${notes}` : '';

    invoicePreview.classList.remove('hidden');
    invoicePreview.scrollIntoView({ behavior: 'smooth' });
  });
}

if (printInvoiceBtn) {
  printInvoiceBtn.addEventListener('click', () => {
    window.print();
  });
}

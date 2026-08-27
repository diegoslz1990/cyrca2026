requireAuth();

function showError(field, message) {
  const errorEl = document.getElementById(`${field.id}-error`);
  errorEl.textContent = message;
  field.classList.add('invalid');
}

function clearError(field) {
  const errorEl = document.getElementById(`${field.id}-error`);
  errorEl.textContent = '';
  field.classList.remove('invalid');
}

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

// Guarda un registro de la factura en Formspree, como respaldo extra.
const INVOICE_LOG_URL = 'https://formspree.io/f/xqpzvgqg';

function logInvoiceRecord(record) {
  fetch(INVOICE_LOG_URL, {
    method: 'POST',
    body: JSON.stringify(record),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  }).catch((error) => {
    console.warn('Could not save invoice record to Formspree:', error);
  });
}

// Guarda el trabajo en la tabla "jobs" de Supabase, para que aparezca en el
// Dashboard. Como esta pagina ya exige estar logueada (requireAuth), esto
// deberia funcionar siempre.
function logJobToSupabase(job) {
  supabaseClient
    .from('jobs')
    .insert(job)
    .then(({ error }) => {
      if (error) {
        console.warn('Could not save job to the dashboard:', error);
      }
    });
}

if (generateInvoiceBtn) {
  generateInvoiceBtn.addEventListener('click', async () => {
    await pricingReady; // asegura que usemos los precios reales del archivo, si ya llegaron

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
    const invoiceNumber = getNextInvoiceNumber();

    document.querySelector('#invoiceNumber').textContent = invoiceNumber;
    document.querySelector('#invoiceDate').textContent = serviceDateField.value;
    document.querySelector('#invoiceClientName').textContent = clientNameField.value.trim();
    document.querySelector('#invoiceServiceDesc').textContent = description;
    document.querySelector('#invoiceServiceAmount').textContent = `$${total}`;
    document.querySelector('#invoiceTotal').textContent = `$${total}`;
    document.querySelector('#invoiceNotesDisplay').textContent = notes ? `Notes: ${notes}` : '';

    invoicePreview.classList.remove('hidden');
    invoicePreview.scrollIntoView({ behavior: 'smooth' });

    logInvoiceRecord({
      invoiceNumber,
      clientName: clientNameField.value.trim(),
      serviceDate: serviceDateField.value,
      service: description,
      total: `$${total}`,
      notes,
    });

    logJobToSupabase({
      client_name: clientNameField.value.trim(),
      job_date: serviceDateField.value,
      service_type: 'residential',
      status: 'completed',
      price: total,
      notes: notes || null,
      invoice_number: invoiceNumber,
    });
  });
}

if (printInvoiceBtn) {
  printInvoiceBtn.addEventListener('click', () => {
    window.print();
  });
}

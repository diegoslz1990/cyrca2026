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

// SIZE_LABELS y DIFFICULTY_LABELS ya vienen definidos globalmente por
// ../js/pricing.js (que se carga antes que este archivo).

const generateInvoiceBtn = document.querySelector('#generateInvoiceBtn');
const printInvoiceBtn = document.querySelector('#printInvoiceBtn');
const invoicePreview = document.querySelector('#invoicePreview');
const serviceDateInput = document.querySelector('#serviceDate');

// La fecha de hoy como valor por defecto, para no tener que escribirla a mano
if (serviceDateInput) {
  serviceDateInput.value = new Date().toISOString().split('T')[0];
}

// Si venimos del boton "Finished" de un trabajo ya agendado, precargamos sus
// datos y, al generar la factura, actualizamos ESE trabajo en vez de crear
// uno duplicado.
const linkedJobId = new URLSearchParams(window.location.search).get('jobId');
let linkedJobServiceType = 'residential';

if (linkedJobId) {
  supabaseClient
    .from('jobs')
    .select('*')
    .eq('id', linkedJobId)
    .single()
    .then(({ data: job, error }) => {
      if (error || !job) {
        console.warn('Could not load the linked job:', error);
        return;
      }
      linkedJobServiceType = job.service_type;
      document.querySelector('#clientName').value = job.client_name;
      if (serviceDateInput) {
        serviceDateInput.value = job.job_date;
      }
      const heading = document.querySelector('h1');
      if (heading) {
        heading.textContent = `Finish Job & Create Invoice — ${job.client_name}`;
      }
    });
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
//
// Si la factura viene de un trabajo ya agendado (boton "Finished"), en vez
// de insertar uno nuevo actualizamos ese mismo trabajo a "completed" — asi
// no queda duplicado en el Dashboard ni en el Calendario.
function logJobToSupabase(job) {
  const query = linkedJobId
    ? supabaseClient.from('jobs').update(job).eq('id', linkedJobId)
    : supabaseClient.from('jobs').insert(job);

  query.then(({ error }) => {
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
      service_type: linkedJobServiceType,
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

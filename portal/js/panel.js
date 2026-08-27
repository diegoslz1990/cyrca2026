const logoutBtn = document.querySelector('#logoutBtn');
const userEmailDisplay = document.querySelector('#userEmailDisplay');
const jobForm = document.querySelector('#jobForm');
const jobFormFeedback = document.querySelector('#jobFormFeedback');
const jobsList = document.querySelector('#jobsList');

const SERVICE_TYPE_LABELS = {
  residential: 'Residential',
  office: 'Office & Commercial',
  moveinout: 'Move In / Move Out',
};

async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = 'login.html';
    return;
  }

  if (userEmailDisplay) {
    userEmailDisplay.textContent = data.session.user.email;
  }

  loadJobs();
}

checkAuth();

async function loadJobs() {
  const { data, error } = await supabaseClient
    .from('jobs')
    .select('*')
    .order('job_date', { ascending: true });

  if (error) {
    jobsList.innerHTML = '<p class="note">Could not load jobs.</p>';
    return;
  }

  if (!data || data.length === 0) {
    jobsList.innerHTML = '<p class="note">No jobs yet — add one above.</p>';
    return;
  }

  const rows = data.map((job) => `
    <tr>
      <td>${job.job_date}</td>
      <td>${job.client_name}</td>
      <td>${SERVICE_TYPE_LABELS[job.service_type] || job.service_type}</td>
      <td><span class="job-status job-status-${job.status}">${job.status}</span></td>
      <td>${job.price ? `$${job.price}` : '—'}</td>
    </tr>
  `).join('');

  jobsList.innerHTML = `
    <table class="jobs-table">
      <thead>
        <tr><th>Date</th><th>Client</th><th>Service</th><th>Status</th><th>Price</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

if (jobForm) {
  jobForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const clientName = document.querySelector('#jobClientName').value.trim();
    const jobDate = document.querySelector('#jobDate').value;
    const serviceType = document.querySelector('#jobServiceType').value;
    const address = document.querySelector('#jobAddress').value.trim();
    const notes = document.querySelector('#jobNotes').value.trim();

    if (!clientName || !jobDate) {
      jobFormFeedback.textContent = 'Please fill in the client name and date.';
      return;
    }

    const submitBtn = document.querySelector('#jobSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding...';

    const { error } = await supabaseClient.from('jobs').insert({
      client_name: clientName,
      job_date: jobDate,
      service_type: serviceType,
      status: 'scheduled',
      address: address || null,
      notes: notes || null,
    });

    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Job';

    if (error) {
      jobFormFeedback.textContent = 'Something went wrong. Please try again.';
      return;
    }

    jobFormFeedback.textContent = 'Job added!';
    jobForm.reset();
    loadJobs();
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
  });
}

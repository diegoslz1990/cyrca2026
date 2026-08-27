requireAuth();

const jobForm = document.querySelector('#jobForm');
const jobFormFeedback = document.querySelector('#jobFormFeedback');

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

    jobFormFeedback.textContent = 'Job added! You can see it on the Dashboard.';
    jobForm.reset();
  });
}

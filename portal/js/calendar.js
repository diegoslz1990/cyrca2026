requireAuth().then((session) => {
  if (session) {
    loadJobs();
  }
});

const SERVICE_TYPE_LABELS = {
  residential: 'Residential',
  office: 'Office & Commercial',
  moveinout: 'Move In / Move Out',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const calendarGrid = document.querySelector('#calendarGrid');
const calendarMonthLabel = document.querySelector('#calendarMonthLabel');
const calendarDayTitle = document.querySelector('#calendarDayTitle');
const calendarDayJobs = document.querySelector('#calendarDayJobs');
const prevBtn = document.querySelector('#calendarPrevBtn');
const nextBtn = document.querySelector('#calendarNextBtn');

const today = new Date();
let viewYear = today.getFullYear();
let viewMonth = today.getMonth(); // 0 = enero
let jobsByDate = {}; // { 'YYYY-MM-DD': [job, job, ...] }
let selectedDate = null;

function pad(num) {
  return String(num).padStart(2, '0');
}

function dateKey(year, month, day) {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

async function loadJobs() {
  const { data, error } = await supabaseClient
    .from('jobs')
    .select('*')
    .order('job_date', { ascending: true });

  if (error || !data) {
    calendarGrid.innerHTML = '<p class="note">Could not load jobs.</p>';
    return;
  }

  jobsByDate = {};
  data.forEach((job) => {
    if (!jobsByDate[job.job_date]) {
      jobsByDate[job.job_date] = [];
    }
    jobsByDate[job.job_date].push(job);
  });

  renderCalendar();
}

function renderCalendar() {
  calendarMonthLabel.textContent = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay(); // 0 = domingo
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

  let cellsHtml = '';

  for (let i = 0; i < firstWeekday; i++) {
    cellsHtml += '<div class="calendar-day other-month"></div>';
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(viewYear, viewMonth, day);
    const jobsThatDay = jobsByDate[key] || [];
    const classes = ['calendar-day'];
    if (key === todayKey) classes.push('today');
    if (jobsThatDay.length > 0) classes.push('has-jobs');
    if (key === selectedDate) classes.push('selected');

    const badge = jobsThatDay.length > 0
      ? `<span class="calendar-day-badge">${jobsThatDay.length}</span>`
      : '';

    cellsHtml += `
      <button type="button" class="${classes.join(' ')}" data-date="${key}">
        <span class="calendar-day-number">${day}</span>
        ${badge}
      </button>
    `;
  }

  calendarGrid.innerHTML = cellsHtml;
}

calendarGrid.addEventListener('click', (event) => {
  const dayBtn = event.target.closest('.calendar-day[data-date]');
  if (!dayBtn) return;

  selectedDate = dayBtn.dataset.date;
  renderCalendar();
  showDayJobs(selectedDate);
});

function showDayJobs(dateKeyValue) {
  calendarDayTitle.textContent = `Jobs on ${dateKeyValue}`;
  const jobsThatDay = jobsByDate[dateKeyValue] || [];

  if (jobsThatDay.length === 0) {
    calendarDayJobs.innerHTML = '<p class="note">No jobs on this day.</p>';
    return;
  }

  const rows = jobsThatDay.map((job) => `
    <tr>
      <td>${job.client_name}</td>
      <td>${SERVICE_TYPE_LABELS[job.service_type] || job.service_type}</td>
      <td><span class="job-status job-status-${job.status}">${job.status}</span></td>
      <td>${job.price ? `$${job.price}` : '—'}</td>
    </tr>
  `).join('');

  calendarDayJobs.innerHTML = `
    <table class="jobs-table">
      <thead>
        <tr><th>Client</th><th>Service</th><th>Status</th><th>Price</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

prevBtn.addEventListener('click', () => {
  viewMonth -= 1;
  if (viewMonth < 0) {
    viewMonth = 11;
    viewYear -= 1;
  }
  renderCalendar();
});

nextBtn.addEventListener('click', () => {
  viewMonth += 1;
  if (viewMonth > 11) {
    viewMonth = 0;
    viewYear += 1;
  }
  renderCalendar();
});

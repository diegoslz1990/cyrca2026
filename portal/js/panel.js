const logoutBtn = document.querySelector('#logoutBtn');
const userEmailDisplay = document.querySelector('#userEmailDisplay');

async function checkAuth() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = 'login.html';
    return;
  }

  if (userEmailDisplay) {
    userEmailDisplay.textContent = data.session.user.email;
  }
}

checkAuth();

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
  });
}

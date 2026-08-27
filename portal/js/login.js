const loginForm = document.querySelector('#loginForm');
const loginError = document.querySelector('#loginError');
const loginBtn = document.querySelector('#loginBtn');

// Si ya hay una sesion activa, saltar directo al panel
supabaseClient.auth.getSession().then(({ data }) => {
  if (data.session) {
    window.location.href = 'panel.html';
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  loginError.textContent = '';

  const email = document.querySelector('#email').value.trim();
  const password = document.querySelector('#password').value;

  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

  loginBtn.disabled = false;
  loginBtn.textContent = 'Log In';

  if (error) {
    loginError.textContent = 'Incorrect email or password.';
    return;
  }

  window.location.href = 'panel.html';
});

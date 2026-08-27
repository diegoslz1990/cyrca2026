// Logica compartida por todas las paginas del portal: exige sesion
// iniciada (si no hay, manda a login.html), muestra el email del usuario,
// y conecta el boton de cerrar sesion. Se carga en cada pagina del portal
// antes que el JS especifico de esa pagina.

const logoutBtn = document.querySelector('#logoutBtn');
const userEmailDisplay = document.querySelector('#userEmailDisplay');

async function requireAuth() {
  const { data } = await supabaseClient.auth.getSession();

  if (!data.session) {
    window.location.href = 'login.html';
    return null;
  }

  if (userEmailDisplay) {
    userEmailDisplay.textContent = data.session.user.email;
  }

  return data.session;
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    window.location.href = 'login.html';
  });
}

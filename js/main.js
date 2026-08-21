// Menu movil (hamburguesa)
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#navMenu');

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });
}

// Resaltar en el menu la pagina en la que estamos parados
const currentPage = window.location.pathname.split('/').pop() || 'index.html';

document.querySelectorAll('nav a').forEach((link) => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});

// Validacion del formulario de contacto
const contactForm = document.querySelector('.contact-form form');

function showError(field, message) {
  const errorEl = field.parentElement.querySelector('.field-error');
  errorEl.textContent = message;
  field.classList.add('invalid');
}

function clearError(field) {
  const errorEl = field.parentElement.querySelector('.field-error');
  errorEl.textContent = '';
  field.classList.remove('invalid');
}

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = contactForm.querySelector('#name');
    const email = contactForm.querySelector('#email');
    const message = contactForm.querySelector('#message');
    const feedback = document.querySelector('.form-feedback');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    [name, email, message].forEach(clearError);
    let isValid = true;

    if (name.value.trim() === '') {
      showError(name, 'Please enter your name.');
      isValid = false;
    }

    if (!emailPattern.test(email.value.trim())) {
      showError(email, 'Please enter a valid email address.');
      isValid = false;
    }

    if (message.value.trim() === '') {
      showError(message, 'Please write a short message.');
      isValid = false;
    }

    if (!isValid) {
      feedback.textContent = '';
      feedback.className = 'form-feedback';
      return;
    }

    feedback.textContent = `Thanks, ${name.value.trim()}! We'll get back to you soon. (This form isn't sending real messages yet.)`;
    feedback.className = 'form-feedback success';
    contactForm.reset();
  });
}

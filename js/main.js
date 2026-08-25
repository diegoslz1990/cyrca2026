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
  const errorEl = document.getElementById(`${field.id}-error`);
  errorEl.textContent = message;
  field.classList.add('invalid');
}

function clearError(field) {
  const errorEl = document.getElementById(`${field.id}-error`);
  errorEl.textContent = '';
  field.classList.remove('invalid');
}

// Si llegamos desde "Request This Quote" en la calculadora, precompletamos
// el mensaje con el estimado que vio el cliente (size, difficulty y price
// vienen en la URL, ej: contacto.html?size=medium&difficulty=deep&price=208)
if (contactForm) {
  const quoteParams = new URLSearchParams(window.location.search);
  const quoteSize = quoteParams.get('size');
  const quoteDifficulty = quoteParams.get('difficulty');
  const quotePrice = quoteParams.get('price');
  const messageField = contactForm.querySelector('#message');

  if (quoteSize && quoteDifficulty && quotePrice && messageField && typeof SIZE_LABELS !== 'undefined') {
    const sizeLabel = SIZE_LABELS[quoteSize] || quoteSize;
    const difficultyLabel = DIFFICULTY_LABELS[quoteDifficulty] || quoteDifficulty;
    messageField.value = `I'm interested in a quote for: ${sizeLabel}, ${difficultyLabel} — Estimated $${quotePrice}`;
  }
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

    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' },
    })
      .then((response) => {
        if (response.ok) {
          feedback.textContent = `Thanks, ${name.value.trim()}! We'll get back to you soon.`;
          feedback.className = 'form-feedback success';
          contactForm.reset();
        } else {
          feedback.textContent = 'Something went wrong sending your message. Please try again or contact us directly.';
          feedback.className = 'form-feedback';
        }
      })
      .catch(() => {
        feedback.textContent = 'Something went wrong sending your message. Please check your connection and try again.';
        feedback.className = 'form-feedback';
      })
      .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
      });
  });
}

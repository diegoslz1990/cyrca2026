// Fase 1: solo la ventanita del chat (abrir/cerrar + un mensaje de ejemplo).
// El motor de respuestas de verdad (por palabras clave) llega en la Fase 2.

const chatbotToggle = document.querySelector('#chatbotToggle');
const chatbotPanel = document.querySelector('#chatbotPanel');
const chatbotClose = document.querySelector('#chatbotClose');
const chatbotMessages = document.querySelector('#chatbotMessages');
const chatbotForm = document.querySelector('#chatbotForm');
const chatbotInput = document.querySelector('#chatbotInput');

function openChatbot() {
  chatbotPanel.classList.remove('hidden');
  chatbotToggle.classList.add('hidden');
  chatbotInput.focus();
}

function closeChatbot() {
  chatbotPanel.classList.add('hidden');
  chatbotToggle.classList.remove('hidden');
}

function addMessage(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = `chatbot-message chatbot-message-${sender}`;
  bubble.textContent = text;
  chatbotMessages.appendChild(bubble);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

if (chatbotToggle && chatbotPanel) {
  chatbotToggle.addEventListener('click', openChatbot);
  chatbotClose.addEventListener('click', closeChatbot);

  chatbotForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = chatbotInput.value.trim();
    if (text === '') return;

    addMessage(text, 'user');
    chatbotInput.value = '';

    // Respuesta temporal hasta la Fase 2 (motor de respuestas por palabras clave).
    window.setTimeout(() => {
      addMessage("Thanks for your message! I'm still learning to answer questions here — for now, try our Contact page or WhatsApp for a quick reply.", 'bot');
    }, 400);
  });
}

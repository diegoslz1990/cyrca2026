// Fase 2: motor de respuestas por palabras clave, cargadas desde
// data/chatbot-preguntas.txt (facil de editar sin tocar codigo).

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

// Quita tildes/acentos y pasa a minusculas, para que "cuánto" y "cuanto"
// (o "Precio" y "precio") sean tratados igual al buscar coincidencias.
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

let chatbotEntries = [];

const CHATBOT_QA_URL = new URL('../data/chatbot-preguntas.txt', document.currentScript.src).href;

fetch(CHATBOT_QA_URL)
  .then((response) => response.text())
  .then((text) => {
    // Sacamos las lineas de comentario (#) antes de buscar bloques, para que
    // el texto explicativo del encabezado no se confunda con una entrada real.
    const cleanText = text
      .split('\n')
      .filter((line) => !line.trim().startsWith('#'))
      .join('\n');

    chatbotEntries = cleanText.split(/\n\s*\n/).map((block) => {
      const keywordsLine = block.match(/PALABRAS:\s*(.+)/);
      const responseLine = block.match(/RESPUESTA:\s*(.+)/);
      if (!keywordsLine || !responseLine) return null;
      return {
        keywords: keywordsLine[1].split(',').map((k) => normalize(k.trim())),
        response: responseLine[1].trim(),
      };
    }).filter(Boolean);
  })
  .catch((error) => {
    console.warn('Could not load chatbot answers:', error);
  });

function findResponse(userText) {
  const normalizedText = normalize(userText);
  let bestMatch = null;
  let bestScore = 0;

  chatbotEntries.forEach((entry) => {
    const score = entry.keywords.filter((keyword) => normalizedText.includes(keyword)).length;
    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  });

  if (bestMatch) return bestMatch.response;
  return "I'm not sure about that one yet. Try asking about pricing, hours, services, or how to book — or reach us directly on WhatsApp or through the Contact page.";
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

    window.setTimeout(() => {
      addMessage(findResponse(text), 'bot');
    }, 400);
  });
}

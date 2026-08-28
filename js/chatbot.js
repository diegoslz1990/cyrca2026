// Fase 2: motor de respuestas por palabras clave, cargadas desde
// data/chatbot-preguntas.txt (facil de editar sin tocar codigo).

const chatbotToggle = document.querySelector('#chatbotToggle');
const chatbotPanel = document.querySelector('#chatbotPanel');
const chatbotClose = document.querySelector('#chatbotClose');
const chatbotMessages = document.querySelector('#chatbotMessages');
const chatbotForm = document.querySelector('#chatbotForm');
const chatbotInput = document.querySelector('#chatbotInput');
const chatbotQuickReplies = document.querySelector('#chatbotQuickReplies');

function openChatbot() {
  chatbotPanel.classList.remove('hidden');
  chatbotToggle.classList.add('hidden');
  chatbotInput.focus();
}

function closeChatbot() {
  chatbotPanel.classList.add('hidden');
  chatbotToggle.classList.remove('hidden');
}

// Fase 4: la conversacion se guarda en este navegador (localStorage), asi
// no se borra si el visitante recarga la pagina o cambia de pestana.
const CHATBOT_HISTORY_KEY = 'cyrcaChatHistory';
const CHATBOT_HISTORY_LIMIT = 30;

function saveHistory(history) {
  try {
    localStorage.setItem(CHATBOT_HISTORY_KEY, JSON.stringify(history.slice(-CHATBOT_HISTORY_LIMIT)));
  } catch (error) {
    // Si el navegador bloquea localStorage (modo privado, etc.), no pasa nada grave.
  }
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(CHATBOT_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function renderBubble(text, sender) {
  const bubble = document.createElement('div');
  bubble.className = `chatbot-message chatbot-message-${sender}`;
  bubble.textContent = text;
  chatbotMessages.appendChild(bubble);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  return bubble;
}

function addMessage(text, sender) {
  renderBubble(text, sender);
  const history = loadHistory();
  history.push({ text, sender });
  saveHistory(history);
}

// Si ya habia una conversacion guardada, la mostramos en vez del saludo
// por defecto que trae el HTML.
const savedHistory = loadHistory();
if (savedHistory.length > 0) {
  chatbotMessages.innerHTML = '';
  savedHistory.forEach((entry) => renderBubble(entry.text, entry.sender));
}

function showTyping() {
  const bubble = renderBubble('', 'bot');
  bubble.classList.add('chatbot-typing');
  bubble.innerHTML = '<span></span><span></span><span></span>';
  return bubble;
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

const PRICE_KEYWORDS = ['price', 'prices', 'pricing', 'cost', 'how much', 'quote', 'estimate', 'precio', 'precios', 'cuanto cuesta', 'presupuesto'];

// Busca cuantos dormitorios menciona ("5 bedroom", "5-bedroom", "5 bed room", "5br"...)
// y lo traduce al mismo tamano que usa la calculadora del sitio.
function detectSize(text) {
  const bedroomMatch = text.match(/(\d+)\s*-?\s*(?:bed\s*room|bedroom|br\b|habitacion|cuarto)/);
  if (bedroomMatch) {
    const n = parseInt(bedroomMatch[1], 10);
    if (n <= 2) return 'small';
    if (n <= 4) return 'medium';
    return 'large';
  }
  if (/\bstudio\b|\bsmall\b|\bpequen/.test(text)) return 'small';
  if (/\bmedium\b|\bmediana/.test(text)) return 'medium';
  if (/\blarge\b|\bbig\b|\bgrande/.test(text)) return 'large';
  return null;
}

// Busca el tipo de limpieza (light/standard/deep) que usa la calculadora.
function detectDifficulty(text) {
  if (/\bdeep\b|\bfirst time\b|\bfirst-time\b|\bheavy\b|\bprofunda\b/.test(text)) return 'deep';
  if (/\blight\b|\bmaintenance\b|\bquick\b|\bbasic\b|\bligera\b/.test(text)) return 'light';
  if (/\bstandard\b|\bregular\b|\bnormal\b/.test(text)) return 'standard';
  return null;
}

function findResponse(userText) {
  const normalizedText = normalize(userText);

  // Si preguntan por precio y podemos identificar el tamano de la casa,
  // calculamos un numero real en vez de solo mandarlos a la calculadora.
  const isPriceQuestion = PRICE_KEYWORDS.some((keyword) => normalizedText.includes(keyword));
  const size = detectSize(normalizedText);
  if (isPriceQuestion && size && typeof calculatePrice === 'function') {
    const difficulty = detectDifficulty(normalizedText) || 'standard';
    const total = calculatePrice(size, difficulty);
    return `For a ${SIZE_LABELS[size]} with a ${DIFFICULTY_LABELS[difficulty]}, that's about $${total}. Try our "Get an Estimate" page for an exact instant quote, or adjust the size/type there.`;
  }

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

async function sendMessage(text) {
  addMessage(text, 'user');
  const typingBubble = showTyping();

  if (typeof pricingReady !== 'undefined') {
    await pricingReady; // asegura precios reales, no solo el respaldo
  }

  window.setTimeout(() => {
    typingBubble.remove();
    addMessage(findResponse(text), 'bot');
  }, 700);
}

if (chatbotToggle && chatbotPanel) {
  chatbotToggle.addEventListener('click', openChatbot);
  chatbotClose.addEventListener('click', closeChatbot);

  chatbotForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = chatbotInput.value.trim();
    if (text === '') return;

    chatbotInput.value = '';
    sendMessage(text);
  });

  if (chatbotQuickReplies) {
    chatbotQuickReplies.addEventListener('click', (event) => {
      const quickBtn = event.target.closest('.chatbot-quick-btn');
      if (!quickBtn) return;
      sendMessage(quickBtn.dataset.question);
    });
  }
}

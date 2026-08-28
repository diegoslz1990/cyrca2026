// ===== Configuracion de precios de Cyrca =====
// Los precios reales se cargan desde data/precios.txt, un archivo de texto
// simple que se puede editar directamente en GitHub (como un bloc de notas,
// sin tocar codigo). Estos valores de aca abajo son el "respaldo": si por
// algun motivo ese archivo no carga, el sitio sigue funcionando con estos
// numeros de ejemplo.

const FALLBACK_PRICING = {
  small: 90, // 1-2 dormitorios
  medium: 130, // 3-4 dormitorios
  large: 180, // 5+ dormitorios
  light: 1, // limpieza de mantenimiento
  standard: 1.25, // limpieza estandar
  deep: 1.6, // limpieza profunda / primera vez
  office_starting: 150, // precio de arranque, oficinas (temporal)
  moveinout_starting: 220, // precio de arranque, move in/out (temporal)
};

const PRICING_CONFIG = { ...FALLBACK_PRICING };

const SIZE_LABELS = {
  small: 'Small Home',
  medium: 'Medium Home',
  large: 'Large Home',
};

const DIFFICULTY_LABELS = {
  light: 'Light Maintenance',
  standard: 'Standard Clean',
  deep: 'Deep Clean',
};

// Se calcula la ruta a partir de la ubicacion de este mismo script, para que
// funcione tanto desde la raiz del sitio como desde paginas dentro de
// portal/ (donde este archivo se carga como "../js/pricing.js").
const PRICING_FILE_URL = new URL('../data/precios.txt', document.currentScript.src).href;

const pricingReady = fetch(PRICING_FILE_URL)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Pricing file did not respond OK');
    }
    return response.text();
  })
  .then((text) => {
    text.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed === '' || trimmed.startsWith('#')) {
        return; // ignorar lineas vacias y comentarios
      }
      const [key, value] = trimmed.split('=').map((part) => part.trim());
      if (key && value !== undefined && !Number.isNaN(parseFloat(value))) {
        PRICING_CONFIG[key] = parseFloat(value);
      }
    });
  })
  .catch((error) => {
    console.warn('Could not load live prices, using fallback values.', error);
  });

function calculatePrice(size, difficulty) {
  const basePrice = PRICING_CONFIG[size];
  const multiplier = PRICING_CONFIG[difficulty];
  return Math.round(basePrice * multiplier);
}

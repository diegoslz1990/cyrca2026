// ===== Configuracion de precios de Cyrca =====
// Los precios reales se cargan desde una Google Sheet publicada, para que
// se puedan editar sin tocar codigo (solo hay que cambiar un numero en la
// planilla). Estos valores de aca abajo son el "respaldo": si por algun
// motivo la planilla no carga (sin internet, no esta publicada todavia,
// etc.), el sitio sigue funcionando con estos numeros de ejemplo.

const FALLBACK_PRICING = {
  small: 90, // 1-2 dormitorios
  medium: 130, // 3-4 dormitorios
  large: 180, // 5+ dormitorios
  light: 1, // limpieza de mantenimiento
  standard: 1.25, // limpieza estandar
  deep: 1.6, // limpieza profunda / primera vez
};

const PRICING_CONFIG = { ...FALLBACK_PRICING };

// TODO: reemplazar por la URL real una vez publicada la Google Sheet
// (Archivo > Compartir > Publicar en la Web > formato CSV)
const PRICING_SHEET_URL = 'PASTE_PUBLISHED_SHEET_CSV_URL_HERE';

const pricingReady = fetch(PRICING_SHEET_URL)
  .then((response) => {
    if (!response.ok) {
      throw new Error('Pricing sheet did not respond OK');
    }
    return response.text();
  })
  .then((csvText) => {
    const rows = csvText.trim().split('\n').slice(1); // saltar encabezado
    rows.forEach((row) => {
      const [key, value] = row.split(',').map((cell) => cell.trim());
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

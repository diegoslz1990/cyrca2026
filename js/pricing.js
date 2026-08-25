// ===== Configuracion de precios de Cyrca =====
// Estos son valores de ejemplo. Cuando tengas los precios reales del
// negocio, reemplaza los numeros aca abajo — el resto del sitio no
// necesita ningun otro cambio.

const PRICING_CONFIG = {
  basePriceBySize: {
    small: 90, // 1-2 dormitorios
    medium: 130, // 3-4 dormitorios
    large: 180, // 5+ dormitorios
  },
  difficultyMultiplier: {
    light: 1, // limpieza de mantenimiento
    standard: 1.25, // limpieza estandar
    deep: 1.6, // limpieza profunda / primera vez
  },
};

function calculatePrice(size, difficulty) {
  const basePrice = PRICING_CONFIG.basePriceBySize[size];
  const multiplier = PRICING_CONFIG.difficultyMultiplier[difficulty];
  return Math.round(basePrice * multiplier);
}

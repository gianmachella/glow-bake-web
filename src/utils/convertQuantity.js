const factors = {
  g: 1,
  kg: 1000,
  mg: 0.001,
  lb: 453.592,
  oz: 28.3495,
  ml: 1,
  l: 1000,
  floz: 29.5735,
  cup: 240,
  tbsp: 15,
  tsp: 5,
  pt: 473.176,
  qt: 946.353,
  gal: 3785.41,
  unidad: 1,
  unit: 1,
  pack: 1,
};

export function convertQuantity(value, fromUnit, toUnit, ingredientName = "") {
  const from = fromUnit?.toLowerCase();
  const to = toUnit?.toLowerCase();

  if (!from) {
    throw new Error(`⚠️ Falta seleccionar unidad para "${ingredientName}"`);
  }

  if (!factors[from] || !factors[to]) {
    throw new Error(`❌ Conversión no soportada: ${fromUnit} -> ${toUnit}`);
  }

  return (value * factors[from]) / factors[to];
}

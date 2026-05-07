export const formatARS = (n: number) =>
  "$" + Math.round(Number(n) || 0).toLocaleString("es-AR");

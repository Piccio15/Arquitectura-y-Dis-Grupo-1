export type Coordenada = {
  lat: number;
  lng: number;
};

export function esCoordenada(valor: unknown): valor is Coordenada {
  if (!valor || typeof valor !== 'object') return false;
  const posible = valor as Partial<Coordenada>;
  return Number.isFinite(posible.lat) && Number.isFinite(posible.lng);
}

export function parsearPoligono(valor: unknown): Coordenada[] {
  if (!Array.isArray(valor)) return [];
  return valor.filter(esCoordenada);
}

export function puntoEnPoligono(punto: Coordenada, poligono: Coordenada[]) {
  if (poligono.length < 3) return false;

  let dentro = false;

  for (let i = 0, j = poligono.length - 1; i < poligono.length; j = i++) {
    const actual = poligono[i];
    const anterior = poligono[j];
    const cruzaLatitud = actual.lat > punto.lat !== anterior.lat > punto.lat;

    if (!cruzaLatitud) continue;

    const lngInterseccion = (
      (anterior.lng - actual.lng) * (punto.lat - actual.lat)
      / (anterior.lat - actual.lat)
    ) + actual.lng;

    if (punto.lng < lngInterseccion) {
      dentro = !dentro;
    }
  }

  return dentro;
}

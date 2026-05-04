// Coordenada geográfica (Latitud, Longitud)
export interface Coordenada {
  lat: number;
  lng: number;
}

export interface Zona {
  id: string;
  nombre: string;
  // Representación del polígono de la zona
  coordenadas: Coordenada[]; 
  capacidadTotal: number;
  espaciosOcupados: number;
  precio_hora: number;
}

export type ZonaFormData = Omit<Zona, 'id'>;
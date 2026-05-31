export interface Coordenada {
  lat: number;
  lng: number;
}

export interface Zona {
  id: number;
  nombre: string;
  calles: string;
  coordenadas: Coordenada[];
  precio_hora: number;
}

export type ZonaFormData = Omit<Zona, 'id'>;
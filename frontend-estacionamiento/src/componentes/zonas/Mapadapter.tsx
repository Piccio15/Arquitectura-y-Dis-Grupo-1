import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Obligatorio para el correcto renderizado de los mosaicos
import type { Coordenada } from '../../types/zona-interface';

// Configuración necesaria en React-Leaflet para que los iconos de los marcadores por defecto funcionen
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapAdapterProps {
  coordenadasIniciales: Coordenada[];
  soloLectura: boolean;
  onCoordenadasChange?: (coordenadas: Coordenada[]) => void;
}

// Subcomponente de React-Leaflet para interceptar eventos del DOM del mapa
function ManejadorEventosMapa({ onClick, soloLectura }: { onClick: (c: Coordenada) => void, soloLectura: boolean }) {
  useMapEvents({
    click(e) {
      if (!soloLectura) {
        onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });
  return null;
}

export function MapAdapter({ coordenadasIniciales, soloLectura, onCoordenadasChange }: MapAdapterProps) {
  const [puntos, setPuntos] = useState<Coordenada[]>(coordenadasIniciales);

  useEffect(() => {
    setPuntos(coordenadasIniciales);
  }, [coordenadasIniciales]);

  const manejarClickMapa = (nuevaCoordenada: Coordenada) => {
    const nuevosPuntos = [...puntos, nuevaCoordenada];
    setPuntos(nuevosPuntos);
    if (onCoordenadasChange) {
      onCoordenadasChange(nuevosPuntos);
    }
  };

  const limpiarPoligono = () => {
    setPuntos([]);
    if (onCoordenadasChange) onCoordenadasChange([]);
  };

  // Coordenadas centrales por defecto (Bahía Blanca)
  const centroPorDefecto: [number, number] = [-38.7196, -62.2663];
  
  // Transformación de la estructura de datos interna al formato requerido por Leaflet
  const posicionesPoligono = puntos.map(p => [p.lat, p.lng] as [number, number]);

  return (
    <div style={{ border: '1px solid #bdc3c7', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ padding: '0.5rem', backgroundColor: '#ecf0f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
          {soloLectura 
            ? 'Modo Visualización' 
            : 'Modo Edición: Haga clic en el mapa para marcar los vértices'}
        </span>
        {!soloLectura && (
          <button type="button" onClick={limpiarPoligono} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
            Limpiar Área
          </button>
        )}
      </div>
      
      {/* Contenedor principal de Leaflet */}
      <MapContainer 
        center={centroPorDefecto} 
        zoom={14} 
        style={{ height: '350px', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ManejadorEventosMapa onClick={manejarClickMapa} soloLectura={soloLectura} />
        
        {/* Renderizado de vértices individuales */}
        {puntos.map((punto, index) => (
          <Marker key={index} position={[punto.lat, punto.lng]} />
        ))}
        
        {/* Renderizado del polígono cerrado (Requiere mínimo 3 puntos estructuralmente) */}
        {puntos.length >= 3 && (
          <Polygon 
            positions={posicionesPoligono} 
            pathOptions={{ color: '#2980b9', fillColor: '#3498db', fillOpacity: 0.4 }} 
          />
        )}
      </MapContainer>
    </div>
  );
}
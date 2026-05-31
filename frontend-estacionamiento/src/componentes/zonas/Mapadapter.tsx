import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordenada } from '../../types/zona-interface';

interface MapAdapterProps {
  coordenadasIniciales: Coordenada[];
  soloLectura: boolean;
  onCoordenadasChange?: (coordenadas: Coordenada[]) => void;
  maxPuntos?: number;
}

const iconoUbicacion = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#1e2d6b"/>
    <circle cx="12" cy="9" r="2.5" fill="white"/>
  </svg>`,
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export function MapAdapter({ coordenadasIniciales, soloLectura, onCoordenadasChange, maxPuntos = 4 }: MapAdapterProps) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const puntosRef = useRef<Coordenada[]>([...coordenadasIniciales]);
  const marcadoresRef = useRef<L.Marker[]>([]);
  const poligonoRef = useRef<L.Polygon | null>(null);
  const contadorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;

    const mapa = L.map(contenedorRef.current).setView([-38.7196, -62.2663], 14);
    mapaRef.current = mapa;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapa);

    if (!soloLectura) {
      mapa.on('click', (e: L.LeafletMouseEvent) => {
        if (puntosRef.current.length >= maxPuntos) return;
        const nuevaCoordenada = { lat: e.latlng.lat, lng: e.latlng.lng };
        puntosRef.current = [...puntosRef.current, nuevaCoordenada];
        actualizarMapa();
        if (onCoordenadasChange) onCoordenadasChange(puntosRef.current);
        if (contadorRef.current) {
          contadorRef.current.textContent = `${puntosRef.current.length} / ${maxPuntos} puntos`;
        }
      });
    }

    return () => {
      mapa.remove();
      mapaRef.current = null;
    };
  }, []);

  const actualizarMapa = () => {
    const mapa = mapaRef.current;
    if (!mapa) return;

    marcadoresRef.current.forEach(m => m.remove());
    marcadoresRef.current = [];

    if (poligonoRef.current) {
      poligonoRef.current.remove();
      poligonoRef.current = null;
    }

    puntosRef.current.forEach(p => {
      const marcador = L.marker([p.lat, p.lng], { icon: iconoUbicacion }).addTo(mapa);
      marcadoresRef.current.push(marcador);
    });

    if (puntosRef.current.length >= 3) {
      poligonoRef.current = L.polygon(
        puntosRef.current.map(p => [p.lat, p.lng] as [number, number]),
        { color: '#2980b9', fillColor: '#3498db', fillOpacity: 0.4 }
      ).addTo(mapa);
    }
  };

  const limpiar = () => {
    puntosRef.current = [];
    actualizarMapa();
    if (onCoordenadasChange) onCoordenadasChange([]);
    if (contadorRef.current) {
      contadorRef.current.textContent = `0 / ${maxPuntos} puntos`;
    }
  };

  return (
    <div style={{ border: '1px solid #bdc3c7', borderRadius: '4px' }}>
      <div style={{ padding: '0.5rem', backgroundColor: '#ecf0f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
          {soloLectura
            ? 'Modo Visualización'
            : <><span ref={contadorRef}>0 / {maxPuntos} puntos</span> — hacé clic para marcar</>
          }
        </span>
        {!soloLectura && (
          <button type="button" onClick={limpiar} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
            Limpiar Área
          </button>
        )}
      </div>
      <div ref={contenedorRef} style={{ height: '350px', width: '100%' }} />
    </div>
  );
}
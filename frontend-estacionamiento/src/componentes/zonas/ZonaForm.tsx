import { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import type { ZonaFormData, Coordenada, Zona } from '../../types/zona-interface';

interface ZonaFormProps {
  zonaEditar?: Zona | null;
  onGuardar: (data: ZonaFormData) => void;
  onCancelar: () => void;
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

function MapaEditable({ coordenadasIniciales, onChange }: { coordenadasIniciales: Coordenada[], onChange: (c: Coordenada[]) => void }) {
  const contenedorRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<L.Map | null>(null);
  const puntosRef = useRef<Coordenada[]>([...coordenadasIniciales]);
  const marcadoresRef = useRef<L.Marker[]>([]);
  const poligonoRef = useRef<L.Polygon | null>(null);
  const contadorRef = useRef<HTMLSpanElement | null>(null);
  const MAX = 4;

  const actualizarMapa = () => {
    const mapa = mapaRef.current;
    if (!mapa) return;
    marcadoresRef.current.forEach(m => m.remove());
    marcadoresRef.current = [];
    if (poligonoRef.current) { poligonoRef.current.remove(); poligonoRef.current = null; }
    puntosRef.current.forEach(p => {
      const m = L.marker([p.lat, p.lng], { icon: iconoUbicacion }).addTo(mapa);
      marcadoresRef.current.push(m);
    });
    if (puntosRef.current.length >= 3) {
      poligonoRef.current = L.polygon(
        puntosRef.current.map(p => [p.lat, p.lng] as [number, number]),
        { color: '#2980b9', fillColor: '#3498db', fillOpacity: 0.4 }
      ).addTo(mapa);
    }
    if (contadorRef.current) contadorRef.current.textContent = `${puntosRef.current.length} / ${MAX} puntos`;
  };

  useEffect(() => {
    if (!contenedorRef.current || mapaRef.current) return;
    const mapa = L.map(contenedorRef.current).setView([-38.7196, -62.2663], 14);
    mapaRef.current = mapa;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapa);

    // Cargar puntos iniciales si hay (modo edición)
    if (puntosRef.current.length > 0) actualizarMapa();

    mapa.on('click', (e: L.LeafletMouseEvent) => {
      if (puntosRef.current.length >= MAX) return;
      puntosRef.current = [...puntosRef.current, { lat: e.latlng.lat, lng: e.latlng.lng }];
      actualizarMapa();
      onChange(puntosRef.current);
    });

    return () => { mapa.remove(); mapaRef.current = null; };
  }, []);

  const limpiar = () => {
    puntosRef.current = [];
    actualizarMapa();
    onChange([]);
  };

  return (
    <div style={{ border: '1px solid #bdc3c7', borderRadius: '4px' }}>
      <div style={{ padding: '0.5rem', backgroundColor: '#ecf0f1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
          <span ref={contadorRef}>{coordenadasIniciales.length} / {MAX} puntos</span> — hacé clic para marcar
        </span>
        <button type="button" onClick={limpiar} style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
          Limpiar Área
        </button>
      </div>
      <div ref={contenedorRef} style={{ height: '350px', width: '100%' }} />
    </div>
  );
}

export function ZonaForm({ zonaEditar, onGuardar, onCancelar }: ZonaFormProps) {
  const [nombre, setNombre] = useState(zonaEditar?.nombre ?? '');
  const [precioHora, setPrecioHora] = useState(zonaEditar?.precio_hora?.toString() ?? '');
  const [coordenadas, setCoordenadas] = useState<Coordenada[]>(zonaEditar?.coordenadas ?? []);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nombre.trim()) { setError('El nombre es requerido'); return; }
    if (!precioHora || Number(precioHora) <= 0) { setError('El precio debe ser mayor a 0'); return; }
    if (coordenadas.length < 3) { setError('Marcá al menos 3 puntos en el mapa'); return; }
    onGuardar({ nombre: nombre.trim(), calles: '', precio_hora: Number(precioHora), coordenadas });
  };

  return (
    <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1.5px solid #e8eef8' }}>
      <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
        {zonaEditar ? 'Editar Zona' : 'Nueva Zona'}
      </h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="campo">
          <label>Nombre de la zona *</label>
          <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Zona Céntrica" />
        </div>
        <div className="campo">
          <label>Precio por hora ($) *</label>
          <input type="number" value={precioHora} onChange={e => setPrecioHora(e.target.value)} placeholder="Ej: 500" min="1" style={{ maxWidth: '200px' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Delimitación geográfica *
          </label>
          <MapaEditable coordenadasIniciales={zonaEditar?.coordenadas ?? []} onChange={setCoordenadas} />
          {coordenadas.length > 0 && coordenadas.length < 3 && (
            <p style={{ fontSize: '0.78rem', color: '#ea580c', marginTop: '0.35rem' }}>Necesitás al menos 3 puntos</p>
          )}
          {coordenadas.length >= 3 && (
            <p style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '0.35rem' }}>✓ Polígono listo</p>
          )}
        </div>
        {error && <div className="alerta alerta-error">{error}</div>}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="submit" className="btn btn-primario">
            {zonaEditar ? 'Guardar cambios' : 'Guardar Zona'}
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} type="button" className="btn btn-secundario" onClick={onCancelar}>
            Cancelar
          </motion.button>
        </div>
      </form>
    </div>
  );
}
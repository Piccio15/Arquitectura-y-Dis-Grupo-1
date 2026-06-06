import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { crearConductorService } from '../../servicios/conductor-servicio';
import {
  crearConfiguracionService,
  type HorarioCobro
} from '../../servicios/configuracion-servicio';
import type { SesionActiva, Vehiculo } from '../../types/conductor-interface';

function TiempoTranscurrido({ desde }: { desde: string }) {
  const inicio = new Date(desde).getTime();
  const [ahora, setAhora] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const segs = Math.floor((ahora - inicio) / 1000);
  const hh = Math.floor(segs / 3600).toString().padStart(2, '0');
  const mm = Math.floor((segs % 3600) / 60).toString().padStart(2, '0');
  const ss = (segs % 60).toString().padStart(2, '0');
  return <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.3rem', color: '#1e2d6b' }}>{hh}:{mm}:{ss}</span>;
}

export default function ModuloEstacionamiento() {
  const { getToken } = useAuth();
  const [sesiones, setSesiones] = useState<SesionActiva[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [zonas, setZonas] = useState<{ id: number; nombre: string; precio_hora: number }[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<string | null>(null);
  const [finalizando, setFinalizando] = useState<number | null>(null);
  const [horarioCobro, setHorarioCobro] = useState<HorarioCobro | null>(null);

  // Form iniciar
  const [patenteSeleccionada, setPatenteSeleccionada] = useState('');
  const [zonaSeleccionada, setZonaSeleccionada] = useState('');
  const [iniciando, setIniciando] = useState(false);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const token = await getToken();
      const svc = crearConductorService(token);
      const configuracionSvc = crearConfiguracionService(token);
      const [sesionesData, vehiculosData, horarioData] = await Promise.all([
        svc.obtenerSesiones(),
        svc.obtenerVehiculos(),
        configuracionSvc.obtenerHorarioCobro(),
      ]);
      setSesiones(sesionesData || []);
      setVehiculos(vehiculosData || []);
      setHorarioCobro(horarioData);
    } catch (err: any) { setError(err.message); }
    finally { setCargando(false); }
  };

  const cargarZonas = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/zonas', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      });
      const data = await res.json();
      setZonas(data || []);
    } catch {}
  };

  useEffect(() => { cargarDatos(); cargarZonas(); }, []);

  const iniciar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultado(null);
    setIniciando(true);
    try {
      const token = await getToken();
      await crearConductorService(token).iniciarSesion(
        patenteSeleccionada, Number(zonaSeleccionada)
      );
      setPatenteSeleccionada('');
      setZonaSeleccionada('');
      setResultado('¡Estacionamiento iniciado correctamente!');
      cargarDatos();
    } catch (err: any) { setError(err.message); }
    finally { setIniciando(false); }
  };

  const finalizar = async (id: number) => {
    setFinalizando(id);
    setResultado(null);
    setError(null);
    try {
      const token = await getToken();
      const res = await crearConductorService(token).finalizarSesion(id);
      setResultado(`Sesión finalizada. Duración real: ${res.duracion_real_minutos} minutos. Costo cobrado: $${res.costo_cobrado.toFixed(2)}.`);
      cargarDatos();
    } catch (err: any) { setError(err.message); }
    finally { setFinalizando(null); }
  };

  if (cargando) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h2 className="seccion-titulo">Estacionamiento</h2>

      {horarioCobro && (
        <div className={`alerta ${horarioCobro.cobro_activo ? 'alerta-exito' : 'alerta-info'}`} style={{ marginBottom: '1rem' }}>
          Horario de cobro: <strong>{horarioCobro.hora_inicio_cobro} a {horarioCobro.hora_fin_cobro}</strong>.
          {' '}Estado actual: <strong>{horarioCobro.cobro_activo ? 'cobro activo' : 'fuera de horario'}</strong>.
        </div>
      )}

      {/* Formulario iniciar */}
      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Iniciar estacionamiento
        </h3>
        <form onSubmit={iniciar} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="campo">
            <label>Vehículo</label>
            <select value={patenteSeleccionada} onChange={e => setPatenteSeleccionada(e.target.value)} required>
              <option value="">Seleccioná un vehículo</option>
              {vehiculos.map(v => <option key={v.patente} value={v.patente}>{v.patente}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>Zona</label>
            <select value={zonaSeleccionada} onChange={e => setZonaSeleccionada(e.target.value)} required>
              <option value="">Seleccioná una zona</option>
              {zonas.map(z => <option key={z.id} value={z.id}>{z.nombre} — ${z.precio_hora}/hr</option>)}
            </select>
          </div>
          <div className="alerta alerta-info">
            Necesitas saldo positivo y estar dentro del horario de cobro para iniciar.
          </div>
          <button type="submit" className="btn btn-primario btn-ancho"
            disabled={iniciando || horarioCobro?.cobro_activo === false}>
            {iniciando ? 'Iniciando...' : '▶ Iniciar estacionamiento'}
          </button>
        </form>
      </div>

      {error && <div className="alerta alerta-error" style={{ marginBottom: '1rem' }}>{error}</div>}
      {resultado && <div className="alerta alerta-exito" style={{ marginBottom: '1rem' }}>{resultado}</div>}

      {sesiones.length === 0 ? (
        <div className="estado-vacio">
          <div className="estado-vacio-icono">⏱️</div>
          <p>No tenés sesiones activas en este momento.</p>
        </div>
      ) : (
        <div className="lista">
          {sesiones.map(s => (
            <div key={s.id} className="card" style={{ borderLeft: '3px solid #1e2d6b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div>
                  <span className="lista-item-titulo">{s.patente}</span>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    {s.zona.nombre} — ${s.zona.precio_hora}/hr
                  </div>
                </div>
                <span className="badge badge-azul">Activo</span>
              </div>
              <div style={{ textAlign: 'center', padding: '0.75rem 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '0.875rem' }}>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>
                  Tiempo transcurrido
                </div>
                <TiempoTranscurrido desde={s.fecha_inicio} />
              </div>
              <button className="btn btn-peligro btn-ancho"
                onClick={() => finalizar(s.id)} disabled={finalizando === s.id}>
                {finalizando === s.id ? 'Finalizando...' : 'Finalizar Estacionamiento'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// src/componentes/conductor/ModuloEstacionamiento.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { crearConductorService } from '../../servicios/conductor-servicio';
import type { SesionActiva } from '../../types/conductor-interface';

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

  return <span style={{ fontFamily: 'var(--fuente-mono)', fontWeight: 700, fontSize: '1.3rem', color: 'var(--azul)' }}>{hh}:{mm}:{ss}</span>;
}

export default function ModuloEstacionamiento() {
  const { getToken } = useAuth();
  const [sesiones, setSesiones] = useState<SesionActiva[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [finalizando, setFinalizando] = useState<string | null>(null);

  const cargarSesiones = async () => {
    try {
      setCargando(true);
      const token = await getToken();
      const datos = await crearConductorService(token).obtenerSesiones();
      setSesiones(datos || []);
    } catch (err: any) { setError(err.message); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargarSesiones(); }, []);

  const finalizar = async (id: string) => {
    setFinalizando(id);
    try {
      const token = await getToken();
      await crearConductorService(token).finalizarSesion(id);
      cargarSesiones();
    } catch (err: any) { setError(err.message); }
    finally { setFinalizando(null); }
  };

  if (cargando) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <div>
      <h2 className="seccion-titulo">Estacionamiento Activo</h2>

      {error && <div className="alerta alerta-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {sesiones.length === 0 ? (
        <div className="estado-vacio">
          <div className="estado-vacio-icono">⏱️</div>
          <p>No tenés sesiones activas en este momento.</p>
        </div>
      ) : (
        <div className="lista">
          {sesiones.map(s => (
            <div key={s.id} className="card" style={{ borderLeft: '3px solid var(--azul)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.875rem' }}>
                <div>
                  <span className="lista-item-titulo">{s.patente}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--gris-500)', marginTop: '0.2rem' }}>
                    Zona: {s.idZona}
                  </div>
                </div>
                <span className="badge badge-azul" style={{ background: 'var(--azul-claro)', color: 'var(--azul)' }}>Activo</span>
              </div>

              <div style={{ textAlign: 'center', padding: '0.75rem 0', borderTop: '1px solid var(--gris-100)', borderBottom: '1px solid var(--gris-100)', marginBottom: '0.875rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--gris-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.3rem' }}>Tiempo transcurrido</div>
                <TiempoTranscurrido desde={s.horaInicio} />
              </div>

              <button
                className="btn btn-peligro btn-ancho"
                onClick={() => finalizar(s.id)}
                disabled={finalizando === s.id}
              >
                {finalizando === s.id ? 'Finalizando...' : 'Finalizar Estacionamiento'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

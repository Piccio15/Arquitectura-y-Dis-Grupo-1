// src/componentes/conductor/ModuloMultas.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { CircleCheck } from 'lucide-react';
import { crearConductorService } from '../../servicios/conductor-servicio';
import type { Multa } from '../../types/conductor-interface';

export function ModuloMultas() {
  const { getToken } = useAuth();
  const [multas, setMultas] = useState<Multa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const token = await getToken();
      setMultas(await crearConductorService(token).obtenerMultas());
    } catch { setError('No se pudo obtener el historial de infracciones.'); }
    finally { setCargando(false); }
  };

  useEffect(() => { cargarDatos(); }, []);

  const pagar = async (id: number) => {
    if (!confirm('¿Confirmar pago de esta infracción con tu saldo virtual?')) return;
    setProcesandoId(id);
    setError(null);
    try {
      const token = await getToken();
      const preferencia = await crearConductorService(token).pagarMulta(id);
      const checkoutUrl = preferencia.sandboxCheckoutUrl || preferencia.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error('Mercado Pago no devolvio una URL de checkout');
      }

      window.location.assign(checkoutUrl);
    } catch (err: any) {
      setError(err.message);
      setProcesandoId(null);
    }
  };

  if (cargando) return <div className="spinner-wrap"><div className="spinner" /></div>;

  const pendientes = multas.filter(m => m.estado === 'PENDIENTE');
  const pagadas    = multas.filter(m => m.estado === 'PAGADA');

  return (
    <div>
      <h2 className="seccion-titulo">Infracciones</h2>

      {error && <div className="alerta alerta-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {multas.length === 0 ? (
        <div className="estado-vacio">
          <div className="estado-vacio-icono"><CircleCheck size={44} strokeWidth={1.8} /></div>
          <p>No tenés infracciones registradas.</p>
        </div>
      ) : (
        <>
          {pendientes.length > 0 && (
            <>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gris-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
                Pendientes ({pendientes.length})
              </p>
              <div className="lista" style={{ marginBottom: '1.5rem' }}>
                {pendientes.map(m => (
                  <div key={m.id_multa} className="card" style={{ borderLeft: '3px solid var(--rojo)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                      <span className="lista-item-titulo">{m.patente}</span>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--rojo)' }}>
                        ${m.monto.toLocaleString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--gris-500)', marginBottom: '0.875rem' }}>{m.ubicacion}</p>
                    <button
                      className="btn btn-peligro btn-ancho"
                      style={{ height: '40px' }}
                      onClick={() => pagar(m.id_multa)}
                      disabled={procesandoId === m.id_multa}
                    >
                      {procesandoId === m.id_multa ? 'Procesando...' : 'Pagar infracción'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {pagadas.length > 0 && (
            <>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gris-500)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.625rem' }}>
                Historial pagadas ({pagadas.length})
              </p>
              <div className="lista">
                {pagadas.map(m => (
                  <div key={m.id_multa} className="lista-item">
                    <div className="lista-item-izq">
                      <span className="lista-item-titulo">{m.patente}</span>
                      <span className="lista-item-subtitulo">{m.ubicacion}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.3rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--gris-500)' }}>${m.monto.toLocaleString()}</span>
                      <span className="badge badge-verde">Pagada</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

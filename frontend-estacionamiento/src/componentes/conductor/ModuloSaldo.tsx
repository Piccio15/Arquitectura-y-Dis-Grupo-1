// src/componentes/conductor/ModuloSaldo.tsx
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { crearConductorService } from '../../servicios/conductor-servicio';

const MONTOS_RAPIDOS = [500, 1000, 2000, 5000];

export function ModuloSaldo() {
  const { getToken } = useAuth();
  const [monto, setMonto] = useState<number>(1000);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'error' | 'exito' } | null>(null);

  const manejarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);
    setMensaje(null);
    try {
      const token = await getToken();
      await crearConductorService(token).cargarSaldo(monto);
      setMensaje({ texto: `✓ Se acreditaron $${monto.toLocaleString()} a tu billetera.`, tipo: 'exito' });
      setMonto(1000);
    } catch (err: any) {
      setMensaje({ texto: err.message || 'Error en la pasarela de pagos.', tipo: 'error' });
    } finally { setProcesando(false); }
  };

  return (
    <div>
      <h2 className="seccion-titulo">Recargar Billetera</h2>

      {mensaje && (
        <div className={`alerta alerta-${mensaje.tipo}`} style={{ marginBottom: '1rem' }}>
          {mensaje.texto}
        </div>
      )}

      <div className="card">
        <p style={{ fontSize: '0.82rem', color: 'var(--gris-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>
          Monto rápido
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {MONTOS_RAPIDOS.map(m => (
            <button
              key={m}
              type="button"
              className={`btn ${monto === m ? 'btn-primario' : 'btn-secundario'}`}
              style={{ height: '40px', fontSize: '0.85rem' }}
              onClick={() => setMonto(m)}
            >
              ${m.toLocaleString()}
            </button>
          ))}
        </div>

        <form onSubmit={manejarTransaccion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="campo">
            <label>O ingresá otro monto (ARS)</label>
            <input
              type="number"
              min="100"
              step="100"
              value={monto}
              onChange={e => setMonto(Number(e.target.value))}
              disabled={procesando}
              required
              style={{ fontSize: '1.1rem', fontWeight: 600 }}
            />
          </div>

          <button type="submit" className="btn btn-primario btn-ancho" disabled={procesando} style={{ height: '48px', background: '#009ee3' }}>
            {procesando ? 'Procesando...' : `Pagar $${monto.toLocaleString()} con MercadoPago`}
          </button>
        </form>
      </div>
    </div>
  );
}

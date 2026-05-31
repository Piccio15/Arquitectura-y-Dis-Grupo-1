import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { crearConductorService } from '../../servicios/conductor-servicio';

const MONTOS_RAPIDOS = [500, 1000, 2000, 5000];

export function ModuloSaldo() {
  const { getToken } = useAuth();
  const [monto, setMonto] = useState<number>(1000);
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const manejarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);
    setMensaje(null);

    try {
      const token = await getToken();
      const preferencia = await crearConductorService(token).cargarSaldo(monto);
      const checkoutUrl = preferencia.sandboxCheckoutUrl || preferencia.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error('Mercado Pago no devolvio una URL de checkout');
      }

      window.location.assign(checkoutUrl);
    } catch (error) {
      setMensaje(error instanceof Error ? error.message : 'Error en la pasarela de pagos');
      setProcesando(false);
    }
  };

  return (
    <div>
      <h2 className="seccion-titulo">Recargar Billetera</h2>

      {mensaje && (
        <div className="alerta alerta-error" style={{ marginBottom: '1rem' }}>
          {mensaje}
        </div>
      )}

      <div className="card">
        <p style={{ fontSize: '0.82rem', color: 'var(--gris-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.625rem' }}>
          Monto rapido
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
          {MONTOS_RAPIDOS.map(montoRapido => (
            <button
              key={montoRapido}
              type="button"
              className={`btn ${monto === montoRapido ? 'btn-primario' : 'btn-secundario'}`}
              style={{ height: '40px', fontSize: '0.85rem' }}
              onClick={() => setMonto(montoRapido)}
            >
              ${montoRapido.toLocaleString('es-AR')}
            </button>
          ))}
        </div>

        <form onSubmit={manejarTransaccion} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="campo">
            <label>O ingresa otro monto (ARS)</label>
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

          <button
            type="submit"
            className="btn btn-primario btn-ancho"
            disabled={procesando}
            style={{ height: '48px', background: '#009ee3' }}
          >
            {procesando ? 'Redirigiendo...' : `Continuar con Mercado Pago por $${monto.toLocaleString('es-AR')}`}
          </button>
        </form>

        <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--gris-500)' }}>
          Entorno de prueba: no se utilizara dinero real. El saldo se acredita cuando Mercado Pago confirma el pago.
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ConductorService } from '../../servicios/conductor-servicio';

export function ModuloSaldo() {
  const [monto, setMonto] = useState<number>(1000);
  const [procesando, setProcesando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<{ texto: string; tipo: 'error' | 'exito' } | null>(null);

  const manejarTransaccion = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcesando(true);
    setMensaje(null);

    try {
      await ConductorService.cargarSaldo(monto);
      setMensaje({ texto: `Se ha acreditado exitosamente un saldo de $${monto.toFixed(2)}.`, tipo: 'exito' });
      setMonto(1000); // Reseteo del estado local
    } catch (err: any) {
      setMensaje({ texto: err.message || 'Error en la pasarela de pagos.', tipo: 'error' });
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem' }}>
        Recarga de Billetera Virtual
      </h3>

      {mensaje && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          borderRadius: '4px', 
          backgroundColor: mensaje.tipo === 'error' ? '#fadbd8' : '#d5f5e3', 
          color: mensaje.tipo === 'error' ? '#c0392b' : '#27ae60',
          border: `1px solid ${mensaje.tipo === 'error' ? '#e74c3c' : '#2ecc71'}`
        }}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={manejarTransaccion} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#34495e', fontSize: '0.9rem' }}>
            Monto a recargar (ARS)
          </label>
          <input 
            type="number" 
            min="100" 
            step="100" 
            value={monto} 
            onChange={(e) => setMonto(Number(e.target.value))} 
            disabled={procesando}
            required 
            style={{ width: '100%', padding: '1rem', borderRadius: '4px', border: '1px solid #bdc3c7', fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={procesando}
          style={{ 
            padding: '1rem', 
            backgroundColor: '#009ee3', // Color característico de pasarelas de pago 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: '4px', 
            fontWeight: 'bold', 
            fontSize: '1rem', 
            cursor: procesando ? 'wait' : 'pointer',
            opacity: procesando ? 0.7 : 1
          }}
        >
          {procesando ? 'Procesando pago...' : 'Pagar con MercadoPago'}
        </button>
      </form>
    </div>
  );
}
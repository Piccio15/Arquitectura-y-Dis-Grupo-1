import { useState, useEffect } from 'react';
import { ConductorService } from '../../servicios/conductor-servicio';
import type { Multa } from '../../types/conductor-interface';

export function ModuloMultas() {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [procesandoPagoId, setProcesandoPagoId] = useState<string | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await ConductorService.obtenerMultas();
      setMultas(data);
    } catch (err) {
      setError('Falla al recuperar el historial de infracciones.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const manejarPagoLocal = async (idMulta: string) => {
    if (!window.confirm('¿Desea cancelar esta infracción debitando de su saldo virtual?')) return;
    
    setProcesandoPagoId(idMulta);
    setError(null);
    try {
      await ConductorService.pagarMulta(idMulta);
      await cargarDatos(); // Sincronización del estado de la vista
    } catch (err: any) {
      setError(err.message || 'Error en la liquidación de la multa.');
    } finally {
      setProcesandoPagoId(null);
    }
  };

  if (cargando) return <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>Obteniendo registros...</div>;

  return (
    <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      <h3 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem' }}>
        Estado de Infracciones
      </h3>

      {error && (
        <div style={{ backgroundColor: '#fadbd8', color: '#c0392b', padding: '0.8rem', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #e74c3c' }}>
          {error}
        </div>
      )}

      {multas.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem 0' }}>El historial de infracciones asociado a sus vehículos se encuentra vacío.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {multas.map(multa => (
            <div key={multa.id} style={{ 
              padding: '1.2rem', 
              border: '1px solid #ecf0f1', 
              borderLeft: `5px solid ${multa.estado === 'PAGADA' ? '#2ecc71' : '#e74c3c'}`, 
              borderRadius: '6px', 
              backgroundColor: '#fdfdfe' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#2c3e50' }}>Patente: {multa.patente}</span>
                <span style={{ 
                  color: multa.estado === 'PAGADA' ? '#27ae60' : '#c0392b', 
                  fontWeight: 'bold', 
                  fontSize: '0.85rem',
                  backgroundColor: multa.estado === 'PAGADA' ? '#d5f5e3' : '#fadbd8',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '4px'
                }}>
                  {multa.estado}
                </span>
              </div>
              <p style={{ margin: '0 0 1rem 0', color: '#7f8c8d', fontSize: '0.95rem' }}>{multa.motivo}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '1.3rem', color: '#34495e' }}>${multa.monto.toFixed(2)}</span>
                
                {multa.estado === 'PENDIENTE' && (
                  <button 
                    onClick={() => manejarPagoLocal(multa.id)}
                    disabled={procesandoPagoId === multa.id}
                    style={{ 
                      padding: '0.6rem 1rem', 
                      backgroundColor: '#f39c12', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '4px', 
                      fontWeight: 'bold', 
                      cursor: procesandoPagoId === multa.id ? 'wait' : 'pointer',
                      opacity: procesandoPagoId === multa.id ? 0.7 : 1
                    }}
                  >
                    Abonar Infracción
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
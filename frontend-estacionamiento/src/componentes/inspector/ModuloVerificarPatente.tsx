import { useState } from 'react';
import { InspectorService, type EstadoVerificacionDTO } from '../../servicios/inspector-servicio';

export default function ModuloVerificarPatente() {
  const [patente, setPatente] = useState('');
  const [resultado, setResultado] = useState<EstadoVerificacionDTO | null>(null);
  const [cargando, setCargando] = useState(false);
  const [errorRed, setErrorRed] = useState<string | null>(null);

  const verificar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setErrorRed(null);
    setResultado(null);
    
    try {
      // Invocación a la capa de servicios delegando la lógica de red
      const datos = await InspectorService.verificarPatente(patente);
      setResultado(datos);
    } catch (error: any) {
      setErrorRed(error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div>
      <h2 style={{ marginTop: 0, color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '0.5rem' }}>Verificación de Vehículos</h2>
      
      <form onSubmit={verificar} style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Ingrese patente (Ej: AB123CD)" 
          value={patente}
          onChange={(e) => setPatente(e.target.value.toUpperCase())}
          required
          style={{ flex: 1, padding: '0.8rem', border: '1px solid #bdc3c7', borderRadius: '4px', fontSize: '1.1rem', textTransform: 'uppercase' }}
        />
        <button type="submit" disabled={cargando} style={{ padding: '0.8rem 1.5rem', backgroundColor: '#e67e22', color: 'white', border: 'none', borderRadius: '4px', cursor: cargando ? 'wait' : 'pointer', fontWeight: 'bold' }}>
          {cargando ? 'Consultando...' : 'Verificar en Base de Datos'}
        </button>
      </form>

      {errorRed && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fadbd8', border: '1px solid #e74c3c', color: '#c0392b', borderRadius: '4px' }}>
          <strong>Error de comunicación:</strong> {errorRed}
        </div>
      )}

      {/* Renderizado condicional basado en la respuesta del DTO */}
      {resultado && !cargando && (
        <div style={{ 
          marginTop: '2rem', 
          padding: '1.5rem', 
          backgroundColor: resultado.tieneSesionActiva ? '#d5f5e3' : '#fdedec', 
          border: `1px solid ${resultado.tieneSesionActiva ? '#27ae60' : '#e74c3c'}`, 
          borderRadius: '4px' 
        }}>
          <h3 style={{ marginTop: 0, color: resultado.tieneSesionActiva ? '#27ae60' : '#c0392b' }}>
            {resultado.tieneSesionActiva ? 'Vehículo en Regla' : 'Infracción Detectada'}
          </h3>
          <p><strong>Patente consultada:</strong> {resultado.patente}</p>
          
          {resultado.tieneSesionActiva ? (
            <div>
              <p>El vehículo posee una sesión activa.</p>
              <p><strong>Zona:</strong> {resultado.zonaId}</p>
              <p><strong>Inicio:</strong> {resultado.horaInicio ? new Date(resultado.horaInicio).toLocaleTimeString() : 'N/A'}</p>
            </div>
          ) : (
            <div>
              <p>El vehículo no registra una sesión activa en la base de datos o carece de saldo suficiente.</p>
              <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', backgroundColor: '#c0392b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                Emitir Infracción
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
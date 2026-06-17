// src/componentes/inspector/ModuloVerificarPatente.tsx
import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Ban, CircleCheck, ClipboardList, Search } from 'lucide-react';
import { crearInspectorService, type EstadoVerificacionDTO } from '../../servicios/inspector-servicio';

export default function ModuloVerificarPatente() {
  const { getToken } = useAuth();
  const [patente, setPatente] = useState('');
  const [resultado, setResultado] = useState<EstadoVerificacionDTO | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emitiendo, setEmitiendo] = useState(false);
  const [ubicacionMulta, setUbicacionMulta] = useState('');
  const [montoMulta, setMontoMulta] = useState(5000);

  const verificar = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError(null);
    setResultado(null);
    try {
      const token = await getToken();
      setResultado(await crearInspectorService(token).verificarPatente(patente));
    } catch (err: any) { setError(err.message); }
    finally { setCargando(false); }
  };

  const [multaEmitida, setMultaEmitida] = useState(false);

const emitirMulta = async () => {
  if (!resultado) return;
  if (!ubicacionMulta.trim()) {
    setError('Ingresa la ubicacion de la infraccion.');
    return;
  }
  if (!Number.isFinite(montoMulta) || montoMulta <= 0) {
    setError('Ingresa un monto valido para la infraccion.');
    return;
  }

  setEmitiendo(true);
  setError(null);
  try {
    const token = await getToken();
    await crearInspectorService(token).emitirMulta(
      resultado.patente,
      ubicacionMulta.trim(),
      montoMulta
    );
    setMultaEmitida(true);
    setResultado(null);
    setPatente('');
    setUbicacionMulta('');
    setMontoMulta(5000);
  } catch (err: any) { setError(err.message); }
  finally { setEmitiendo(false); }
};

  return (
    
    <div>
      {multaEmitida && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
  }}>
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '2rem',
      maxWidth: '360px', width: '90%', textAlign: 'center',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
        <ClipboardList size={48} color="#1e2d6b" />
      </div>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
        Infracción emitida
      </p>
      <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.25rem' }}>
        Se registró la multa correctamente en el sistema.
      </p>
      <button
        className="btn btn-primario"
        style={{ width: '100%' }}
        onClick={() => setMultaEmitida(false)}
      >
        Aceptar
      </button>
    </div>
  </div>
)}
      <h2 className="seccion-titulo">Verificar Patente</h2>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <form onSubmit={verificar} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="campo">
            <label>Número de patente</label>
            <input
              type="text"
              placeholder="Ej: AB 123 CD"
              value={patente}
              onChange={e => setPatente(e.target.value.toUpperCase())}
              required
              style={{ fontFamily: 'var(--fuente-mono)', fontSize: '1.1rem', letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'center' }}
            />
          </div>
          <button type="submit" className="btn btn-primario btn-ancho" disabled={cargando} style={{ height: '48px' }}>
            {cargando ? 'Consultando base de datos...' : <><Search size={17} /> Buscar Patente</>}
          </button>
        </form>
      </div>

      {error && <div className="alerta alerta-error">{error}</div>}

      {resultado && (
        <div className={resultado.tieneSesionActiva ? 'resultado-ok' : 'resultado-mal'}>
          <div className="resultado-titulo" style={{ color: resultado.tieneSesionActiva ? 'var(--verde)' : 'var(--rojo)' }}>
            {resultado.tieneSesionActiva
              ? <><CircleCheck size={20} /> Vehiculo en regla</>
              : <><Ban size={20} /> Sin sesion activa</>}
          </div>

          <div className="patente-display" style={{ margin: '0.875rem 0', background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(0,0,0,0.08)' }}>
            {resultado.patente}
          </div>

          {resultado.tieneSesionActiva ? (
            <>
              <div className="resultado-fila">
                <span>Zona</span>
                <span>{resultado.nombreZona ?? resultado.zonaId}</span>
              </div>
              <div className="resultado-fila">
                <span>Hora de inicio</span>
                <span>{resultado.horaInicio ? new Date(resultado.horaInicio).toLocaleTimeString() : '—'}</span>
              </div>
            </>
          ) : (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--rojo)', marginBottom: '0.875rem' }}>
                El vehículo no registra sesión activa en el sistema.
              </p>
              <div className="campo" style={{ marginBottom: '0.875rem' }}>
                <label>Ubicacion de la infraccion</label>
                <input
                  type="text"
                  placeholder="Ej: Av. Colon 200"
                  value={ubicacionMulta}
                  onChange={e => setUbicacionMulta(e.target.value)}
                  required
                />
              </div>
              <div className="campo" style={{ marginBottom: '0.875rem' }}>
                <label>Monto de la multa</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={montoMulta}
                  onChange={e => setMontoMulta(Number(e.target.value))}
                  required
                />
              </div>
              <button
                className="btn btn-peligro btn-ancho"
                onClick={emitirMulta}
                disabled={emitiendo}
              >
                {emitiendo ? 'Emitiendo...' : <><ClipboardList size={17} /> Emitir Infraccion</>}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

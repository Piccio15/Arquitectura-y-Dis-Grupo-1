import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import {
  crearConfiguracionService,
  type HorarioCobro
} from '../../servicios/configuracion-servicio';

export default function ModuloHorarioCobro() {
  const { getToken } = useAuth();
  const [horario, setHorario] = useState<HorarioCobro>({
    hora_inicio_cobro: '08:00',
    hora_fin_cobro: '20:00'
  });
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarHorario = async () => {
      try {
        const token = await getToken();
        const datos = await crearConfiguracionService(token).obtenerHorarioCobro();
        setHorario(datos);
      } catch (err: any) {
        setError(err.message || 'No se pudo cargar el horario de cobro');
      } finally {
        setCargando(false);
      }
    };

    cargarHorario();
  }, [getToken]);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setGuardando(true);

    try {
      const token = await getToken();
      const datos = await crearConfiguracionService(token).actualizarHorarioCobro(horario);
      setHorario(datos);
      setMensaje('Horario de cobro actualizado correctamente.');
    } catch (err: any) {
      setError(err.message || 'No se pudo actualizar el horario de cobro');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return <div className="spinner-wrap"><div className="spinner" /></div>;
  }

  return (
    <div>
      <h2 className="seccion-titulo">Horario de Cobro</h2>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Los conductores solo pueden iniciar estacionamiento dentro de este horario.
          Al finalizar el horario de cobro, el backend cierra automaticamente las sesiones activas y cobra el tiempo real.
        </p>

        <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="campo">
            <label>Inicio del cobro</label>
            <input
              type="time"
              value={horario.hora_inicio_cobro}
              onChange={e => setHorario({ ...horario, hora_inicio_cobro: e.target.value })}
              required
            />
          </div>

          <div className="campo">
            <label>Fin del cobro</label>
            <input
              type="time"
              value={horario.hora_fin_cobro}
              onChange={e => setHorario({ ...horario, hora_fin_cobro: e.target.value })}
              required
            />
          </div>

          <div className={`alerta ${horario.cobro_activo ? 'alerta-exito' : 'alerta-info'}`}>
            Estado actual: <strong>{horario.cobro_activo ? 'Cobro activo' : 'Fuera de horario de cobro'}</strong>
          </div>

          {mensaje && <div className="alerta alerta-exito">{mensaje}</div>}
          {error && <div className="alerta alerta-error">{error}</div>}

          <button type="submit" className="btn btn-primario" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar horario'}
          </button>
        </form>
      </div>
    </div>
  );
}

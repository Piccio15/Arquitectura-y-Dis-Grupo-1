import { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { ShieldCheck } from 'lucide-react';
import { crearAdminService } from '../../servicios/admin-servicio';

export default function ModuloInspectores() {
  const { getToken } = useAuth();
  const [email, setEmail] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const asignarInspector = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setError(null);
    setGuardando(true);

    try {
      const token = await getToken();
      const usuario = await crearAdminService(token).asignarInspector(email);
      setEmail('');
      setMensaje(`${usuario.email} ahora es inspector. Legajo: ${usuario.inspector.legajo}.`);
    } catch (err: any) {
      setError(err.message || 'No se pudo asignar el inspector');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <h2 className="seccion-titulo">Gestion de Inspectores</h2>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div className="estado-vacio-icono" style={{ width: 44, height: 44 }}>
            <ShieldCheck size={26} strokeWidth={1.8} />
          </div>
          <div>
            <h3 style={{ margin: 0, color: '#0f172a' }}>Asignar inspector</h3>
            <p style={{ color: '#64748b', margin: '0.25rem 0 0' }}>
              Ingresa el email de una cuenta ya registrada para convertirla en inspector.
            </p>
          </div>
        </div>

        <form onSubmit={asignarInspector} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="campo">
            <label>Email del usuario</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="inspector@correo.com"
              required
            />
          </div>

          {mensaje && <div className="alerta alerta-exito">{mensaje}</div>}
          {error && <div className="alerta alerta-error">{error}</div>}

          <button type="submit" className="btn btn-primario" disabled={guardando}>
            {guardando ? 'Asignando...' : 'Convertir en inspector'}
          </button>
        </form>
      </div>
    </div>
  );
}

import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contextos/AuthContext';
import { apiClient } from '../servicios/api-client';
import type { RolUsuario } from '../App';

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCargando(true);

    if (!auth) {
      setError('Falla estructural: Contexto de autenticación inaccesible.');
      setCargando(false);
      return;
    }

    try {
      // Llamada real al Back-End. Esto fallará con ERR_CONNECTION_REFUSED actualmente.
      const respuesta = await apiClient<{ token: string, rol: RolUsuario }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, password })
      });

      auth.iniciarSesion(respuesta.token, respuesta.rol);

      if (respuesta.rol === 'ADMINISTRADOR') navigate('/admin');
      else if (respuesta.rol === 'CONDUCTOR') navigate('/conductor');
      else if (respuesta.rol === 'INSPECTOR') navigate('/inspector');

    } catch (err: any) {
      // El bloque catch captura el error del Gateway y lo muestra al usuario
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#2c3e50' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '3rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>Acceso al Sistema</h2>
        
        <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
            style={{ padding: '0.8rem', border: '1px solid #bdc3c7', borderRadius: '4px' }}
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '0.8rem', border: '1px solid #bdc3c7', borderRadius: '4px' }}
          />

          {error && (
            <div style={{ color: '#c0392b', backgroundColor: '#fadbd8', padding: '0.8rem', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={cargando} style={{ padding: '1rem', backgroundColor: '#3498db', color: '#fff', border: 'none', borderRadius: '4px', cursor: cargando ? 'wait' : 'pointer' }}>
            {cargando ? 'Conectando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
import { createContext, useState, useEffect } from 'react';
import type { ReactNode} from 'react';
import type { RolUsuario } from '../App'; // O donde tenga definido el tipo

interface AuthContextType {
  rolActivo: RolUsuario | null;
  token: string | null;
  iniciarSesion: (token: string, rol: RolUsuario) => void;
  cerrarSesion: () => void;
  cargando: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [rolActivo, setRolActivo] = useState<RolUsuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  // Hidratación del estado inicial desde el almacenamiento persistente
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const rolGuardado = localStorage.getItem('rolUsuario') as RolUsuario | null;

    if (tokenGuardado && rolGuardado) {
      setToken(tokenGuardado);
      setRolActivo(rolGuardado);
    }
    setCargando(false);
  }, []);

  const iniciarSesion = (nuevoToken: string, rol: RolUsuario) => {
    localStorage.setItem('token', nuevoToken);
    if(rol != null)
        localStorage.setItem('rolUsuario', rol);
    setToken(nuevoToken);
    setRolActivo(rol);
  };

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rolUsuario');
    setToken(null);
    setRolActivo(null);
  };

  return (
    <AuthContext.Provider value={{ rolActivo, token, iniciarSesion, cerrarSesion, cargando }}>
      {children}
    </AuthContext.Provider>
  );
}
import { createContext, useEffect, type ReactNode } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { setTokenGetter } from '../servicios/api-client';
import type { RolUsuario } from '../App';

interface AuthContextType {
  rolActivo: RolUsuario | null;
  cerrarSesion: () => void;
  cargando: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoaded, signOut, getToken } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);

  const rolActivo = (user?.publicMetadata?.rol as RolUsuario) ?? null;

  return (
    <AuthContext.Provider value={{
      rolActivo,
      cerrarSesion: () => { void signOut(); },
      cargando: !isLoaded,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

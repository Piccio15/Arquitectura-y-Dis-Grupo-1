import { Outlet } from 'react-router-dom';
import { LayoutPrincipal } from '../componentes/LayoutPrincipal';
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function VistaConductor() {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    console.log("Estado de Clerk:", { isLoaded, hasUser: !!user });

    if (isLoaded && user) {
      console.log("Intentando sincronizar con el backend...");
      
      fetch('http://localhost:3000/api/usuarios/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress
        })
      })
      .then(res => res.json())
      .then(data => console.log("Respuesta del backend:", data))
      .catch(err => console.error("Error de conexión:", err));
    }
  }, [isLoaded, user]); // IMPORTANTE: Agregá isLoaded acá

  return (
    <LayoutPrincipal titulo="Portal del Conductor" rutaInicio="/conductor">
      <Outlet />
    </LayoutPrincipal>
  );
}
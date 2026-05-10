
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export function useSincronizacion() {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      console.log("Sincronizando usuario:", user.primaryEmailAddress?.emailAddress);
      
      fetch('http://localhost:3000/api/usuarios/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress
        })
      })
      .then(res => res.json())
      .then(data => console.log("Sincronización exitosa:", data))
      .catch(err => console.error("Error al sincronizar:", err));
    }
  }, [isLoaded, user]);
}

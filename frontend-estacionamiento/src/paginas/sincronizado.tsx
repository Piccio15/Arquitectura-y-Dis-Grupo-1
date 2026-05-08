import { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";

export default function Sincronizando() {
  const { isLoaded, user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const syncUsuario = async () => {
      if (isLoaded && user) {
        try {
          // 1. Le avisamos al backend que cree el usuario y actualice Clerk
          const res = await fetch('http://localhost:3000/api/usuarios/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clerk_id: user.id,
              email: user.primaryEmailAddress?.emailAddress
            })
          });

          if (res.ok) {
            // 2. CRÍTICO: Obligamos a Clerk a recargar la sesión para que "vea" el nuevo rol
            await user.reload();
            
            // 3. Una vez actualizado, lo mandamos a su panel
            navigate('/conductor', { replace: true });
          } else {
            console.error("Fallo la respuesta del backend");
          }
        } catch (error) {
          console.error("Error de red al sincronizar", error);
        }
      }
    };

    syncUsuario();
  }, [isLoaded, user, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
      <h2>Configurando tu cuenta...</h2>
      <p>Por favor espera un momento.</p>
      {/* Acá podés poner un spinner de carga lindo si querés */}
    </div>
  );
}
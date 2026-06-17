import { SignIn, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

export default function Login() {
  return (
    <>
      <SignedIn>
        <Navigate to="/sincronizando" replace />
      </SignedIn>
      <SignedOut>
        <div className="login-wrapper">
          <div className="login-inner">
            <div className="login-encabezado">
              <h1>Bienvenido</h1>
              <p>Ingresa con tu cuenta para continuar</p>
            </div>
            <div className="login-card">
              <SignIn routing="hash" />
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

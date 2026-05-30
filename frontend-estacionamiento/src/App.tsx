// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { RutaProtegida } from './componentes/RutaProtegida';

import DashboardAdmin from './paginas/dashboardAdmin';
import VistaConductor from './paginas/VistaConductor';
import VistaInspector from './paginas/VistaInspector';

import MenuAdmin from './componentes/admin/MenuAdmin';
import MenuConductor from './componentes/conductor/MenuConductor';
import MenuInspector from './componentes/inspector/MenuInspector';

import ModuloZonas from './componentes/admin/ModuloZonas';
import ModuloInspectores from './componentes/admin/ModuloInspectores';
import ModuloVehiculos from './componentes/conductor/ModuloVehiculos';
import ModuloEstacionamiento from './componentes/conductor/ModuloEstacionamiento';
import { ModuloSaldo } from './componentes/conductor/ModuloSaldo';
import { ModuloMultas } from './componentes/conductor/ModuloMultas';
import ModuloVerificarPatente from './componentes/inspector/ModuloVerificarPatente';
import Sincronizando from './paginas/sincronizado';


export type RolUsuario = 'ADMINISTRADOR' | 'INSPECTOR' | 'CONDUCTOR';

const clerkApariencia = {
  layout: { socialButtonsPlacement: 'bottom' as const, shimmer: false },
  variables: {
    colorPrimary: '#1e2d6b',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    colorBackground: '#ffffff',
    colorInputBackground: '#f8fafc',
    colorInputText: '#0f172a',
    colorDanger: '#dc2626',
    borderRadius: '9px',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '15px',
    spacingUnit: '16px',
  },
  elements: {
    // Quitamos el card propio de Clerk — usamos el nuestro (.login-card)
    card: {
  boxShadow: 'none',
  border: 'none',
  borderRadius: '20px',   /* ← que coincida con .login-card */
  padding: '2rem 1.75rem 1.5rem',  /* ← Clerk maneja su propio padding */
  background: 'transparent',
},
    // Ocultamos el header de Clerk (nosotros ponemos el nuestro arriba)
    header: { display: 'none' },
    headerTitle: { display: 'none' },
    headerSubtitle: { display: 'none' },
    logoBox: { display: 'none' },
    formButtonPrimary: {
      backgroundColor: '#1e2d6b', fontWeight: '700', height: '44px',
      borderRadius: '9px', fontSize: '0.9rem',
      boxShadow: '0 2px 8px rgba(30,45,107,0.3)',
    },
    formFieldInput: {
      height: '44px', borderRadius: '9px',
      border: '1.5px solid #e2e8f0', fontSize: '0.9rem',
      backgroundColor: '#f8fafc',
    },
    formFieldLabel: {
      fontSize: '0.72rem', fontWeight: '700',
      color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em',
    },
    footerActionLink: { color: '#1e2d6b', fontWeight: '700' },
    socialButtonsBlockButton: {
      borderRadius: '9px', height: '42px',
      border: '1.5px solid #e2e8f0', fontSize: '0.875rem', fontWeight: '600',
    },
    dividerLine: { background: '#f1f5f9' },
    dividerText: { color: '#94a3b8', fontSize: '0.78rem' },
    footer: { '& a': { color: '#1e2d6b' } },
  },
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <>
            <SignedOut>
              <div className="login-wrapper">
                <div className="login-blob login-blob-1" />
                <div className="login-blob login-blob-2" />
                <div className="login-inner">
                  <div className="login-encabezado">
                    <h1>Bienvenido</h1>
                    <p>Ingresá con tu cuenta para continuar</p>
                  </div>
                  <div className="login-card">
                    <SignIn routing="hash" appearance={clerkApariencia} />
                  </div>
                </div>
              </div>
            </SignedOut>
            <SignedIn><Navigate to="/sincronizando" replace /></SignedIn>
          </>
        } />

        <Route path="/sincronizando" element={
          <RutaProtegida>
            <Sincronizando />
          </RutaProtegida>
        } />

        <Route path="/admin" element={<RutaProtegida rolRequerido="ADMINISTRADOR"><DashboardAdmin /></RutaProtegida>}>
          <Route index element={<MenuAdmin />} />
          <Route path="zonas" element={<ModuloZonas />} />
          <Route path="inspectores" element={<ModuloInspectores />} />
        </Route>

        <Route path="/conductor" element={<RutaProtegida rolRequerido="CONDUCTOR"><VistaConductor /></RutaProtegida>}>
          <Route index element={<MenuConductor />} />
          <Route path="vehiculos"       element={<ModuloVehiculos />} />
          <Route path="estacionamiento" element={<ModuloEstacionamiento />} />
          <Route path="saldo"           element={<ModuloSaldo />} />
          <Route path="multas"          element={<ModuloMultas />} />
        </Route>

        <Route path="/inspector" element={<RutaProtegida rolRequerido="INSPECTOR"><VistaInspector /></RutaProtegida>}>
          <Route index element={<MenuInspector />} />
          <Route path="verificar" element={<ModuloVerificarPatente />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

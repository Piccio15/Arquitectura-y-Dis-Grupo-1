import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignIn } from '@clerk/clerk-react';
import { RutaProtegida } from './componentes/RutaProtegida';

// Controladores de Subsistema (Vistas Principales / Layouts)
import DashboardAdmin from './paginas/dashboardAdmin';
import VistaConductor from './paginas/VistaConductor';
import VistaInspector from './paginas/VistaInspector';

// Menús Hub (Navegación basada en Tarjetas / PWA)
import MenuAdmin from './componentes/admin/MenuAdmin';
import MenuConductor from './componentes/conductor/MenuConductor';
import MenuInspector from './componentes/inspector/MenuInspector';

// Módulos de Dominio: Administrador
import ModuloZonas from './componentes/admin/ModuloZonas';
import ModuloInspectores from './componentes/admin/ModuloInspectores';

// Módulos de Dominio: Conductor
import ModuloVehiculos from './componentes/conductor/ModuloVehiculos';
import ModuloEstacionamiento from './componentes/conductor/ModuloEstacionamiento';
import {ModuloSaldo} from './componentes/conductor/ModuloSaldo';
import {ModuloMultas} from './componentes/conductor/ModuloMultas';

// Módulos de Dominio: Inspector
import ModuloVerificarPatente from './componentes/inspector/ModuloVerificarPatente';
import Sincronizando from './paginas/sincronizado';

export type RolUsuario = 'ADMINISTRADOR' | 'INSPECTOR' | 'CONDUCTOR';

export default function App() {
  return (
    
      <BrowserRouter>
        <Routes>
          {/* Ruta Base: Autenticación Delegada a Clerk */}
          {/* Ruta Base: Autenticación */}
          <Route path="/" element={
           <>
              <SignedOut>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                  {/* forceRedirectUrl manda al usuario a la zona de tránsito al loguearse */}
                <SignIn routing="hash" forceRedirectUrl="/sincronizando" fallbackRedirectUrl="/sincronizando" />
              </div>
              </SignedOut>
            
              <SignedIn>
                {/* Si ya está logueado y entra a la raíz, lo mandamos a sincronizar por las dudas */}
                <Navigate to="/sincronizando" replace />
              </SignedIn>
            </>
          } />

        {/* ZONA DE TRÁNSITO (Sin RutaProtegida) */}
        <Route path="/sincronizando" element={<Sincronizando />} />

          {/* Subsistema: Administración Central */}
          <Route path="/admin" element={
            <RutaProtegida rolRequerido="ADMINISTRADOR">
              <DashboardAdmin />
            </RutaProtegida>
          }>
            {/* El índice renderiza el menú de tarjetas por defecto */}
            <Route index element={<MenuAdmin />} />
            <Route path="zonas" element={<ModuloZonas />} />
            <Route path="inspectores" element={<ModuloInspectores />} />
          </Route>
          
          {/* Subsistema: Portal del Conductor */}
          <Route path="/conductor" element={
            <RutaProtegida rolRequerido="CONDUCTOR">
              <VistaConductor />
            </RutaProtegida>
          }>
            <Route index element={<MenuConductor />} />
            <Route path="vehiculos" element={<ModuloVehiculos />} />
            <Route path="estacionamiento" element={<ModuloEstacionamiento />} />
            <Route path="saldo" element={<ModuloSaldo />} />
            <Route path="multas" element={<ModuloMultas />} />
          </Route>

          {/* Subsistema: Terminal de Inspección */}
          <Route path="/inspector" element={
            <RutaProtegida rolRequerido="INSPECTOR">
              <VistaInspector />
            </RutaProtegida>
          }>
            <Route index element={<MenuInspector />} />
            <Route path="verificar" element={<ModuloVerificarPatente />} />
          </Route>

          {/* Regla de Captura por Defecto (Fallback de Seguridad) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
          
  );
}
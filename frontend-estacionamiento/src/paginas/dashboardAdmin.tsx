import { Outlet } from 'react-router-dom';
import { LayoutPrincipal } from '../componentes/LayoutPrincipal';
import { useSincronizacion } from '../servicios/useSincronizacion';

export default function DashboardAdmin() {
  useSincronizacion();
  return (
    <LayoutPrincipal titulo="Administración" rutaInicio="/admin">
      {/* Outlet renderiza el MenuAdmin o cualquier submódulo */}
      <Outlet /> 
    </LayoutPrincipal>
  );
}
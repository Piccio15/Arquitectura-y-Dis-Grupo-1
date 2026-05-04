import { Outlet } from 'react-router-dom';
import { LayoutPrincipal } from '../componentes/LayoutPrincipal';

export default function DashboardAdmin() {
  return (
    <LayoutPrincipal titulo="Administración Central" rutaInicio="/admin">
      <Outlet />
    </LayoutPrincipal>
  );
}
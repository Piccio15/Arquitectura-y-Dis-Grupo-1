import { Outlet } from 'react-router-dom';
import { LayoutPrincipal } from '../componentes/LayoutPrincipal';
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function VistaConductor() {

  return (
    <LayoutPrincipal titulo="Portal del Conductor" rutaInicio="/conductor">
      <Outlet />
    </LayoutPrincipal>
  );
}
import { orm } from './orm-config';

export const ZonaRepository = {
  listarZonas: async () => {
    return await orm.zona.findMany();
  },

  buscarZonaPorId: async (id: number) => {
    return await orm.zona.findUnique({ where: { id } });
  },

  contarSesionesPorZona: async (id: number) => {
    return await orm.sesionestacionamiento.count({
      where: { zonaId: id }
    });
  },

  crearZona: async (datos: { nombre: string; calles: string; precio_hora: number; coordenadas: object }) => {
    return await orm.zona.create({ data: datos });
  },

  actualizarZona: async (id: number, datos: { nombre: string; precio_hora: number; coordenadas: object }) => {
    return await orm.zona.update({ where: { id }, data: datos });
  },

  eliminarZona: async (id: number) => {
    return await orm.zona.delete({ where: { id } });
  }
};

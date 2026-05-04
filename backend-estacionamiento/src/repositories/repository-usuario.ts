/*Responsabilidad: Abstraer las consultas para buscar perfiles de conductor por email, 
crear nuevos usuarios y actualizar el saldo de la billetera virtual. */

// EJEMPLO DE COMO SE APLICARIA EL REPOSITORIO CON ORM

// 1. Se importa la instancia única del ORM (módulo de bajo nivel)
import { orm } from './orm-config'; 

// 2. Se exporta el Repositorio, el cual será consumido por el Service
export const UsuarioRepository = {
  
  buscarPorEmail: async (email: string) => {
    // El repositorio oculta la sintaxis específica del ORM
    return await orm.usuario.findUnique({
      where: { email: email }
    });
  },

  buscarPorId: async (id: string) => {
    return await orm.usuario.findUnique({
      where: { id: id }
    });
  },

  actualizarSaldo: async (id: string, nuevoSaldo: number) => {
    // Operación de persistencia abstraída
    return await orm.usuario.update({
      where: { id: id },
      data: { saldo: nuevoSaldo }
    });
  }
};
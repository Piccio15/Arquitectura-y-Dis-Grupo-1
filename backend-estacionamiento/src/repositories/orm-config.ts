/*Responsabilidad: Actuar como un Singleton (patrón de Gamma et al.) para instanciar 
la conexión del ORM a la base de datos una sola vez y exportarla para que los repositorios la utilicen. 
Se usa el patron Singleton para garantizar que solo exista una única instancia de la conexión a la base 
de datos en toda la aplicación, evitando fugas de memoria y el agotamiento del pool de conexiones.
*/
// src/repositories/db.client.ts

import { PrismaClient } from '@prisma/client';

// Extensión del objeto global de Node para preservar la instancia en entornos de desarrollo (Hot Reloading)
declare global {
  // Evita que TypeScript marque un error si prismaGlobal no está definido
  var prismaGlobal: PrismaClient | undefined;
}

// Implementación del patrón Singleton:
// Reutiliza la instancia existente o crea una nueva si no existe.
export const orm = globalThis.prismaGlobal || new PrismaClient({
  // Configuración de logs para auditoría y depuración (Alineado con buenas prácticas operativas)
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// En entornos de desarrollo, las recargas de módulos (HMR) pueden crear múltiples conexiones.
// Esto asegura que la instancia se mantenga en memoria a través del objeto global.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = orm;
}
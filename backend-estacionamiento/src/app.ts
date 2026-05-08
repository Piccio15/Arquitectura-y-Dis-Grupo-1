import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { clerkMiddleware } from '@clerk/express';
import cors from 'cors';

// Inicializamos Express y Prisma
const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;

// 1. Le decimos a TypeScript que el Request de Express ahora incluye "auth"
declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string | null;
        sessionId?: string | null;
      };
    }
  }
}

app.use(cors({
  origin: 'http://localhost:5173', // Solo permitís a tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());
app.use(clerkMiddleware());

// ==========================================
// RUTAS DE PRUEBA: ZONAS
// ==========================================

// 1. POST: Crear una nueva zona
app.post('/api/zonas', async (req: Request, res: Response) => {
  try {
    const { nombre, calles, precio_hora } = req.body;
    const nuevaZona = await prisma.zona.create({
      data: {
        nombre: nombre,
        calles: calles,
        precio_hora: precio_hora
      }
    });
    res.status(201).json({ mensaje: "Zona creada con éxito", zona: nuevaZona });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno al crear la zona" });
  }
});

// 2. GET: Obtener todas las zonas
app.get('/api/zonas', async (req: Request, res: Response) => {
  try {
    const zonas = await prisma.zona.findMany();
    res.status(200).json(zonas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las zonas" });
  }
});

// Ruta Protegida de prueba
app.post('/api/estacionamiento/iniciar', async (req: Request, res: Response) => {
  if (!req.auth?.userId) {
     return res.status(401).json({ 
       error: "Acceso denegado. Debes iniciar sesión para estacionar." 
     });
  }

  const clerkUserId = req.auth.userId;

  try {
      res.json({ 
        mensaje: "Estacionamiento iniciado con éxito", 
        usuarioAuntenticado: clerkUserId 
      });
  } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
  }
});

// En tu archivo de rutas de usuario INTENTO CREAR UN USUARIO SI ES LA PRIMERA VEZ QUE INICIA SESIÓN
app.post('/api/usuarios/sync', async (req: Request, res: Response) => {
  const { clerk_id, email } = req.body; // Estos vienen del frontend tras el login

  try {
    const usuario = await prisma.usuario.upsert({
      where: { clerk_id: clerk_id },
      update: {}, // Si ya existe, no hace nada
      create: {
        clerk_id: clerk_id,
        email: email,
        dni: clerk_id, // Lo ponemos temporal, después le pedís que lo complete
        rol: "CONDUCTOR",
        conductor: {
          create: { saldo: 0.0 }
        }
      },
      include: { conductor: true }
    });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al sincronizar usuario" });
  }
});

// ==========================================
// LEVANTAR EL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
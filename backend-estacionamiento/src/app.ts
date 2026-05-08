import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { clerkClient, clerkMiddleware } from '@clerk/express';
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


//INTENTO CREAR UN USUARIO SI ES LA PRIMERA VEZ QUE INICIA SESIÓN y actualizo metadata de clerk // NO BORRAR, ESTA FUNCIONANDO. faltaria realocar.
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

    // 💡 PASO CLAVE: Le informamos a Clerk el rol que tiene en nuestra DB
    await clerkClient.users.updateUserMetadata(clerk_id, {
      publicMetadata: {
        role: usuario.rol
      }
    });

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: "Error al sincronizar usuario" });
  }
});


// ==========================================
// RUTAS DE PRUEBA PARA ZONAS (CRUD BÁSICO)
// ==========================================
//// 1. POST: Crear una nueva zona
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

// ==========================================
// LEVANTAR EL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
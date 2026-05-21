import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import dataRoutes from './routes/dataRoutes';
import aiRoutes from './routes/aiRoutes';
import payosRoutes from './routes/payosRoutes';
import prisma from './lib/prismaClient';
import { globalErrorHandler } from './middleware/error';
import RealTimeServer from './realtime/RealTimeServer';

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean) as string[];

const isLocalNetworkOrigin = (origin: string) => {
  return /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)[:0-9]*$/.test(origin);
};

// Self-host mode: when running behind an nginx reverse proxy on a VPS, the
// public IP/domain is not known at config time. Auth uses Bearer tokens
// (localStorage), not cookies, so reflecting the request origin is safe.
const corsAllowAll = process.env.CORS_ALLOW_ALL === 'true';

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        corsAllowAll ||
        !origin ||
        allowedOrigins.includes(origin) ||
        isLocalNetworkOrigin(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} is not allowed`));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payos', payosRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'Backend is running!' });
});

app.get('/api/db-check', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'Database connection successful!' });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed', details: error });
  }
});

app.use(globalErrorHandler);

app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Attach the realtime (Socket.io) server so live chat & notifications work.
const realtime = new RealTimeServer(httpServer);
export { realtime };

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.io realtime server attached`);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

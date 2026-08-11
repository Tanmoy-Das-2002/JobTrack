import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db.js';
import authRoutes from './server/routes/authRoutes.js';
import applicationRoutes from './server/routes/applicationRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Safely determine __dirname for both ESM (dev/tsx) and bundled CJS (production)
const currentDirname = typeof __dirname !== 'undefined'
  ? __dirname
  : (typeof import.meta !== 'undefined' && import.meta.url ? path.dirname(fileURLToPath(import.meta.url)) : process.cwd());

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Global Middleware
  app.use(cors());
  app.use(express.json());

  // Connect to Database
  await connectDB();

  // Authentication API Routes
  app.use('/api/auth', authRoutes);

  // Application CRUD API Routes
  app.use('/api/applications', applicationRoutes);

  // Health check API endpoint to verify backend status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      message: 'JobTrack REST API Server is online and operational!',
      timestamp: new Date().toISOString()
    });
  });

  // Integrate Vite for frontend serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 JobTrack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

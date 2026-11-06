import http from 'http';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import streamsRouter from './routes/streams';
import { initSocketServer } from './services/socketService';
import { streamManager } from './services/streamManager';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin)
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io initialization
const io = initSocketServer(server, [CLIENT_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:5173', '*']);

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'RTSP Video Stream Viewer API',
    version: '1.0.0',
    status: 'running',
    activeStreams: streamManager.getAll().filter((s) => s.status === 'streaming').length,
    totalStreams: streamManager.getAll().length,
  });
});

app.use('/api/health', healthRouter);
app.use('/api/streams', streamsRouter);

// 404 handler for unknown routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Centralized error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Graceful shutdown handling
const handleExit = () => {
  console.log('\n[Server] Shutting down gracefully...');
  streamManager.cleanup();
  server.close(() => {
    console.log('[Server] HTTP and Socket server closed');
    process.exit(0);
  });
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready and listening for connections`);
});

export { app, server, io };

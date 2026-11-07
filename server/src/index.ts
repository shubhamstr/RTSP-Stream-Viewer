import http from 'http';
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import streamsRouter from './routes/streams';
import { initSocketServer } from './services/socketService';
import { streamManager } from './services/streamManager';
import { logger, protectLogsMiddleware, requestLoggerMiddleware } from './services/logger';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Security Middleware: Strictly hide and protect logs folder from public HTTP access
app.use(protectLogsMiddleware);

// Request Logging Middleware: Record incoming requests and response timings
app.use(requestLoggerMiddleware);

// CORS Middleware
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
app.use((req: Request, res: Response) => {
  logger.warn('Router', `Endpoint not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Centralized error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Server', 'Unhandled error encountered in Express pipeline:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Uncaught exception and unhandled rejection safety
process.on('uncaughtException', (err: Error) => {
  logger.error('Server', 'Uncaught Exception detected:', err);
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Server', 'Unhandled Promise Rejection detected:', reason);
});

// Graceful shutdown handling
const handleExit = (signal: string) => {
  logger.info('Server', `Received ${signal}. Shutting down gracefully...`);
  streamManager.cleanup();
  server.close(async () => {
    logger.info('Server', 'HTTP and Socket server closed');
    await logger.close();
    process.exit(0);
  });
};

process.on('SIGINT', () => handleExit('SIGINT'));
process.on('SIGTERM', () => handleExit('SIGTERM'));

// Start server
server.listen(PORT, () => {
  logger.info('Server', `🚀 Server listening on http://localhost:${PORT}`);
  logger.info('Server', `🔌 Socket.io ready and listening for connections`);
  logger.info('Server', `📁 Logging initialized. Saving to: ${logger.getLogsDirectory()}`);
});

export { app, server, io };

import http from 'http';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRouter from './routes/health';
import streamsRouter from './routes/streams';
import { initSocketServer } from './services/socketService';

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.io initialization
const io = initSocketServer(server, [CLIENT_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:5173']);

// Routes
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'RTSP Video Stream Viewer API',
    version: '1.0.0',
    status: 'running',
  });
});

app.use('/api/health', healthRouter);
app.use('/api/streams', streamsRouter);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io ready and listening for connections`);
});

export { app, server, io };


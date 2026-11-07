import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { streamManager } from './streamManager';
import { logger } from './logger';

export const initSocketServer = (httpServer: HttpServer, allowedOrigin: string | string[]) => {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Max buffer size for high-frequency video frames
    maxHttpBufferSize: 1e7,
  });

  // Link socket server to stream manager for frame broadcasting
  streamManager.setSocketServer(io);

  io.on('connection', (socket: Socket) => {
    logger.info('Socket', `Client connected: ${socket.id} (IP: ${socket.handshake.address})`);

    // Initial ping/pong
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Client requests current list of streams
    socket.on('stream:get_all', () => {
      logger.debug('Socket', `Client ${socket.id} requested stream list`);
      socket.emit('stream:list', streamManager.getAll());
    });

    // Client subscribes to a specific stream feed
    socket.on('stream:join', async (data: { streamId: string }) => {
      const { streamId } = data || {};
      if (!streamId) return;

      const room = `stream:${streamId}`;
      socket.join(room);
      logger.info('Socket', `Socket ${socket.id} joined room ${room}`);

      const stream = streamManager.getById(streamId);
      if (stream) {
        socket.emit('stream:status', {
          streamId,
          status: stream.status,
          error: stream.error,
          active: stream.active,
          displayed: stream.displayed,
        });

        // If displayed and currently stopped, start streaming
        if (stream.displayed && stream.status === 'stopped') {
          try {
            await streamManager.startStream(streamId);
          } catch (err) {
            logger.error('Socket', `Auto-start failed for stream ${streamId}:`, err);
          }
        }
      }
    });

    // Client unsubscribes from a specific stream feed
    socket.on('stream:leave', (data: { streamId: string }) => {
      const { streamId } = data || {};
      if (!streamId) return;

      const room = `stream:${streamId}`;
      socket.leave(room);
      logger.info('Socket', `Socket ${socket.id} left room ${room}`);
    });

    // Client requests stream start (play)
    socket.on('stream:start', async (data: { streamId: string }) => {
      const { streamId } = data || {};
      if (!streamId) return;
      logger.info('Socket', `Client ${socket.id} requested start for stream ${streamId}`);
      try {
        await streamManager.startStream(streamId);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error('Socket', `Error starting stream ${streamId}:`, message);
        socket.emit('stream:error', { streamId, error: message });
      }
    });

    // Client requests stream stop (pause)
    socket.on('stream:stop', (data: { streamId: string }) => {
      const { streamId } = data || {};
      if (!streamId) return;
      logger.info('Socket', `Client ${socket.id} requested stop for stream ${streamId}`);
      streamManager.stopStream(streamId);
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket', `Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { streamManager } from './streamManager';

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
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Initial ping/pong
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Client requests current list of streams
    socket.on('stream:get_all', () => {
      socket.emit('stream:list', streamManager.getAll());
    });

    // Client subscribes to a specific stream feed
    socket.on('stream:join', async (data: { streamId: string }) => {
      const { streamId } = data || {};
      if (!streamId) return;

      const room = `stream:${streamId}`;
      socket.join(room);
      console.log(`[Socket.io] Socket ${socket.id} joined ${room}`);

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
            console.error(`[Socket.io] Auto-start failed for ${streamId}:`, err);
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
      console.log(`[Socket.io] Socket ${socket.id} left ${room}`);
    });

    // Client requests stream start (play)
    socket.on('stream:start', async (data: { streamId: string }) => {
      const { streamId } = data || {};
      if (!streamId) return;
      try {
        await streamManager.startStream(streamId);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        socket.emit('stream:error', { streamId, error: message });
      }
    });

    // Client requests stream stop (pause)
    socket.on('stream:stop', (data: { streamId: string }) => {
      const { streamId } = data || {};
      if (!streamId) return;
      streamManager.stopStream(streamId);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket.io] Client disconnected: ${socket.id} (${reason})`);
    });
  });

  return io;
};

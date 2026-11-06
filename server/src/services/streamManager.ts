import { spawn, ChildProcess } from 'child_process';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';
import { Server as SocketIOServer } from 'socket.io';
import { StreamItem, CreateStreamDto, UpdateStreamDto } from '../types/stream';

// Determine FFmpeg binary location
const resolveFfmpegPath = (): string => {
  if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) {
    return process.env.FFMPEG_PATH;
  }
  if (ffmpegStatic && fs.existsSync(ffmpegStatic)) {
    return ffmpegStatic;
  }
  return 'ffmpeg';
};

const FFMPEG_BIN = resolveFfmpegPath();
console.log(`[StreamManager] Using FFmpeg binary: ${FFMPEG_BIN}`);

interface ActiveProcess {
  process: ChildProcess;
  lastError: string;
  frameCount: number;
}

export class StreamManager {
  private streams: Map<string, StreamItem> = new Map();
  private processes: Map<string, ActiveProcess> = new Map();
  private io: SocketIOServer | null = null;
  private nextId = 1;

  constructor() {
    // Streams are not pre-seeded on startup; users can add streams or select default options from the UI modal.
  }

  public setSocketServer(io: SocketIOServer) {
    this.io = io;
  }

  public getAll(): StreamItem[] {
    return Array.from(this.streams.values());
  }

  public getById(id: string): StreamItem | undefined {
    return this.streams.get(id);
  }

  public addStream(dto: CreateStreamDto): StreamItem {
    const id = String(this.nextId++);
    const newStream: StreamItem = {
      id,
      name: dto.name.trim() || `Stream ${id}`,
      url: dto.url.trim(),
      status: 'stopped',
      active: dto.active ?? true,
      displayed: dto.displayed ?? true,
      createdAt: Date.now(),
    };

    this.streams.set(id, newStream);
    console.log(`[StreamManager] Added new stream ${id}: "${newStream.name}" (${newStream.url})`);

    // Auto-start if requested active and displayed
    if (newStream.active && newStream.displayed) {
      this.startStream(id).catch((err) => {
        console.error(`[StreamManager] Error starting new stream ${id}:`, err);
      });
    }

    this.broadcastStreamsList();
    return newStream;
  }

  public updateStream(id: string, dto: UpdateStreamDto): StreamItem | undefined {
    const stream = this.streams.get(id);
    if (!stream) return undefined;

    if (dto.name !== undefined) stream.name = dto.name;
    if (dto.url !== undefined && dto.url !== stream.url) {
      stream.url = dto.url;
      // If URL changed while running, restart process
      if (this.processes.has(id)) {
        this.stopStream(id);
        if (stream.active && stream.displayed) {
          this.startStream(id);
        }
      }
    }

    if (dto.active !== undefined) {
      stream.active = dto.active;
      if (!dto.active) {
        stream.displayed = false;
        this.stopStream(id);
      }
    }

    if (dto.displayed !== undefined) {
      stream.displayed = dto.displayed;
      if (!dto.displayed && this.processes.has(id)) {
        this.stopStream(id);
      } else if (dto.displayed && stream.active && !this.processes.has(id)) {
        this.startStream(id);
      }
    }

    this.broadcastStreamStatus(id);
    this.broadcastStreamsList();
    return stream;
  }

  public deleteStream(id: string): boolean {
    if (!this.streams.has(id)) return false;
    this.stopStream(id);
    this.streams.delete(id);
    console.log(`[StreamManager] Deleted stream ${id}`);
    this.broadcastStreamsList();
    return true;
  }

  public async startStream(id: string): Promise<StreamItem> {
    const stream = this.streams.get(id);
    if (!stream) {
      throw new Error(`Stream ${id} not found`);
    }

    // Already running or starting
    if (this.processes.has(id)) {
      console.log(`[StreamManager] Stream ${id} is already running/starting`);
      return stream;
    }

    stream.status = 'starting';
    stream.error = undefined;
    stream.displayed = true;
    stream.active = true;
    this.broadcastStreamStatus(id);

    console.log(`[StreamManager] Starting FFmpeg process for stream ${id} (${stream.url})`);

    const isRtsp = stream.url.toLowerCase().startsWith('rtsp://') || stream.url.toLowerCase().startsWith('rtsps://');
    const args: string[] = [
      '-loglevel', 'warning',
      '-fflags', 'nobuffer+flush_packets',
      '-flags', 'low_delay',
    ];

    if (isRtsp) {
      args.push('-rtsp_transport', 'tcp');
      args.push('-timeout', '5000000'); // 5 second socket timeout (in microseconds)
    }

    args.push(
      '-probesize', '65536',
      '-analyzeduration', '200000',
      '-i', stream.url,
      '-an',                // omit audio for canvas video frames
      '-c:v', 'mjpeg',      // transcode to Motion JPEG frames
      '-q:v', '4',          // balance image quality and bandwidth
      '-r', '20',           // limit to 20 fps for responsive live playback
      '-f', 'image2pipe',   // stream image sequence to stdout
      '-'
    );

    try {
      const child = spawn(FFMPEG_BIN, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });

      const activeItem: ActiveProcess = {
        process: child,
        lastError: '',
        frameCount: 0,
      };
      this.processes.set(id, activeItem);

      // Parse MJPEG stdout: JPEG starts with 0xFF 0xD8 and ends with 0xFF 0xD9
      let frameBuffer = Buffer.alloc(0);
      const SOI = Buffer.from([0xff, 0xd8]);
      const EOI = Buffer.from([0xff, 0xd9]);

      child.stdout.on('data', (chunk: Buffer) => {
        frameBuffer = Buffer.concat([frameBuffer, chunk]);

        while (true) {
          const startIndex = frameBuffer.indexOf(SOI);
          if (startIndex === -1) {
            // Discard any garbage before SOI if oversized
            if (frameBuffer.length > 512 * 1024) {
              frameBuffer = Buffer.alloc(0);
            }
            break;
          }

          const endIndex = frameBuffer.indexOf(EOI, startIndex + 2);
          if (endIndex === -1) {
            // Incomplete JPEG; keep buffer from startIndex
            if (startIndex > 0) {
              frameBuffer = frameBuffer.subarray(startIndex);
            }
            // Protect against runaway buffer memory on corrupt feeds
            if (frameBuffer.length > 4 * 1024 * 1024) {
              frameBuffer = Buffer.alloc(0);
            }
            break;
          }

          // Complete frame extracted
          const fullFrame = frameBuffer.subarray(startIndex, endIndex + 2);
          frameBuffer = frameBuffer.subarray(endIndex + 2);

          if (stream.status !== 'streaming') {
            stream.status = 'streaming';
            stream.error = undefined;
            this.broadcastStreamStatus(id);
          }

          activeItem.frameCount++;
          stream.lastActive = Date.now();

          // Emit binary frame over WebSockets to room `stream:${id}`
          if (this.io) {
            this.io.to(`stream:${id}`).emit('stream:frame', {
              streamId: id,
              frame: fullFrame,
              timestamp: Date.now(),
            });
          }
        }
      });

      child.stderr.on('data', (data: Buffer) => {
        const line = data.toString().trim();
        if (line) {
          activeItem.lastError = line;
          // Only log real errors or connection warnings
          if (line.includes('Connection refused') || line.includes('Server returned') || line.includes('error')) {
            console.warn(`[FFmpeg ${id} Warning] ${line}`);
          }
        }
      });

      child.on('error', (err: Error) => {
        console.error(`[FFmpeg ${id}] Failed to spawn process:`, err.message);
        this.handleProcessError(id, `FFmpeg failed to start: ${err.message}`);
      });

      child.on('exit', (code: number | null, signal: NodeJS.Signals | null) => {
        console.log(`[FFmpeg ${id}] Process exited with code ${code}, signal ${signal}`);
        const wasStopped = stream.status === 'stopped';
        this.processes.delete(id);

        if (!wasStopped) {
          let errDetail = activeItem.lastError;
          if (!errDetail) {
            errDetail = code !== 0 ? `Process exited with error code ${code}` : 'Stream connection closed';
          }
          if (errDetail.includes('Connection refused')) {
            errDetail = 'Connection refused (Ensure RTSP server is reachable at specified host/port)';
          } else if (errDetail.includes('404')) {
            errDetail = 'RTSP stream path not found (404)';
          } else if (errDetail.includes('Immediate exit requested')) {
            errDetail = 'Stream connection timed out';
          }
          this.handleProcessError(id, errDetail);
        }
      });

      return stream;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.handleProcessError(id, `Could not initialize FFmpeg: ${msg}`);
      return stream;
    }
  }

  public stopStream(id: string): StreamItem | undefined {
    const stream = this.streams.get(id);
    if (!stream) return undefined;

    stream.status = 'stopped';
    stream.error = undefined;

    const activeItem = this.processes.get(id);
    if (activeItem) {
      console.log(`[StreamManager] Stopping FFmpeg process for stream ${id}`);
      this.processes.delete(id);

      try {
        activeItem.process.kill('SIGTERM');
        // Force kill after 1.5s if not cleanly terminated
        setTimeout(() => {
          try {
            if (!activeItem.process.killed) {
              activeItem.process.kill('SIGKILL');
            }
          } catch {
            // Ignore already terminated
          }
        }, 1500);
      } catch (err) {
        console.error(`[StreamManager] Error terminating process ${id}:`, err);
      }
    }

    this.broadcastStreamStatus(id);
    return stream;
  }

  private handleProcessError(id: string, errorMessage: string) {
    const stream = this.streams.get(id);
    if (!stream) return;

    stream.status = 'error';
    stream.error = errorMessage;
    console.error(`[StreamManager] Stream ${id} encountered error: ${errorMessage}`);

    if (this.io) {
      this.io.to(`stream:${id}`).emit('stream:error', {
        streamId: id,
        error: errorMessage,
      });
      this.broadcastStreamStatus(id);
    }
  }

  public broadcastStreamStatus(id: string) {
    const stream = this.streams.get(id);
    if (!stream || !this.io) return;

    this.io.to(`stream:${id}`).emit('stream:status', {
      streamId: id,
      status: stream.status,
      error: stream.error,
      active: stream.active,
      displayed: stream.displayed,
    });

    this.io.emit('stream:item_updated', stream);
  }

  public broadcastStreamsList() {
    if (!this.io) return;
    this.io.emit('stream:list', this.getAll());
  }

  public cleanup() {
    console.log('[StreamManager] Cleaning up all streaming processes...');
    for (const [id, item] of this.processes.entries()) {
      try {
        item.process.kill('SIGKILL');
      } catch {
        // Ignore
      }
      this.processes.delete(id);
    }
  }
}

export const streamManager = new StreamManager();

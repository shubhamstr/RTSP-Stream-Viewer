export type StreamStatus = 'stopped' | 'starting' | 'streaming' | 'error';

export interface StreamItem {
  id: string;
  name: string;
  url: string;
  status: StreamStatus;
  active: boolean;
  displayed: boolean;
  error?: string;
  fps?: number;
  lastActive?: number;
  createdAt: number;
}

export interface CreateStreamDto {
  name: string;
  url: string;
  active?: boolean;
  displayed?: boolean;
}

export interface UpdateStreamDto {
  name?: string;
  url?: string;
  active?: boolean;
  displayed?: boolean;
}

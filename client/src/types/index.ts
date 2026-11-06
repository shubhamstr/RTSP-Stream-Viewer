export type Tab = 'active' | 'all'

export type StreamStatus = 'stopped' | 'starting' | 'streaming' | 'error'

export interface Stream {
  id: string
  name: string
  url: string
  status?: StreamStatus
  active: boolean
  displayed: boolean
  error?: string
  fps?: number
  lastActive?: number
  createdAt?: number
}

export interface CreateStreamPayload {
  name: string
  url: string
  active?: boolean
  displayed?: boolean
}

export interface UpdateStreamPayload {
  name?: string
  url?: string
  active?: boolean
  displayed?: boolean
}

export interface ApiResponse<T = unknown> {
  success?: boolean
  message?: string
  data?: T
  stream?: Stream
  streams?: Stream[]
}

export interface HealthStatus {
  status: string
  uptime: number
  timestamp: string
}

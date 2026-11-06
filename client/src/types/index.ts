export type Tab = 'active' | 'all'

export interface Stream {
  id: string
  name: string
  url: string
  active: boolean
  displayed: boolean
}

export interface CreateStreamPayload {
  name: string
  url: string
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
}

export interface HealthStatus {
  status: string
  uptime: number
  timestamp: string
}

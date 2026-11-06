import apiClient from './api'
import type { CreateStreamPayload, HealthStatus, Stream, UpdateStreamPayload } from '../types'

/**
 * Standard API handler to invoke Express backend endpoints via axios from React components.
 */
export const apiHandler = {
  // ── Health ────────────────────────────────────────────────────────────────
  /**
   * Check backend server health status
   */
  getHealth: async (): Promise<HealthStatus> => {
    const { data } = await apiClient.get<HealthStatus>('/api/health')
    return data
  },

  // ── Streams API ───────────────────────────────────────────────────────────
  /**
   * Fetch all RTSP streams from the server
   */
  getStreams: async (): Promise<Stream[]> => {
    const { data } = await apiClient.get<{ streams?: Stream[] } | Stream[]>('/api/streams')
    if (Array.isArray(data)) return data
    return data.streams ?? []
  },

  /**
   * Fetch a single stream by ID
   */
  getStreamById: async (id: string): Promise<Stream> => {
    const { data } = await apiClient.get<Stream>(`/api/streams/${id}`)
    return data
  },

  /**
   * Add / Register a new stream
   */
  createStream: async (payload: CreateStreamPayload): Promise<Stream> => {
    const { data } = await apiClient.post<Stream>('/api/streams', payload)
    return data
  },

  /**
   * Update an existing stream's configuration or status
   */
  updateStream: async (id: string, payload: UpdateStreamPayload): Promise<Stream> => {
    const { data } = await apiClient.patch<Stream>(`/api/streams/${id}`, payload)
    return data
  },

  /**
   * Remove / Delete a stream by ID
   */
  deleteStream: async (id: string): Promise<{ success: boolean; id: string }> => {
    const { data } = await apiClient.delete<{ success: boolean; id: string }>(`/api/streams/${id}`)
    return data
  },

  // ── Generic Axios Helpers ─────────────────────────────────────────────────
  get: async <T>(url: string, params?: Record<string, unknown>): Promise<T> => {
    const { data } = await apiClient.get<T>(url, { params })
    return data
  },

  post: async <T>(url: string, body?: unknown): Promise<T> => {
    const { data } = await apiClient.post<T>(url, body)
    return data
  },

  put: async <T>(url: string, body?: unknown): Promise<T> => {
    const { data } = await apiClient.put<T>(url, body)
    return data
  },

  patch: async <T>(url: string, body?: unknown): Promise<T> => {
    const { data } = await apiClient.patch<T>(url, body)
    return data
  },

  delete: async <T>(url: string): Promise<T> => {
    const { data } = await apiClient.delete<T>(url)
    return data
  },
}

export default apiHandler


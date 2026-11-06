import { makeAutoObservable, runInAction } from 'mobx'
import type { Stream, StreamStatus, Tab } from '../types'
import apiHandler from '../services/apiHandler'
import getSocket from '../services/socketService'

class AppStore {
  // ── Theme ─────────────────────────────────────────────────────────────────
  dark = true

  // ── Sidebar tab ───────────────────────────────────────────────────────────
  tab: Tab = 'all'

  // ── Add/Edit stream modal ────────────────────────────────────────────────
  modalOpen = false
  editingStream: Stream | null = null

  // ── Streams ───────────────────────────────────────────────────────────────
  streams: Stream[] = []
  isLoading = false
  errorMessage: string | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
    this.init()
  }

  // ── Initializer ───────────────────────────────────────────────────────────
  async init() {
    await this.fetchStreams()
    this.setupSocketListeners()
  }

  private setupSocketListeners() {
    try {
      const socket = getSocket()

      socket.on('stream:list', (serverStreams: Stream[]) => {
        runInAction(() => {
          this.streams = serverStreams
        })
      })

      socket.on('stream:item_updated', (updated: Stream) => {
        runInAction(() => {
          const index = this.streams.findIndex((s) => s.id === updated.id)
          if (index !== -1) {
            this.streams[index] = { ...this.streams[index], ...updated }
          } else {
            this.streams.push(updated)
          }
        })
      })

      socket.on(
        'stream:status',
        (payload: { streamId: string; status: StreamStatus; error?: string; active?: boolean; displayed?: boolean }) => {
          runInAction(() => {
            const stream = this.streams.find((s) => s.id === payload.streamId)
            if (stream) {
              stream.status = payload.status
              stream.error = payload.error
              if (payload.active !== undefined) stream.active = payload.active
              if (payload.displayed !== undefined) stream.displayed = payload.displayed
            }
          })
        }
      )
    } catch (err) {
      console.warn('[AppStore] Socket listener initialization failed:', err)
    }
  }

  // ── Theme ─────────────────────────────────────────────────────────────────
  toggleDark() {
    this.dark = !this.dark
  }

  // ── Sidebar tab ───────────────────────────────────────────────────────────
  setTab(tab: Tab) {
    this.tab = tab
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  openModal(stream?: Stream) {
    this.editingStream = stream || null
    this.modalOpen = true
  }

  closeModal() {
    this.modalOpen = false
    this.editingStream = null
  }

  // ── Streams API Actions ───────────────────────────────────────────────────
  async fetchStreams() {
    this.isLoading = true
    try {
      const serverStreams = await apiHandler.getStreams()
      runInAction(() => {
        if (Array.isArray(serverStreams)) {
          this.streams = serverStreams
        }
        this.isLoading = false
      })
    } catch (err: unknown) {
      console.error('[AppStore] Failed to fetch streams from backend:', err)
      runInAction(() => {
        this.isLoading = false
      })
    }
  }

  /**
   * Called when adding a new stream URL:
   * Calls the backend API and updates the local store.
   */
  async addStream(name: string, url: string, closeModal = true) {
    this.errorMessage = null
    try {
      const createdStream = await apiHandler.createStream({
        name,
        url,
        active: true,
        displayed: true,
      })

      runInAction(() => {
        // Remove if duplicate id exists, then add
        this.streams = this.streams.filter((s) => s.id !== createdStream.id)
        this.streams.push(createdStream)
        if (closeModal) {
          this.modalOpen = false
        }
      })
      return createdStream
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add stream'
      console.error('[AppStore] addStream error:', err)
      runInAction(() => {
        this.errorMessage = msg
      })
      throw err
    }
  }

  /**
   * Update an existing stream's configuration (name, url)
   */
  async updateStream(id: string, payload: { name?: string; url?: string }) {
    this.errorMessage = null
    try {
      const updated = await apiHandler.updateStream(id, payload)
      runInAction(() => {
        const index = this.streams.findIndex((s) => s.id === id)
        if (index !== -1) {
          this.streams[index] = { ...this.streams[index], ...updated }
        }
        this.modalOpen = false
        this.editingStream = null
      })
      return updated
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update stream'
      console.error('[AppStore] updateStream error:', err)
      runInAction(() => {
        this.errorMessage = msg
      })
      throw err
    }
  }

  /**
   * Called when clicking on a stream card:
   * Calls backend API to activate and start FFmpeg stream playback.
   */
  async selectStream(id: string) {
    const stream = this.streams.find((s) => s.id === id)
    if (!stream) return

    // If already active & displayed, toggle or restart
    const nextDisplayed = !stream.displayed || stream.status === 'stopped' || stream.status === 'error'

    runInAction(() => {
      stream.active = true
      stream.displayed = nextDisplayed
      if (nextDisplayed) {
        stream.status = 'starting'
        stream.error = undefined
      } else {
        stream.status = 'stopped'
      }
    })

    try {
      if (nextDisplayed) {
        await apiHandler.startStream(id)
      } else {
        await apiHandler.stopStream(id)
      }
    } catch (err: unknown) {
      console.error(`[AppStore] Failed to toggle stream ${id} on backend:`, err)
      runInAction(() => {
        if (nextDisplayed) {
          stream.status = 'error'
          stream.error = err instanceof Error ? err.message : 'Failed to start stream'
        }
      })
    }
  }

  async activateStream(id: string) {
    const s = this.streams.find((s) => s.id === id)
    if (s) {
      s.active = true
      s.displayed = true
      s.status = 'starting'
      s.error = undefined
    }

    try {
      await apiHandler.startStream(id)
    } catch (err: unknown) {
      console.error(`[AppStore] activateStream error for ${id}:`, err)
      runInAction(() => {
        if (s) {
          s.status = 'error'
          s.error = err instanceof Error ? err.message : 'Failed to activate stream'
        }
      })
    }
  }

  async deactivateStream(id: string) {
    const s = this.streams.find((s) => s.id === id)
    if (s) {
      s.active = false
      s.displayed = false
      s.status = 'stopped'
    }

    try {
      await apiHandler.stopStream(id)
      await apiHandler.updateStream(id, { active: false, displayed: false })
    } catch (err) {
      console.error(`[AppStore] deactivateStream error for ${id}:`, err)
    }
  }

  async hideStream(id: string) {
    const s = this.streams.find((s) => s.id === id)
    if (s) {
      s.displayed = false
      s.status = 'stopped'
    }

    try {
      await apiHandler.stopStream(id)
    } catch (err) {
      console.error(`[AppStore] hideStream error for ${id}:`, err)
    }
  }

  async deleteStream(id: string) {
    runInAction(() => {
      this.streams = this.streams.filter((s) => s.id !== id)
    })

    try {
      await apiHandler.deleteStream(id)
    } catch (err) {
      console.error(`[AppStore] deleteStream error for ${id}:`, err)
    }
  }

  async startStream(id: string) {
    const s = this.streams.find((s) => s.id === id)
    if (s) {
      s.status = 'starting'
      s.error = undefined
      s.displayed = true
    }

    try {
      await apiHandler.startStream(id)
    } catch (err: unknown) {
      console.error(`[AppStore] startStream error for ${id}:`, err)
      runInAction(() => {
        if (s) {
          s.status = 'error'
          s.error = err instanceof Error ? err.message : 'Failed to start stream'
        }
      })
    }
  }

  async stopStream(id: string) {
    const s = this.streams.find((s) => s.id === id)
    if (s) {
      s.status = 'stopped'
    }

    try {
      await apiHandler.stopStream(id)
    } catch (err) {
      console.error(`[AppStore] stopStream error for ${id}:`, err)
    }
  }

  // ── Computed ──────────────────────────────────────────────────────────────
  /** Streams shown in the sidebar list (respects Active / All tab). */
  get listedStreams(): Stream[] {
    return this.tab === 'active'
      ? this.streams.filter((s) => s.active)
      : this.streams
  }

  /** Streams actively displayed in the main player grid. */
  get displayedStreams(): Stream[] {
    return this.streams.filter((s) => s.active && s.displayed)
  }
}

// Singleton — import this directly in components (no hook/context needed).
export const appStore = new AppStore()

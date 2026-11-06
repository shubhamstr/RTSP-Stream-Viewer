import { makeAutoObservable } from 'mobx'
import type { Stream, Tab } from '../types'

let _nextId = 1

class AppStore {
  // ── Theme ─────────────────────────────────────────────────────────────────
  dark = true

  // ── Sidebar tab ───────────────────────────────────────────────────────────
  tab: Tab = 'all'

  // ── Add-stream modal ──────────────────────────────────────────────────────
  modalOpen = false

  // ── Streams ───────────────────────────────────────────────────────────────
  streams: Stream[] = []

  constructor() {
    // Automatically makes all fields observable, getters computed,
    // and methods actions.
    makeAutoObservable(this)
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
  openModal() {
    this.modalOpen = true
  }

  closeModal() {
    this.modalOpen = false
  }

  // ── Streams ───────────────────────────────────────────────────────────────
  addStream(name: string, url: string) {
    this.streams.push({
      id: String(_nextId++),
      name,
      url,
      active: true,
      displayed: true,
    })
    this.modalOpen = false
  }

  deactivateStream(id: string) {
    const s = this.streams.find((s) => s.id === id)
    if (s) {
      s.active = false
      s.displayed = false
    }
  }

  hideStream(id: string) {
    const s = this.streams.find((s) => s.id === id)
    if (s) s.displayed = false
  }

  deleteStream(id: string) {
    this.streams = this.streams.filter((s) => s.id !== id)
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


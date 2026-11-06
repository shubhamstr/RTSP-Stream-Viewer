export type Tab = 'active' | 'all'

export interface Stream {
  id: string
  name: string
  url: string
  active: boolean
  displayed: boolean
}


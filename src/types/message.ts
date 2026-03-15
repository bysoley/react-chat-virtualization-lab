export type DemoAuthor = 'me' | 'other'

export type DemoMessageKind = 'text' | 'image'

export type RenderMode = 'plain' | 'virtualized'

export type DemoMessage = {
  id: string
  author: DemoAuthor
  kind: DemoMessageKind
  text?: string
  imageUrl?: string
  timestamp: number
  authorName: string
}

export type PerfParams = {
  mode: RenderMode
  items: number
  imageRatio: number
}

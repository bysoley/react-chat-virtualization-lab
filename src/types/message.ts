export type DemoAuthor = 'me' | 'other'

export type DemoMessageKind = 'text' | 'image' | 'reply'

export type RenderMode = 'plain' | 'virtualized'

export interface DemoReplyPreview {
  authorName: string
  text: string
}

export interface DemoMessage {
  id: string
  author: DemoAuthor
  kind: DemoMessageKind
  text?: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  timestamp: number
  authorName: string
  replyTo?: DemoReplyPreview
  status?: 'sending' | 'sent'
}

export interface DateDividerItem {
  kind: 'date-divider'
  id: string
  label: string
}

export interface UnreadDividerItem {
  kind: 'unread-divider'
  id: 'unread-divider'
}

export type DemoListItem = DemoMessage | DateDividerItem | UnreadDividerItem

export interface PerfParams {
  mode: RenderMode
  items: number
  imageRatio: number
  replyRatio: number
  liveMessages: boolean
  pageSize: number
}

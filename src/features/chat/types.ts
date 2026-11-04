export type Role = 'user' | 'assistant'
export type MessageStatus = 'done' | 'streaming' | 'error' | 'aborted'

export interface Message {
  id: string
  role: Role
  content: string
  status: MessageStatus
}

export type StreamStatus = 'idle' | 'streaming' | 'error'

/** Payload of one SSE `data:` frame sent by the server. */
export type StreamEvent = { token: string } | { error: string }

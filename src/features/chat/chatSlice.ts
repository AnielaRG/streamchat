import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Message, StreamStatus } from './types'

export interface ChatState {
  messages: Message[]
  status: StreamStatus
  error: string | null
}

export const initialState: ChatState = { messages: [], status: 'idle', error: null }

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    userMessageAdded(state, { payload }: PayloadAction<{ id: string; content: string }>) {
      state.messages.push({ ...payload, role: 'user', status: 'done' })
      state.error = null
    },
    assistantStarted(state, { payload }: PayloadAction<{ id: string }>) {
      state.messages.push({
        id: payload.id,
        role: 'assistant',
        content: '',
        status: 'streaming',
      })
      state.status = 'streaming'
    },
    tokenReceived(state, { payload }: PayloadAction<{ id: string; token: string }>) {
      const msg = state.messages.find((m) => m.id === payload.id)
      if (msg) msg.content += payload.token
    },
    streamFinished(state, { payload }: PayloadAction<{ id: string }>) {
      const msg = state.messages.find((m) => m.id === payload.id)
      if (msg) msg.status = 'done'
      state.status = 'idle'
    },
    streamAborted(state, { payload }: PayloadAction<{ id: string }>) {
      const msg = state.messages.find((m) => m.id === payload.id)
      if (msg) msg.status = 'aborted'
      state.status = 'idle'
    },
    streamFailed(state, { payload }: PayloadAction<{ id: string; error: string }>) {
      const msg = state.messages.find((m) => m.id === payload.id)
      if (msg) msg.status = 'error'
      state.status = 'error'
      state.error = payload.error
    },
    chatCleared() {
      return initialState
    },
  },
})

export const {
  userMessageAdded,
  assistantStarted,
  tokenReceived,
  streamFinished,
  streamAborted,
  streamFailed,
  chatCleared,
} = chatSlice.actions
export default chatSlice.reducer

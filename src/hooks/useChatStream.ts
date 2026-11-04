import { useCallback, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import {
  assistantStarted,
  streamAborted,
  streamFailed,
  streamFinished,
  tokenReceived,
  userMessageAdded,
} from '@/features/chat/chatSlice'
import type { StreamEvent } from '@/features/chat/types'
import { createSseParser } from '@/lib/sse'

const uid = () => crypto.randomUUID()

/** Sends a message and streams the assistant reply token by token into the store. */
export function useChatStream() {
  const dispatch = useAppDispatch()
  const messages = useAppSelector((s) => s.chat.messages)
  const status = useAppSelector((s) => s.chat.status)
  const controller = useRef<AbortController | null>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const send = useCallback(
    async (content: string) => {
      const text = content.trim()
      if (!text) return

      const history = [
        ...messagesRef.current
          .filter((m) => m.status === 'done' || m.status === 'aborted')
          .map(({ role, content }) => ({ role, content })),
        { role: 'user' as const, content: text },
      ]
      const assistantId = uid()
      dispatch(userMessageAdded({ id: uid(), content: text }))
      dispatch(assistantStarted({ id: assistantId }))

      const ac = new AbortController()
      controller.current = ac
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
          signal: ac.signal,
        })
        if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`)

        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
        const parser = createSseParser()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          for (const payload of parser.push(value)) {
            if (payload === '[DONE]') continue
            const event = JSON.parse(payload) as StreamEvent
            if ('error' in event) throw new Error(event.error)
            dispatch(tokenReceived({ id: assistantId, token: event.token }))
          }
        }
        dispatch(streamFinished({ id: assistantId }))
      } catch (err) {
        if (ac.signal.aborted) dispatch(streamAborted({ id: assistantId }))
        else
          dispatch(
            streamFailed({
              id: assistantId,
              error: err instanceof Error ? err.message : 'Unknown error',
            }),
          )
      } finally {
        controller.current = null
      }
    },
    [dispatch],
  )

  const stop = useCallback(() => controller.current?.abort(), [])

  return { send, stop, isStreaming: status === 'streaming' }
}

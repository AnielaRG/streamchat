import { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageBubble } from '@/components/MessageBubble'
import { useAppSelector } from '@/store'

export function MessageList() {
  const messages = useAppSelector((s) => s.chat.messages)
  const viewport = useRef<HTMLDivElement>(null)
  const last = messages.at(-1)

  // Keep the view pinned to the newest token.
  useEffect(() => {
    const el = viewport.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages.length, last?.content])

  return (
    <ScrollArea className="flex-1" viewportRef={viewport}>
      <div
        className="mx-auto flex max-w-3xl flex-col gap-3 p-4"
        role="log"
        aria-live="polite"
        aria-label="Conversation"
      >
        {messages.length === 0 && (
          <p className="mt-24 text-center text-muted-foreground">
            Ask anything to start.
          </p>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} />
        ))}
      </div>
    </ScrollArea>
  )
}

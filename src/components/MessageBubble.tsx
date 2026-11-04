import { memo } from 'react'
import Markdown from 'react-markdown'
import { cn } from '@/lib/utils'
import type { Message } from '@/features/chat/types'

export const MessageBubble = memo(function MessageBubble({
  message,
}: {
  message: Message
}) {
  const isUser = message.role === 'user'
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted',
          message.status === 'error' && 'border border-red-500',
        )}
      >
        <div className="prose-sm whitespace-pre-wrap break-words">
          <Markdown>{message.content}</Markdown>
        </div>
        {message.status === 'streaming' && (
          <span
            aria-hidden
            className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-current align-middle"
          />
        )}
        {message.status === 'aborted' && (
          <p className="mt-1 text-xs text-muted-foreground">Stopped</p>
        )}
      </div>
    </div>
  )
})

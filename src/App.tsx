import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatInput } from '@/components/ChatInput'
import { MessageList } from '@/components/MessageList'
import { ThemeToggle } from '@/components/ThemeToggle'
import { chatCleared } from '@/features/chat/chatSlice'
import { useChatStream } from '@/hooks/useChatStream'
import { useAppDispatch, useAppSelector } from '@/store'

export default function App() {
  const dispatch = useAppDispatch()
  const error = useAppSelector((s) => s.chat.error)
  const { send, stop, isStreaming } = useChatStream()

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-border px-4 py-2">
        <h1 className="font-semibold">StreamChat</h1>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Clear chat"
            onClick={() => dispatch(chatCleared())}
          >
            <Trash2 className="size-4" />
          </Button>
          <ThemeToggle />
        </div>
      </header>
      <MessageList />
      {error && (
        <p role="alert" className="mx-auto w-full max-w-3xl px-4 text-sm text-red-500">
          {error}
        </p>
      )}
      <ChatInput isStreaming={isStreaming} onSend={send} onStop={stop} />
    </div>
  )
}

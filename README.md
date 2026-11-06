# StreamChat

A production-style chat UI with **real-time token streaming** over Server-Sent Events.

**Stack:** React 19 · TypeScript · Tailwind CSS v4 · Radix UI / shadcn-style components · Redux Toolkit · Vite · Vitest · Express (SSE API)

<!-- TODO: add GIF (docs/demo.gif) and live demo link -->

## Features

- Streaming assistant replies rendered token by token (markdown supported)
- Stop generation mid-stream (`AbortController`, server stops upstream on disconnect)
- Error and aborted states kept in the message model
- Auto-scrolling log with `aria-live`, keyboard-friendly input (Enter / Shift+Enter)
- Dark mode, accessible icon buttons
- Works offline with a built-in mock model; optional **OpenAI** or **Azure OpenAI** backend

## Run

```bash
npm install
npm run dev          # web http://localhost:5173, API http://localhost:8787
```

Real model (optional): copy `.env.example` to `.env`, set `LLM_PROVIDER=openai` or `azure` and the keys.

```bash
npm run typecheck && npm run lint && npm test && npm run build
```

## Architecture

```
ChatInput ──send()──▶ useChatStream ──POST /api/chat──▶ Express ──▶ mock | OpenAI | Azure OpenAI
                          │                                  │
                          │◀──── SSE frames: data:{"token"} ─┘
                          ▼
              Redux Toolkit chatSlice (messages, status, error)
                          ▼
              MessageList ▶ MessageBubble (React.memo)
```

- `src/lib/sse.ts` — tiny SSE parser, tested for frames split across chunks.
- `src/features/chat/chatSlice.ts` — reducers for token append, finish, abort, fail.
- `src/hooks/useChatStream.ts` — fetch + `ReadableStream`, cancellation, error handling.
- `server/` — SSE endpoint; provider adapters normalise OpenAI-compatible streams.

## Decisions

- **SSE over WebSockets:** replies are one-way server → client streams; SSE is simpler, works through proxies and matches how OpenAI/Azure stream. `fetch` + streams (not `EventSource`) so I can POST a body and abort.
- **Redux Toolkit:** predictable updates for per-token appends, easy to test reducers in isolation.
- **Memoised bubbles:** only the streaming message re-renders per token.

## Built with AI assistance

Developed with Claude Code guided by [`CLAUDE.md`](./CLAUDE.md); every change reviewed and covered by tests where it matters.

## License

MIT. See [LICENSE](./LICENSE).

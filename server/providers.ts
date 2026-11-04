export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const t = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => (clearTimeout(t), resolve()), { once: true })
  })

/** Offline mock: streams a canned markdown answer word by word. */
async function* mock(
  messages: ChatMessage[],
  signal: AbortSignal,
): AsyncGenerator<string> {
  const last = messages.at(-1)?.content ?? ''
  const text =
    `You said: **${last}**\n\nThis reply is streamed over *Server-Sent Events*, token by token.\n\n` +
    '- Redux Toolkit keeps the message list\n- `AbortController` cancels the request\n- Tailwind + Radix power the UI\n'
  for (const token of text.match(/\S+\s*|\s+/g) ?? []) {
    if (signal.aborted) return
    yield token
    await sleep(30 + Math.random() * 50, signal)
  }
}

/** Parses an OpenAI-compatible streaming response and yields content deltas. */
async function* openAiCompatible(res: Response): AsyncGenerator<string> {
  if (!res.ok || !res.body)
    throw new Error(`Upstream error ${res.status}: ${await res.text()}`)
  const decoder = new TextDecoder()
  let buffer = ''
  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(chunk, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      const data = line.slice(5).trim()
      if (!data || data === '[DONE]') continue
      const delta = JSON.parse(data).choices?.[0]?.delta?.content
      if (delta) yield delta as string
    }
  }
}

function openai(messages: ChatMessage[], signal: AbortSignal) {
  return fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      stream: true,
      messages,
    }),
  }).then(openAiCompatible)
}

function azure(messages: ChatMessage[], signal: AbortSignal) {
  const { AZURE_OPENAI_ENDPOINT: endpoint, AZURE_OPENAI_DEPLOYMENT: deployment } =
    process.env
  const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-10-21`
  return fetch(url, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.AZURE_OPENAI_API_KEY ?? '',
    },
    body: JSON.stringify({ stream: true, messages }),
  }).then(openAiCompatible)
}

export function streamCompletion(messages: ChatMessage[], signal: AbortSignal) {
  switch (process.env.LLM_PROVIDER) {
    case 'openai':
      return (async function* () {
        yield* await openai(messages, signal)
      })()
    case 'azure':
      return (async function* () {
        yield* await azure(messages, signal)
      })()
    default:
      return mock(messages, signal)
  }
}

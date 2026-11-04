import express from 'express'
import cors from 'cors'
import { streamCompletion, type ChatMessage } from './providers.ts'

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

app.post('/api/chat', async (req, res) => {
  const messages = req.body?.messages as ChatMessage[] | undefined
  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages[] required' })
    return
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
  })

  const ac = new AbortController()
  res.on('close', () => ac.abort()) // client pressed Stop or left

  const send = (data: unknown) => res.write(`data: ${JSON.stringify(data)}\n\n`)
  try {
    for await (const token of streamCompletion(messages, ac.signal)) send({ token })
    if (!ac.signal.aborted) res.write('data: [DONE]\n\n')
  } catch (err) {
    if (!ac.signal.aborted)
      send({ error: err instanceof Error ? err.message : 'Upstream error' })
  } finally {
    res.end()
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

const port = Number(process.env.PORT ?? 8787)
app.listen(port, () => console.log(`API on http://localhost:${port}`))

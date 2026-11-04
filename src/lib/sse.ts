/**
 * Minimal SSE parser. Feed it decoded text chunks; it returns the `data:` payloads of
 * every complete frame and keeps the incomplete tail in an internal buffer.
 */
export function createSseParser() {
  let buffer = ''
  return {
    push(chunk: string): string[] {
      buffer += chunk
      const frames = buffer.split(/\r?\n\r?\n/)
      buffer = frames.pop() ?? ''
      const payloads: string[] = []
      for (const frame of frames) {
        const data = frame
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).replace(/^ /, ''))
          .join('\n')
        if (data) payloads.push(data)
      }
      return payloads
    },
  }
}

import { createSseParser } from './sse'

describe('createSseParser', () => {
  it('parses complete frames', () => {
    const p = createSseParser()
    expect(p.push('data: {"token":"a"}\n\ndata: {"token":"b"}\n\n')).toEqual([
      '{"token":"a"}',
      '{"token":"b"}',
    ])
  })

  it('buffers frames split across chunks', () => {
    const p = createSseParser()
    expect(p.push('data: {"tok')).toEqual([])
    expect(p.push('en":"x"}\n')).toEqual([])
    expect(p.push('\n')).toEqual(['{"token":"x"}'])
  })

  it('handles CRLF and ignores non-data lines', () => {
    const p = createSseParser()
    expect(p.push(': ping\r\n\r\ndata: [DONE]\r\n\r\n')).toEqual(['[DONE]'])
  })
})

import reducer, {
  assistantStarted,
  chatCleared,
  initialState,
  streamAborted,
  streamFailed,
  streamFinished,
  tokenReceived,
  userMessageAdded,
} from './chatSlice'

describe('chatSlice', () => {
  it('appends streamed tokens to the assistant message', () => {
    let s = reducer(initialState, userMessageAdded({ id: 'u1', content: 'hi' }))
    s = reducer(s, assistantStarted({ id: 'a1' }))
    s = reducer(s, tokenReceived({ id: 'a1', token: 'Hel' }))
    s = reducer(s, tokenReceived({ id: 'a1', token: 'lo' }))
    expect(s.status).toBe('streaming')
    expect(s.messages[1]).toMatchObject({ content: 'Hello', status: 'streaming' })
  })

  it('marks the message done when the stream finishes', () => {
    let s = reducer(initialState, assistantStarted({ id: 'a1' }))
    s = reducer(s, streamFinished({ id: 'a1' }))
    expect(s.status).toBe('idle')
    expect(s.messages[0].status).toBe('done')
  })

  it('keeps partial content when aborted', () => {
    let s = reducer(initialState, assistantStarted({ id: 'a1' }))
    s = reducer(s, tokenReceived({ id: 'a1', token: 'part' }))
    s = reducer(s, streamAborted({ id: 'a1' }))
    expect(s.messages[0]).toMatchObject({ content: 'part', status: 'aborted' })
    expect(s.status).toBe('idle')
  })

  it('records errors', () => {
    let s = reducer(initialState, assistantStarted({ id: 'a1' }))
    s = reducer(s, streamFailed({ id: 'a1', error: 'boom' }))
    expect(s).toMatchObject({ status: 'error', error: 'boom' })
    expect(s.messages[0].status).toBe('error')
  })

  it('clears the chat', () => {
    const s = reducer(
      reducer(initialState, userMessageAdded({ id: 'u1', content: 'x' })),
      chatCleared(),
    )
    expect(s).toEqual(initialState)
  })
})

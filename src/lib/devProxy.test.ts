import { describe, expect, it } from 'vitest'
import { buildApiUrl, normalizeBaseUrl } from './devProxy'

describe('normalizeBaseUrl', () => {
  it('keeps same-origin proxy paths relative', () => {
    expect(normalizeBaseUrl('/api-proxy/v1')).toBe('/api-proxy/v1')
    expect(normalizeBaseUrl('/api-proxy')).toBe('/api-proxy/v1')
  })

  it('normalizes absolute upstream urls', () => {
    expect(normalizeBaseUrl('https://anyrouter.top')).toBe('https://anyrouter.top')
    expect(normalizeBaseUrl('https://anyrouter.top/v1')).toBe('https://anyrouter.top/v1')
  })
})

describe('buildApiUrl', () => {
  it('builds responses requests against a same-origin proxy path', () => {
    expect(buildApiUrl('/api-proxy/v1', 'responses')).toBe('/api-proxy/v1/responses')
  })
})

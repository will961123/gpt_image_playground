import { describe, expect, it } from 'vitest'
import { getSettingsOverridesFromSearch } from './urlSettings'

describe('getSettingsOverridesFromSearch', () => {
  it('does not force apiMode when the url does not provide overrides', () => {
    expect(getSettingsOverridesFromSearch('')).toEqual({
      hasOverrides: false,
      overrides: {},
    })
  })

  it('parses supported settings overrides from the query string', () => {
    expect(
      getSettingsOverridesFromSearch('?apiUrl=https://api.example.com/v1&apiKey=test-key&codexCli=true&apiMode=responses'),
    ).toEqual({
      hasOverrides: true,
      overrides: {
        baseUrl: 'https://api.example.com/v1',
        apiKey: 'test-key',
        codexCli: true,
        apiMode: 'responses',
      },
    })
  })
})

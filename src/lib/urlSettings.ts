import { normalizeBaseUrl } from './api'
import type { AppSettings } from '../types'

export function getSettingsOverridesFromSearch(search: string): {
  hasOverrides: boolean
  overrides: Partial<AppSettings>
} {
  const searchParams = new URLSearchParams(search)
  const overrides: Partial<AppSettings> = {}

  const apiUrlParam = searchParams.get('apiUrl')
  if (apiUrlParam !== null) {
    overrides.baseUrl = normalizeBaseUrl(apiUrlParam.trim())
  }

  const apiKeyParam = searchParams.get('apiKey')
  if (apiKeyParam !== null) {
    overrides.apiKey = apiKeyParam.trim()
  }

  const codexCliParam = searchParams.get('codexCli')
  if (codexCliParam !== null) {
    overrides.codexCli = codexCliParam.trim().toLowerCase() === 'true'
  }

  const apiModeParam = searchParams.get('apiMode')
  if (apiModeParam === 'images' || apiModeParam === 'responses') {
    overrides.apiMode = apiModeParam
  }

  return {
    hasOverrides: Boolean(
      searchParams.has('apiUrl') ||
      searchParams.has('apiKey') ||
      searchParams.has('codexCli') ||
      searchParams.has('apiMode'),
    ),
    overrides,
  }
}

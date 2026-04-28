interface Env {
  UPSTREAM_API_BASE_URL?: string
}

interface PagesFunctionContext {
  env: Env
  request: Request
}

type PagesFunction = (context: PagesFunctionContext) => Promise<Response> | Response

function splitPath(pathname: string): string[] {
  return pathname.split('/').filter(Boolean)
}

function mergePathSegments(basePathname: string, requestPathname: string): string {
  const baseSegments = splitPath(basePathname)
  const requestSegments = splitPath(requestPathname)

  let overlap = 0
  const maxOverlap = Math.min(baseSegments.length, requestSegments.length)
  for (let size = maxOverlap; size > 0; size -= 1) {
    const baseSuffix = baseSegments.slice(-size).join('/')
    const requestPrefix = requestSegments.slice(0, size).join('/')
    if (baseSuffix === requestPrefix) {
      overlap = size
      break
    }
  }

  const mergedSegments = [...baseSegments, ...requestSegments.slice(overlap)]
  return `/${mergedSegments.join('/')}`
}

function buildUpstreamUrl(upstreamBaseUrl: string, requestPathname: string, search: string): URL {
  const upstreamUrl = new URL(upstreamBaseUrl)
  upstreamUrl.pathname = mergePathSegments(upstreamUrl.pathname, requestPathname)
  upstreamUrl.search = search
  return upstreamUrl
}

function createProxyRequest(request: Request, targetUrl: URL): Request {
  const headers = new Headers(request.headers)
  headers.set('host', targetUrl.host)
  headers.set('x-forwarded-host', new URL(request.url).host)
  headers.set('x-forwarded-proto', new URL(request.url).protocol.replace(':', ''))

  return new Request(targetUrl, {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'follow',
  })
}

export const onRequest: PagesFunction = async ({ env, request }) => {
  const upstreamBaseUrl = env.UPSTREAM_API_BASE_URL?.trim().replace(/\/+$/, '')
  if (!upstreamBaseUrl) {
    return new Response('Missing UPSTREAM_API_BASE_URL', { status: 500 })
  }

  let upstreamOrigin: URL
  try {
    upstreamOrigin = new URL(upstreamBaseUrl)
  } catch {
    return new Response('Invalid UPSTREAM_API_BASE_URL', { status: 500 })
  }

  const requestUrl = new URL(request.url)
  const proxyPrefix = '/api-proxy'
  const upstreamPathname = requestUrl.pathname.startsWith(proxyPrefix)
    ? requestUrl.pathname.slice(proxyPrefix.length) || '/'
    : requestUrl.pathname

  const targetUrl = buildUpstreamUrl(upstreamOrigin.toString(), upstreamPathname, requestUrl.search)
  const proxyRequest = createProxyRequest(request, targetUrl)
  return fetch(proxyRequest)
}

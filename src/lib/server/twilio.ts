import { serverEnv } from './env'

const encoder = new TextEncoder()
const base64Url = (value: string | ArrayBuffer) => {
  const bytes = typeof value === 'string' ? encoder.encode(value) : new Uint8Array(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '')
}

async function hmac(algorithm: 'SHA-1' | 'SHA-256', secret: string, value: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: algorithm }, false, ['sign'])
  return crypto.subtle.sign('HMAC', key, encoder.encode(value))
}

export async function createVoiceToken(identity: string) {
  const e = serverEnv()
  const issuedAt = Math.floor(Date.now() / 1000)
  const header = base64Url(JSON.stringify({ typ: 'JWT', alg: 'HS256', cty: 'twilio-fpa;v=1' }))
  const payload = base64Url(JSON.stringify({
    jti: `${e.TWILIO_API_KEY_SID}-${issuedAt}`,
    iss: e.TWILIO_API_KEY_SID,
    sub: e.TWILIO_ACCOUNT_SID,
    iat: issuedAt,
    exp: issuedAt + 900,
    grants: { identity, voice: { outgoing: { application_sid: e.TWILIO_TWIML_APP_SID } } },
  }))
  const signingInput = `${header}.${payload}`
  return { accessToken: `${signingInput}.${base64Url(await hmac('SHA-256', e.TWILIO_API_KEY_SECRET, signingInput))}`, expiresAt: new Date((issuedAt + 900) * 1000).toISOString() }
}

export async function verifyTwilioSignature(url: string, params: Record<string, string>, signature: string | null) {
  if (!signature) return false
  const payload = `${url}${Object.keys(params).sort().map((key) => `${key}${params[key]}`).join('')}`
  const expected = base64Url(await hmac('SHA-1', serverEnv().TWILIO_AUTH_TOKEN, payload)).replaceAll('-', '+').replaceAll('_', '/')
  const supplied = signature.replace(/=+$/, '')
  const normalizedExpected = expected.replace(/=+$/, '')
  if (supplied.length !== normalizedExpected.length) return false
  let difference = 0
  for (let index = 0; index < supplied.length; index++) difference |= supplied.charCodeAt(index) ^ normalizedExpected.charCodeAt(index)
  return difference === 0
}

/** Use the configured public HTTPS origin, never a caller-controlled forwarding header. */
export function twilioPublicUrl(request: Request) {
  const publicUrl = new URL(serverEnv().PUBLIC_APP_URL)
  if (publicUrl.protocol !== 'https:') throw new Error('PUBLIC_APP_URL must use HTTPS for Twilio webhooks.')
  const requestedUrl = new URL(request.url)
  return `${publicUrl.origin}${requestedUrl.pathname}${requestedUrl.search}`
}

export function voiceResponse(destination: string, callerId: string, statusUrl: string) {
  const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')
  const url = escape(statusUrl)
  return `<?xml version="1.0" encoding="UTF-8"?><Response><Dial callerId="${escape(callerId)}" answerOnBridge="true" action="${url}" statusCallback="${url}" statusCallbackEvent="initiated ringing answered completed" statusCallbackMethod="POST"><Number>${escape(destination)}</Number></Dial></Response>`
}

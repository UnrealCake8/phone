import { createHmac } from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'
import { serverEnv } from '@/lib/server/env'
import { createVoiceToken, twilioPublicUrl, verifyTwilioSignature, voiceResponse } from '@/lib/server/twilio'

const workerEnv = {
  SUPABASE_URL: 'https://project.supabase.co', SUPABASE_ANON_KEY: 'anon', SUPABASE_SERVICE_ROLE_KEY: 'service',
  TWILIO_ACCOUNT_SID: 'AC123', TWILIO_API_KEY_SID: 'SK123', TWILIO_API_KEY_SECRET: 'api-secret', TWILIO_AUTH_TOKEN: 'auth-token',
  TWILIO_TWIML_APP_SID: 'AP123', TWILIO_CALLER_ID: '+14155552671', PUBLIC_APP_URL: 'https://phone.example.com/',
}
const originalEnvironment = { ...process.env }

afterEach(() => { process.env = { ...originalEnvironment } })

describe('Worker server configuration', () => {
  it('validates Worker vars and normalizes the public origin', () => {
    expect(serverEnv(workerEnv).PUBLIC_APP_URL).toBe('https://phone.example.com')
    expect(() => serverEnv({ ...workerEnv, PUBLIC_APP_URL: 'not-a-url' })).toThrow()
  })

  it('always validates Twilio signatures against the configured external HTTPS URL', async () => {
    process.env = { ...process.env, ...workerEnv }
    const params = { CallSid: 'CA123', To: '+14155552671' }
    const url = twilioPublicUrl(new Request('http://internal-worker/api/twilio/voice?edge=1', { headers: { 'x-forwarded-host': 'attacker.example' } }))
    const signature = createHmac('sha1', workerEnv.TWILIO_AUTH_TOKEN).update(`${url}CallSidCA123To+14155552671`).digest('base64')
    expect(url).toBe('https://phone.example.com/api/twilio/voice?edge=1')
    await expect(verifyTwilioSignature(url, params, signature)).resolves.toBe(true)
    await expect(verifyTwilioSignature(url, params, 'invalid')).resolves.toBe(false)
  })

  it('creates a signed, short-lived Voice access token and secure TwiML', async () => {
    process.env = { ...process.env, ...workerEnv }
    const token = await createVoiceToken('uc8_user')
    const [, payload] = token.accessToken.split('.')
    expect(JSON.parse(Buffer.from(payload!, 'base64url').toString())).toMatchObject({ iss: 'SK123', sub: 'AC123', grants: { identity: 'uc8_user', voice: { outgoing: { application_sid: 'AP123' } } } })
    expect(token.accessToken.split('.')).toHaveLength(3)
    expect(voiceResponse('+14155552671', '+14155552671', 'https://phone.example.com/api/twilio/status?x=1&y=2')).toContain('statusCallback="https://phone.example.com/api/twilio/status?x=1&amp;y=2"')
  })
})

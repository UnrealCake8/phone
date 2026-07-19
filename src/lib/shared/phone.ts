import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js'
export type PhoneResult = { e164: string; display: string; country: string }
const emergency = new Set(['911','112','999'])
export function normalizeDestination(input: string, defaultCountry: string, supportedCountries: readonly string[], blockedPrefixes: readonly string[]): PhoneResult {
  const compact = input.replace(/[\s().-]/g, '')
  if (emergency.has(compact)) throw new Error('Emergency numbers cannot be called with UC8Phone.')
  const phone = parsePhoneNumberFromString(compact, defaultCountry as CountryCode)
  if (!phone?.isValid()) throw new Error('Enter a valid international telephone number.')
  if (!supportedCountries.includes(phone.country ?? '')) throw new Error('This destination country is not supported.')
  if (blockedPrefixes.some((prefix) => phone.number.startsWith(prefix))) throw new Error('This destination is prohibited.')
  return { e164: phone.number, display: phone.formatInternational(), country: phone.country ?? '' }
}

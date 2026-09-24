const AAKASH_SEND_URL = 'https://sms.aakashsms.com/sms/v3/send'

export async function sendActivationSms({ token, phone, membershipId, code, fetchImpl = fetch }) {
  const message = `NCAS ID: ${membershipId}. One-time login code: ${code}. Set password: https://ncas-system.vercel.app/login . Valid 7 days. Do not share.`
  const body = new URLSearchParams({ auth_token: token, to: phone, text: message })
  const response = await fetchImpl(AAKASH_SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    signal: AbortSignal.timeout(15000),
  })
  let result
  try { result = await response.json() } catch { return { queued: false, reason: 'invalid_response' } }
  if (response.ok && result?.error === false &&
    Array.isArray(result?.data?.valid) && result.data.valid.length === 1 &&
    result.data.valid[0]?.status === 'queued') {
    return { queued: true }
  }
  const providerMessage = String(result?.message ?? '').toLowerCase()
  if (providerMessage.includes('auth token') && providerMessage.includes('not valid')) return { queued: false, reason: 'invalid_token' }
  if (providerMessage.includes('balance') || providerMessage.includes('credit')) return { queued: false, reason: 'insufficient_credit' }
  if (Array.isArray(result?.data?.invalid) && result.data.invalid.length > 0) return { queued: false, reason: 'invalid_number' }
  return { queued: false, reason: 'provider_rejected' }
}

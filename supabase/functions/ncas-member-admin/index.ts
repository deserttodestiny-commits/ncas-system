import { withSupabase } from 'npm:@supabase/server@^1'

const encoder = new TextEncoder()

function phoneDigits(value: unknown) {
  const digits = String(value ?? '').replace(/[०-९]/g, (digit) => String(digit.charCodeAt(0) - 0x0966)).replace(/\D/g, '')
  return digits.length === 13 && digits.startsWith('977') ? digits.slice(3) : digits
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (req, ctx) => {
    if (req.method !== 'POST') return Response.json({ error: 'POST मात्र स्वीकारिन्छ।' }, { status: 405 })
    const userId = ctx.userClaims?.id
    if (!userId) return Response.json({ error: 'प्रवेश निषेध।' }, { status: 403 })
    const { data: admin } = await ctx.supabaseAdmin
      .from('ncas_system_admins').select('user_id').eq('user_id', userId).maybeSingle()
    if (!admin) return Response.json({ error: 'प्रवेश निषेध।' }, { status: 403 })

    let input: Record<string, unknown>
    try { input = await req.json() } catch { return Response.json({ error: 'अमान्य अनुरोध।' }, { status: 400 }) }
    const memberId = String(input.memberId ?? '').trim()
    const { data: member, error: memberError } = await ctx.supabaseAdmin
      .from('ncas_system_members').select('id, phone').eq('id', memberId).maybeSingle()
    if (memberError || !member || phoneDigits(member.phone).length < 10) {
      return Response.json({ error: 'सदस्य वा फोन नम्बर मान्य छैन।' }, { status: 400 })
    }

    const raw = Array.from(crypto.getRandomValues(new Uint8Array(6)), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()
    const code = raw.match(/.{4}/g)!.join('-')
    const hashBytes = await crypto.subtle.digest('SHA-256', encoder.encode(`${member.id}:${phoneDigits(member.phone)}:${raw}`))
    const codeHash = Array.from(new Uint8Array(hashBytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { error } = await ctx.supabaseAdmin.from('ncas_system_member_activations').upsert({
      member_id: member.id,
      code_hash: codeHash,
      expires_at: expiresAt,
      attempts: 0,
      consumed_at: null,
      issued_at: new Date().toISOString(),
      issued_by: userId,
    })
    if (error) return Response.json({ error: 'Code बनाउन सकिएन।' }, { status: 503 })
    return Response.json({ code, expiresAt })
  }),
}

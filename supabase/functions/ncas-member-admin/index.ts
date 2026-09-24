import { withSupabase } from 'npm:@supabase/server@^1'
import { checkSmsCredit, sendActivationSms } from './sms.js'

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
    const smsToken = Deno.env.get('AAKASH_SMS_TOKEN')
    if (!smsToken) return Response.json({ error: 'SMS सेवा तयार छैन। Admin ले AakashSMS secret जाँच्नुहोस्।' }, { status: 503 })
    if (input.action === 'diagnose') {
      let result: { ready: boolean; credit?: number; reason?: string }
      try { result = await checkSmsCredit({ token: smsToken }) }
      catch { result = { ready: false, reason: 'connection_failed' } }
      if (result.ready) return Response.json({ ready: true, credit: result.credit })
      const explanations: Record<string, string> = {
        invalid_token: 'AakashSMS token मान्य छैन। Supabase secret पुनः जाँच्नुहोस्।',
        blocked_access: 'AakashSMS ले यो server बाट आएको अनुरोध रोकेको छ। Token को IP नियम वा खाता अनुमति जाँच्नुहोस्।',
        invalid_response: 'AakashSMS credit सेवाबाट अमान्य प्रतिक्रिया आयो।',
        connection_failed: 'AakashSMS credit सेवासँग सम्पर्क हुन सकेन।',
        provider_rejected: 'AakashSMS ले credit जाँच स्वीकार गरेन। खाता/API अनुमति जाँच्नुहोस्।',
      }
      return Response.json({ error: explanations[result.reason ?? ''] ?? explanations.provider_rejected }, { status: 502 })
    }
    const memberId = String(input.memberId ?? '').trim()
    const { data: member, error: memberError } = await ctx.supabaseAdmin
      .from('ncas_system_members').select('id, membership_id, phone').eq('id', memberId).maybeSingle()
    const phone = phoneDigits(member?.phone)
    if (memberError || !member || !/^9\d{9}$/.test(phone)) {
      return Response.json({ error: 'सदस्य वा फोन नम्बर मान्य छैन।' }, { status: 400 })
    }
    const raw = Array.from(crypto.getRandomValues(new Uint8Array(6)), (byte) => byte.toString(16).padStart(2, '0')).join('').toUpperCase()
    const code = raw.match(/.{4}/g)!.join('-')
    const hashBytes = await crypto.subtle.digest('SHA-256', encoder.encode(`${member.id}:${phone}:${raw}`))
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

    let smsResult: { queued: boolean; reason?: string } = { queued: false, reason: 'connection_failed' }
    try {
      smsResult = await sendActivationSms({
        token: smsToken, phone, membershipId: member.membership_id, code,
      })
    } catch { /* A timeout or connection failure must not be reported as a sent SMS. */ }
    if (!smsResult.queued) {
      await ctx.supabaseAdmin.from('ncas_system_member_activations')
        .update({ consumed_at: new Date().toISOString() })
        .eq('member_id', member.id).eq('code_hash', codeHash)
      const explanations: Record<string, string> = {
        invalid_token: 'AakashSMS token मान्य छैन। Supabase secret जाँच्नुहोस्।',
        insufficient_credit: 'AakashSMS खातामा पर्याप्त SMS credit छैन।',
        invalid_number: 'AakashSMS ले सदस्यको फोन नम्बर अमान्य भनेको छ।',
        invalid_response: 'AakashSMS बाट अमान्य प्रतिक्रिया आयो।',
        connection_failed: 'AakashSMS सेवासँग सम्पर्क हुन सकेन।',
        provider_rejected: 'AakashSMS ले सन्देश स्वीकार गरेन। खाता र SMS report जाँच्नुहोस्।',
      }
      return Response.json({ error: explanations[smsResult.reason ?? ''] ?? explanations.provider_rejected }, { status: 502 })
    }
    return Response.json({ smsQueued: true, expiresAt, phoneLast4: phone.slice(-4) })
  }),
}

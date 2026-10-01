import { withSupabase } from 'npm:@supabase/server@^1'
import { checkSmsCredit, probeAakashHost, probeAakashPost } from './sms.js'

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
    if (input.action === 'diagnose') {
      const smsToken = Deno.env.get('AAKASH_SMS_TOKEN')?.trim()
      if (!smsToken) return Response.json({ error: 'SMS सेवा तयार छैन। Admin ले AakashSMS secret जाँच्नुहोस्।' }, { status: 503 })
      let result: { ready: boolean; credit?: number; reason?: string }
      try { result = await checkSmsCredit({ token: smsToken }) }
      catch (error) {
        // Log only the error type, never the token or full upstream request.
        console.warn('AakashSMS credit request failed:', error instanceof Error ? error.name : 'unknown')
        const probe = await probeAakashHost({})
        const postProbe = probe.reachable ? await probeAakashPost({}) : { reachable: false }
        result = { ready: false, reason: !probe.reachable ? 'host_unreachable' : postProbe.reachable ? 'credit_connection_failed' : 'post_unreachable' }
      }
      if (result.ready) return Response.json({ ready: true, credit: result.credit })
      const explanations: Record<string, string> = {
        invalid_token: 'AakashSMS token मान्य छैन। Supabase secret पुनः जाँच्नुहोस्।',
        blocked_access: 'AakashSMS ले यो server बाट आएको अनुरोध रोकेको छ। Token को IP नियम वा खाता अनुमति जाँच्नुहोस्।',
        invalid_response: 'AakashSMS credit सेवाबाट अमान्य प्रतिक्रिया आयो।',
        connection_failed: 'AakashSMS credit सेवासँग सम्पर्क हुन सकेन।',
        credit_connection_failed: 'AakashSMS server खुल्छ, तर token सहितको credit अनुरोध असफल भयो। API वा खाता नियम AakashSMS सँग जाँच्नुहोस्।',
        post_unreachable: 'AakashSMS server खुल्छ, तर POST अनुरोधको उत्तर आएन। AakashSMS लाई API POST पहुँच जाँच्न भन्नुहोस्।',
        host_unreachable: 'Supabase बाट AakashSMS server सम्म जडान हुन सकेन। AakashSMS लाई server पहुँच जाँच्न भन्नुहोस्।',
        provider_rejected: 'AakashSMS ले credit जाँच स्वीकार गरेन। खाता/API अनुमति जाँच्नुहोस्।',
      }
      return Response.json({ error: explanations[result.reason ?? ''] ?? explanations.provider_rejected }, { status: 502 })
    }
    if (input.action !== 'reset-password') return Response.json({ error: 'अमान्य अनुरोध।' }, { status: 400 })
    const memberId = String(input.memberId ?? '').trim()
    const { data: member, error: memberError } = await ctx.supabaseAdmin
      .from('ncas_system_members').select('id, membership_id, phone, auth_user_id').eq('id', memberId).maybeSingle()
    const phone = phoneDigits(member?.phone)
    if (memberError || !member || !/^9\d{9}$/.test(phone)) {
      return Response.json({ error: 'सदस्य वा फोन नम्बर मान्य छैन।' }, { status: 400 })
    }
    if (!member.auth_user_id) return Response.json({ error: 'यो सदस्यले पहिलो पटक फोन नम्बरबाट login गरेकै छैन। Reset आवश्यक छैन।' }, { status: 400 })
    const { error } = await ctx.supabaseAdmin.auth.admin.updateUserById(member.auth_user_id, { password: phone })
    if (error) return Response.json({ error: 'Password reset हुन सकेन। फेरि प्रयास गर्नुहोस्।' }, { status: 503 })
    return Response.json({ reset: true, phoneLast4: phone.slice(-4), membershipId: member.membership_id })
  }),
}

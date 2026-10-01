import { withSupabase } from 'npm:@supabase/server@^1'
import { ensureMemberAuthAccount, isInitialPassword, memberAlias } from './account.js'

const INVALID = 'सदस्य ID वा password मिलेन।'

function reply(message: string, status = 400) {
  return Response.json({ error: message }, { status })
}

export default {
  fetch: withSupabase({ auth: 'publishable' }, async (req, ctx) => {
    if (req.method !== 'POST') return reply('POST मात्र स्वीकारिन्छ।', 405)
    let input: Record<string, unknown>
    try { input = await req.json() } catch { return reply('अमान्य अनुरोध।') }

    const memberId = String(input.memberId ?? '').trim().toUpperCase()
    if (!/^NCAS-[0-9]{4}-[0-9]{5}$/.test(memberId)) return reply(INVALID)

    const { data: member, error: lookupError } = await ctx.supabaseAdmin
      .from('ncas_system_members')
      .select('id, phone, auth_user_id')
      .eq('membership_id', memberId)
      .maybeSingle()
    if (lookupError) {
      console.error('member lookup failed', lookupError.code, lookupError.message)
      return reply('अहिले सेवा उपलब्ध छैन।', 503)
    }
    if (!member) return reply(INVALID)

    if (input.action !== 'login') return reply('अमान्य अनुरोध।')
    const password = String(input.password ?? '')
    if (!password) return reply(INVALID)

    // Do not create or link an account just because someone knows a member ID.
    // First use must match the registered phone; linked accounts then use Auth
    // so a password change makes the phone number stop working.
    if (!member.auth_user_id && !isInitialPassword(member, password)) return reply(INVALID)
    let authUserId: string
    try { authUserId = await ensureMemberAuthAccount(member, ctx.supabaseAdmin) }
    catch (error) {
      if (error instanceof Error && error.message === 'invalid_phone') return reply('दर्ता फोन नम्बर मिलाउन Admin लाई भन्नुहोस्।')
      console.error('member account provisioning failed', error instanceof Error ? error.message : 'unknown')
      return reply('खाता बनाउन सकिएन। केही बेरपछि फेरि प्रयास गर्नुहोस्।', 503)
    }

    const { data, error } = await ctx.supabase.auth.signInWithPassword({
      email: memberAlias(member.id), password,
    })
    if (error || !data.session || data.user.id !== authUserId) return reply(INVALID)
    return Response.json({ session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    } })
  }),
}

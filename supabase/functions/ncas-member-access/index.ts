import { withSupabase } from 'npm:@supabase/server@^1'

const INVALID = 'सदस्य ID, फोन नम्बर, code वा password मिलेन।'
const encoder = new TextEncoder()

function phoneDigits(value: unknown) {
  const digits = String(value ?? '').replace(/[०-९]/g, (digit) => String(digit.charCodeAt(0) - 0x0966)).replace(/\D/g, '')
  return digits.length === 13 && digits.startsWith('977') ? digits.slice(3) : digits
}

function alias(memberId: string) {
  return `m-${memberId}@members.ncas.org.np`
}

async function digest(value: string) {
  const bytes = await crypto.subtle.digest('SHA-256', encoder.encode(value))
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

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

    if (input.action === 'login') {
      if (!member.auth_user_id) return reply('पहिले सक्रियता code बाट खाता खोल्नुहोस्।')
      const password = String(input.password ?? '')
      if (!password) return reply(INVALID)
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email: alias(member.id), password,
      })
      if (error || !data.session || data.user.id !== member.auth_user_id) return reply(INVALID)
      return Response.json({ session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      } })
    }

    if (input.action !== 'activate') return reply('अमान्य अनुरोध।')
    const phone = phoneDigits(input.phone)
    const code = String(input.code ?? '').replace(/[^0-9a-f]/gi, '').toUpperCase()
    const password = String(input.password ?? '')
    if (phone.length < 10 || code.length !== 12 || password.length < 12 || password.length > 72) {
      return reply('फोन नम्बर, १२-अक्षरको code र कम्तीमा १२-अक्षरको नयाँ password चाहिन्छ।')
    }
    if (password === phone || password === String(input.phone ?? '').trim()) {
      return reply('फोन नम्बरलाई नै नयाँ password नराख्नुहोस्।')
    }
    const codeHash = await digest(`${member.id}:${phone}:${code}`)
    const { data: accepted, error: consumeError } = await ctx.supabaseAdmin.rpc(
      'ncas_system_consume_member_activation',
      { p_member_id: member.id, p_code_hash: codeHash },
    )
    if (consumeError) return reply('अहिले सेवा उपलब्ध छैन।', 503)
    if (!accepted) return reply(INVALID)

    if (member.auth_user_id) {
      const { error } = await ctx.supabaseAdmin.auth.admin.updateUserById(member.auth_user_id, { password })
      if (error) return reply('Password राख्न सकिएन। Admin सँग नयाँ code लिनुहोस्।', 503)
    } else {
      const { data, error } = await ctx.supabaseAdmin.auth.admin.createUser({
        email: alias(member.id), password, email_confirm: true,
      })
      if (error || !data.user) return reply('खाता बनाउन सकिएन। Admin सँग नयाँ code लिनुहोस्।', 503)
      const { error: linkError } = await ctx.supabaseAdmin
        .from('ncas_system_members')
        .update({ auth_user_id: data.user.id })
        .eq('id', member.id)
        .is('auth_user_id', null)
        .select('id')
        .single()
      if (linkError) {
        await ctx.supabaseAdmin.auth.admin.deleteUser(data.user.id)
        return reply('खाता जोड्न सकिएन। Admin सँग नयाँ code लिनुहोस्।', 503)
      }
    }
    return Response.json({ activated: true })
  }),
}

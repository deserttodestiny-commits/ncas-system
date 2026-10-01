export function phoneDigits(value) {
  const digits = String(value ?? '')
    .replace(/[०-९]/g, (digit) => String(digit.charCodeAt(0) - 0x0966))
    .replace(/\D/g, '')
  return digits.length === 13 && digits.startsWith('977') ? digits.slice(3) : digits
}

export function memberAlias(memberId) {
  return `m-${memberId}@members.ncas.org.np`
}

export async function ensureMemberAuthAccount(member, adminClient) {
  if (member.auth_user_id) return member.auth_user_id
  const initialPassword = phoneDigits(member.phone)
  if (!/^9\d{9}$/.test(initialPassword)) throw new Error('invalid_phone')

  const { data, error } = await adminClient.auth.admin.createUser({
    email: memberAlias(member.id), password: initialPassword, email_confirm: true,
  })
  if (error || !data?.user) throw new Error('create_failed')

  const { error: linkError } = await adminClient
    .from('ncas_system_members')
    .update({ auth_user_id: data.user.id })
    .eq('id', member.id)
    .is('auth_user_id', null)
    .select('id')
    .single()
  if (linkError) {
    await adminClient.auth.admin.deleteUser(data.user.id)
    throw new Error('link_failed')
  }
  return data.user.id
}

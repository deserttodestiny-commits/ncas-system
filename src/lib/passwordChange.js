export async function changeMemberPassword({ client, memberId, authUserId, currentPassword, newPassword }) {
  if (newPassword.length < 12) throw new Error('नयाँ password कम्तीमा १२ अक्षरको राख्नुहोस्।')
  if (newPassword === currentPassword) throw new Error('नयाँ password पुरानोभन्दा फरक हुनुपर्छ।')

  // Verify the current password even if the project's global Auth setting does
  // not require it. Supabase signs the same member in again on success.
  const { data, error: signInError } = await client.auth.signInWithPassword({
    email: `m-${memberId}@members.ncas.org.np`,
    password: currentPassword,
  })
  if (signInError || data?.user?.id !== authUserId) throw new Error('हालको password मिलेन।')

  const { error } = await client.auth.updateUser({
    password: newPassword,
    current_password: currentPassword,
  })
  if (error) throw error
}

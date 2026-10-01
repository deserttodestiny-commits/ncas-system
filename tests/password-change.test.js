import test from 'node:test'
import assert from 'node:assert/strict'
import { changeMemberPassword } from '../src/lib/passwordChange.js'

test('member must prove the current password before changing it', async () => {
  let updated
  const client = { auth: {
    async signInWithPassword(input) {
      assert.deepEqual(input, { email: 'm-member-1@members.ncas.org.np', password: '9800000000' })
      return { data: { user: { id: 'auth-1' } } }
    },
    async updateUser(input) { updated = input; return { error: null } },
  } }
  await changeMemberPassword({ client, memberId: 'member-1', authUserId: 'auth-1', currentPassword: '9800000000', newPassword: 'a strong new password' })
  assert.deepEqual(updated, { password: 'a strong new password', current_password: '9800000000' })
})

test('wrong current password cannot update the account', async () => {
  const client = { auth: {
    async signInWithPassword() { return { error: new Error('invalid credentials') } },
    async updateUser() { throw new Error('must not update') },
  } }
  await assert.rejects(changeMemberPassword({ client, memberId: 'member-1', authUserId: 'auth-1', currentPassword: 'wrong', newPassword: 'a strong new password' }), /हालको password मिलेन/)
})

test('member cannot set another short or identical password', async () => {
  const client = { auth: { signInWithPassword() { throw new Error('must not sign in') } } }
  await assert.rejects(changeMemberPassword({ client, memberId: 'member-1', authUserId: 'auth-1', currentPassword: '9800000000', newPassword: 'short' }), /१२ अक्षर/)
  await assert.rejects(changeMemberPassword({ client, memberId: 'member-1', authUserId: 'auth-1', currentPassword: 'a strong new password', newPassword: 'a strong new password' }), /फरक/)
})

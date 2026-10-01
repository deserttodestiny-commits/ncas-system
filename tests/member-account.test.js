import test from 'node:test'
import assert from 'node:assert/strict'
import { ensureMemberAuthAccount, isInitialPassword, memberAlias, phoneDigits } from '../supabase/functions/ncas-member-access/account.js'

test('normalizes registered Nepali mobile numbers', () => {
  assert.equal(phoneDigits('+977 980-000-0000'), '9800000000')
  assert.equal(phoneDigits('९८००००००००'), '9800000000')
  assert.equal(memberAlias('member-1'), 'm-member-1@members.ncas.org.np')
})

test('only the registered phone can trigger first-use account creation', () => {
  const member = { phone: '+977 980-000-0000', auth_user_id: null }
  assert.equal(isInitialPassword(member, '9800000000'), true)
  assert.equal(isInitialPassword(member, '9800000001'), false)
  assert.equal(isInitialPassword({ ...member, auth_user_id: 'auth-1' }, '9800000000'), false)
})

test('first member login provisions Auth with the registered phone and links the row', async () => {
  let created
  let linked
  const query = {
    update(value) { linked = value; return this },
    eq() { return this },
    is() { return this },
    select() { return this },
    async single() { return { error: null } },
  }
  const adminClient = {
    auth: { admin: { async createUser(value) { created = value; return { data: { user: { id: 'auth-1' } } } } } },
    from(table) { assert.equal(table, 'ncas_system_members'); return query },
  }
  const authUserId = await ensureMemberAuthAccount({ id: 'member-1', phone: '+977 9800000000', auth_user_id: null }, adminClient)
  assert.equal(authUserId, 'auth-1')
  assert.deepEqual(created, { email: memberAlias('member-1'), password: '9800000000', email_confirm: true })
  assert.deepEqual(linked, { auth_user_id: 'auth-1' })
})

test('existing member keeps their changed password account', async () => {
  const authUserId = await ensureMemberAuthAccount({ id: 'member-1', phone: '9800000000', auth_user_id: 'auth-1' }, {
    auth: { admin: { createUser() { throw new Error('must not reset password') } } },
  })
  assert.equal(authUserId, 'auth-1')
})

test('invalid phone does not create an Auth account', async () => {
  await assert.rejects(
    ensureMemberAuthAccount({ id: 'member-1', phone: '123', auth_user_id: null }, {
      auth: { admin: { createUser() { throw new Error('must not create') } } },
    }),
    /invalid_phone/,
  )
})

test('failed member link deletes the unlinked Auth account', async () => {
  let deletedId
  const query = {
    update() { return this }, eq() { return this }, is() { return this }, select() { return this },
    async single() { return { error: new Error('link failed') } },
  }
  await assert.rejects(
    ensureMemberAuthAccount({ id: 'member-1', phone: '9800000000', auth_user_id: null }, {
      auth: { admin: {
        async createUser() { return { data: { user: { id: 'auth-1' } } } },
        async deleteUser(id) { deletedId = id },
      } },
      from() { return query },
    }),
    /link_failed/,
  )
  assert.equal(deletedId, 'auth-1')
})

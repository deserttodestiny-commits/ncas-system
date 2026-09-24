import assert from 'node:assert/strict'
import test from 'node:test'
import { sendActivationSms } from '../supabase/functions/ncas-member-admin/sms.js'

test('sends one code to the registered mobile using a POST body', async () => {
  let request
  const queued = await sendActivationSms({
    token: 'test-token', phone: '9812345678', membershipId: 'NCAS-2083-00001',
    code: 'ABCD-EF12-3456',
    fetchImpl: async (url, options) => {
      request = { url, options }
      return {
        ok: true,
        json: async () => ({ error: false, data: { valid: [{ status: 'queued' }], invalid: [] } }),
      }
    },
  })
  assert.deepEqual(queued, { queued: true })
  assert.equal(request.url, 'https://sms.aakashsms.com/sms/v3/send')
  assert.equal(request.options.method, 'POST')
  assert.equal(request.options.body.get('auth_token'), 'test-token')
  assert.equal(request.options.body.get('to'), '9812345678')
  assert.match(request.options.body.get('text'), /ABCD-EF12-3456/)
  assert.match(request.options.body.get('text'), /NCAS-2083-00001/)
  assert.ok(!request.url.includes('test-token'))
})

test('does not treat a provider rejection as a sent message', async () => {
  const queued = await sendActivationSms({
    token: 'test-token', phone: '9812345678', membershipId: 'NCAS-2083-00001',
    code: 'ABCD-EF12-3456',
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ error: true, message: 'Not enough balance.', data: [] }),
    }),
  })
  assert.deepEqual(queued, { queued: false, reason: 'insufficient_credit' })
})

test('does not treat an invalid destination as a sent message', async () => {
  const queued = await sendActivationSms({
    token: 'test-token', phone: '9812345678', membershipId: 'NCAS-2083-00001',
    code: 'ABCD-EF12-3456',
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({
        error: false,
        data: { valid: [], invalid: [{ status: 'aborted' }] },
      }),
    }),
  })
  assert.deepEqual(queued, { queued: false, reason: 'invalid_number' })
})

test('accepts a queued single number even when the provider omits the invalid list', async () => {
  const result = await sendActivationSms({
    token: 'test-token', phone: '9812345678', membershipId: 'NCAS-2083-00001',
    code: 'ABCD-EF12-3456',
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ error: false, data: { valid: [{ status: 'queued' }] } }),
    }),
  })
  assert.deepEqual(result, { queued: true })
})

test('recognizes an invalid provider token without exposing it', async () => {
  const result = await sendActivationSms({
    token: 'test-token', phone: '9812345678', membershipId: 'NCAS-2083-00001',
    code: 'ABCD-EF12-3456',
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ error: true, message: 'The provided Auth Token is not valid.', data: [] }),
    }),
  })
  assert.deepEqual(result, { queued: false, reason: 'invalid_token' })
})

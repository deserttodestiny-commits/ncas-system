import test from 'node:test'
import assert from 'node:assert/strict'
import { MEMBERSHIP_RENEWAL_CATEGORY } from '../src/data/districts.js'
import { isMembershipRenewal } from '../src/data/membershipPayment.js'

test('membership dues linked to a member renew the membership', () => {
  assert.equal(isMembershipRenewal({ category: MEMBERSHIP_RENEWAL_CATEGORY, memberId: 'member-1' }), true)
})

test('other income linked to a member does not renew the membership', () => {
  assert.equal(isMembershipRenewal({ category: 'दान/सहयोग', memberId: 'member-1' }), false)
  assert.equal(isMembershipRenewal({ category: 'व्यवसाय दर्ता तथा नवीकरण', memberId: 'member-1' }), false)
})

test('membership dues without a member do not renew the membership', () => {
  assert.equal(isMembershipRenewal({ category: MEMBERSHIP_RENEWAL_CATEGORY, memberId: '' }), false)
})

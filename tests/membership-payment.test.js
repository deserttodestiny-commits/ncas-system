import test from 'node:test'
import assert from 'node:assert/strict'
import { CONTRIBUTION_CATEGORIES, INCOME_CATEGORIES, MEMBERSHIP_RENEWAL_CATEGORY } from '../src/data/districts.js'
import { isMembershipRenewal } from '../src/data/membershipPayment.js'

test('membership dues linked to a member renew the membership', () => {
  assert.equal(isMembershipRenewal({ category: MEMBERSHIP_RENEWAL_CATEGORY, memberId: 'member-1' }), true)
})

test('other income linked to a member does not renew the membership', () => {
  for (const category of CONTRIBUTION_CATEGORIES) {
    assert.ok(INCOME_CATEGORIES.includes(category))
    assert.equal(isMembershipRenewal({ category, memberId: 'member-1' }), false)
    assert.equal(isMembershipRenewal({ category, memberId: null }), false)
  }
  assert.equal(isMembershipRenewal({ category: 'व्यवसाय दर्ता तथा नवीकरण', memberId: 'member-1' }), false)
})

test('membership dues without a member do not renew the membership', () => {
  assert.equal(isMembershipRenewal({ category: MEMBERSHIP_RENEWAL_CATEGORY, memberId: '' }), false)
})

import { MEMBERSHIP_RENEWAL_CATEGORY } from './districts.js'

export function isMembershipRenewal(entry) {
  return entry.category === MEMBERSHIP_RENEWAL_CATEGORY && Boolean(entry.memberId)
}

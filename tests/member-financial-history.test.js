import test from 'node:test'
import assert from 'node:assert/strict'
import { financialHistorySummary, membershipRequirement } from '../src/data/memberFinancialHistory.js'

const member = { id: 'member-1', joinDate: '2023-08-17' }
const income = [
  { id: '3', memberId: 'member-1', date: '2025-08-20', category: 'सदस्यता शुल्क/नवीकरण', amount: 1000, fiscalYear: 2083 },
  { id: '2', memberId: 'member-1', date: '2024-08-20', category: 'सदस्यता शुल्क/नवीकरण', amount: 900, fiscalYear: 2082 },
  { id: '1', memberId: 'member-1', date: '2024-02-10', category: 'परिचयपत्र मुद्रण', amount: 200, fiscalYear: 2080 },
  { id: 'other', memberId: 'other', date: '2025-08-20', category: 'सदस्यता शुल्क/नवीकरण', amount: 999, fiscalYear: 2083 },
]

test('membership requirement shows every unpaid fiscal year from joining through the current year', () => {
  const result = membershipRequirement(member, income, { startYear: 2082, endYear: 2083 }, { startYear: 2080, endYear: 2081 })
  assert.deepEqual(result.requiredEndYears, [2081, 2082, 2083])
  assert.deepEqual(result.paidEndYears, [2082, 2083])
  assert.deepEqual(result.overdueEndYears, [2081])
})

test('financial summary uses only the selected member income records', () => {
  const result = financialHistorySummary(member, income, { startYear: 2082, endYear: 2083 }, { startYear: 2080, endYear: 2081 })
  assert.equal(result.paidTotal, 2100)
  assert.equal(result.firstPaymentDate, '2024-02-10')
  assert.equal(result.history.length, 3)
  assert.deepEqual(result.byCategory.map((entry) => entry.category), ['सदस्यता शुल्क/नवीकरण', 'परिचयपत्र मुद्रण'])
})

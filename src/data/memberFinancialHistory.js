import { isMembershipRenewal } from './membershipPayment.js'

export const REQUIRED_MEMBERSHIP_PAYMENT = 'सदस्यता शुल्क/नवीकरण'

function validEndYear(value) {
  const endYear = Number(value)
  return Number.isInteger(endYear) && endYear > 0 ? endYear : null
}

export function memberIncomeHistory(member, income) {
  if (!member) return []
  return income
    .filter((entry) => entry.memberId === member.id)
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
}

// Membership renewal is the only payment currently configured as compulsory.
// We intentionally calculate this from actual income records instead of the
// member's paid-through field, so the history remains suitable for audit.
export function membershipRequirement(member, income, currentFiscalYear, joinedFiscalYear) {
  const startEndYear = joinedFiscalYear?.endYear
  const currentEndYear = currentFiscalYear?.endYear
  const paidEndYears = new Set(
    memberIncomeHistory(member, income)
      .filter(isMembershipRenewal)
      .map((entry) => validEndYear(entry.fiscalYear))
      .filter(Boolean)
  )

  const requiredEndYears = []
  if (startEndYear && currentEndYear && startEndYear <= currentEndYear) {
    for (let endYear = startEndYear; endYear <= currentEndYear; endYear += 1) requiredEndYears.push(endYear)
  }

  return {
    requiredEndYears,
    paidEndYears: [...paidEndYears].sort((a, b) => a - b),
    overdueEndYears: requiredEndYears.filter((endYear) => !paidEndYears.has(endYear)),
  }
}

export function financialHistorySummary(member, income, currentFiscalYear, joinedFiscalYear) {
  const history = memberIncomeHistory(member, income)
  const membership = membershipRequirement(member, income, currentFiscalYear, joinedFiscalYear)
  const paidTotal = history.reduce((sum, entry) => sum + (Number(entry.amount) || 0), 0)
  const chronological = [...history].sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0))
  const byCategory = Object.values(history.reduce((summary, entry) => {
    const category = entry.category || 'अन्य'
    if (!summary[category]) summary[category] = { category, total: 0, count: 0 }
    summary[category].total += Number(entry.amount) || 0
    summary[category].count += 1
    return summary
  }, {})).sort((a, b) => b.total - a.total)

  return {
    history,
    byCategory,
    paidTotal,
    firstPaymentDate: chronological[0]?.date || '',
    membership,
    requiredPayment: {
      name: REQUIRED_MEMBERSHIP_PAYMENT,
      frequency: 'वार्षिक',
      requiredFromEndYear: membership.requiredEndYears[0] || null,
    },
  }
}

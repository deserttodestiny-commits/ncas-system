import { getMemberPaymentStatus, lastNBsMonths } from './bsCalendar'

export function monthlyTotalsBs(entries, months) {
  return months.map(({ key, label }) => {
    const total = entries
      .filter((e) => e.bsKey === key)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    return { month: label, total }
  })
}

export function monthlyIncomeExpense(income, expenses, n = 6) {
  const months = lastNBsMonths(n)
  const incomeByMonth = monthlyTotalsBs(income, months)
  const expenseByMonth = monthlyTotalsBs(expenses, months)
  return months.map((m, i) => ({
    month: m.label,
    Income: incomeByMonth[i].total,
    Expenses: expenseByMonth[i].total,
  }))
}

export function districtStats(members) {
  const map = {}
  for (const m of members) {
    if (!map[m.district]) {
      map[m.district] = { district: m.district, total: 0, paid: 0, pendingOverdue: 0, fees: 0 }
    }
    const status = getMemberPaymentStatus(m.paidThroughFiscalYear)
    map[m.district].total += 1
    if (status === 'Paid') {
      map[m.district].paid += 1
      map[m.district].fees += Number(m.monthlyFee) || 0
    } else {
      map[m.district].pendingOverdue += 1
    }
  }
  return map
}

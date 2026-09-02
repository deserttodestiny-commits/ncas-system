export function lastNMonthsLabels(n) {
  const months = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    })
  }
  return months
}

export function monthlyTotals(entries, months) {
  return months.map(({ key, label }) => {
    const total = entries
      .filter((e) => e.date && e.date.startsWith(key))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
    return { month: label, total }
  })
}

export function monthlyIncomeExpense(income, expenses, n = 6) {
  const months = lastNMonthsLabels(n)
  const incomeByMonth = monthlyTotals(income, months)
  const expenseByMonth = monthlyTotals(expenses, months)
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
    map[m.district].total += 1
    if (m.paymentStatus === 'Paid') map[m.district].paid += 1
    else map[m.district].pendingOverdue += 1
    if (m.paymentStatus === 'Paid') map[m.district].fees += Number(m.monthlyFee) || 0
  }
  return map
}

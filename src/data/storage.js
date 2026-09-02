const KEYS = {
  members: 'ncas_members',
  income: 'ncas_income',
  expenses: 'ncas_expenses',
  notifications: 'ncas_notifications',
  opportunities: 'ncas_opportunities',
  session: 'ncas_session',
  seeded: 'ncas_seeded',
}

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(KEYS[key])
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  localStorage.setItem(KEYS[key], JSON.stringify(value))
}

export { KEYS }

export function nextMembershipId(members) {
  const year = 2026
  const nums = members
    .map((m) => m.membershipId)
    .filter((id) => id && id.startsWith(`NCAS-${year}-`))
    .map((id) => parseInt(id.split('-')[2], 10))
    .filter((n) => !isNaN(n))
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `NCAS-${year}-${String(next).padStart(4, '0')}`
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function daysUntil(dateStr) {
  const target = new Date(dateStr)
  const now = new Date()
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((target - now) / (1000 * 60 * 60 * 24))
}

export function formatNPR(amount) {
  const n = Number(amount) || 0
  return 'रु. ' + n.toLocaleString('en-IN')
}

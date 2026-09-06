const KEYS = {
  members: 'ncas_members',
  income: 'ncas_income',
  expenses: 'ncas_expenses',
  notifications: 'ncas_notifications',
  opportunities: 'ncas_opportunities',
  session: 'ncas_session',
  schemaVersion: 'ncas_schema_version',
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

// Standard membership ID: NCAS-<BS year joined>-<5-digit sequence>, e.g. NCAS-2083-00007
export function formatMembershipId(bsYear, seq) {
  return `NCAS-${bsYear}-${String(seq).padStart(5, '0')}`
}

export function parseMembershipId(id) {
  const m = /^NCAS-(\d{4})-(\d+)$/.exec(id || '')
  if (!m) return null
  return { year: Number(m[1]), seq: Number(m[2]) }
}

export function nextMembershipId(members, bsYear) {
  const nums = members.map((m) => parseMembershipId(m.membershipId)?.seq).filter((n) => !isNaN(n) && n != null)
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return formatMembershipId(bsYear, next)
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export function formatNPR(amount) {
  const n = Number(amount) || 0
  return 'रु. ' + n.toLocaleString('en-IN')
}

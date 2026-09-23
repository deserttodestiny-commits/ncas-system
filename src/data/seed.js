// Remove the original browser-only demo records once per browser. Keep this
// migration separate from later production data so future visits never wipe it.
const CLEANUP_MARKER = 'ncas_demo_data_cleared_20260923'
const DEMO_KEYS = [
  'ncas_members',
  'ncas_income',
  'ncas_expenses',
  'ncas_notifications',
  'ncas_opportunities',
  'ncas_session',
  'ncas_schema_version',
]

export function clearBundledDemoData() {
  try {
    if (localStorage.getItem(CLEANUP_MARKER)) return
    DEMO_KEYS.forEach((key) => localStorage.removeItem(key))
    localStorage.setItem(CLEANUP_MARKER, '1')
  } catch {
    // Storage may be unavailable in private browsing; the app can still open.
  }
}

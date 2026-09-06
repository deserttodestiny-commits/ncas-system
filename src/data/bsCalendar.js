import NepaliDate, { dateConfigMap as CONFIG } from 'nepali-date-converter'

export const BS_MIN_YEAR = 2000
export const BS_MAX_YEAR = 2090

// index = getMonth() (0-based): Baishakh..Chaitra
export const BS_MONTHS_NP = [
  'बैशाख', 'जेठ', 'असार', 'श्रावण', 'भदौ', 'असोज',
  'कार्तिक', 'मंसिर', 'पुष', 'माघ', 'फागुन', 'चैत',
]

// keys used by the library's dateConfigMap, same order/index as BS_MONTHS_NP
const CONFIG_MONTH_KEYS = [
  'Baisakh', 'Jestha', 'Asar', 'Shrawan', 'Bhadra', 'Aswin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra',
]

export const ASHAD_MONTH_INDEX = 2
export const SHRAWAN_MONTH_INDEX = 3

const NP_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']

export function toNpDigits(value) {
  return String(value).replace(/[0-9]/g, (d) => NP_DIGITS[d])
}

export function getDaysInBsMonth(bsYear, bsMonthIndex) {
  const row = CONFIG[bsYear]
  if (!row) return 30
  return row[CONFIG_MONTH_KEYS[bsMonthIndex]] || 30
}

export function adToBs(adDateInput) {
  if (!adDateInput) return null
  const jsDate = adDateInput instanceof Date ? adDateInput : new Date(adDateInput + 'T00:00:00')
  if (isNaN(jsDate)) return null
  const nd = new NepaliDate(jsDate)
  return { year: nd.getYear(), month: nd.getMonth(), date: nd.getDate() }
}

export function bsToAdIso(bsYear, bsMonthIndex, bsDate) {
  if (!bsYear || bsMonthIndex == null || !bsDate) return ''
  const nd = new NepaliDate(bsYear, bsMonthIndex, bsDate)
  const ad = nd.getAD()
  const mm = String(ad.month + 1).padStart(2, '0')
  const dd = String(ad.date).padStart(2, '0')
  return `${ad.year}-${mm}-${dd}`
}

export function getTodayBs() {
  return adToBs(new Date())
}

export function formatBs(adDateInput, { devanagari = true } = {}) {
  const bs = adToBs(adDateInput)
  if (!bs) return ''
  const y = devanagari ? toNpDigits(bs.year) : bs.year
  const d = devanagari ? toNpDigits(bs.date) : bs.date
  return `${BS_MONTHS_NP[bs.month]} ${d}, ${y}`
}

export function formatBsShort(adDateInput) {
  const bs = adToBs(adDateInput)
  if (!bs) return ''
  return `${bs.year}-${String(bs.month + 1).padStart(2, '0')}-${String(bs.date).padStart(2, '0')}`
}

// Fiscal year: Shrawan 1 (month index 3) of `startYear` through Ashad-end (month index 2) of `endYear` (startYear + 1).
export function getFiscalYearForBs(bsYear, bsMonthIndex) {
  if (bsMonthIndex >= SHRAWAN_MONTH_INDEX) {
    return { startYear: bsYear, endYear: bsYear + 1 }
  }
  return { startYear: bsYear - 1, endYear: bsYear }
}

export function getFiscalYearForAdDate(adDateInput) {
  const bs = adToBs(adDateInput)
  if (!bs) return null
  return getFiscalYearForBs(bs.year, bs.month)
}

export function getCurrentFiscalYear() {
  return getFiscalYearForAdDate(new Date())
}

export function fiscalYearLabel(fy) {
  if (!fy) return ''
  return `${fy.startYear}/${String(fy.endYear).slice(-2)}`
}

export function getFiscalYearStartAdIso(fy) {
  return bsToAdIso(fy.startYear, SHRAWAN_MONTH_INDEX, 1)
}

export function getFiscalYearEndAdIso(fy) {
  const lastDay = getDaysInBsMonth(fy.endYear, ASHAD_MONTH_INDEX)
  return bsToAdIso(fy.endYear, ASHAD_MONTH_INDEX, lastDay)
}

// FY identified by its endYear (e.g. 2084 => FY 2083/84, Shrawan 2083 - Ashad-end 2084)
export function fiscalYearFromEndYear(endYear) {
  return { startYear: endYear - 1, endYear }
}

export function listFiscalYears(before = 3, after = 3) {
  const current = getCurrentFiscalYear()
  const list = []
  for (let e = current.endYear - before; e <= current.endYear + after; e++) {
    if (e - 1 < BS_MIN_YEAR || e > BS_MAX_YEAR) continue
    const fy = fiscalYearFromEndYear(e)
    list.push({ ...fy, label: fiscalYearLabel(fy) })
  }
  return list
}

export function isFiscalYearCoveredThroughToday(paidThroughEndYear) {
  if (!paidThroughEndYear) return false
  const current = getCurrentFiscalYear()
  return paidThroughEndYear >= current.endYear
}

// A member is "Paid" while the current fiscal year is covered, "Pending" once inside
// the grace window before their covered FY actually lapses, else "Overdue".
export function getMemberPaymentStatus(paidThroughEndYear, graceDays = 30) {
  if (!paidThroughEndYear) return 'Overdue'
  const expiryIso = getFiscalYearEndAdIso(fiscalYearFromEndYear(paidThroughEndYear))
  const days = daysUntilIso(expiryIso)
  if (days < 0) return 'Overdue'
  if (days <= graceDays) return 'Pending'
  return 'Paid'
}

export function getMemberExpiryAdIso(paidThroughEndYear) {
  if (!paidThroughEndYear) return ''
  return getFiscalYearEndAdIso(fiscalYearFromEndYear(paidThroughEndYear))
}

export function daysUntilIso(dateStr) {
  if (!dateStr) return -Infinity
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((target - now) / (1000 * 60 * 60 * 24))
}

export function bsMonthKeyForAdDate(adDateInput) {
  const bs = adToBs(adDateInput)
  if (!bs) return ''
  return `${bs.year}-${String(bs.month + 1).padStart(2, '0')}`
}

// Returns last N fiscal-year months (BS year/month pairs, chronological) ending at the current BS month.
export function lastNBsMonths(n) {
  const today = getTodayBs()
  const months = []
  let y = today.year
  let m = today.month
  for (let i = 0; i < n; i++) {
    months.unshift({ year: y, month: m, label: `${BS_MONTHS_NP[m]}` , key: `${y}-${String(m + 1).padStart(2, '0')}` })
    m -= 1
    if (m < 0) { m = 11; y -= 1 }
  }
  return months
}

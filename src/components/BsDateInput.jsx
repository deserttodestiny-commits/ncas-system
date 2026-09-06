import { useMemo } from 'react'
import {
  BS_MAX_YEAR, BS_MIN_YEAR, BS_MONTHS_NP, adToBs, bsToAdIso, getDaysInBsMonth, toNpDigits,
} from '../data/bsCalendar'

export default function BsDateInput({ value, onChange, required, yearsBack = 100, yearsForward = 10 }) {
  const bs = useMemo(() => adToBs(value), [value])

  const currentYear = adToBs(new Date()).year
  const yearOptions = useMemo(() => {
    const from = Math.max(BS_MIN_YEAR, currentYear - yearsBack)
    const to = Math.min(BS_MAX_YEAR, currentYear + yearsForward)
    const years = []
    for (let y = to; y >= from; y--) years.push(y)
    return years
  }, [currentYear, yearsBack, yearsForward])

  const dayCount = bs ? getDaysInBsMonth(bs.year, bs.month) : 32
  const dayOptions = Array.from({ length: dayCount }, (_, i) => i + 1)

  const commit = (year, month, date) => {
    if (!year || month == null || !date) {
      onChange('')
      return
    }
    const maxDay = getDaysInBsMonth(year, month)
    const safeDate = Math.min(date, maxDay)
    onChange(bsToAdIso(year, month, safeDate))
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <select
          required={required}
          value={bs?.year ?? ''}
          onChange={(e) => commit(Number(e.target.value), bs?.month, bs?.date)}
          className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
        >
          <option value="">वर्ष</option>
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          required={required}
          value={bs?.month ?? ''}
          onChange={(e) => commit(bs?.year, Number(e.target.value), bs?.date)}
          className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
        >
          <option value="">महिना</option>
          {BS_MONTHS_NP.map((m, i) => <option key={m} value={i}>{m}</option>)}
        </select>
        <select
          required={required}
          value={bs?.date ?? ''}
          onChange={(e) => commit(bs?.year, bs?.month, Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-2 py-2 text-sm"
        >
          <option value="">गते</option>
          {dayOptions.map((d) => <option key={d} value={d}>{toNpDigits(d)}</option>)}
        </select>
      </div>
      {value && <div className="text-xs text-gray-400 mt-1">AD: {value}</div>}
    </div>
  )
}

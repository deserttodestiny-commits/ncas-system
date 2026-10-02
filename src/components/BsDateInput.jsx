import { useMemo, useState } from 'react'
import {
  BS_MAX_YEAR, BS_MIN_YEAR, BS_MONTHS_NP, adToBs, bsToAdIso, getDaysInBsMonth, toNpDigits,
} from '../data/bsCalendar'

const WEEK_DAYS = ['आइत', 'सोम', 'मंगल', 'बुध', 'बिहि', 'शुक्र', 'शनि']

export default function BsDateInput({ value, onChange, required, yearsBack = 100, yearsForward = 10 }) {
  const bs = useMemo(() => adToBs(value), [value])
  const currentBs = useMemo(() => adToBs(new Date()), [])
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => bs || currentBs)

  const yearOptions = useMemo(() => {
    const from = Math.max(BS_MIN_YEAR, currentBs.year - yearsBack)
    const to = Math.min(BS_MAX_YEAR, currentBs.year + yearsForward)
    const years = []
    for (let year = to; year >= from; year--) years.push(year)
    return years
  }, [currentBs.year, yearsBack, yearsForward])

  const daysInMonth = getDaysInBsMonth(view.year, view.month)
  const firstDayIso = bsToAdIso(view.year, view.month, 1)
  const firstWeekday = new Date(`${firstDayIso}T00:00:00`).getDay()
  const calendarDays = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => index < firstWeekday ? null : index - firstWeekday + 1)
  const displayValue = bs ? `${toNpDigits(bs.year)} ${BS_MONTHS_NP[bs.month]} ${toNpDigits(bs.date)} गते` : 'मिति छान्नुहोस्'

  const openCalendar = () => {
    setView(bs || currentBs)
    setOpen(true)
  }

  const moveMonth = (amount) => {
    setView((current) => {
      let month = current.month + amount
      let year = current.year
      if (month < 0) { month = 11; year -= 1 }
      if (month > 11) { month = 0; year += 1 }
      return { year: Math.min(BS_MAX_YEAR, Math.max(BS_MIN_YEAR, year)), month }
    })
  }

  const selectDate = (date) => {
    onChange(bsToAdIso(view.year, view.month, date))
    setOpen(false)
  }

  return (
    <div className="relative">
      <input type="hidden" value={value || ''} required={required} readOnly />
      <button
        type="button"
        onClick={openCalendar}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 border border-gray-300 bg-white rounded-lg px-3 py-2 text-left text-sm hover:border-ncas-blue focus:outline-none focus:ring-2 focus:ring-ncas-blue/30"
      >
        <span className={bs ? 'text-gray-800' : 'text-gray-400'}>{displayValue}</span>
        <span aria-hidden="true" className="text-base">📅</span>
      </button>
      {value && <div className="text-xs text-gray-400 mt-1">AD: {value}</div>}

      {open && (
        <div role="dialog" aria-label="वि.सं. मिति छान्नुहोस्" className="absolute z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-gray-200 bg-white p-3 shadow-xl">
          <div className="flex items-center justify-between gap-2 mb-3">
            <button type="button" onClick={() => moveMonth(-1)} aria-label="अघिल्लो महिना" className="w-9 h-9 rounded-lg hover:bg-gray-100 text-lg">‹</button>
            <div className="flex items-center gap-2">
              <select value={view.year} onChange={(event) => setView((current) => ({ ...current, year: Number(event.target.value) }))} aria-label="वर्ष" className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm font-semibold">
                {yearOptions.map((year) => <option key={year} value={year}>{toNpDigits(year)}</option>)}
              </select>
              <span className="text-sm font-semibold text-ncas-dark">{BS_MONTHS_NP[view.month]}</span>
            </div>
            <button type="button" onClick={() => moveMonth(1)} aria-label="अर्को महिना" className="w-9 h-9 rounded-lg hover:bg-gray-100 text-lg">›</button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-1">
            {WEEK_DAYS.map((day) => <span key={day} className="py-1">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} />
              const selected = bs?.year === view.year && bs?.month === view.month && bs?.date === date
              const today = currentBs.year === view.year && currentBs.month === view.month && currentBs.date === date
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => selectDate(date)}
                  aria-label={`${toNpDigits(view.year)} ${BS_MONTHS_NP[view.month]} ${toNpDigits(date)} गते`}
                  className={`h-9 rounded-lg text-sm transition-colors ${selected ? 'bg-ncas-dark text-white' : today ? 'bg-ncas-gold/20 text-ncas-dark font-bold' : 'hover:bg-blue-50 text-gray-700'}`}
                >
                  {toNpDigits(date)}
                </button>
              )
            })}
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
            <button type="button" onClick={() => { onChange(''); setOpen(false) }} className="text-ncas-danger hover:underline">खाली गर्नुहोस्</button>
            <button type="button" onClick={() => setOpen(false)} className="text-ncas-blue font-semibold hover:underline">बन्द गर्नुहोस्</button>
          </div>
        </div>
      )}
    </div>
  )
}

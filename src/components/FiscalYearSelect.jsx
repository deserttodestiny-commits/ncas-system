import { listFiscalYears } from '../data/bsCalendar'

export default function FiscalYearSelect({ value, onChange, before = 3, after = 3, className }) {
  const years = listFiscalYears(before, after)
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(Number(e.target.value))}
      className={className || 'w-full border border-gray-300 rounded-lg px-3 py-2'}
    >
      <option value="">आर्थिक वर्ष छान्नुहोस्</option>
      {years.map((fy) => (
        <option key={fy.endYear} value={fy.endYear}>{fy.label}</option>
      ))}
    </select>
  )
}

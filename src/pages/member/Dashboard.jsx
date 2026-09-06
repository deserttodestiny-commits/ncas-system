import { Link } from 'react-router-dom'
import { useCurrentMember } from '../../data/useCurrentMember'
import {
  daysUntilIso, fiscalYearFromEndYear, fiscalYearLabel, formatBs,
  getCurrentFiscalYear, getMemberExpiryAdIso, getMemberPaymentStatus,
} from '../../data/bsCalendar'
import StatusBadge from '../../components/StatusBadge'

const LINKS = [
  { to: '/member/profile', label: 'प्रोफाइल', icon: '👤' },
  { to: '/member/payment', label: 'भुक्तानी', icon: '💳' },
  { to: '/member/idcard', label: 'परिचयपत्र', icon: '🪪' },
  { to: '/member/notifications', label: 'सूचनाहरू', icon: '📢' },
  { to: '/member/opportunities', label: 'अवसरहरू', icon: '💼' },
]

export default function MemberDashboard() {
  const { member } = useCurrentMember()
  if (!member) return null

  const currentFy = getCurrentFiscalYear()
  const status = getMemberPaymentStatus(member.paidThroughFiscalYear)
  const expiryIso = getMemberExpiryAdIso(member.paidThroughFiscalYear)
  const days = daysUntilIso(expiryIso)

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-ncas-dark to-ncas-blue text-white rounded-xl shadow-sm p-6">
        <h1 className="text-2xl font-bold">नमस्ते, {member.fullName} जी!</h1>
        <p className="text-blue-100 mt-1">{member.district} · {member.membershipType}</p>
        <p className="text-blue-100 mt-1 text-sm">चालु आर्थिक वर्ष: {fiscalYearLabel(currentFy)}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-gray-500">सदस्यता आइडी</div>
          <div className="text-lg font-bold text-ncas-dark mt-1 font-mono">{member.membershipId}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-gray-500 mb-2">भुक्तानी स्थिति</div>
          <StatusBadge status={status} />
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-gray-500">तिरेको आ.व. (अन्तिम)</div>
          <div className="text-lg font-bold text-ncas-dark mt-1">
            {member.paidThroughFiscalYear ? fiscalYearLabel(fiscalYearFromEndYear(member.paidThroughFiscalYear)) : '-'}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">आषाढ़ मसान्त: {expiryIso ? formatBs(expiryIso) : '-'}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-gray-500">बाँकी दिन</div>
          <div className={`text-lg font-bold mt-1 ${days < 0 ? 'text-ncas-danger' : days <= 30 ? 'text-ncas-warning' : 'text-ncas-success'}`}>
            {days < 0 ? `${Math.abs(days)} दिन नाघेको` : `${days} दिन`}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-ncas-dark mb-4">छिटो पहुँच</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="flex flex-col items-center justify-center gap-2 border border-gray-200 rounded-xl py-5 hover:bg-ncas-light hover:border-ncas-blue transition text-center"
            >
              <span className="text-2xl">{l.icon}</span>
              <span className="text-sm font-medium text-gray-700">{l.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

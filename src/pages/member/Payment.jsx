import { useMemo } from 'react'
import { useCurrentMember } from '../../data/useCurrentMember'
import { useCollection } from '../../data/useCollection'
import { formatNPR } from '../../data/storage'
import {
  daysUntilIso, fiscalYearFromEndYear, fiscalYearLabel, formatBs,
  getCurrentFiscalYear, getMemberExpiryAdIso, getMemberPaymentStatus,
} from '../../data/bsCalendar'
import { useUi } from '../../context/UiContext'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'

export default function Payment() {
  const { member } = useCurrentMember()
  const { items: income } = useCollection('income')
  const { toast } = useUi()

  const history = useMemo(
    () => (member ? income.filter((e) => e.memberId === member.id).sort((a, b) => new Date(b.date) - new Date(a.date)) : []),
    [income, member]
  )

  const byHeading = useMemo(() => {
    const map = {}
    for (const h of history) {
      if (!map[h.category]) map[h.category] = { category: h.category, total: 0, count: 0 }
      map[h.category].total += Number(h.amount) || 0
      map[h.category].count += 1
    }
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [history])

  if (!member) return null

  const currentFy = getCurrentFiscalYear()
  const status = getMemberPaymentStatus(member.paidThroughFiscalYear)
  const expiryIso = getMemberExpiryAdIso(member.paidThroughFiscalYear)
  const days = daysUntilIso(expiryIso)
  const totalPaid = history.reduce((s, h) => s + (Number(h.amount) || 0), 0)

  const handleNotify = () => {
    toast('तपाईंको भुक्तानी सूचना पठाइयो! NCAS कार्यालयले छिट्टै confirm गर्नेछ।')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-ncas-dark">भुक्तानी</h1>

      <div className="bg-white rounded-xl shadow-sm p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="text-sm text-gray-500">हालको स्थिति</div>
          <div className="mt-1"><StatusBadge status={status} /></div>
        </div>
        <div>
          <div className="text-sm text-gray-500">चालु आ.व.</div>
          <div className="text-base font-bold text-ncas-dark mt-1">{fiscalYearLabel(currentFy)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">तिरेको आ.व. (अन्तिम)</div>
          <div className="text-base font-bold text-ncas-dark mt-1">
            {member.paidThroughFiscalYear ? fiscalYearLabel(fiscalYearFromEndYear(member.paidThroughFiscalYear)) : '-'}
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">म्याद (आषाढ़ मसान्त)</div>
          <div className="text-base font-bold text-ncas-dark mt-1">{expiryIso ? formatBs(expiryIso) : '-'}</div>
          <div className={`text-xs mt-0.5 ${days < 0 ? 'text-ncas-danger' : days <= 30 ? 'text-ncas-warning' : 'text-ncas-success'}`}>
            {days < 0 ? `${Math.abs(days)} दिन नाघेको` : `${days} दिन बाँकी`}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-ncas-dark mb-4">भुक्तानी निर्देशन</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>🏦 <strong>बैंक हस्तान्तरण:</strong> NCAS खाता नं. — [कार्यालयबाट प्राप्त गर्नुहोस्]</li>
          <li>📱 <strong>QR कोड:</strong></li>
        </ul>
        <div className="w-32 h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs mt-2 mb-3">
          QR Code
        </div>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>🏢 <strong>कार्यालयमा नगद:</strong> बागबजार, काठमाडौं</li>
          <li>📞 <strong>सम्पर्क:</strong> info@ncas.org.np</li>
        </ul>
        <button onClick={handleNotify} className="mt-5 px-5 py-2.5 rounded-lg bg-ncas-gold text-white font-medium hover:opacity-90">
          भुक्तानी गरिसकेँ — सूचित गर्नुस्
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ncas-dark">सिर्षक अनुसार सारांश</h2>
          <div className="text-sm text-gray-500">कुल जम्मा: <span className="font-bold text-ncas-success">{formatNPR(totalPaid)}</span></div>
        </div>
        {byHeading.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="py-2">सिर्षक</th>
                  <th className="py-2 text-right">पटक</th>
                  <th className="py-2 text-right">जम्मा रकम</th>
                </tr>
              </thead>
              <tbody>
                {byHeading.map((h) => (
                  <tr key={h.category} className="border-b last:border-0">
                    <td className="py-2 text-gray-800">{h.category}</td>
                    <td className="py-2 text-right text-gray-600">{h.count}</td>
                    <td className="py-2 text-right font-medium text-ncas-success">{formatNPR(h.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="कुनै भुक्तानी अभिलेख फेला परेन" />
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-ncas-dark">पूर्ण भुक्तानी इतिहास (मिति अनुसार)</h2>
        </div>
        {history.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="text-left">
                  <th className="px-4 py-3">मिति (वि.सं.)</th>
                  <th className="px-4 py-3">आ.व.</th>
                  <th className="px-4 py-3">सिर्षक</th>
                  <th className="px-4 py-3">विवरण</th>
                  <th className="px-4 py-3 text-right">रकम</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatBs(h.date)}</td>
                    <td className="px-4 py-3 text-gray-600">{h.fiscalYear ? fiscalYearLabel(fiscalYearFromEndYear(h.fiscalYear)) : '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{h.category}</td>
                    <td className="px-4 py-3 text-gray-700">{h.description}</td>
                    <td className="px-4 py-3 text-right font-medium text-ncas-success">{formatNPR(h.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="कुनै भुक्तानी इतिहास फेला परेन" />
        )}
      </div>
    </div>
  )
}

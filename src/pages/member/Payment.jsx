import { useCurrentMember } from '../../data/useCurrentMember'
import { useCollection } from '../../data/useCollection'
import { formatNPR } from '../../data/storage'
import { useUi } from '../../context/UiContext'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'

export default function Payment() {
  const { member } = useCurrentMember()
  const { items: income } = useCollection('income')
  const { toast } = useUi()

  if (!member) return null

  const history = income
    .filter((e) => e.receivedFrom === member.fullName)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleNotify = () => {
    toast('तपाईंको भुक्तानी सूचना पठाइयो! NCAS कार्यालयले छिट्टै confirm गर्नेछ।')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-ncas-dark">भुक्तानी</h1>

      <div className="bg-white rounded-xl shadow-sm p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm text-gray-500">हालको स्थिति</div>
          <div className="mt-1"><StatusBadge status={member.paymentStatus} /></div>
        </div>
        <div>
          <div className="text-sm text-gray-500">मासिक शुल्क</div>
          <div className="text-lg font-bold text-ncas-dark mt-1">{formatNPR(member.monthlyFee)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">म्याद सकिने मिति</div>
          <div className="text-lg font-bold text-ncas-dark mt-1">{member.paymentExpiryDate}</div>
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

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-ncas-dark">भुक्तानी इतिहास</h2>
        </div>
        {history.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="text-left">
                  <th className="px-4 py-3">मिति</th>
                  <th className="px-4 py-3">विवरण</th>
                  <th className="px-4 py-3 text-right">रकम</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-600">{h.date}</td>
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

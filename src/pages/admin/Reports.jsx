import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCollection } from '../../data/useCollection'
import { DISTRICTS } from '../../data/districts'
import { districtStats } from '../../data/helpers'
import { formatNPR } from '../../data/storage'
import { fiscalYearLabel, getCurrentFiscalYear } from '../../data/bsCalendar'

export default function Reports() {
  const { items: members } = useCollection('members')
  const statsMap = districtStats(members)
  const currentFy = getCurrentFiscalYear()

  const rows = DISTRICTS.map((d) => statsMap[d] || { district: d, total: 0, paid: 0, pendingOverdue: 0, fees: 0 })
  const topChartData = [...rows]
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 15)
    .map((r) => ({ district: r.district, सदस्य: r.total }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-ncas-dark">जिल्ला अनुसार रिपोर्ट</h1>
        <span className="px-3 py-1 rounded-full bg-ncas-light text-ncas-dark text-sm font-semibold border border-ncas-blue/30">
          चालु आर्थिक वर्ष: {fiscalYearLabel(currentFy)}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold text-ncas-dark mb-4">शीर्ष १५ जिल्ला (सदस्य संख्या अनुसार)</h2>
        {topChartData.length ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={topChartData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" fontSize={11} />
              <YAxis type="category" dataKey="district" fontSize={11} width={110} />
              <Tooltip />
              <Bar dataKey="सदस्य" fill="#2E75B6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-400 text-sm py-8 text-center">कुनै डेटा छैन</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 sticky top-0">
              <tr className="text-left">
                <th className="px-4 py-3">जिल्ला</th>
                <th className="px-4 py-3 text-right">कुल सदस्य</th>
                <th className="px-4 py-3 text-right">भुक्तानी गरेका</th>
                <th className="px-4 py-3 text-right">बाँकी/म्याद नाघेका</th>
                <th className="px-4 py-3 text-right">संकलित शुल्क</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.district} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-800 font-medium">{r.district}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{r.total}</td>
                  <td className="px-4 py-3 text-right text-ncas-success">{r.paid}</td>
                  <td className="px-4 py-3 text-right text-ncas-danger">{r.pendingOverdue}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatNPR(r.fees)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useCollection } from '../../data/useCollection'
import { districtStats, monthlyIncomeExpense } from '../../data/helpers'
import { formatNPR } from '../../data/storage'
import StatusBadge from '../../components/StatusBadge'
import EmptyState from '../../components/EmptyState'

const PIE_COLORS = ['#1F3864', '#2E75B6', '#B8860B', '#375623', '#C55A11', '#C00000', '#6B8E23', '#4682B4', '#8B4789', '#B22222']

function SummaryCard({ label, value, icon, accent }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border-l-4" style={{ borderColor: accent }}>
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="text-xl font-bold text-ncas-dark">{value}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { items: members } = useCollection('members')
  const { items: income } = useCollection('income')
  const { items: expenses } = useCollection('expenses')

  const totalIncome = income.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const totalExpenses = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const netBalance = totalIncome - totalExpenses

  const chartData = monthlyIncomeExpense(income, expenses, 6)

  const stats = Object.values(districtStats(members))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
    .map((s) => ({ name: s.district, value: s.total }))

  const recentMembers = [...members]
    .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
    .slice(0, 5)

  const recentTransactions = [
    ...income.map((e) => ({ ...e, type: 'आम्दानी' })),
    ...expenses.map((e) => ({ ...e, type: 'खर्च' })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ncas-dark">ड्यासबोर्ड</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="कुल सदस्य" value={members.length} icon="👥" accent="#1F3864" />
        <SummaryCard label="कुल आम्दानी" value={formatNPR(totalIncome)} icon="💰" accent="#375623" />
        <SummaryCard label="कुल खर्च" value={formatNPR(totalExpenses)} icon="💸" accent="#C55A11" />
        <SummaryCard label="खुद मौज्दात" value={formatNPR(netBalance)} icon="📈" accent={netBalance >= 0 ? '#2E75B6' : '#C00000'} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-ncas-dark mb-4">मासिक आम्दानी बनाम खर्च (गत ६ महिना)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v) => formatNPR(v)} />
              <Legend />
              <Bar dataKey="Income" fill="#2E75B6" radius={[4, 4, 0, 0]} name="आम्दानी" />
              <Bar dataKey="Expenses" fill="#C55A11" radius={[4, 4, 0, 0]} name="खर्च" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-ncas-dark mb-4">जिल्ला अनुसार सदस्य (शीर्ष १०)</h2>
          {stats.length ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={stats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={({ name, value }) => `${name}: ${value}`}>
                  {stats.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="कुनै सदस्य छैन" />
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-ncas-dark mb-4">भर्खरै थपिएका सदस्यहरू</h2>
          {recentMembers.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">नाम</th>
                    <th className="pb-2">जिल्ला</th>
                    <th className="pb-2">स्थिति</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMembers.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2 font-medium text-gray-800">{m.fullName}</td>
                      <td className="py-2 text-gray-600">{m.district}</td>
                      <td className="py-2"><StatusBadge status={m.paymentStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="कुनै सदस्य छैन" />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-ncas-dark mb-4">भर्खरका कारोबारहरू</h2>
          {recentTransactions.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">मिति</th>
                    <th className="pb-2">प्रकार</th>
                    <th className="pb-2">विवरण</th>
                    <th className="pb-2 text-right">रकम</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((t) => (
                    <tr key={t.type + t.id} className="border-b last:border-0">
                      <td className="py-2 text-gray-600">{t.date}</td>
                      <td className="py-2">
                        <span className={t.type === 'आम्दानी' ? 'text-ncas-success font-medium' : 'text-ncas-danger font-medium'}>{t.type}</span>
                      </td>
                      <td className="py-2 text-gray-700">{t.description}</td>
                      <td className="py-2 text-right font-medium">{formatNPR(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState message="कुनै कारोबार छैन" />
          )}
        </div>
      </div>
    </div>
  )
}

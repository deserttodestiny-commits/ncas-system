import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCollection } from '../../data/useCollection'
import { INCOME_CATEGORIES } from '../../data/districts'
import { formatNPR, uid } from '../../data/storage'
import { lastNMonthsLabels, monthlyTotals } from '../../data/helpers'
import { useUi } from '../../context/UiContext'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'

const emptyForm = { date: new Date().toISOString().slice(0, 10), category: INCOME_CATEGORIES[0], amount: '', description: '', receivedFrom: '' }

export default function Income() {
  const { items: income, addItem, removeItem } = useCollection('income')
  const { toast, confirm } = useUi()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const total = income.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const chartData = monthlyTotals(income, lastNMonthsLabels(6)).map((m) => ({ month: m.month, आम्दानी: m.total }))
  const sorted = [...income].sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleSubmit = (e) => {
    e.preventDefault()
    addItem({ id: uid(), ...form, amount: Number(form.amount) || 0 })
    toast('आम्दानी थपियो')
    setForm(emptyForm)
    setOpen(false)
  }

  const handleDelete = async (entry) => {
    const ok = await confirm('यो आम्दानी प्रविष्टि हटाउने पक्का हो?')
    if (ok) {
      removeItem(entry.id)
      toast('प्रविष्टि हटाइयो', 'info')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ncas-dark">आम्दानी</h1>
        <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-ncas-dark text-white text-sm font-medium hover:opacity-90">
          + नयाँ आम्दानी
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="text-sm text-gray-500">कुल आम्दानी</div>
          <div className="text-2xl font-bold text-ncas-success mt-1">{formatNPR(total)}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-semibold text-ncas-dark mb-2 text-sm">मासिक आम्दानी (गत ६ महिना)</h2>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip formatter={(v) => formatNPR(v)} />
              <Bar dataKey="आम्दानी" fill="#375623" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {sorted.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="text-left">
                  <th className="px-4 py-3">मिति</th>
                  <th className="px-4 py-3">श्रेणी</th>
                  <th className="px-4 py-3">विवरण</th>
                  <th className="px-4 py-3">प्राप्त गर्ने</th>
                  <th className="px-4 py-3 text-right">रकम</th>
                  <th className="px-4 py-3 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => (
                  <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{e.date}</td>
                    <td className="px-4 py-3 text-gray-700">{e.category}</td>
                    <td className="px-4 py-3 text-gray-700">{e.description}</td>
                    <td className="px-4 py-3 text-gray-600">{e.receivedFrom}</td>
                    <td className="px-4 py-3 text-right font-medium text-ncas-success">{formatNPR(e.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(e)} className="text-ncas-danger hover:underline text-xs font-medium">हटाउनुहोस्</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="कुनै आम्दानी प्रविष्टि छैन" />
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="नयाँ आम्दानी थप्नुहोस्">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">मिति</label>
            <input type="date" required value={form.date} onChange={set('date')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">श्रेणी</label>
            <select value={form.category} onChange={set('category')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              {INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">रकम (रु.)</label>
            <input type="number" min="0" required value={form.amount} onChange={set('amount')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">विवरण</label>
            <input value={form.description} onChange={set('description')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">प्राप्त गर्ने</label>
            <input value={form.receivedFrom} onChange={set('receivedFrom')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">रद्द गर्नुहोस्</button>
            <button type="submit" className="px-5 py-2 rounded-lg bg-ncas-dark text-white font-medium hover:opacity-90">सुरक्षित गर्नुहोस्</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

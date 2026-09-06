import { useState } from 'react'
import { useCollection } from '../../data/useCollection'
import { EXPENSE_CATEGORIES } from '../../data/districts'
import { formatNPR, uid } from '../../data/storage'
import { bsMonthKeyForAdDate, formatBs } from '../../data/bsCalendar'
import { useUi } from '../../context/UiContext'
import BsDateInput from '../../components/BsDateInput'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'

const emptyForm = { date: new Date().toISOString().slice(0, 10), category: EXPENSE_CATEGORIES[0], amount: '', description: '', paidTo: '' }

export default function Expenses() {
  const { items: expenses, addItem, removeItem } = useCollection('expenses')
  const { toast, confirm } = useUi()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const total = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const sorted = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleSubmit = (e) => {
    e.preventDefault()
    addItem({ id: uid(), ...form, amount: Number(form.amount) || 0, bsKey: bsMonthKeyForAdDate(form.date) })
    toast('खर्च थपियो')
    setForm(emptyForm)
    setOpen(false)
  }

  const handleDelete = async (entry) => {
    const ok = await confirm('यो खर्च प्रविष्टि हटाउने पक्का हो?')
    if (ok) {
      removeItem(entry.id)
      toast('प्रविष्टि हटाइयो', 'info')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ncas-dark">खर्च</h1>
        <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-ncas-dark text-white text-sm font-medium hover:opacity-90">
          + नयाँ खर्च
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-5 max-w-xs">
        <div className="text-sm text-gray-500">कुल खर्च</div>
        <div className="text-2xl font-bold text-ncas-danger mt-1">{formatNPR(total)}</div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {sorted.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="text-left">
                  <th className="px-4 py-3">मिति (वि.सं.)</th>
                  <th className="px-4 py-3">श्रेणी</th>
                  <th className="px-4 py-3">विवरण</th>
                  <th className="px-4 py-3">भुक्तानी गरिएको</th>
                  <th className="px-4 py-3 text-right">रकम</th>
                  <th className="px-4 py-3 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => (
                  <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatBs(e.date)}</td>
                    <td className="px-4 py-3 text-gray-700">{e.category}</td>
                    <td className="px-4 py-3 text-gray-700">{e.description}</td>
                    <td className="px-4 py-3 text-gray-600">{e.paidTo}</td>
                    <td className="px-4 py-3 text-right font-medium text-ncas-danger">{formatNPR(e.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDelete(e)} className="text-ncas-danger hover:underline text-xs font-medium">हटाउनुहोस्</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="कुनै खर्च प्रविष्टि छैन" />
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="नयाँ खर्च थप्नुहोस्">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">मिति (वि.सं.)</label>
            <BsDateInput value={form.date} onChange={(iso) => setForm((f) => ({ ...f, date: iso }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">श्रेणी</label>
            <select value={form.category} onChange={set('category')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">भुक्तानी गरिएको</label>
            <input value={form.paidTo} onChange={set('paidTo')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
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

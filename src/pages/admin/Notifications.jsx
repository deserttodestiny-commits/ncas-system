import { useState } from 'react'
import { useCollection } from '../../data/useCollection'
import { DISTRICTS } from '../../data/districts'
import { uid } from '../../data/storage'
import { formatBs } from '../../data/bsCalendar'
import { useUi } from '../../context/UiContext'
import BsDateInput from '../../components/BsDateInput'
import EmptyState from '../../components/EmptyState'

const emptyForm = { title: '', message: '', target: 'All' }
const emptyOppForm = { title: '', description: '', location: '', deadline: '', contact: '' }

export default function Notifications() {
  const { items: notifications, addItem, removeItem } = useCollection('notifications')
  const { items: opportunities, addItem: addOpp, removeItem: removeOpp } = useCollection('opportunities')
  const { toast, confirm } = useUi()
  const [form, setForm] = useState(emptyForm)
  const [oppForm, setOppForm] = useState(emptyOppForm)
  const setOpp = (key) => (e) => setOppForm((f) => ({ ...f, [key]: e.target.value }))

  const handleOppSubmit = (e) => {
    e.preventDefault()
    if (!oppForm.title.trim()) return
    addOpp({ id: uid(), ...oppForm })
    toast('अवसर थपियो')
    setOppForm(emptyOppForm)
  }

  const handleOppDelete = async (o) => {
    const ok = await confirm('यो अवसर हटाउने पक्का हो?')
    if (ok) {
      removeOpp(o.id)
      toast('अवसर हटाइयो', 'info')
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const sorted = [...notifications].sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return
    addItem({ id: uid(), ...form, date: new Date().toISOString().slice(0, 10) })
    toast('सूचना पठाइयो')
    setForm(emptyForm)
  }

  const handleDelete = async (n) => {
    const ok = await confirm('यो सूचना हटाउने पक्का हो?')
    if (ok) {
      removeItem(n.id)
      toast('सूचना हटाइयो', 'info')
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ncas-dark">सूचना पठाउनुहोस्</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">शीर्षक</label>
          <input required value={form.title} onChange={set('title')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">सन्देश</label>
          <textarea required rows={3} value={form.message} onChange={set('message')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">लक्षित समूह</label>
          <select value={form.target} onChange={set('target')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option value="All">सबै सदस्य</option>
            {DISTRICTS.map((d) => <option key={d} value={d}>{d} (जिल्ला)</option>)}
          </select>
        </div>
        <button type="submit" className="px-5 py-2 rounded-lg bg-ncas-dark text-white font-medium hover:opacity-90">
          सूचना पठाउनुहोस्
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-ncas-dark">पठाइएका सूचनाहरू</h2>
        </div>
        {sorted.length ? (
          <ul className="divide-y divide-gray-100">
            {sorted.map((n) => (
              <li key={n.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-gray-800">{n.title}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{formatBs(n.date)} · {n.target === 'All' ? 'सबै सदस्य' : n.target}</div>
                </div>
                <button onClick={() => handleDelete(n)} className="text-ncas-danger hover:underline text-xs font-medium shrink-0">हटाउनुहोस्</button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="कुनै सूचना पठाइएको छैन" />
        )}
      </div>

      <h1 className="text-2xl font-bold text-ncas-dark pt-4">अवसर व्यवस्थापन</h1>

      <form onSubmit={handleOppSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-4 max-w-2xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">शीर्षक</label>
          <input required value={oppForm.title} onChange={setOpp('title')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">विवरण</label>
          <textarea rows={2} value={oppForm.description} onChange={setOpp('description')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">स्थान</label>
            <input value={oppForm.location} onChange={setOpp('location')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">अन्तिम मिति (वि.सं.)</label>
            <BsDateInput value={oppForm.deadline} onChange={(iso) => setOppForm((f) => ({ ...f, deadline: iso }))} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">सम्पर्क</label>
          <input value={oppForm.contact} onChange={setOpp('contact')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <button type="submit" className="px-5 py-2 rounded-lg bg-ncas-dark text-white font-medium hover:opacity-90">
          अवसर थप्नुहोस्
        </button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-ncas-dark">हालका अवसरहरू</h2>
        </div>
        {opportunities.length ? (
          <ul className="divide-y divide-gray-100">
            {opportunities.map((o) => (
              <li key={o.id} className="px-5 py-4 flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-gray-800">{o.title}</div>
                  <div className="text-sm text-gray-600 mt-0.5">{o.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{o.location} · अन्तिम मिति: {o.deadline ? formatBs(o.deadline) : '-'} · सम्पर्क: {o.contact}</div>
                </div>
                <button onClick={() => handleOppDelete(o)} className="text-ncas-danger hover:underline text-xs font-medium shrink-0">हटाउनुहोस्</button>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="कुनै अवसर थपिएको छैन" />
        )}
      </div>
    </div>
  )
}

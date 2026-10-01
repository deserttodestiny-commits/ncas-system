import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useCollection } from '../../data/useCollection'
import { CONTRIBUTION_CATEGORIES, INCOME_CATEGORIES, MEMBERSHIP_RENEWAL_CATEGORY } from '../../data/districts'
import { isMembershipRenewal } from '../../data/membershipPayment'
import { formatNPR, uid } from '../../data/storage'
import { monthlyTotalsBs } from '../../data/helpers'
import {
  bsMonthKeyForAdDate, fiscalYearFromEndYear, fiscalYearLabel, formatBs,
  getCurrentFiscalYear, getMemberExpiryAdIso, lastNBsMonths,
} from '../../data/bsCalendar'
import { useUi } from '../../context/UiContext'
import BsDateInput from '../../components/BsDateInput'
import FiscalYearSelect from '../../components/FiscalYearSelect'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import { isSupabaseConfigured } from '../../lib/supabase'

const currentFy = getCurrentFiscalYear()

const emptyForm = {
  date: new Date().toISOString().slice(0, 10),
  category: INCOME_CATEGORIES[0],
  amount: '',
  description: '',
  receivedFrom: '',
  memberId: '',
  fiscalYear: currentFy.endYear,
}

export default function Income() {
  const { items: income, addItem, removeItem, canRemove } = useCollection('income')
  const { items: members, updateItem: updateMember, refresh: refreshMembers } = useCollection('members')
  const { toast, confirm } = useUi()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const total = income.reduce((s, e) => s + (Number(e.amount) || 0), 0)
  const chartData = monthlyTotalsBs(income, lastNBsMonths(6)).map((m) => ({ month: m.month, आम्दानी: m.total }))
  const sorted = [...income].sort((a, b) => new Date(b.date) - new Date(a.date))

  const handleMemberSelect = (e) => {
    const memberId = e.target.value
    const member = members.find((m) => m.id === memberId)
    setForm((f) => {
      const previousMember = members.find((m) => m.id === f.memberId)
      const previousNameWasAutofilled = previousMember && f.receivedFrom === previousMember.fullName
      return {
        ...f,
        memberId,
        receivedFrom: member ? member.fullName : previousNameWasAutofilled ? '' : f.receivedFrom,
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    if (form.category === MEMBERSHIP_RENEWAL_CATEGORY && !form.memberId) {
      toast('सदस्यता शुल्क/नवीकरणको लागि सदस्य छान्नुहोस्।', 'error')
      return
    }
    if (CONTRIBUTION_CATEGORIES.includes(form.category) && !form.receivedFrom.trim()) {
      toast('रकम दिने व्यक्ति वा संस्थाको नाम लेख्नुहोस्। नाम थाहा नभए “नाम नखुलेको” लेख्न सक्नुहुन्छ।', 'error')
      return
    }
    if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0) {
      toast('रकम शून्यभन्दा बढी हुनुपर्छ।', 'error')
      return
    }
    const entry = {
      id: uid(),
      ...form,
      amount: Number(form.amount) || 0,
      receivedFrom: form.receivedFrom.trim(),
      fiscalYear: Number(form.fiscalYear) || currentFy.endYear,
      memberId: form.memberId || null,
      bsKey: bsMonthKeyForAdDate(form.date),
    }
    setSaving(true)
    try {
      await addItem(entry)
      setForm(emptyForm)
      setOpen(false)
      if (isMembershipRenewal(entry)) {
        const member = members.find((m) => m.id === entry.memberId)
        if (member) {
          const newPaidThrough = Math.max(Number(member.paidThroughFiscalYear) || 0, entry.fiscalYear)
          try {
            if (isSupabaseConfigured) await refreshMembers()
            else await updateMember(member.id, { paidThroughFiscalYear: newPaidThrough })
            toast(`आम्दानी थपियो — ${member.fullName} को सदस्यता आ.व. ${fiscalYearLabel(fiscalYearFromEndYear(newPaidThrough))} सम्म नवीकरण भयो`)
          } catch {
            toast('आम्दानी सुरक्षित भयो, तर सदस्यता सूची फेरि लोड गर्न सकिएन। फेरि आम्दानी नथप्नुहोस्; पृष्ठ पुनः खोल्नुहोस्।', 'error')
          }
        } else toast('आम्दानी थपियो')
      } else toast('आम्दानी थपियो')
    } catch (error) {
      toast(`आम्दानी सुरक्षित भएन: ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (entry) => {
    const ok = await confirm('यो आम्दानी प्रविष्टि हटाउने पक्का हो?')
    if (ok) {
      try {
        await removeItem(entry.id)
        toast('प्रविष्टि हटाइयो', 'info')
      } catch (error) {
        toast(error.message, 'error')
      }
    }
  }

  const memberName = (memberId) => members.find((m) => m.id === memberId)?.fullName

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
          <h2 className="font-semibold text-ncas-dark mb-2 text-sm">मासिक आम्दानी (गत ६ महिना, वि.सं.)</h2>
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
                  <th className="px-4 py-3">मिति (वि.सं.)</th>
                  <th className="px-4 py-3">श्रेणी</th>
                  <th className="px-4 py-3">आ.व.</th>
                  <th className="px-4 py-3">रकम दिने व्यक्ति/संस्था</th>
                  <th className="px-4 py-3">सम्बन्धित सदस्य</th>
                  <th className="px-4 py-3">विवरण</th>
                  <th className="px-4 py-3 text-right">रकम</th>
                  <th className="px-4 py-3 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => (
                  <tr key={e.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatBs(e.date)}</td>
                    <td className="px-4 py-3 text-gray-700">{e.category}</td>
                    <td className="px-4 py-3 text-gray-600">{e.fiscalYear ? fiscalYearLabel(fiscalYearFromEndYear(e.fiscalYear)) : '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{e.receivedFrom || memberName(e.memberId) || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{memberName(e.memberId) || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">{e.description}</td>
                    <td className="px-4 py-3 text-right font-medium text-ncas-success">{formatNPR(e.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      {canRemove && <button onClick={() => handleDelete(e)} className="text-ncas-danger hover:underline text-xs font-medium">हटाउनुहोस्</button>}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">मिति (वि.सं.)</label>
            <BsDateInput value={form.date} onChange={(iso) => setForm((f) => ({ ...f, date: iso }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">श्रेणी</label>
            <select value={form.category} onChange={set('category')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              {INCOME_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <p className="text-xs text-gray-500 mt-1">सदस्यता म्याद “सदस्यता शुल्क/नवीकरण” श्रेणीमा रकम दर्ता गर्दा मात्र बढ्छ।</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">सम्बन्धित सदस्य {form.category === MEMBERSHIP_RENEWAL_CATEGORY ? '*' : '(वैकल्पिक)'}</label>
            <select required={form.category === MEMBERSHIP_RENEWAL_CATEGORY} value={form.memberId} onChange={handleMemberSelect} className="w-full border border-gray-300 rounded-lg px-3 py-2">
              <option value="">— कुनै सदस्यसँग सम्बन्धित छैन —</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.membershipId} — {m.fullName}</option>)}
            </select>
            {CONTRIBUTION_CATEGORIES.includes(form.category) && (
              <p className="text-xs text-gray-500 mt-1">सदस्य नभएको व्यक्ति वा संस्थाले सहयोग गरेको भए यहाँ सदस्य नछान्नुहोस्। तल सहयोग गर्नेको नाम लेख्नुहोस्।</p>
            )}
          </div>
          {form.category === MEMBERSHIP_RENEWAL_CATEGORY && form.memberId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">यो भुक्तानी कुन आ.व. को लागि हो?</label>
              <FiscalYearSelect value={form.fiscalYear} onChange={(endYear) => setForm((f) => ({ ...f, fiscalYear: endYear }))} />
              {form.fiscalYear && (
                <p className="text-xs text-gray-400 mt-1">
                  यसले सदस्यको म्याद आ.व. {fiscalYearLabel(fiscalYearFromEndYear(Number(form.fiscalYear)))} को आषाढ़ मसान्त ({formatBs(getMemberExpiryAdIso(Number(form.fiscalYear)))}) सम्म पुर्‍याउनेछ।
                </p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">रकम (रु.)</label>
            <input type="number" min="0.01" step="0.01" required value={form.amount} onChange={set('amount')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">विवरण</label>
            <input value={form.description} onChange={set('description')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">रकम दिने व्यक्ति वा संस्था {CONTRIBUTION_CATEGORIES.includes(form.category) ? '*' : '(वैकल्पिक)'}</label>
            <input value={form.receivedFrom} onChange={set('receivedFrom')} placeholder="नाम थाहा नभए: नाम नखुलेको" required={CONTRIBUTION_CATEGORIES.includes(form.category)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" disabled={saving} onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium disabled:opacity-50">रद्द गर्नुहोस्</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-ncas-dark text-white font-medium hover:opacity-90 disabled:opacity-50">{saving ? 'सुरक्षित हुँदैछ…' : 'सुरक्षित गर्नुहोस्'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

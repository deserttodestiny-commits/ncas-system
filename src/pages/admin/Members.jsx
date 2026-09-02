import { useMemo, useState } from 'react'
import { useCollection } from '../../data/useCollection'
import { ART_FIELDS, DISTRICTS, MEMBERSHIP_TYPES, PAYMENT_STATUSES } from '../../data/districts'
import { nextMembershipId, uid } from '../../data/storage'
import { useUi } from '../../context/UiContext'
import Modal from '../../components/Modal'
import EmptyState from '../../components/EmptyState'
import StatusBadge from '../../components/StatusBadge'
import MemberForm from './MemberForm'

function toCsvValue(v) {
  const s = Array.isArray(v) ? v.join('; ') : String(v ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export default function Members() {
  const { items: members, addItem, updateItem, removeItem } = useCollection('members')
  const { toast, confirm } = useUi()

  const [search, setSearch] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [artFilter, setArtFilter] = useState('')

  const [modalMode, setModalMode] = useState(null) // 'add' | 'edit' | 'view'
  const [activeMember, setActiveMember] = useState(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return members.filter((m) => {
      if (q && !(m.fullName.toLowerCase().includes(q) || m.phone.includes(q) || m.district.toLowerCase().includes(q))) return false
      if (districtFilter && m.district !== districtFilter) return false
      if (paymentFilter && m.paymentStatus !== paymentFilter) return false
      if (typeFilter && m.membershipType !== typeFilter) return false
      if (artFilter && !m.artFields.includes(artFilter)) return false
      return true
    })
  }, [members, search, districtFilter, paymentFilter, typeFilter, artFilter])

  const openAdd = () => { setActiveMember(null); setModalMode('add') }
  const openEdit = (m) => { setActiveMember(m); setModalMode('edit') }
  const openView = (m) => { setActiveMember(m); setModalMode('view') }
  const closeModal = () => { setModalMode(null); setActiveMember(null) }

  const handleSubmit = (form) => {
    if (modalMode === 'add') {
      const membershipId = nextMembershipId(members)
      addItem({ id: uid(), membershipId, ...form })
      toast('नयाँ सदस्य थपियो')
    } else if (modalMode === 'edit') {
      updateItem(activeMember.id, form)
      toast('सदस्य विवरण अद्यावधिक भयो')
    }
    closeModal()
  }

  const handleDelete = async (m) => {
    const ok = await confirm(`${m.fullName} लाई हटाउने पक्का हो?`)
    if (ok) {
      removeItem(m.id)
      toast('सदस्य हटाइयो', 'info')
    }
  }

  const handleExportCsv = () => {
    const headers = [
      'membershipId', 'fullName', 'gender', 'dob', 'citizenshipNo', 'phone', 'email', 'district',
      'municipality', 'wardNo', 'artFields', 'experienceYears', 'employmentStatus', 'organizationName',
      'membershipType', 'joinDate', 'paymentStatus', 'paymentExpiryDate', 'monthlyFee', 'notes',
    ]
    const rows = filtered.map((m) => headers.map((h) => toCsvValue(m[h])).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ncas-members-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast('CSV निर्यात भयो')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ncas-dark">सदस्य व्यवस्थापन</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => toast('SMS सुविधा छिट्टै आउँदैछ!', 'info')} className="px-4 py-2 rounded-lg bg-ncas-blue text-white text-sm font-medium hover:opacity-90">
            📩 Bulk SMS
          </button>
          <button onClick={handleExportCsv} className="px-4 py-2 rounded-lg bg-ncas-gold text-white text-sm font-medium hover:opacity-90">
            ⬇️ CSV Export
          </button>
          <button onClick={openAdd} className="px-4 py-2 rounded-lg bg-ncas-dark text-white text-sm font-medium hover:opacity-90">
            + नयाँ सदस्य
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="नाम, फोन वा जिल्लाले खोज्नुहोस्..."
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm lg:col-span-2"
        />
        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">सबै जिल्ला</option>
          {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">सबै भुक्तानी स्थिति</option>
          {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
          <option value="">सबै सदस्यता प्रकार</option>
          {MEMBERSHIP_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={artFilter} onChange={(e) => setArtFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm lg:col-span-5">
          <option value="">सबै कला क्षेत्र</option>
          {ART_FIELDS.map((f) => <option key={f}>{f}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {filtered.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="text-left">
                  <th className="px-4 py-3">सदस्य आइडी</th>
                  <th className="px-4 py-3">नाम</th>
                  <th className="px-4 py-3">फोन</th>
                  <th className="px-4 py-3">जिल्ला</th>
                  <th className="px-4 py-3">प्रकार</th>
                  <th className="px-4 py-3">स्थिति</th>
                  <th className="px-4 py-3 text-right">कार्य</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{m.membershipId}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{m.fullName}</td>
                    <td className="px-4 py-3 text-gray-600">{m.phone}</td>
                    <td className="px-4 py-3 text-gray-600">{m.district}</td>
                    <td className="px-4 py-3 text-gray-600">{m.membershipType}</td>
                    <td className="px-4 py-3"><StatusBadge status={m.paymentStatus} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openView(m)} className="text-ncas-blue hover:underline text-xs font-medium">हेर्नुहोस्</button>
                        <button onClick={() => openEdit(m)} className="text-ncas-gold hover:underline text-xs font-medium">सम्पादन</button>
                        <button onClick={() => handleDelete(m)} className="text-ncas-danger hover:underline text-xs font-medium">हटाउनुहोस्</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="कुनै सदस्य फेला परेन" />
        )}
      </div>

      <Modal open={modalMode === 'add' || modalMode === 'edit'} onClose={closeModal} title={modalMode === 'add' ? 'नयाँ सदस्य थप्नुहोस्' : 'सदस्य सम्पादन गर्नुहोस्'} wide>
        <MemberForm initial={modalMode === 'edit' ? activeMember : null} onCancel={closeModal} onSubmit={handleSubmit} />
      </Modal>

      <Modal open={modalMode === 'view'} onClose={closeModal} title="सदस्य विवरण" wide>
        {activeMember && (
          <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <Detail label="सदस्य आइडी" value={activeMember.membershipId} />
            <Detail label="पूरा नाम" value={activeMember.fullName} />
            <Detail label="लिङ्ग" value={activeMember.gender} />
            <Detail label="जन्म मिति" value={activeMember.dob} />
            <Detail label="नागरिकता नं." value={activeMember.citizenshipNo} />
            <Detail label="फोन" value={activeMember.phone} />
            <Detail label="इमेल" value={activeMember.email} />
            <Detail label="जिल्ला" value={activeMember.district} />
            <Detail label="नगर/गाउँपालिका" value={activeMember.municipality} />
            <Detail label="वडा नं." value={activeMember.wardNo} />
            <Detail label="कला क्षेत्र" value={activeMember.artFields?.join(', ')} full />
            <Detail label="अनुभव" value={`${activeMember.experienceYears} वर्ष`} />
            <Detail label="रोजगारी स्थिति" value={activeMember.employmentStatus} />
            <Detail label="संस्था" value={activeMember.organizationName || '-'} />
            <Detail label="सदस्यता प्रकार" value={activeMember.membershipType} />
            <Detail label="सामेल मिति" value={activeMember.joinDate} />
            <Detail label="भुक्तानी स्थिति" value={<StatusBadge status={activeMember.paymentStatus} />} />
            <Detail label="म्याद सकिने मिति" value={activeMember.paymentExpiryDate} />
            <Detail label="मासिक शुल्क" value={`रु. ${activeMember.monthlyFee}`} />
            {activeMember.notes && <Detail label="कैफियत" value={activeMember.notes} full />}
          </div>
        )}
      </Modal>
    </div>
  )
}

function Detail({ label, value, full }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <div className="text-gray-400 text-xs">{label}</div>
      <div className="text-gray-800 font-medium">{value}</div>
    </div>
  )
}

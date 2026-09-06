import { useEffect, useState } from 'react'
import { useCurrentMember } from '../../data/useCurrentMember'
import { formatBs } from '../../data/bsCalendar'
import { useUi } from '../../context/UiContext'
import Avatar from '../../components/Avatar'

export default function Profile() {
  const { member, updateItem } = useCurrentMember()
  const { toast } = useUi()
  const [form, setForm] = useState({ phone: '', email: '', municipality: '', wardNo: '', organizationName: '' })

  useEffect(() => {
    if (member) {
      setForm({
        phone: member.phone, email: member.email, municipality: member.municipality,
        wardNo: member.wardNo, organizationName: member.organizationName,
      })
    }
  }, [member])

  if (!member) return null

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = (e) => {
    e.preventDefault()
    updateItem(member.id, form)
    toast('प्रोफाइल अद्यावधिक भयो')
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-ncas-dark">प्रोफाइल</h1>

      <div className="bg-white rounded-xl shadow-sm p-5">
        <div className="flex items-center gap-4 mb-5">
          <Avatar src={member.photo} sizePx={72} />
          <div>
            <div className="text-lg font-bold text-gray-900">{member.fullName}</div>
            <div className="text-sm font-mono text-ncas-blue">{member.membershipId}</div>
          </div>
        </div>
        <h2 className="font-semibold text-ncas-dark mb-4">सदस्य विवरण</h2>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Detail label="सदस्य आइडी" value={member.membershipId} />
          <Detail label="पूरा नाम" value={member.fullName} />
          <Detail label="लिङ्ग" value={member.gender} />
          <Detail label="जन्म मिति (वि.सं.)" value={formatBs(member.dob) || '-'} />
          <Detail label="नागरिकता नं." value={member.citizenshipNo} />
          <Detail label="जिल्ला" value={member.district} />
          <Detail label="कला क्षेत्र" value={member.artFields?.join(', ')} full />
          <Detail label="अनुभव" value={`${member.experienceYears} वर्ष`} />
          <Detail label="रोजगारी स्थिति" value={member.employmentStatus} />
          <Detail label="सदस्यता प्रकार" value={member.membershipType} />
          <Detail label="सामेल मिति (वि.सं.)" value={formatBs(member.joinDate)} />
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-ncas-dark">सम्पादन गर्न सकिने विवरण</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">फोन नम्बर</label>
            <input value={form.phone} onChange={set('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">इमेल</label>
            <input type="email" value={form.email} onChange={set('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">नगर/गाउँपालिका</label>
            <input value={form.municipality} onChange={set('municipality')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">वडा नं.</label>
            <input value={form.wardNo} onChange={set('wardNo')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">संस्था/पसलको नाम</label>
            <input value={form.organizationName} onChange={set('organizationName')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
        </div>
        <button type="submit" className="px-5 py-2 rounded-lg bg-ncas-dark text-white font-medium hover:opacity-90">
          सुरक्षित गर्नुहोस्
        </button>
      </form>
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

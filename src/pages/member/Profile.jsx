import { useEffect, useState } from 'react'
import { useCurrentMember } from '../../data/useCurrentMember'
import { formatBs } from '../../data/bsCalendar'
import { useUi } from '../../context/UiContext'
import Avatar from '../../components/Avatar'
import { isSupabaseConfigured, supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { changeMemberPassword } from '../../lib/passwordChange'

export default function Profile() {
  const { member, updateItem } = useCurrentMember()
  const { session } = useAuth()
  const { toast } = useUi()
  const [form, setForm] = useState({ phone: '', email: '', municipality: '', wardNo: '', organizationName: '' })
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)

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

  const handlePasswordChange = async (event) => {
    event.preventDefault()
    if (savingPassword) return
    if (newPassword !== confirmPassword) return toast('नयाँ password दुई ठाउँमा मिलेन।', 'error')
    setSavingPassword(true)
    try {
      await changeMemberPassword({
        client: supabase,
        memberId: member.id,
        authUserId: session.userId,
        currentPassword,
        newPassword,
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      toast('Password परिवर्तन भयो। अर्को login मा नयाँ password प्रयोग गर्नुहोस्।')
    } catch (error) {
      toast(error.message || 'Password परिवर्तन हुन सकेन।', 'error')
    } finally {
      setSavingPassword(false)
    }
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

      {isSupabaseConfigured ? (
        <>
          <p className="bg-white rounded-xl shadow-sm p-5 text-sm text-gray-600">विवरण सच्याउन संघको कार्यालयमा सम्पर्क गर्नुहोस्। सदस्यता र भुक्तानी अवस्था सदस्य आफैंले बदल्न मिल्दैन।</p>
          <form onSubmit={handlePasswordChange} className="bg-white rounded-xl shadow-sm p-5 space-y-4">
            <h2 className="font-semibold text-ncas-dark">Settings · Password परिवर्तन</h2>
            <p className="text-sm text-gray-600">पहिलो password दर्ता भएको मोबाइल नम्बर हो। त्यसपछि आफ्नै बलियो password राख्न सक्नुहुन्छ।</p>
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">हालको password</label>
              <input id="current-password" type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">नयाँ password (कम्तीमा १२ अक्षर)</label>
              <input id="new-password" type="password" autoComplete="new-password" required minLength={12} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">नयाँ password फेरि लेख्नुहोस्</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required minLength={12} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>
            <button type="submit" disabled={savingPassword} className="px-5 py-2 rounded-lg bg-ncas-dark text-white font-medium disabled:opacity-50">{savingPassword ? 'परिवर्तन हुँदैछ…' : 'Password परिवर्तन गर्नुहोस्'}</button>
            <p className="text-xs text-gray-500">Password बिर्सिएमा संघको Admin लाई सम्पर्क गर्नुहोस्।</p>
          </form>
        </>
      ) : <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm p-5 space-y-4">
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
      </form>}
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

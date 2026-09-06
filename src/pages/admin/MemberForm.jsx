import { useState } from 'react'
import {
  ART_FIELDS, DISTRICTS, EMPLOYMENT_STATUSES, MEMBERSHIP_TYPES,
} from '../../data/districts'
import { fiscalYearLabel, fiscalYearFromEndYear, getCurrentFiscalYear, getMemberExpiryAdIso } from '../../data/bsCalendar'
import { fileToResizedDataUrl } from '../../data/image'
import BsDateInput from '../../components/BsDateInput'
import FiscalYearSelect from '../../components/FiscalYearSelect'
import Avatar from '../../components/Avatar'
import { useUi } from '../../context/UiContext'

const emptyForm = {
  fullName: '', gender: 'पुरुष', dob: '', citizenshipNo: '', phone: '', email: '',
  district: DISTRICTS[0], municipality: '', wardNo: '', artFields: [], experienceYears: '',
  employmentStatus: EMPLOYMENT_STATUSES[0], organizationName: '', membershipType: MEMBERSHIP_TYPES[0],
  joinDate: new Date().toISOString().slice(0, 10),
  paidThroughFiscalYear: '', monthlyFee: 100, notes: '', photo: '',
}

export default function MemberForm({ initial, onCancel, onSubmit }) {
  const [form, setForm] = useState(() => (initial ? { ...emptyForm, ...initial } : emptyForm))
  const { toast } = useUi()

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const setDate = (key) => (iso) => setForm((f) => ({ ...f, [key]: iso }))

  const toggleArtField = (field) => {
    setForm((f) => ({
      ...f,
      artFields: f.artFields.includes(field) ? f.artFields.filter((x) => x !== field) : [...f.artFields, field],
    }))
  }

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast('कृपया मान्य तस्बिर फाइल छान्नुहोस्', 'error')
      return
    }
    try {
      const dataUrl = await fileToResizedDataUrl(file)
      setForm((f) => ({ ...f, photo: dataUrl }))
    } catch {
      toast('तस्बिर लोड गर्न सकिएन', 'error')
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const currentFy = getCurrentFiscalYear()
  const expiryPreview = form.paidThroughFiscalYear ? getMemberExpiryAdIso(Number(form.paidThroughFiscalYear)) : ''

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar src={form.photo} sizePx={72} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">सदस्यको फोटो</label>
          <input type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
          {form.photo && (
            <button type="button" onClick={() => setForm((f) => ({ ...f, photo: '' }))} className="block text-xs text-ncas-danger hover:underline mt-1">
              फोटो हटाउनुहोस्
            </button>
          )}
        </div>
      </div>

      {initial && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">सदस्यता आइडी *</label>
          <input
            required
            value={form.membershipId}
            onChange={set('membershipId')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">सावधानी: यो सदस्यको लगइन आइडी हो — परिवर्तन गर्दा सदस्यलाई नयाँ आइडी जानकारी दिनुहोस्।</p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">पूरा नाम *</label>
          <input required value={form.fullName} onChange={set('fullName')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">लिङ्ग</label>
          <select value={form.gender} onChange={set('gender')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            <option>पुरुष</option>
            <option>महिला</option>
            <option>अन्य</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">जन्म मिति (वि.सं.)</label>
          <BsDateInput value={form.dob} onChange={setDate('dob')} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">नागरिकता नं.</label>
          <input value={form.citizenshipNo} onChange={set('citizenshipNo')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">फोन नम्बर *</label>
          <input required value={form.phone} onChange={set('phone')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">इमेल</label>
          <input type="email" value={form.email} onChange={set('email')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">जिल्ला</label>
          <select value={form.district} onChange={set('district')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">नगरपालिका/गाउँपालिका</label>
          <input value={form.municipality} onChange={set('municipality')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">वडा नं.</label>
          <input value={form.wardNo} onChange={set('wardNo')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">अनुभव (वर्ष)</label>
          <input type="number" min="0" value={form.experienceYears} onChange={set('experienceYears')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">रोजगारी स्थिति</label>
          <select value={form.employmentStatus} onChange={set('employmentStatus')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            {EMPLOYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">संस्था/पसलको नाम</label>
          <input value={form.organizationName} onChange={set('organizationName')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">कला क्षेत्र</label>
        <div className="grid sm:grid-cols-2 gap-2">
          {ART_FIELDS.map((field) => (
            <label key={field} className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.artFields.includes(field)}
                onChange={() => toggleArtField(field)}
                className="rounded border-gray-300"
              />
              {field}
            </label>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">सदस्यता प्रकार</label>
          <select value={form.membershipType} onChange={set('membershipType')} className="w-full border border-gray-300 rounded-lg px-3 py-2">
            {MEMBERSHIP_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">सामेल मिति (वि.सं.)</label>
          <BsDateInput value={form.joinDate} onChange={setDate('joinDate')} required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">मासिक शुल्क (रु.)</label>
          <input type="number" min="0" value={form.monthlyFee} onChange={set('monthlyFee')} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            सदस्यता तिरेको आ.व. (अन्तिम) — चालु आ.व. {fiscalYearLabel(currentFy)}
          </label>
          <FiscalYearSelect
            value={form.paidThroughFiscalYear}
            onChange={(endYear) => setForm((f) => ({ ...f, paidThroughFiscalYear: endYear }))}
          />
          {form.paidThroughFiscalYear && (
            <p className="text-xs text-gray-400 mt-1">
              म्याद: आ.व. {fiscalYearLabel(fiscalYearFromEndYear(Number(form.paidThroughFiscalYear)))} को आषाढ़ मसान्तसम्म (AD: {expiryPreview})
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">कैफियत</label>
        <textarea value={form.notes} onChange={set('notes')} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium">
          रद्द गर्नुहोस्
        </button>
        <button type="submit" className="px-5 py-2 rounded-lg bg-ncas-dark text-white font-medium hover:opacity-90">
          सुरक्षित गर्नुहोस्
        </button>
      </div>
    </form>
  )
}

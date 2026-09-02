import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUi } from '../context/UiContext'
import { load } from '../data/storage'

export default function Landing() {
  const navigate = useNavigate()
  const { loginAdmin, loginMember } = useAuth()
  const { toast } = useUi()

  const [adminUser, setAdminUser] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [memberId, setMemberId] = useState('')
  const [memberPhone, setMemberPhone] = useState('')

  const handleAdminLogin = (e) => {
    e.preventDefault()
    if (adminUser === 'admin' && adminPass === 'ncas2026') {
      loginAdmin()
      toast('स्वागत छ, प्रशासक!')
      navigate('/admin')
    } else {
      toast('गलत प्रयोगकर्ता नाम वा पासवर्ड', 'error')
    }
  }

  const handleMemberLogin = (e) => {
    e.preventDefault()
    const members = load('members', [])
    const found = members.find(
      (m) => m.membershipId.trim().toLowerCase() === memberId.trim().toLowerCase() && m.phone === memberPhone.trim()
    )
    if (found) {
      loginMember(found.membershipId)
      toast(`नमस्ते, ${found.fullName} जी!`)
      navigate('/member')
    } else {
      toast('सदस्य आइडी वा फोन नम्बर मिलेन', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-ncas-light flex flex-col">
      <header className="bg-ncas-dark text-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-ncas-gold flex items-center justify-center text-2xl font-bold mb-3">
            NCAS
          </div>
          <h1 className="text-2xl md:text-3xl font-bold">नेपाल कमर्शियल आर्टिष्ट संघ (NCAS)</h1>
          <p className="text-blue-200 mt-2 text-sm md:text-base">"कलाकारिता नै राष्ट्रको मूल सभ्यता"</p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          <form onSubmit={handleAdminLogin} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-ncas-dark">
            <h2 className="text-lg font-bold text-ncas-dark mb-1 flex items-center gap-2">
              <span>🛡️</span> Admin Login
            </h2>
            <p className="text-sm text-gray-500 mb-5">प्रशासकीय प्रवेश</p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={adminUser}
              onChange={(e) => setAdminUser(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-ncas-blue"
              placeholder="admin"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={adminPass}
              onChange={(e) => setAdminPass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-ncas-blue"
              placeholder="••••••••"
            />

            <button type="submit" className="w-full bg-ncas-dark hover:opacity-90 text-white font-semibold py-2.5 rounded-lg transition">
              लगइन गर्नुहोस्
            </button>
          </form>

          <form onSubmit={handleMemberLogin} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-ncas-gold">
            <h2 className="text-lg font-bold text-ncas-dark mb-1 flex items-center gap-2">
              <span>👤</span> Member Login
            </h2>
            <p className="text-sm text-gray-500 mb-5">सदस्य प्रवेश</p>

            <label className="block text-sm font-medium text-gray-700 mb-1">Membership ID</label>
            <input
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-ncas-gold"
              placeholder="NCAS-2026-0001"
            />

            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              value={memberPhone}
              onChange={(e) => setMemberPhone(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-5 focus:outline-none focus:ring-2 focus:ring-ncas-gold"
              placeholder="98XXXXXXXX"
            />

            <button type="submit" className="w-full bg-ncas-gold hover:opacity-90 text-white font-semibold py-2.5 rounded-lg transition">
              लगइन गर्नुहोस्
            </button>
          </form>
        </div>
      </main>

      <footer className="text-center text-xs text-gray-400 py-6">
        © 2026 नेपाल कमर्शियल आर्टिष्ट संघ (NCAS)
      </footer>
    </div>
  )
}

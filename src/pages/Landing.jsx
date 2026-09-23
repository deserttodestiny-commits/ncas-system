import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useUi } from '../context/UiContext'
import { load } from '../data/storage'
import { isSupabaseConfigured } from '../lib/supabase'

export default function Landing() {
  const navigate = useNavigate()
  const { session, loading, demoMode, loginAdmin, loginMember } = useAuth()
  const { toast } = useUi()
  const [portal, setPortal] = useState(() => new URLSearchParams(window.location.search).get('portal') === 'member' ? 'member' : 'admin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [memberId, setMemberId] = useState('')
  const [memberPhone, setMemberPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (session?.role === 'admin') navigate('/admin', { replace: true })
    if (session?.role === 'member') navigate('/member', { replace: true })
  }, [navigate, session])

  const handleCloudLogin = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (portal === 'admin') await loginAdmin(email, password)
      else await loginMember(email, password)
      navigate(portal === 'admin' ? '/admin' : '/member', { replace: true })
    } catch (error) {
      toast(error.message || 'लगइन हुन सकेन।', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminDemo = () => {
    loginAdmin()
    navigate('/admin')
  }

  const handleMemberDemo = (event) => {
    event.preventDefault()
    const members = load('members', [])
    const found = members.find((m) =>
      m.membershipId.trim().toLowerCase() === memberId.trim().toLowerCase() && m.phone === memberPhone.trim()
    )
    if (!found) return toast('सदस्य आइडी वा फोन नम्बर मिलेन', 'error')
    loginMember(found.membershipId)
    navigate('/member')
  }

  return (
    <div className="min-h-screen bg-ncas-light flex flex-col">
      <header className="bg-ncas-dark text-white">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center text-center">
          <img src="/ncas-logo.jpg" alt="NCAS" className="w-20 h-20 rounded-full bg-white p-1 shadow-md mb-3" />
          <h1 className="text-2xl md:text-3xl font-bold">नेपाल कमर्शियल आर्टिष्ट संघ (NCAS)</h1>
          <p className="text-blue-200 mt-2 text-sm md:text-base">सदस्य तथा वित्तीय व्यवस्थापन</p>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {loading ? (
          <p className="text-center text-gray-600">खाता जाँचिँदैछ...</p>
        ) : isSupabaseConfigured ? (
          <section className="max-w-md mx-auto bg-white rounded-xl shadow-md p-7 border-t-4 border-ncas-gold">
            <h2 className="text-xl font-bold text-ncas-dark text-center mb-5">सुरक्षित लगइन</h2>
            <div className="grid grid-cols-2 gap-2 mb-6" role="group" aria-label="पोर्टल छान्नुहोस्">
              <button type="button" onClick={() => setPortal('admin')} aria-pressed={portal === 'admin'} className={`rounded-lg px-4 py-3 font-semibold ${portal === 'admin' ? 'bg-ncas-dark text-white' : 'bg-gray-100 text-gray-600'}`}>Admin</button>
              <button type="button" onClick={() => setPortal('member')} aria-pressed={portal === 'member'} className={`rounded-lg px-4 py-3 font-semibold ${portal === 'member' ? 'bg-ncas-dark text-white' : 'bg-gray-100 text-gray-600'}`}>सदस्य</button>
            </div>
            <form onSubmit={handleCloudLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input id="login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <button type="submit" disabled={submitting} className="w-full rounded-lg bg-ncas-dark text-white font-semibold py-3 disabled:opacity-50">
                {submitting ? 'लगइन हुँदैछ...' : portal === 'admin' ? 'Admin लगइन' : 'सदस्य लगइन'}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4 text-center">सदस्य खाताका लागि संघबाट अनुमति पाएको email र password प्रयोग गर्नुहोस्। सदस्यता आइडी वा फोन नम्बर मात्रै लगइन होइन।</p>
          </section>
        ) : demoMode ? (
          <div className="grid md:grid-cols-2 gap-6">
            <section className="bg-white rounded-xl shadow-md p-6 border-t-4 border-ncas-dark">
              <h2 className="text-lg font-bold text-ncas-dark mb-3">Admin Demo</h2>
              <p className="text-sm text-gray-500 mb-5">स्थानीय विकासमा परीक्षणका लागि मात्र</p>
              <button type="button" onClick={handleAdminDemo} className="w-full bg-ncas-dark text-white font-semibold py-2.5 rounded-lg">Demo खोल्नुहोस्</button>
            </section>
            <form onSubmit={handleMemberDemo} className="bg-white rounded-xl shadow-md p-6 border-t-4 border-ncas-gold">
              <h2 className="text-lg font-bold text-ncas-dark mb-3">Member Demo</h2>
              <label className="block text-sm mb-1">Membership ID</label>
              <input value={memberId} onChange={(event) => setMemberId(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4" />
              <label className="block text-sm mb-1">Phone Number</label>
              <input value={memberPhone} onChange={(event) => setMemberPhone(event.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-5" />
              <button type="submit" className="w-full bg-ncas-gold text-white font-semibold py-2.5 rounded-lg">Demo लगइन</button>
            </form>
          </div>
        ) : (
          <p className="max-w-xl mx-auto bg-white rounded-xl p-8 text-center text-gray-600">Supabase जडान उपलब्ध छैन। कृपया प्रशासकलाई सम्पर्क गर्नुहोस्।</p>
        )}
      </main>
      <footer className="text-center text-xs text-gray-400 py-6">© 2026 नेपाल कमर्शियल आर्टिष्ट संघ (NCAS)</footer>
    </div>
  )
}

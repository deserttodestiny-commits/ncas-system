import { createContext, useContext, useEffect, useState } from 'react'
import { load, save } from '../data/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const demoMode = import.meta.env.DEV
  const [session, setSession] = useState(() => demoMode ? load('session', null) : null)

  useEffect(() => {
    if (!demoMode) return
    if (session) save('session', session)
    else localStorage.removeItem('ncas_session')
  }, [demoMode, session])

  const loginAdmin = () => { if (demoMode) setSession({ role: 'admin' }) }
  const loginMember = (membershipId) => { if (demoMode) setSession({ role: 'member', membershipId }) }
  const logout = () => setSession(null)

  return (
    <AuthContext.Provider value={{ session, loginAdmin, loginMember, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

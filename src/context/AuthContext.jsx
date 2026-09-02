import { createContext, useContext, useEffect, useState } from 'react'
import { load, save } from '../data/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => load('session', null))

  useEffect(() => {
    if (session) save('session', session)
    else localStorage.removeItem('ncas_session')
  }, [session])

  const loginAdmin = () => setSession({ role: 'admin' })
  const loginMember = (membershipId) => setSession({ role: 'member', membershipId })
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

import { createContext, useContext, useEffect, useState } from 'react'
import { load, save } from '../data/storage'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { memberPasswordSession } from '../lib/memberAccess'

const AuthContext = createContext(null)
const demoMode = import.meta.env.DEV && !isSupabaseConfigured

async function resolveCloudSession(user) {
  if (!user) return null
  const { data: role, error } = await supabase.rpc('ncas_system_current_role')
  if (error) throw error
  if (role === 'admin') return { role: 'admin', userId: user.id }
  if (role === 'member') {
    const { data: member, error: memberError } = await supabase
      .from('ncas_system_members')
      .select('membership_id')
      .eq('auth_user_id', user.id)
      .single()
    if (memberError) throw memberError
    return { role: 'member', userId: user.id, membershipId: member.membership_id }
  }
  return null
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => demoMode ? load('session', null) : null)
  const [loading, setLoading] = useState(!demoMode && isSupabaseConfigured)

  useEffect(() => {
    if (demoMode) {
      if (session) save('session', session)
      else localStorage.removeItem('ncas_session')
    }
  }, [session])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    let active = true
    const hydrate = async () => {
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) throw error
        const resolved = await resolveCloudSession(data.user)
        if (active) setSession(resolved)
      } catch {
        if (active) setSession(null)
      } finally {
        if (active) setLoading(false)
      }
    }
    hydrate()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setSession(null)
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setTimeout(hydrate, 0)
      }
    })
    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email, password, expectedRole) => {
    if (!isSupabaseConfigured) throw new Error('Supabase जडान भएको छैन।')
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) throw error
    const resolved = await resolveCloudSession(data.user)
    if (!resolved || resolved.role !== expectedRole) {
      await supabase.auth.signOut()
      throw new Error('यस खातालाई यो पोर्टलको अनुमति छैन।')
    }
    setSession(resolved)
    return resolved
  }

  const loginAdmin = async (email, password) => {
    if (demoMode) {
      setSession({ role: 'admin' })
      return
    }
    return signIn(email, password, 'admin')
  }

  const loginMember = async (memberId, password) => {
    if (demoMode) {
      setSession({ role: 'member', membershipId: memberId })
      return
    }
    if (!isSupabaseConfigured) throw new Error('Supabase जडान भएको छैन।')
    const tokens = await memberPasswordSession(memberId.trim(), password)
    const { data, error } = await supabase.auth.setSession(tokens)
    if (error) throw error
    const resolved = await resolveCloudSession(data.user)
    if (!resolved || resolved.role !== 'member' || resolved.membershipId.toUpperCase() !== memberId.trim().toUpperCase()) {
      await supabase.auth.signOut()
      throw new Error('यस सदस्य आइडीलाई अनुमति छैन।')
    }
    setSession(resolved)
    return resolved
  }

  const logout = async () => {
    setSession(null)
    if (isSupabaseConfigured) await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ session, loading, demoMode, loginAdmin, loginMember, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

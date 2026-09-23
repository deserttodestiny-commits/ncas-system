import { supabase } from './supabase'

async function invoke(name, body) {
  const { data, error } = await supabase.functions.invoke(name, { body })
  if (error) {
    const response = error.context
    let message = ''
    if (response && typeof response.json === 'function') {
      try { message = (await response.json()).error } catch { /* Use the fallback below. */ }
    }
    throw new Error(message || 'सेवा उपलब्ध छैन। कृपया फेरि प्रयास गर्नुहोस्।')
  }
  return data
}

export async function memberPasswordSession(memberId, password) {
  const data = await invoke('ncas-member-access', { action: 'login', memberId, password })
  if (!data?.session?.access_token || !data?.session?.refresh_token) throw new Error('लगइन प्रतिक्रिया अमान्य छ।')
  return data.session
}

export async function activateMember({ memberId, phone, code, password }) {
  return invoke('ncas-member-access', { action: 'activate', memberId, phone, code, password })
}

export async function issueMemberCode(memberId) {
  return invoke('ncas-member-admin', { memberId })
}

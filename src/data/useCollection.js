import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useUi } from '../context/UiContext'
import { isSupabaseConfigured } from '../lib/supabase'
import { addCloudItem, listCloudItems, updateCloudItem } from './cloudCollections'
import { load, save } from './storage'

export function useCollection(key) {
  const { session } = useAuth()
  const { toast } = useUi()
  const [items, setItems] = useState(() => isSupabaseConfigured ? [] : load(key, []))
  const [loading, setLoading] = useState(isSupabaseConfigured)

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) return load(key, [])
    const rows = await listCloudItems(key)
    setItems(rows)
    return rows
  }, [key])

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined
    if (!session) {
      setItems([])
      setLoading(false)
      return undefined
    }
    let active = true
    setLoading(true)
    listCloudItems(key)
      .then((rows) => { if (active) setItems(rows) })
      .catch((error) => { if (active) toast(`डेटा लोड भएन: ${error.message}`, 'error') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [key, session, toast])

  const persist = useCallback((next) => {
    if (isSupabaseConfigured) throw new Error('Cloud data सिधै बदल्न मिल्दैन।')
    setItems(next)
    save(key, next)
  }, [key])

  const addItem = useCallback(async (item) => {
    if (isSupabaseConfigured) {
      const added = await addCloudItem(key, item)
      setItems((prev) => [...prev, added])
      return added
    }
    setItems((prev) => {
      const next = [...prev, item]
      save(key, next)
      return next
    })
    return item
  }, [key])

  const updateItem = useCallback(async (id, patch) => {
    if (isSupabaseConfigured) {
      const current = items.find((item) => item.id === id)
      if (!current) throw new Error('रेकर्ड फेला परेन।')
      const updated = await updateCloudItem(key, id, patch, current)
      setItems((prev) => prev.map((item) => item.id === id ? updated : item))
      return updated
    }
    setItems((prev) => {
      const next = prev.map((item) => item.id === id ? { ...item, ...patch } : item)
      save(key, next)
      return next
    })
  }, [items, key])

  const removeItem = useCallback(async (id) => {
    if (isSupabaseConfigured) throw new Error('Production रेकर्ड मेटाउने सुविधा सुरक्षित प्रक्रिया तयार भएपछि मात्र उपलब्ध हुनेछ।')
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id)
      save(key, next)
      return next
    })
  }, [key])

  return { items, loading, refresh, addItem, updateItem, removeItem, setItems: persist, canRemove: !isSupabaseConfigured }
}

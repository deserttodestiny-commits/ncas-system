import { useCallback, useState } from 'react'
import { load, save } from './storage'

export function useCollection(key) {
  const [items, setItems] = useState(() => load(key, []))

  const persist = useCallback(
    (next) => {
      setItems(next)
      save(key, next)
    },
    [key]
  )

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const next = [...prev, item]
      save(key, next)
      return next
    })
  }, [key])

  const updateItem = useCallback((id, patch) => {
    setItems((prev) => {
      const next = prev.map((it) => (it.id === id ? { ...it, ...patch } : it))
      save(key, next)
      return next
    })
  }, [key])

  const removeItem = useCallback((id) => {
    setItems((prev) => {
      const next = prev.filter((it) => it.id !== id)
      save(key, next)
      return next
    })
  }, [key])

  return { items, addItem, updateItem, removeItem, setItems: persist }
}

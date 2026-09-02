import { createContext, useCallback, useContext, useRef, useState } from 'react'

const UiContext = createContext(null)

export function UiProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)
  const idRef = useRef(0)

  const toast = useCallback((message, type = 'success') => {
    const id = ++idRef.current
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3200)
  }, [])

  const confirm = useCallback((message) => {
    return new Promise((resolve) => {
      setConfirmState({
        message,
        onConfirm: () => {
          setConfirmState(null)
          resolve(true)
        },
        onCancel: () => {
          setConfirmState(null)
          resolve(false)
        },
      })
    })
  }, [])

  return (
    <UiContext.Provider value={{ toast, confirm }}>
      {children}

      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 no-print">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'animate-toast-in rounded-lg px-4 py-3 shadow-lg text-white text-sm font-medium min-w-[240px] ' +
              (t.type === 'error' ? 'bg-ncas-danger' : t.type === 'info' ? 'bg-ncas-blue' : 'bg-ncas-success')
            }
          >
            {t.message}
          </div>
        ))}
      </div>

      {confirmState && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
            <p className="text-gray-800 mb-6">{confirmState.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={confirmState.onCancel}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-medium"
              >
                रद्द गर्नुहोस्
              </button>
              <button
                onClick={confirmState.onConfirm}
                className="px-4 py-2 rounded-lg bg-ncas-danger text-white font-medium hover:opacity-90"
              >
                पुष्टि गर्नुहोस्
              </button>
            </div>
          </div>
        </div>
      )}
    </UiContext.Provider>
  )
}

export function useUi() {
  const ctx = useContext(UiContext)
  if (!ctx) throw new Error('useUi must be used within UiProvider')
  return ctx
}

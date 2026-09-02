export default function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto no-print">
      <div className={`bg-white rounded-xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} my-8`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-ncas-dark">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

const STYLES = {
  Paid: 'bg-green-100 text-green-800 border-green-300',
  Pending: 'bg-amber-100 text-amber-800 border-amber-300',
  Overdue: 'bg-red-100 text-red-800 border-red-300',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${STYLES[status] || 'bg-gray-100 text-gray-800 border-gray-300'}`}>
      {status}
    </span>
  )
}

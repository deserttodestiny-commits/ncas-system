export default function EmptyState({ icon = '📭', message }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-gray-400">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm">{message}</p>
    </div>
  )
}

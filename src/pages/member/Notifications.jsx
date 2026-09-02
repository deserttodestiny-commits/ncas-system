import { useCurrentMember } from '../../data/useCurrentMember'
import { useCollection } from '../../data/useCollection'
import EmptyState from '../../components/EmptyState'

export default function MemberNotifications() {
  const { member } = useCurrentMember()
  const { items: notifications } = useCollection('notifications')
  if (!member) return null

  const relevant = notifications
    .filter((n) => n.target === 'All' || n.target === member.district)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ncas-dark">सूचनाहरू</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {relevant.length ? (
          <ul className="divide-y divide-gray-100">
            {relevant.map((n) => (
              <li key={n.id} className="px-5 py-4">
                <div className="font-medium text-gray-800">{n.title}</div>
                <div className="text-sm text-gray-600 mt-0.5">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{n.date}</div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="कुनै सूचना छैन" />
        )}
      </div>
    </div>
  )
}

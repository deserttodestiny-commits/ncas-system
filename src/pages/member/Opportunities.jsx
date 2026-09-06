import { useCollection } from '../../data/useCollection'
import { formatBs } from '../../data/bsCalendar'
import EmptyState from '../../components/EmptyState'

export default function Opportunities() {
  const { items: opportunities } = useCollection('opportunities')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ncas-dark">अवसरहरू</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {opportunities.length ? (
          <ul className="divide-y divide-gray-100">
            {opportunities.map((o) => (
              <li key={o.id} className="px-5 py-4">
                <div className="font-medium text-gray-800">{o.title}</div>
                <div className="text-sm text-gray-600 mt-0.5">{o.description}</div>
                <div className="text-xs text-gray-400 mt-1">
                  📍 {o.location} · ⏰ अन्तिम मिति: {o.deadline ? formatBs(o.deadline) : '-'} · 📞 {o.contact}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState message="हाल कुनै अवसर छैन" />
        )}
      </div>
    </div>
  )
}

import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SidebarLayout from './SidebarLayout'

const NAV_ITEMS = [
  { to: '/member', label: 'मेरो खाता', icon: '🏠', end: true },
  { to: '/member/profile', label: 'प्रोफाइल', icon: '👤' },
  { to: '/member/payment', label: 'भुक्तानी', icon: '💳' },
  { to: '/member/idcard', label: 'परिचयपत्र', icon: '🪪' },
  { to: '/member/notifications', label: 'सूचनाहरू', icon: '📢' },
  { to: '/member/opportunities', label: 'अवसरहरू', icon: '💼' },
]

export default function MemberLayout() {
  const { session } = useAuth()
  if (!session || session.role !== 'member') return <Navigate to="/" replace />

  return (
    <SidebarLayout title="NCAS सदस्य" subtitle="सदस्य पोर्टल" navItems={NAV_ITEMS}>
      <Outlet />
    </SidebarLayout>
  )
}

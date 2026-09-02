import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SidebarLayout from './SidebarLayout'

const NAV_ITEMS = [
  { to: '/admin', label: 'ड्यासबोर्ड', icon: '📊', end: true },
  { to: '/admin/members', label: 'सदस्य व्यवस्थापन', icon: '👥' },
  { to: '/admin/income', label: 'आम्दानी', icon: '💰' },
  { to: '/admin/expenses', label: 'खर्च', icon: '💸' },
  { to: '/admin/reports', label: 'रिपोर्ट', icon: '📈' },
  { to: '/admin/notifications', label: 'सूचना', icon: '📢' },
]

export default function AdminLayout() {
  const { session } = useAuth()
  if (!session || session.role !== 'admin') return <Navigate to="/" replace />

  return (
    <SidebarLayout title="NCAS Admin" subtitle="प्रशासकीय प्यानल" navItems={NAV_ITEMS}>
      <Outlet />
    </SidebarLayout>
  )
}

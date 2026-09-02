import { useEffect } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { UiProvider } from './context/UiContext'
import { ensureSeeded } from './data/seed'

import Landing from './pages/Landing'
import AdminLayout from './components/AdminLayout'
import MemberLayout from './components/MemberLayout'

import Dashboard from './pages/admin/Dashboard'
import Members from './pages/admin/Members'
import Income from './pages/admin/Income'
import Expenses from './pages/admin/Expenses'
import Reports from './pages/admin/Reports'
import AdminNotifications from './pages/admin/Notifications'

import MemberDashboard from './pages/member/Dashboard'
import Profile from './pages/member/Profile'
import Payment from './pages/member/Payment'
import IdCard from './pages/member/IdCard'
import MemberNotifications from './pages/member/Notifications'
import Opportunities from './pages/member/Opportunities'

export default function App() {
  useEffect(() => {
    ensureSeeded()
  }, [])

  return (
    <UiProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="members" element={<Members />} />
              <Route path="income" element={<Income />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reports" element={<Reports />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

            <Route path="/member" element={<MemberLayout />}>
              <Route index element={<MemberDashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="payment" element={<Payment />} />
              <Route path="idcard" element={<IdCard />} />
              <Route path="notifications" element={<MemberNotifications />} />
              <Route path="opportunities" element={<Opportunities />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </UiProvider>
  )
}

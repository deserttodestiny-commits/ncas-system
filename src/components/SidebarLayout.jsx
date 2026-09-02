import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SidebarLayout({ title, subtitle, navItems, children }) {
  const [open, setOpen] = useState(false)
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen flex bg-ncas-light">
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static z-40 top-0 left-0 h-full w-64 bg-ncas-dark text-white flex flex-col transition-transform duration-200
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 no-print`}
      >
        <div className="px-5 py-5 border-b border-white/10">
          <div className="text-lg font-bold leading-tight">{title}</div>
          <div className="text-xs text-blue-200 mt-1">{subtitle}</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors ${
                  isActive ? 'bg-ncas-blue text-white' : 'text-blue-100 hover:bg-white/10'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-blue-100 hover:bg-white/10 rounded-lg"
          >
            <span className="text-base">🚪</span> लगआउट
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden bg-ncas-dark text-white flex items-center justify-between px-4 py-3 no-print">
          <button onClick={() => setOpen(true)} className="text-2xl leading-none">☰</button>
          <div className="font-semibold">{title}</div>
          <div className="w-6" />
        </header>
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}

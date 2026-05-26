import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

const NAV = [
  { to: '/admin',           label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/products',  label: 'Products',  icon: '🖼️' },
  { to: '/admin/orders',    label: 'Orders',    icon: '📦' },
  { to: '/admin/users',     label: 'Users',     icon: '👥' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📈' },
  { to: '/admin/offers',    label: 'Offers',    icon: '🏷️' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen" style={{ background: '#f8f8f8' }}>
      {/* Sidebar */}
      <aside className="w-64 shrink-0 flex flex-col fixed left-0 top-0 h-full z-40"
        style={{ background: '#ffffff', borderRight: '1.5px solid rgba(0,0,0,0.07)', boxShadow: '2px 0 12px rgba(0,0,0,0.04)' }}>

        {/* Logo */}
        <div className="p-5" style={{ borderBottom: '1.5px solid rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Admin" className="w-10 h-10 object-contain rounded-xl"
              style={{ boxShadow: '0 2px 8px rgba(139,0,0,0.15)' }} />
            <div>
              <p className="font-bold text-sm" style={{ color: '#1a0000' }}>Admin Panel</p>
              <p className="text-xs truncate max-w-[120px]" style={{ color: '#999' }}>{user?.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(135deg, #CC0000, #8B0000)',
                color: '#fff',
                boxShadow: '0 4px 16px rgba(139,0,0,0.3)',
              } : { color: '#666' }}
              onMouseEnter={(e) => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
              onMouseLeave={(e) => { if (!e.currentTarget.getAttribute('aria-current')) e.currentTarget.style.background = ''; }}>
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 space-y-1" style={{ borderTop: '1.5px solid rgba(0,0,0,0.07)' }}>
          <button onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all"
            style={{ color: '#666' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            🌐 View Store
          </button>
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-red-500"
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = ''}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          className="p-8">
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

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
    <div className="flex min-h-screen bg-dark-950">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-dark-900 border-r border-dark-800 flex flex-col fixed left-0 top-0 h-full z-40">
        <div className="p-6 border-b border-dark-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold">
              <span className="text-black font-bold text-lg">✦</span>
            </div>
            <div>
              <p className="font-display font-bold text-white text-sm">Admin Panel</p>
              <p className="text-dark-400 text-xs">{user?.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                 ${isActive
                   ? 'bg-gold-gradient text-black shadow-gold'
                   : 'text-dark-400 hover:text-white hover:bg-white/5'}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-dark-800 space-y-2">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-dark-400 hover:text-white hover:bg-white/5 text-sm transition-all"
          >
            🌐 View Store
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}

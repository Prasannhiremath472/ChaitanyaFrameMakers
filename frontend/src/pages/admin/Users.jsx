import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getAdminUsers, updateUser } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [total,   setTotal]   = useState(0);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAdminUsers({ search: search || undefined });
      setUsers(data.data);
      setTotal(data.pagination.total);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [search]);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    await updateUser(user.id, { role: newRole });
    toast.success('User role updated');
    load();
  };

  return (
    <>
      <Helmet><title>Users — Admin</title></Helmet>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">Users</h1>
        <p className="text-dark-400 text-sm mt-1">{total} registered users</p>
      </div>

      <div className="mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…" className="input-field max-w-xs" />
      </div>

      <div className="card-dark overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-800">
                {['User','Phone','Role','Verified','Joined','Actions'].map(h => (
                  <th key={h} className="px-5 py-4 text-left text-xs font-semibold text-dark-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="skeleton h-10 rounded-xl" /></td></tr>
                ))
              ) : users.map(user => (
                <tr key={user.id} className="border-b border-dark-800/50 hover:bg-white/2 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-black font-bold text-sm shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{user.name}</p>
                        <p className="text-dark-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-dark-400 text-sm">{user.phone || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-gold-500/20 text-gold-400' : 'bg-dark-800 text-dark-400'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold ${user.is_verified ? 'text-green-400' : 'text-red-400'}`}>
                      {user.is_verified ? '✓ Verified' : '✗ Unverified'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-dark-400 text-sm">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleRole(user)}
                      className="px-3 py-1.5 text-xs border border-dark-700 text-white/70 hover:text-gold-400 hover:border-gold-500 rounded-lg transition-all">
                      {user.role === 'admin' ? 'Demote' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

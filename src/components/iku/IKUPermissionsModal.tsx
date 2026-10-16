import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, UserRole } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  Search, 
  Filter, 
  Check, 
  Lock, 
  Unlock, 
  Sparkles,
  Info,
  Building2,
  Users
} from 'lucide-react';

interface IKUPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IKUPermissionsModal: React.FC<IKUPermissionsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { users, currentUser, setUserIKUAccess } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'bidang'>('all');
  const [notification, setNotification] = useState<string | null>(null);

  const nonAdminUsers = useMemo(() => {
    return users.filter((u) => u.role !== 'admin');
  }, [users]);

  const filteredUsers = useMemo(() => {
    return nonAdminUsers.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.username && u.username.toLowerCase().includes(q)) ||
          (u.department && u.department.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [nonAdminUsers, roleFilter, searchQuery]);

  if (!isOpen) return null;

  const handleToggle = (user: User) => {
    const nextVal = !user.canManageIKU;
    setUserIKUAccess(user.id, nextVal);
    setNotification(
      nextVal
        ? `Wewenang input/edit IKU berhasil DIBERIKAN kepada "${user.name}".`
        : `Wewenang input/edit IKU untuk "${user.name}" telah DICABUT (kembali Read-Only).`
    );
    setTimeout(() => setNotification(null), 3000);
  };

  const authorizedCount = nonAdminUsers.filter((u) => Boolean(u.canManageIKU)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Pengaturan Otorisasi Admin
                </span>
                <span className="text-xs text-emerald-200">
                  {authorizedCount} Pengguna Ditunjuk
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Tunjuk Hak Akses Pengelola Menu IKU
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900">
          <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Pilih pengguna non-admin (<strong>Staf User</strong> atau <strong>User Bidang</strong>) yang
            diberi wewenang untuk <strong>menginput, mengedit, dan menghapus</strong> data IKU serta
            Visi. Pengguna lain yang tidak ditunjuk tetap dapat mengakses menu IKU dalam mode{' '}
            <strong>Pratinjau (Read-Only)</strong>.
          </p>
        </div>

        {/* Feedback notification */}
        {notification && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{notification}</span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama pengguna, email, atau bidang..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 cursor-pointer"
            >
              <option value="all">Semua Role ({nonAdminUsers.length})</option>
              <option value="user">User Staff Saja</option>
              <option value="bidang">User Bidang Saja</option>
            </select>
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2.5 divide-y divide-slate-100">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada pengguna yang cocok.</p>
              <p className="text-xs text-slate-400 mt-0.5">Silakan sesuaikan kata kunci pencarian.</p>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const isAllowed = Boolean(user.canManageIKU);
              return (
                <div
                  key={user.id}
                  className={`pt-2.5 first:pt-0 p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isAllowed
                      ? 'bg-emerald-50/60 border-emerald-200 shadow-2xs'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50/60'
                  }`}
                >
                  {/* User Profile Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <UserAvatar name={user.name} role={user.role} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {user.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            user.role === 'bidang'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {user.role === 'bidang' ? 'User Bidang' : 'Staf User'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-2">
                        <span>{user.email}</span>
                        {user.department && (
                          <span className="text-slate-400 truncate max-w-[150px]">
                            · {user.department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Permission Toggle Controls */}
                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <div className="text-right">
                      {isAllowed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-300">
                          <Unlock className="w-3 h-3 text-emerald-600" />
                          <span>Bisa Input &amp; Edit IKU</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>Pratinjau Saja</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggle(user)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                        isAllowed
                          ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {isAllowed ? (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Cabut Wewenang</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Beri Wewenang</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Perubahan hak akses tersimpan otomatis secara real-time.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

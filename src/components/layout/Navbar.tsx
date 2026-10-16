import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../context/StorageContext';
import { BapperidaLogo } from '../common/BapperidaLogo';
import { UserAvatar } from '../common/UserAvatar';
import { 
  ShieldCheck, 
  LogOut, 
  ChevronDown, 
  UserCheck, 
  Menu,
  Lock,
  Cloud,
  Key
} from 'lucide-react';

interface NavbarProps {
  onMobileMenuToggle: () => void;
  activeView: string;
  onOpenNextcloudModal: () => void;
  onOpenProfileModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onMobileMenuToggle, 
  activeView,
  onOpenNextcloudModal,
  onOpenProfileModal
}) => {
  const { currentUser, logout, isAdmin, isBidang } = useAuth();
  const { nextcloudConfig } = useStorage();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!currentUser) return null;

  const getRoleLabel = () => {
    switch (currentUser.role) {
      case 'admin':
        return { text: 'Admin Instansi', style: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      case 'user':
        return { text: 'User Staff', style: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'bidang':
        return { text: 'User Bidang (Read-Only)', style: 'bg-amber-50 text-amber-700 border-amber-200' };
      default:
        return { text: currentUser.role, style: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleMeta = getRoleLabel();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 md:gap-8 px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
      {/* Zone 1: Mobile Toggle & Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <BapperidaLogo size="sm" className="w-10 h-10 shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap leading-none">
              E-PMPED
            </span>
            <span className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
              Bapperida Tanggamus
            </span>
          </div>
        </div>

        {/* Active View Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs font-semibold text-slate-700">
          <span className="text-slate-400">/</span>
          {activeView === 'private' && <span>File Saya</span>}
          {activeView === 'public' && <span>Folder Publik</span>}
          {activeView === 'bidang' && <span>Menu Bidang</span>}
          {activeView === 'surat' && <span>Manajemen Surat</span>}
          {activeView === 'surat-keluar' && <span>Surat Keluar</span>}
          {activeView === 'iku' && (
            <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Indikator Kinerja Utama (IKU)
            </span>
          )}
          {activeView === 'tujuan-sasaran' && (
            <span className="flex items-center gap-1.5 text-indigo-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              Tujuan &amp; Sasaran RPJMD
            </span>
          )}
          {activeView === 'users' && <span>Kelola Pengguna</span>}
          {activeView === 'security' && (
            <span className="flex items-center gap-1.5 text-rose-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              Log Akses &amp; Keamanan
            </span>
          )}
        </div>
      </div>

      {/* Zone 2: Nextcloud Status (Hanya Admin) */}
      {isAdmin && (
        <div className="hidden md:flex items-center gap-2.5">
          {/* Nextcloud Real Storage Trigger */}
          <button
            onClick={onOpenNextcloudModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              nextcloudConfig.isEnabled
                ? 'bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
            title="Buka Pengaturan Koneksi Nextcloud & Database Real"
          >
            <Cloud className={`w-3.5 h-3.5 ${nextcloudConfig.isEnabled ? 'text-sky-600' : 'text-slate-400'}`} />
            <span>Nextcloud:</span>
            {nextcloudConfig.isEnabled ? (
              <span className="text-emerald-700 font-bold">Terhubung Real</span>
            ) : (
              <span className="text-slate-500 font-normal">Hubungkan</span>
            )}
          </button>
        </div>
      )}

      {/* Zone 3: User Profile & Actions */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <UserAvatar name={currentUser.name} role={currentUser.role} size="sm" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-900 leading-tight truncate max-w-[140px]">
                {currentUser.name}
              </span>
              <span className="text-[11px] text-slate-500 leading-tight truncate max-w-[140px]">
                {currentUser.department || currentUser.email}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                <UserAvatar name={currentUser.name} role={currentUser.role} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded border uppercase font-semibold ${roleMeta.style}`}>
                      {roleMeta.text}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-2 py-1">
                <div className="px-2 py-1.5 text-[11px] text-slate-500">
                  Unit: <strong className="text-slate-700">{currentUser.department}</strong>
                </div>
              </div>

              <div className="border-t border-slate-100 px-2 py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onOpenProfileModal?.();
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 transition-colors text-left cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isBidang ? 'Lihat Profil Akun' : 'Ubah Profil & Kata Sandi'}</span>
                </button>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar dari Akun (Logout)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

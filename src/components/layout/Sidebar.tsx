import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../context/StorageContext';
import { formatBytes } from '../../services/storageService';
import { BapperidaLogo } from '../common/BapperidaLogo';
import { UserAvatar } from '../common/UserAvatar';
import { 
  FolderLock, 
  FolderKanban, 
  Share2, 
  Mail, 
  Send,
  Users, 
  HardDrive, 
  RefreshCw, 
  Info,
  ChevronRight,
  Cloud,
  X,
  Sparkles,
  KeyRound,
  Pencil,
  GitFork,
  Target,
  ShieldCheck,
  ShieldAlert,
  Download
} from 'lucide-react';

export type ActiveNavTab = 'private' | 'public' | 'bidang' | 'surat' | 'surat-keluar' | 'iku' | 'tujuan-sasaran' | 'users' | 'security';

interface SidebarProps {
  currentTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenNextcloudModal: () => void;
  onOpenProfileModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  onOpenNextcloudModal,
  onOpenProfileModal,
}) => {
  const { currentUser, isAdmin, isBidang, canAccessPublic, canAccessSurat } = useAuth();
  const { getStorageUsage, resetAllData, nextcloudConfig } = useStorage();

  if (!currentUser) return null;

  const storageInfo = getStorageUsage(isAdmin ? undefined : currentUser.id);
  const percentage = Math.min(
    100,
    Math.max(1, Math.round((storageInfo.usedBytes / storageInfo.totalBytes) * 100))
  );

  const handleNavClick = (tab: ActiveNavTab) => {
    onSelectTab(tab);
    onClose();
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'admin':
        return { label: 'Administrator', style: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      case 'user':
        return { label: 'Staf Pengguna', style: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'bidang':
        return { label: 'User Bidang', style: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: currentUser.role, style: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-700 flex flex-col border-r border-slate-200/90 shadow-sm transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* App Identification in Sidebar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-b from-slate-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-50 via-indigo-50 to-white border border-indigo-100/80 p-1 flex items-center justify-center shadow-2xs shrink-0">
              <BapperidaLogo size="sm" className="w-8 h-8" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>E-PMPED</span>
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium -mt-0.5">
                Bapperida Tanggamus
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-lg transition-colors cursor-pointer"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Mini Profile Card */}
        <div className="px-3 pt-3">
          <div 
            onClick={onOpenProfileModal}
            className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70 flex items-center justify-between gap-2.5 hover:bg-slate-100/80 transition-colors cursor-pointer group"
            title={isBidang ? 'Lihat Profil Akun' : 'Ubah Profil & Kata Sandi Akun'}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <UserAvatar name={currentUser.name} role={currentUser.role} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                  {currentUser.name}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${roleBadge.style}`}>
                    {roleBadge.label}
                  </span>
                  {currentUser.department && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[70px]" title={currentUser.department}>
                      · {currentUser.department}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenProfileModal?.();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors shrink-0"
              title={isBidang ? 'Lihat Profil Akun' : 'Ubah Profil & Password'}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* User Role Notice Box for Bidang */}
        {isBidang && (
          <div className="mx-3 mt-3 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs shadow-2xs">
            <div className="flex items-center gap-1.5 font-semibold text-amber-800 mb-1">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Otorisasi Role Bidang:</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800/90">
              Sebagai <strong>User Bidang</strong>, Anda berhak mengakses <strong>Menu Bidang</strong>, <strong>Menu IKU</strong>, dan <strong>Tujuan &amp; Sasaran RPJMD (Mode Pratinjau)</strong>.
            </p>
          </div>
        )}

        {/* Navigation Menu */}
        <div className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Ruang Penyimpanan
          </div>

          {/* MENU 1: FILE SAYA (Private Cloud Storage) */}
          {!isBidang && (
            <button
              onClick={() => handleNavClick('private')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                currentTab === 'private'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FolderLock className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                  currentTab === 'private' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                }`} />
                <span className="whitespace-nowrap">File Saya (Pribadi)</span>
              </div>
              {isAdmin && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  currentTab === 'private'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                }`}>
                  Multi-Akun
                </span>
              )}
            </button>
          )}

          {/* MENU 2: FOLDER PUBLIK */}
          {canAccessPublic && (
            <button
              onClick={() => handleNavClick('public')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                currentTab === 'public'
                  ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Share2 className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                  currentTab === 'public' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                }`} />
                <span className="whitespace-nowrap">Folder Publik</span>
              </div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                currentTab === 'public'
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                Umum
              </span>
            </button>
          )}

          {/* MENU 3: MENU BIDANG */}
          <button
            onClick={() => handleNavClick('bidang')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
              currentTab === 'bidang'
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FolderKanban className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                currentTab === 'bidang' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
              }`} />
              <span className="whitespace-nowrap">Menu Bidang</span>
            </div>
            {isBidang ? (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                currentTab === 'bidang'
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                Lihat &amp; Unduh
              </span>
            ) : (
              <ChevronRight className={`w-3.5 h-3.5 ${
                currentTab === 'bidang' ? 'text-white/70' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
            )}
          </button>

          {/* SECTION 2: KEARSIPAN & SURAT */}
          {canAccessSurat && (
            <>
              <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Kearsipan Dinas
              </div>

              {/* MENU 4: MANAJEMEN SURAT (Semua / Surat Masuk) */}
              <button
                onClick={() => handleNavClick('surat')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  currentTab === 'surat'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Mail className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    currentTab === 'surat' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                  }`} />
                  <span className="whitespace-nowrap">Manajemen Surat</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  currentTab === 'surat'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  Semua
                </span>
              </button>

              {/* MENU 5: SURAT KELUAR (10 Kategori) */}
              <button
                onClick={() => handleNavClick('surat-keluar')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  currentTab === 'surat-keluar'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-600/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Send className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    currentTab === 'surat-keluar' ? 'text-white' : 'text-purple-600'
                  }`} />
                  <span className="whitespace-nowrap">Surat Keluar</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  currentTab === 'surat-keluar'
                    ? 'bg-white/20 text-white'
                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                }`}>
                  10 Kategori
                </span>
              </button>
            </>
          )}

          {/* SECTION: INDIKATOR KINERJA UTAMA (IKU) - Accessible by Admin, User, and Bidang */}
          <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Kinerja &amp; Perencanaan
          </div>

          <button
            onClick={() => handleNavClick('iku')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
              currentTab === 'iku'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/20 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <GitFork className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                currentTab === 'iku' ? 'text-white' : 'text-emerald-600'
              }`} />
              <span className="whitespace-nowrap">Menu IKU (Kinerja)</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              currentTab === 'iku'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {isAdmin ? 'Admin' : 'Pratinjau'}
            </span>
          </button>

          {/* MENU: TUJUAN DAN SASARAN (RPJMD 5 TAHUNAN) */}
          <button
            onClick={() => handleNavClick('tujuan-sasaran')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
              currentTab === 'tujuan-sasaran'
                ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Target className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                currentTab === 'tujuan-sasaran' ? 'text-white' : 'text-indigo-600'
              }`} />
              <span className="whitespace-nowrap">Tujuan &amp; Sasaran</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
              currentTab === 'tujuan-sasaran'
                ? 'bg-white/20 text-white'
                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
            }`}>
              5 Tahunan
            </span>
          </button>

          {/* SECTION 3: ADMINISTRASI (Admin Only) */}
          {isAdmin && (
            <>
              <div className="pt-4 px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Pengawasan Admin
              </div>

              <button
                onClick={() => handleNavClick('users')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  currentTab === 'users'
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm shadow-indigo-600/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    currentTab === 'users' ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'
                  }`} />
                  <span className="whitespace-nowrap">Kelola Pengguna</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  currentTab === 'users'
                    ? 'bg-white/20 text-white'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                }`}>
                  Otoritas
                </span>
              </button>

              {/* MENU BARU: LOG AKSES & KEAMANAN */}
              <button
                onClick={() => handleNavClick('security')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                  currentTab === 'security'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-sm shadow-rose-600/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className={`w-4 h-4 transition-transform group-hover:scale-105 ${
                    currentTab === 'security' ? 'text-white' : 'text-rose-600 group-hover:text-rose-700'
                  }`} />
                  <span className="whitespace-nowrap">Log Akses &amp; Keamanan</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${
                  currentTab === 'security'
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}>
                  Audit
                </span>
              </button>
            </>
          )}
        </div>

        {/* Sidebar Footer: Storage Meter & Utilities */}
        <div className="p-3.5 border-t border-slate-200/80 bg-slate-50/70">
          <div className="p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs mb-2.5">
            <div className="flex items-center justify-between text-[11px] mb-1.5">
              <span className="text-slate-600 font-medium flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isAdmin ? 'Kapasitas Global' : 'Kapasitas Akun'}</span>
              </span>
              <span className="font-mono font-semibold text-slate-800">{formatBytes(storageInfo.usedBytes)}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  percentage > 85 ? 'bg-gradient-to-r from-amber-500 to-rose-600' : 'bg-gradient-to-r from-indigo-500 to-blue-600'
                }`}
                style={{ width: `${Math.max(4, percentage)}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-medium mt-1.5">
              <span>{storageInfo.fileCount} berkas tersimpan</span>
              <span className="text-slate-800 font-semibold" title="Ukuran kuota disk penyimpanan instansi">
                Batas {formatBytes(storageInfo.totalBytes)}
              </span>
            </div>
            {nextcloudConfig.isEnabled && (
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] text-sky-700">
                <span className="flex items-center gap-1 font-medium">
                  <Cloud className="w-2.5 h-2.5 text-sky-600" />
                  Disk Server Nextcloud
                </span>
                <span className="font-mono text-emerald-600 font-bold">Sinkron Real</span>
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
              <a
                href="/api/download-zip"
                download="epmped-terbaru-lengkap.zip"
                className="w-full py-1.5 px-2.5 text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 rounded-xl border border-indigo-200/90 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.99] cursor-pointer"
                title="Unduh seluruh file proyek versi terbaru (termasuk modul keamanan) untuk dipindahkan ke CasaOS"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>Unduh File Update CasaOS (.ZIP)</span>
              </a>

              <button
                onClick={onOpenNextcloudModal}
                className="w-full py-1.5 px-2.5 text-[11px] font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100/80 rounded-xl border border-sky-200/90 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.99] cursor-pointer"
                title="Konfigurasi Server & Database Real Nextcloud"
              >
                <Cloud className="w-3.5 h-3.5 text-sky-600" />
                <span>Koneksi Nextcloud Real</span>
              </button>

              <button
                onClick={() => {
                  if (window.confirm('Reset data ke kondisi awal (demo instansi)?')) {
                    resetAllData();
                  }
                }}
                className="w-full py-1.5 px-2.5 text-[11px] font-medium text-slate-600 hover:text-rose-600 bg-white hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-[0.99] cursor-pointer"
                title="Kembalikan file dan surat contoh bawaan"
              >
                <RefreshCw className="w-3 h-3 text-slate-400 group-hover:text-rose-500" />
                <span>Muat Ulang Data Bawaan</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

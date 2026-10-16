import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { 
  User, 
  Key, 
  Mail, 
  Building, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ShieldAlert,
  AtSign
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, canEditProfile, updateOwnProfile } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name || '');
      setUsername(currentUser.username || '');
      setEmail(currentUser.email || '');
      setDepartment(currentUser.department || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage(null);
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!canEditProfile) {
      setStatusMessage({
        text: 'Akun Bidang tidak diizinkan mengubah profil akun maupun kata sandi.',
        isError: true,
      });
      return;
    }

    if (!name.trim() || !email.trim()) {
      setStatusMessage({
        text: 'Nama lengkap dan email tidak boleh kosong.',
        isError: true,
      });
      return;
    }

    if (newPassword) {
      if (newPassword.length < 3) {
        setStatusMessage({
          text: 'Kata sandi baru minimal 3 karakter.',
          isError: true,
        });
        return;
      }
      if (newPassword !== confirmPassword) {
        setStatusMessage({
          text: 'Konfirmasi kata sandi baru tidak cocok.',
          isError: true,
        });
        return;
      }
    }

    setIsSubmitting(true);
    const result = updateOwnProfile({
      name: name.trim(),
      username: username.trim() || undefined,
      email: email.trim().toLowerCase(),
      department: department.trim() || undefined,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword ? newPassword.trim() : undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      setStatusMessage({
        text: result.message || 'Profil dan kredensial akun berhasil diperbarui!',
        isError: false,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setStatusMessage({
        text: result.message || 'Gagal memperbarui profil.',
        isError: true,
      });
    }
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'admin':
        return { label: 'Administrator', style: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
      case 'user':
        return { label: 'User Staff', style: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'bidang':
        return { label: 'User Bidang (Read-Only)', style: 'bg-amber-100 text-amber-800 border-amber-200' };
      default:
        return { label: currentUser.role, style: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const roleMeta = getRoleBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pengaturan Profil &amp; Kata Sandi
              </h2>
              <p className="text-[11px] text-slate-500">
                Kelola informasi akun Anda dan perbarui kata sandi masuk.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* User Hero Banner */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <UserAvatar name={currentUser.name} role={currentUser.role} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 truncate">
                  {currentUser.name}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded border uppercase font-mono ${roleMeta.style}`}>
                  {roleMeta.label}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">{currentUser.email}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{currentUser.department}</p>
            </div>
          </div>

          {/* Alert if User is Bidang (Read-Only) */}
          {!canEditProfile && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="block text-amber-950 font-semibold mb-0.5">
                  Akses Terbatas: Akun Bidang Tidak Dapat Mengubah Profil / Password
                </strong>
                Sesuai dengan kebijakan sistem tata kelola kearsipan, akun <strong>User Bidang</strong> hanya memiliki wewenang melihat dan mengunduh berkas pada Menu Bidang. Perubahan data profil dan kata sandi akun Bidang dikelola secara terpusat oleh Administrator.
              </div>
            </div>
          )}

          {/* Feedback status message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.isError
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {statusMessage.isError ? (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Input Fields */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  disabled={!canEditProfile || isSubmitting}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username Akun
                </label>
                <div className="relative">
                  <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    disabled={!canEditProfile || isSubmitting}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 font-mono"
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat Email Resmi
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    disabled={!canEditProfile || isSubmitting}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Unit Kerja / Departemen
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  disabled={!canEditProfile || isSubmitting}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Section Ganti Password (Only available for Admin and Standard User) */}
          {canEditProfile && (
            <div className="pt-3 border-t border-slate-200 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Ubah Kata Sandi (Opsional)</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Kosongkan kolom kata sandi baru jika Anda tidak ingin mengganti password akun Anda saat ini.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kata Sandi Saat Ini
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    disabled={isSubmitting}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini (untuk verifikasi)"
                    autoComplete="current-password"
                    spellCheck={false}
                    data-lpignore="true"
                    className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      disabled={isSubmitting}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 3 karakter"
                      autoComplete="new-password"
                      spellCheck={false}
                      data-lpignore="true"
                      className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      disabled={isSubmitting}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi password baru"
                      autoComplete="new-password"
                      spellCheck={false}
                      data-lpignore="true"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              Tutup
            </button>
            {canEditProfile && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../context/StorageContext';
import { formatBytes, getUserAccountFolder } from '../../services/storageService';
import { UserAvatar } from '../common/UserAvatar';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  Lock, 
  FolderLock, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert,
  UserPlus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Key,
  Mail,
  Building,
  AtSign,
  Search,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminUserManagementProps {
  onSwitchToUserDrive: (userId: string) => void;
}

const DEPARTMENTS = [
  'Bidang PME (Perencanaan, Pengendalian & Evaluasi)',
  'Bidang Tata Ruang & Infrastruktur',
  'Bidang Perekonomian & SDA',
  'Bidang Sosial Budaya & Pemerintahan',
  'Bidang Litbang & Inovasi',
  'Sekretariat',
  'Instansi Umum'
];

export const AdminUserManagement: React.FC<AdminUserManagementProps> = ({
  onSwitchToUserDrive,
}) => {
  const { users, currentUser, addUser, editUser, deleteUser, isAdmin } = useAuth();
  const { items } = useStorage();

  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Form states for Add User
  const [addName, setAddName] = useState('');
  const [addUsername, setAddUsername] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('123456');
  const [addRole, setAddRole] = useState<UserRole>('user');
  const [addDepartment, setAddDepartment] = useState('Bidang PME (Perencanaan, Pengendalian & Evaluasi)');

  // Form states for Edit User
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [editDepartment, setEditDepartment] = useState('');

  // Password visibility states (protected by default)
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  if (!isAdmin) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-slate-50">
        <ShieldAlert className="w-12 h-12 text-red-500 mb-3" />
        <h2 className="text-base font-bold text-slate-800">Akses Khusus Administrator</h2>
        <p className="text-xs text-slate-500">Anda tidak memiliki hak untuk mengelola akun pengguna.</p>
      </div>
    );
  }

  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 3500);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username || '');
    setEditEmail(user.email);
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setEditDepartment(user.department || '');
  };

  // Submit Add User
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim() || !addEmail.trim()) {
      showNotification('Nama lengkap dan email wajib diisi.', true);
      return;
    }

    const res = addUser({
      name: addName,
      username: addUsername || undefined,
      email: addEmail,
      password: addPassword || '123456',
      role: addRole,
      department: addDepartment,
    });

    if (res.success) {
      showNotification(res.message || 'Pengguna baru berhasil ditambahkan.');
      setIsAddModalOpen(false);
      // Reset
      setAddName('');
      setAddUsername('');
      setAddEmail('');
      setAddPassword('123456');
      setAddRole('user');
    } else {
      showNotification(res.message || 'Gagal menambahkan pengguna.', true);
    }
  };

  // Submit Edit User
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editName.trim() || !editEmail.trim()) {
      showNotification('Nama lengkap dan email tidak boleh kosong.', true);
      return;
    }

    const res = editUser(editingUser.id, {
      name: editName,
      username: editUsername || undefined,
      email: editEmail,
      password: editPassword || undefined,
      role: editRole,
      department: editDepartment,
    });

    if (res.success) {
      showNotification(res.message || 'Perubahan data pengguna berhasil disimpan.');
      setEditingUser(null);
    } else {
      showNotification(res.message || 'Gagal mengubah pengguna.', true);
    }
  };

  // Submit Delete User
  const handleDeleteSubmit = () => {
    if (!deletingUser) return;
    const res = deleteUser(deletingUser.id);
    if (res.success) {
      showNotification(res.message || 'Pengguna berhasil dihapus.');
      setDeletingUser(null);
    } else {
      showNotification(res.message || 'Gagal menghapus pengguna.', true);
      setDeletingUser(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Manajemen &amp; Kelola Pengguna
                </h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 font-mono">
                  Admin Otoritas
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                Kelola hak akses akun instansi: Tambah user baru, edit profil/role, hapus akun, dan audit ruang penyimpanan.
              </p>
            </div>
          </div>

          {/* Action Buttons Header */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {/* Notification alerts */}
        {successMsg && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 animate-fadeIn">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Table Header Filter */}
          <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Daftar Pengguna Sistem ({users.length})
              </span>
              <span className="text-[11px] text-slate-400">|</span>
              <span className="text-[11px] text-slate-500">
                Total {filteredUsers.length} akun ditampilkan
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, email, username..."
                className="text-xs pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-full sm:w-60"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/75 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nama &amp; Akun</th>
                  <th className="py-3 px-4 font-semibold">Unit Kerja / Bidang</th>
                  <th className="py-3 px-4 font-semibold">Peran (Role)</th>
                  <th className="py-3 px-4 font-semibold">Penyimpanan Pribadi</th>
                  <th className="py-3 px-4 font-semibold text-center">Tindakan / Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada pengguna yang cocok dengan kriteria pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const userPrivateItems = items.filter(
                      (i) => i.ownerId === user.id && i.scope === 'private'
                    );
                    const userFiles = userPrivateItems.filter((i) => i.type === 'file');
                    const userUsedBytes = userFiles.reduce((acc, curr) => acc + curr.size, 0);
                    const isSelf = user.id === currentUser?.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Nama & Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <UserAvatar name={user.name} role={user.role} size="md" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-slate-900 block">{user.name}</span>
                                {isSelf && (
                                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-medium">
                                    Anda
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                                <span>{user.email}</span>
                                {user.username && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="text-indigo-600">@{user.username}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Unit Kerja */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 font-medium">{user.department || 'Instansi Umum'}</span>
                        </td>

                        {/* Peran / Role */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                              user.role === 'admin'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : user.role === 'bidang'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {user.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                            {user.role === 'bidang' && <Lock className="w-3.5 h-3.5" />}
                            {user.role === 'user' && <UserCheck className="w-3.5 h-3.5" />}
                            {user.role === 'admin'
                              ? 'Admin'
                              : user.role === 'bidang'
                              ? 'User Bidang'
                              : 'User Staff'}
                          </span>
                        </td>

                        {/* Berkas & Size */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-800 font-medium block">
                            {formatBytes(userUsedBytes)}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {userFiles.length} berkas • {userPrivateItems.filter((i) => i.type === 'folder').length} folder
                          </span>
                          <span 
                            className="inline-flex items-center gap-1 text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 mt-1"
                            title="Folder penyimpanan terpisah di Nextcloud untuk kemudahan backup data per user"
                          >
                            📁 File_Saya/{getUserAccountFolder(user)}/
                          </span>
                        </td>

                        {/* Action buttons: Edit, Hapus, Audit */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Tombol Edit */}
                            <button
                              onClick={() => handleOpenEdit(user)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 hover:text-indigo-600 rounded-lg transition-colors border border-slate-200 shadow-2xs"
                              title="Edit Informasi & Peran Pengguna"
                            >
                              <Pencil className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => setDeletingUser(user)}
                              disabled={isSelf}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors border shadow-2xs ${
                                isSelf
                                  ? 'bg-slate-50 text-slate-300 border-slate-200 cursor-not-allowed opacity-50'
                                  : 'text-red-700 bg-white hover:bg-red-50 hover:text-red-800 border-red-200 cursor-pointer'
                              }`}
                              title={isSelf ? 'Tidak dapat menghapus akun Anda sendiri' : 'Hapus Pengguna'}
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Hapus</span>
                            </button>

                            {/* Tombol Audit File */}
                            <button
                              onClick={() => onSwitchToUserDrive(user.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200 shadow-2xs"
                              title="Audit File Saya akun ini"
                            >
                              <FolderLock className="w-3.5 h-3.5 text-indigo-600" />
                              <span className="hidden xl:inline">Audit File</span>
                              <ArrowRight className="w-3 h-3 text-indigo-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Security Rule Matrix Reference */}
        <div className="mt-6 bg-slate-900 text-slate-200 rounded-xl p-5 border border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Matriks Kebijakan Otorisasi Sistem (RBAC)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
              <span className="font-bold text-indigo-400 block mb-1">Peran: Administrator</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• Akses semua data semua akun user</li>
                <li>• Akses Folder Publik (upload &amp; kelola)</li>
                <li>• Akses Menu Bidang (upload, edit, hapus)</li>
                <li>• Akses Manajemen Surat (arsip &amp; disposisi)</li>
                <li>• Tambah, edit, dan hapus user sistem</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
              <span className="font-bold text-blue-400 block mb-1">Peran: User (Staff)</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li>• File Saya pribadi (tidak bisa dilihat user lain)</li>
                <li>• Akses Folder Publik (upload &amp; unduh)</li>
                <li>• Akses Menu Bidang (upload, edit, hapus, unduh)</li>
                <li>• Akses Manajemen Surat (arsip &amp; disposisi)</li>
                <li>• Tidak dapat melihat file pribadi user lain</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
              <span className="font-bold text-amber-400 block mb-1">Peran: User Bidang</span>
              <ul className="space-y-1 text-amber-200/90 text-[11px]">
                <li>• <strong>HANYA bisa melihat Menu Bidang</strong></li>
                <li>• <strong>HANYA wewenang melihat &amp; download</strong></li>
                <li>• TIDAK BISA upload, hapus, ataupun edit</li>
                <li>• TIDAK BISA akses Folder Publik</li>
                <li>• TIDAK BISA akses Manajemen Surat</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: TAMBAH USER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah Pengguna Baru</h3>
                  <p className="text-[11px] text-slate-500">Buat akun untuk pegawai / staf atau bagian bidang</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Misal: Ahmad Rifai, S.Kom"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Login
                  </label>
                  <div className="relative">
                    <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={addUsername}
                      onChange={(e) => setAddUsername(e.target.value)}
                      placeholder="staf_pme"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Resmi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={addEmail}
                      onChange={(e) => setAddEmail(e.target.value)}
                      placeholder="staf@instansi.go.id"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi (Password) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showAddPassword ? 'text' : 'password'}
                      required
                      value={addPassword}
                      onChange={(e) => setAddPassword(e.target.value)}
                      placeholder="123456"
                      autoComplete="new-password"
                      spellCheck={false}
                      data-lpignore="true"
                      className="w-full text-xs pl-8 pr-8 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="text-slate-400 hover:text-slate-600 p-1 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      title={showAddPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showAddPassword ? <Eye className="w-3.5 h-3.5 text-indigo-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran / Otoritas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as UserRole)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="user">User (Staf - Akses Pribadi, Publik, Bidang, Surat)</option>
                    <option value="bidang">User Bidang (Hanya Lihat Menu Bidang &amp; Unduh)</option>
                    <option value="admin">Administrator (Akses Penuh Semua Modul)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Kerja / Bidang
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    list="dept-list-add"
                    value={addDepartment}
                    onChange={(e) => setAddDepartment(e.target.value)}
                    placeholder="Pilih atau ketik unit kerja..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <datalist id="dept-list-add">
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Simpan Pengguna</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Edit Pengguna</h3>
                  <p className="text-[11px] text-slate-500">Perbarui identitas, hak akses, atau kata sandi akun</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <AtSign className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="Username akun"
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Akun <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Ubah password..."
                      autoComplete="new-password"
                      spellCheck={false}
                      data-lpignore="true"
                      className="w-full text-xs pl-8 pr-8 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      className="text-slate-400 hover:text-slate-600 p-1 absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
                      title={showEditPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    >
                      {showEditPassword ? <Eye className="w-3.5 h-3.5 text-indigo-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peran / Otoritas <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editRole}
                    disabled={editingUser.id === currentUser?.id}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="user">User (Staf - Akses Lengkap Standar)</option>
                    <option value="bidang">User Bidang (Hanya Lihat Bidang &amp; Download)</option>
                    <option value="admin">Administrator (Akses Penuh)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unit Kerja / Bidang
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    list="dept-list-edit"
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    placeholder="Unit kerja..."
                    className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <datalist id="dept-list-edit">
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: KONFIRMASI HAPUS USER */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Hapus Akun Pengguna?
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Apakah Anda yakin ingin menghapus akun pengguna{' '}
                <strong className="text-slate-900 font-semibold">{deletingUser.name}</strong> ({deletingUser.email})?
              </p>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-left text-[11px] text-red-700 mb-5">
                <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Peringatan Penting:</span>
                </div>
                <span>
                  Akun yang dihapus tidak akan dapat masuk ke sistem lagi. Pastikan berkas atau disposisi penting telah dialihkan jika diperlukan.
                </span>
              </div>

              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="w-1/2 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleDeleteSubmit}
                  className="w-1/2 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ya, Hapus Akun</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

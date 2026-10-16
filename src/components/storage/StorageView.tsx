import React, { useState, useMemo } from 'react';
import { StorageItem, StorageScope, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../context/StorageContext';
import { formatBytes, formatDateIndo } from '../../services/storageService';
import { NewFolderModal } from './NewFolderModal';
import { UploadModal } from './UploadModal';
import { FilePreviewModal } from './FilePreviewModal';
import { 
  Folder, 
  FolderPlus, 
  FolderLock,
  UploadCloud, 
  Search, 
  Grid, 
  List, 
  ChevronRight, 
  Home, 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  FileCode, 
  FileArchive, 
  Video, 
  Music, 
  Download, 
  Trash2, 
  Edit3, 
  Eye, 
  Lock, 
  ShieldCheck, 
  Users, 
  Filter, 
  Check, 
  X,
  Share2,
  FolderKanban,
  AlertTriangle
} from 'lucide-react';

interface StorageViewProps {
  scope: StorageScope;
}

export const StorageView: React.FC<StorageViewProps> = ({ scope }) => {
  const { currentUser, isAdmin, isBidang, canModifyBidang, users } = useAuth();
  const { 
    items, 
    createFolder, 
    uploadFiles, 
    deleteItem, 
    renameItem 
  } = useStorage();

  // Navigation state: current folder ID (null means root of current scope)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Admin filter for private drives: allows admin to view any user's private drive!
  const [adminSelectedUserId, setAdminSelectedUserId] = useState<string>('all');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [bidangFilter, setBidangFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<StorageItem | null>(null);
  const [renameTarget, setRenameTarget] = useState<StorageItem | null>(null);
  const [newNameInput, setNewNameInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<StorageItem | null>(null);

  // Determine permissions for this scope
  const isReadOnly = scope === 'bidang' && isBidang;
  const canUploadAndEdit = !isReadOnly;

  // Selected target owner for admin uploads into a user's private space
  const targetOwnerForAdmin = useMemo(() => {
    if (scope === 'private' && isAdmin && adminSelectedUserId !== 'all') {
      return users.find((u) => u.id === adminSelectedUserId);
    }
    return currentUser || undefined;
  }, [scope, isAdmin, adminSelectedUserId, users, currentUser]);

  // Current folder object
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return items.find((i) => i.id === currentFolderId) || null;
  }, [currentFolderId, items]);

  // Breadcrumbs path
  const breadcrumbs = useMemo(() => {
    const crumbs: { id: string | null; name: string }[] = [];
    crumbs.push({
      id: null,
      name: scope === 'private' ? 'File Saya' : scope === 'public' ? 'Folder Publik' : 'Menu Bidang',
    });

    let currId = currentFolderId;
    const tempCrumb: { id: string; name: string }[] = [];
    while (currId) {
      const found = items.find((i) => i.id === currId);
      if (!found) break;
      tempCrumb.unshift({ id: found.id, name: found.name });
      currId = found.parentId;
    }
    return [...crumbs, ...tempCrumb];
  }, [scope, currentFolderId, items]);

  // Filter items in current view
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // 1. Must match scope
      if (item.scope !== scope) return false;

      // 2. Ownership rule for private storage:
      // Standard user ONLY sees their own items!
      // Admin sees selected user's items or all if 'all' is selected.
      if (scope === 'private') {
        if (!isAdmin) {
          if (item.ownerId !== currentUser?.id) return false;
        } else {
          if (adminSelectedUserId !== 'all' && item.ownerId !== adminSelectedUserId) {
            return false;
          }
        }
      }

      // 3. Parent Folder constraint
      // If user is searching across files, search in entire scope or within folder:
      if (!searchQuery.trim()) {
        if (item.parentId !== currentFolderId) return false;
      }

      // 4. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchOwner = item.ownerName.toLowerCase().includes(q);
        if (!matchName && !matchOwner) return false;
      }

      // 5. Type filter
      if (typeFilter !== 'all') {
        if (typeFilter === 'folder' && item.type !== 'folder') return false;
        if (typeFilter !== 'folder') {
          if (item.type === 'folder') return false;
          const ext = item.extension?.toLowerCase() || '';
          if (typeFilter === 'document' && !['pdf', 'docx', 'doc', 'txt', 'rtf'].includes(ext)) return false;
          if (typeFilter === 'spreadsheet' && !['xlsx', 'xls', 'csv'].includes(ext)) return false;
          if (typeFilter === 'presentation' && !['pptx', 'ppt'].includes(ext)) return false;
          if (typeFilter === 'image' && !['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(ext)) return false;
          if (typeFilter === 'archive' && !['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return false;
        }
      }

      // 6. Bidang filter (only when in bidang scope and root)
      if (scope === 'bidang' && bidangFilter !== 'all') {
        if (item.bidangCategory && item.bidangCategory !== bidangFilter) return false;
      }

      return true;
    });
  }, [items, scope, isAdmin, currentUser, adminSelectedUserId, currentFolderId, searchQuery, typeFilter, bidangFilter]);

  // Separate folders and files
  const folders = filteredItems.filter((i) => i.type === 'folder');
  const files = filteredItems.filter((i) => i.type === 'file');

  const handleOpenFolder = (folderId: string) => {
    setCurrentFolderId(folderId);
    setSearchQuery('');
  };

  const handleNavigateCrumb = (crumbId: string | null) => {
    setCurrentFolderId(crumbId);
    setSearchQuery('');
  };

  const handleCreateFolder = (name: string, bidangCat?: string) => {
    const cat = bidangCat || currentFolder?.bidangCategory || (scope === 'bidang' ? 'Bidang PME' : undefined);
    createFolder(name, currentFolderId, scope, targetOwnerForAdmin, cat);
  };

  const handleUpload = async (fileList: File[], bidangCat?: string) => {
    const cat = bidangCat || currentFolder?.bidangCategory || (scope === 'bidang' ? 'Bidang PME' : undefined);
    await uploadFiles(fileList, currentFolderId, scope, targetOwnerForAdmin, cat);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renameTarget || !newNameInput.trim()) return;
    renameItem(renameTarget.id, newNameInput.trim());
    setRenameTarget(null);
    setNewNameInput('');
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteItem(deleteTarget.id);
    setDeleteTarget(null);
  };

  const getFileIcon = (ext?: string) => {
    const e = ext?.toLowerCase() || '';
    if (['pdf'].includes(e)) return <FileText className="w-5 h-5 text-red-500" />;
    if (['xlsx', 'xls', 'csv'].includes(e)) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />;
    if (['docx', 'doc', 'rtf'].includes(e)) return <FileText className="w-5 h-5 text-blue-600" />;
    if (['pptx', 'ppt'].includes(e)) return <FileText className="w-5 h-5 text-amber-600" />;
    if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(e)) return <ImageIcon className="w-5 h-5 text-purple-500" />;
    if (['zip', 'rar', '7z', 'tar'].includes(e)) return <FileArchive className="w-5 h-5 text-amber-700" />;
    if (['mp4', 'mov', 'avi'].includes(e)) return <Video className="w-5 h-5 text-rose-500" />;
    if (['mp3', 'wav'].includes(e)) return <Music className="w-5 h-5 text-teal-600" />;
    if (['js', 'ts', 'html', 'css', 'json', 'sql'].includes(e)) return <FileCode className="w-5 h-5 text-slate-600" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  // Scope descriptive banners
  const getScopeMeta = () => {
    switch (scope) {
      case 'private':
        return {
          title: 'File Saya (Penyimpanan Cloud Pribadi)',
          desc: 'Ruang penyimpanan terisolasi. Berkas pribadi Anda dijamin aman dan tidak dapat dilihat atau diakses oleh akun user lain.',
          badge: isAdmin ? 'Admin Multi-Akun Otoritas' : 'Pribadi Terenkripsi',
          icon: <FolderLock className="w-5 h-5 text-indigo-600" />,
        };
      case 'public':
        return {
          title: 'Folder Publik Instansi',
          desc: 'Repositori bersama untuk regulasi, SOP, template resmi, dan dokumen umum yang dapat diakses oleh Admin dan User Staff.',
          badge: 'Akses Terbuka Instansi',
          icon: <Share2 className="w-5 h-5 text-blue-600" />,
        };
      case 'bidang':
        return {
          title: 'Menu Bidang & Arsip Kinerja',
          desc: 'Penyimpanan terstruktur dokumen bidang teknis (Bidang PME, Infrastruktur, Tata Ruang, dsb). Akses kolaborasi staf dan bidang.',
          badge: isReadOnly ? 'Wewenang Bidang: Lihat & Unduh Saja' : 'Akses Penuh Kelola',
          icon: <FolderKanban className="w-5 h-5 text-amber-600" />,
        };
    }
  };

  const scopeMeta = getScopeMeta();

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
      {/* Top Header & Breadcrumbs Area */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        {/* Banner for Bidang Role Restriksi */}
        {isReadOnly && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-semibold block text-amber-950">
                Mode Akses User Bidang: Hak Baca &amp; Unduh Saja (Read-Only)
              </strong>
              Sesuai kebijakan keamanan, akun Bidang hanya memiliki wewenang untuk meninjau pratinjau dan mengunduh berkas. Otoritas penambahan folder, unggah dokumen baru, edit nama, dan penghapusan berkas hanya dimiliki oleh User Staff dan Admin.
            </div>
          </div>
        )}

        {/* Admin Multi-Account Drive Switcher */}
        {scope === 'private' && isAdmin && (
          <div className="mb-4 p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <span className="text-xs font-bold text-indigo-950 block">
                  Akses Admin ke Semua Data Akun Pengguna
                </span>
                <span className="text-[11px] text-indigo-700">
                  Sebagai Administrator, Anda memiliki otoritas penuh untuk meninjau dan mengelola drive pribadi semua akun.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                Pilih Ruang Akun:
              </span>
              <select
                value={adminSelectedUserId}
                onChange={(e) => {
                  setAdminSelectedUserId(e.target.value);
                  setCurrentFolderId(null);
                }}
                className="text-xs font-medium bg-white border border-indigo-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              >
                <option value="all">Semua Akun (Tampilkan Seluruh Data User)</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.email}) [{u.role.toUpperCase()}]
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
              {scopeMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  {scopeMeta.title}
                </h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-slate-200 bg-slate-100 text-slate-600 font-mono">
                  {scopeMeta.badge}
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                {scopeMeta.desc}
              </p>
            </div>
          </div>

          {/* Action Buttons: Add Folder & Upload (Disabled/Hidden for User Bidang) */}
          {canUploadAndEdit ? (
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => setIsFolderModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
                title="Buat folder baru di direktori ini"
              >
                <FolderPlus className="w-4 h-4 text-indigo-600" />
                <span>+ Tambah Folder</span>
              </button>

              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
                title="Unggah berkas baru dari komputer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Upload File</span>
              </button>
            </div>
          ) : (
            <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
              Akses Bidang: Wewenang Pratinjau &amp; Unduh Saja
            </div>
          )}
        </div>

        {/* Breadcrumb Navigation Trail */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-xs text-slate-600 overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => handleNavigateCrumb(null)}
            className="flex items-center gap-1 font-medium hover:text-indigo-600 text-slate-700 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Root</span>
          </button>

          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.id || idx}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <button
                onClick={() => handleNavigateCrumb(crumb.id)}
                className={`transition-colors font-medium ${
                  idx === breadcrumbs.length - 1
                    ? 'text-indigo-600 font-semibold'
                    : 'text-slate-600 hover:text-indigo-600'
                }`}
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-4 sm:px-6 py-3 bg-white/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama folder atau nama berkas..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
          />
        </div>

        {/* Filter Badges & View Toggle */}
        <div className="flex items-center gap-2">
          {/* Format Type Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Format:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Tipe</option>
              <option value="folder">Folder Saja</option>
              <option value="document">Dokumen (PDF, Word)</option>
              <option value="spreadsheet">Spreadsheet (Excel)</option>
              <option value="presentation">Presentasi (PPT)</option>
              <option value="image">Gambar</option>
              <option value="archive">Arsip (ZIP/RAR)</option>
            </select>
          </div>

          {/* Bidang Category Filter (when in Bidang scope) */}
          {scope === 'bidang' && (
            <select
              value={bidangFilter}
              onChange={(e) => setBidangFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="all">Semua Bidang</option>
              <option value="Bidang PME">Bidang PME</option>
              <option value="Bidang Infrastruktur">Bidang Infrastruktur</option>
              <option value="Bidang Tata Ruang">Bidang Tata Ruang</option>
            </select>
          )}

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'list' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Tampilan Daftar / Tabel"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Folders & Files */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3 border border-slate-200">
              <Folder className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              Direktori ini belum memiliki berkas
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              {searchQuery
                ? 'Tidak ada item yang cocok dengan pencarian Anda.'
                : isReadOnly
                ? 'Belum ada berkas yang diunggah di dalam folder bidang ini.'
                : 'Mulai dengan menambahkan folder baru atau mengunggah dokumen Anda.'}
            </p>
            {canUploadAndEdit && !searchQuery && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setIsFolderModalOpen(true)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
                >
                  + Tambah Folder
                </button>
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 shadow-xs"
                >
                  Upload File
                </button>
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="space-y-6">
            {/* Folders Section */}
            {folders.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Folder ({folders.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      onClick={() => handleOpenFolder(folder.id)}
                      className="group cursor-pointer bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-3.5 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                          <Folder className="w-5 h-5 fill-indigo-100 text-indigo-600" />
                        </div>

                        {/* Action buttons (only for Admin or User who can modify) */}
                        {canUploadAndEdit && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRenameTarget(folder);
                                setNewNameInput(folder.name);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                              title="Ubah Nama Folder"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTarget(folder);
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                              title="Hapus Folder"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-semibold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors truncate">
                          {folder.name}
                        </div>
                        {folder.bidangCategory && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 mt-1 inline-block">
                            {folder.bidangCategory}
                          </span>
                        )}
                        <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between">
                          <span>{formatDateIndo(folder.updatedAt)}</span>
                          <span className="text-slate-400 text-[10px] truncate max-w-[90px]">{folder.ownerName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {files.length > 0 && (
              <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Berkas &amp; Dokumen ({files.length})
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      onClick={() => setPreviewItem(file)}
                      className="group cursor-pointer bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-3.5 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                          {getFileIcon(file.extension)}
                        </div>

                        {/* Top quick actions */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem(file);
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="Pratinjau Berkas"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Rename & Delete for Admin and User only */}
                          {canUploadAndEdit && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenameTarget(file);
                                  setNewNameInput(file.name);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                                title="Ubah Nama Berkas"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(file);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                title="Hapus Berkas"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <div>
                        <div className="font-semibold text-slate-900 text-xs truncate group-hover:text-indigo-600 transition-colors" title={file.name}>
                          {file.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-1 flex items-center justify-between">
                          <span>{formatBytes(file.size)}</span>
                          <span className="uppercase text-[10px] text-slate-400">{file.extension || 'FILE'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span className="truncate max-w-[100px]">{file.ownerName}</span>
                          <span>{formatDateIndo(file.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Table List View */
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Nama Berkas / Folder</th>
                    <th className="py-2.5 px-4 font-semibold">Kategori / Ruang</th>
                    <th className="py-2.5 px-4 font-semibold">Pemilik Akun</th>
                    <th className="py-2.5 px-4 font-semibold">Ukuran</th>
                    <th className="py-2.5 px-4 font-semibold">Tanggal Modifikasi</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        if (item.type === 'folder') {
                          handleOpenFolder(item.id);
                        } else {
                          setPreviewItem(item);
                        }
                      }}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {item.type === 'folder' ? (
                            <Folder className="w-4 h-4 text-indigo-500 fill-indigo-100 shrink-0" />
                          ) : (
                            getFileIcon(item.extension)
                          )}
                          <span className="font-medium text-slate-900 truncate max-w-xs">
                            {item.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-[11px] text-slate-600 capitalize">
                          {item.scope === 'bidang' ? (item.bidangCategory || 'Menu Bidang') : item.scope}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="text-slate-600 truncate block max-w-[140px]">
                          {item.ownerName}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">
                        {item.type === 'folder' ? '—' : formatBytes(item.size)}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 text-[11px]">
                        {formatDateIndo(item.updatedAt)}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => {
                              if (item.type === 'folder') {
                                handleOpenFolder(item.id);
                              } else {
                                setPreviewItem(item);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                            title="Buka / Pratinjau"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {canUploadAndEdit && (
                            <>
                              <button
                                onClick={() => {
                                  setRenameTarget(item);
                                  setNewNameInput(item.name);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100"
                                title="Ubah Nama"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(item)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                                title="Hapus"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* RENAME MODAL */}
      {renameTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <span className="text-xs font-bold text-slate-900">Ubah Nama Berkas / Folder</span>
              <button
                onClick={() => setRenameTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleRenameSubmit} className="p-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nama Baru
              </label>
              <input
                type="text"
                autoFocus
                value={newNameInput}
                onChange={(e) => setNewNameInput(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameTarget(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 p-5">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-sm mb-1">
              Hapus {deleteTarget.type === 'folder' ? 'Folder' : 'Berkas'}?
            </h3>
            <p className="text-center text-xs text-slate-500 mb-4">
              Yakin ingin menghapus <strong>"{deleteTarget.name}"</strong>?
              {deleteTarget.type === 'folder' && ' Seluruh berkas di dalam folder ini juga akan terhapus.'}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-sm"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW FOLDER MODAL */}
      <NewFolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        scope={scope}
        targetOwner={targetOwnerForAdmin}
        onCreate={handleCreateFolder}
      />

      {/* UPLOAD MODAL */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        scope={scope}
        targetOwner={targetOwnerForAdmin}
        onUpload={handleUpload}
      />

      {/* PREVIEW & DOWNLOAD MODAL */}
      <FilePreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />
    </div>
  );
};

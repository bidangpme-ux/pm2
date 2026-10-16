import React, { createContext, useContext, useState, useEffect } from 'react';
import { StorageItem, SuratItem, StorageScope, User, IKUItem, PeriodeRPJMD, TujuanSasaranItem } from '../types';
import { StorageService, getUserAccountFolder } from '../services/storageService';
import { NextcloudService, NextcloudConfig } from '../services/nextcloudService';
import { AuditLogService } from '../services/auditLogService';
import { useAuth } from './AuthContext';

interface StorageContextType {
  items: StorageItem[];
  suratList: SuratItem[];
  ikuList: IKUItem[];
  // Tujuan & Sasaran RPJMD 5 Tahunan
  tujuanSasaranList: TujuanSasaranItem[];
  periodeList: PeriodeRPJMD[];
  activePeriode: PeriodeRPJMD;
  setActivePeriode: (periode: PeriodeRPJMD) => void;
  addTujuanSasaran: (data: Omit<TujuanSasaranItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTujuanSasaran: (id: string, updates: Partial<TujuanSasaranItem>) => Promise<boolean>;
  deleteTujuanSasaran: (id: string) => Promise<boolean>;
  addPeriode: (data: Omit<PeriodeRPJMD, 'id' | 'createdAt'>) => Promise<boolean>;
  updatePeriode: (id: string, updates: Partial<PeriodeRPJMD>) => Promise<boolean>;
  deletePeriode: (id: string) => Promise<boolean>;
  nextcloudConfig: NextcloudConfig;
  updateNextcloudConfig: (config: NextcloudConfig) => void;
  syncFromNextcloud: () => Promise<{ success: boolean; message: string; count?: number }>;
  pushToNextcloud: () => Promise<{ success: boolean; message: string }>;
  isSyncing: boolean;
  createFolder: (
    name: string,
    parentId: string | null,
    scope: StorageScope,
    targetOwner?: User,
    bidangCategory?: string
  ) => Promise<{ success: boolean; message?: string }>;
  uploadFiles: (
    files: File[],
    parentId: string | null,
    scope: StorageScope,
    targetOwner?: User,
    bidangCategory?: string
  ) => Promise<{ success: boolean; count: number }>;
  deleteItem: (id: string) => Promise<boolean>;
  renameItem: (id: string, newName: string) => boolean;
  toggleStar: (id: string) => void;
  // Surat operations
  addSurat: (
    data: Omit<SuratItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'creatorName'>,
    file?: File | null
  ) => Promise<boolean>;
  updateSurat: (id: string, updates: Partial<SuratItem>, file?: File | null) => Promise<boolean>;
  deleteSurat: (id: string) => Promise<boolean>;
  // IKU (Indikator Kinerja Utama) operations
  addIKU: (data: Omit<IKUItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateIKU: (id: string, updates: Partial<IKUItem>) => Promise<boolean>;
  deleteIKU: (id: string) => Promise<boolean>;
  updateVisi: (tahun: number, newVisi: string) => Promise<boolean>;
  deleteVisi: (tahun: number) => Promise<boolean>;
  // Quota & counts
  getStorageUsage: (userId?: string) => { usedBytes: number; totalBytes: number; fileCount: number; isNextcloudSynced?: boolean };
  refreshNextcloudQuota: () => Promise<{ success: boolean; totalBytes?: number; usedBytes?: number; message?: string }>;
  resetAllData: () => void;
}


const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<StorageItem[]>(() => StorageService.getItems());
  const [suratList, setSuratList] = useState<SuratItem[]>(() => StorageService.getSuratList());
  const [ikuList, setIKUList] = useState<IKUItem[]>(() => StorageService.getIKUList());
  const [periodeList, setPeriodeList] = useState<PeriodeRPJMD[]>(() => StorageService.getPeriodeList());
  const [activePeriode, setActivePeriode] = useState<PeriodeRPJMD>(() => {
    const list = StorageService.getPeriodeList();
    return list.find((p) => p.isAktif) || list[0];
  });
  const [tujuanSasaranList, setTujuanSasaranList] = useState<TujuanSasaranItem[]>(() =>
    StorageService.getTujuanSasaranList()
  );
  const [nextcloudConfig, setNextcloudConfig] = useState<NextcloudConfig>(() =>
    NextcloudService.getConfig()
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const { currentUser, isAdmin, canModifyBidang } = useAuth();

  useEffect(() => {
    StorageService.saveItems(items);
  }, [items]);

  useEffect(() => {
    StorageService.saveSuratList(suratList);
  }, [suratList]);

  useEffect(() => {
    StorageService.saveIKUList(ikuList);
  }, [ikuList]);

  useEffect(() => {
    StorageService.savePeriodeList(periodeList);
  }, [periodeList]);

  useEffect(() => {
    StorageService.saveTujuanSasaranList(tujuanSasaranList);
  }, [tujuanSasaranList]);


  const updateNextcloudConfig = (cfg: NextcloudConfig) => {
    setNextcloudConfig(cfg);
    NextcloudService.saveConfig(cfg);
  };

  // Helper to get Nextcloud directory path for an item
  // Ensures private files are stored strictly in ArsipCloud/File_Saya/[nama_akun]/
  // for easy per-user identification and direct backup via Nextcloud.
  const getNextcloudFolderPath = (
    scope: StorageScope,
    owner?: User | { name?: string; username?: string; email?: string } | string,
    bidangCat?: string
  ) => {
    if (scope === 'public') return 'ArsipCloud/Folder_Publik';
    if (scope === 'bidang') return `ArsipCloud/Menu_Bidang/${bidangCat || 'Bidang PME'}`;

    let accountName = 'umum';
    if (owner && typeof owner === 'object') {
      accountName = getUserAccountFolder(owner);
    } else if (typeof owner === 'string') {
      const allUsers = StorageService.getUsers();
      const matched = allUsers.find(
        (u) => u.id === owner || u.email === owner || u.username === owner || u.name === owner
      );
      if (matched) {
        accountName = getUserAccountFolder(matched);
      } else {
        accountName = owner.includes('@')
          ? owner.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_')
          : owner.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
      }
    }
    return `ArsipCloud/File_Saya/${accountName}`;
  };

  // Create folder
  const createFolder = async (
    name: string,
    parentId: string | null,
    scope: StorageScope,
    targetOwner?: User,
    bidangCategory?: string
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmed = name.trim();
    if (!trimmed) {
      return { success: false, message: 'Nama folder tidak boleh kosong.' };
    }

    if (!currentUser) {
      return { success: false, message: 'Harap login terlebih dahulu.' };
    }

    // Role verification
    if (scope === 'bidang' && !canModifyBidang) {
      return { success: false, message: 'User bidang hanya memiliki akses baca dan unduh.' };
    }

    if (scope === 'public' && currentUser.role === 'bidang') {
      return { success: false, message: 'User bidang tidak diizinkan mengakses folder publik.' };
    }

    const owner = targetOwner && isAdmin ? targetOwner : currentUser;

    const newFolder: StorageItem = {
      id: `folder_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: trimmed,
      type: 'folder',
      size: 0,
      parentId,
      scope,
      ownerId: owner.id,
      ownerName: owner.name,
      ownerEmail: owner.email,
      bidangCategory: bidangCategory || (scope === 'bidang' ? 'Bidang PME' : undefined),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems((prev) => [newFolder, ...prev]);

    // If Nextcloud integration is active, create on Nextcloud WebDAV
    if (nextcloudConfig.isEnabled && nextcloudConfig.serverUrl) {
      try {
        const ncBase = getNextcloudFolderPath(scope, owner, newFolder.bidangCategory);
        await NextcloudService.createFolder(
          nextcloudConfig.serverUrl,
          nextcloudConfig.username,
          nextcloudConfig.appPassword,
          `${ncBase}/${newFolder.name}`
        );
      } catch (err) {
        console.warn('Nextcloud folder sync warning:', err);
      }
    }

    if (currentUser) {
      AuditLogService.logFile({
        action: 'FOLDER_CREATE',
        user: currentUser,
        fileName: newFolder.name,
        scope,
        status: 'success',
      });
    }

    return { success: true };
  };

  // Upload files
  const uploadFiles = async (
    files: File[],
    parentId: string | null,
    scope: StorageScope,
    targetOwner?: User,
    bidangCategory?: string
  ): Promise<{ success: boolean; count: number }> => {
    if (!currentUser || files.length === 0) {
      return { success: false, count: 0 };
    }

    if (scope === 'bidang' && !canModifyBidang) {
      return { success: false, count: 0 };
    }

    const owner = targetOwner && isAdmin ? targetOwner : currentUser;

    const readAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve) => {
        if (file.size <= 20 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        } else {
          resolve('');
        }
      });
    };

    const newItems: StorageItem[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let dataUrl = '';
      try {
        dataUrl = await readAsDataURL(file);
      } catch (err) {
        console.error('Error reading file', err);
      }

      const item: StorageItem = {
        id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: 'file',
        extension: ext,
        size: file.size,
        mimeType: file.type || 'application/octet-stream',
        parentId,
        scope,
        ownerId: owner.id,
        ownerName: owner.name,
        ownerEmail: owner.email,
        bidangCategory: bidangCategory || (scope === 'bidang' ? 'Bidang PME' : undefined),
        dataUrl: dataUrl || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      newItems.push(item);

      // If Nextcloud integration is active, upload to Nextcloud WebDAV
      if (nextcloudConfig.isEnabled && nextcloudConfig.serverUrl && dataUrl) {
        try {
          const ncFolder = getNextcloudFolderPath(scope, owner, item.bidangCategory);
          await NextcloudService.uploadFile(
            nextcloudConfig.serverUrl,
            nextcloudConfig.username,
            nextcloudConfig.appPassword,
            `${ncFolder}/${item.name}`,
            dataUrl,
            item.mimeType
          );
        } catch (err) {
          console.warn('Nextcloud file sync warning:', err);
        }
      }
    }

    setItems((prev) => [...newItems, ...prev]);

    if (currentUser) {
      newItems.forEach((item) => {
        AuditLogService.logFile({
          action: 'FILE_UPLOAD',
          user: currentUser,
          fileName: item.name,
          scope: item.scope,
          fileSize: item.size,
          status: 'success',
        });
      });
    }

    return { success: true, count: newItems.length };
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    if (!currentUser) return false;

    const targetItem = items.find((i) => i.id === id);

    // Find all item IDs to delete (recursively if folder)
    const toDeleteIds = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      for (const item of items) {
        if (item.parentId && toDeleteIds.has(item.parentId) && !toDeleteIds.has(item.id)) {
          toDeleteIds.add(item.id);
          added = true;
        }
      }
    }

    setItems((prev) => prev.filter((item) => !toDeleteIds.has(item.id)));

    if (currentUser && targetItem) {
      AuditLogService.logFile({
        action: 'FILE_DELETE',
        user: currentUser,
        fileName: targetItem.name,
        scope: targetItem.scope,
        status: 'warning',
      });
    }

    // Nextcloud deletion
    if (nextcloudConfig.isEnabled && targetItem && nextcloudConfig.serverUrl) {
      try {
        const ncFolder = getNextcloudFolderPath(
          targetItem.scope,
          targetItem.ownerId || targetItem.ownerEmail,
          targetItem.bidangCategory
        );
        await NextcloudService.deleteItem(
          nextcloudConfig.serverUrl,
          nextcloudConfig.username,
          nextcloudConfig.appPassword,
          `${ncFolder}/${targetItem.name}`
        );
      } catch (err) {
        console.warn('Nextcloud delete warning:', err);
      }
    }

    return true;
  };

  const renameItem = (id: string, newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed) return false;

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, name: trimmed, updatedAt: new Date().toISOString() } : item
      )
    );
    return true;
  };

  const toggleStar = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, starred: !item.starred } : item))
    );
  };

  // Surat Operations
  const addSurat = async (
    data: Omit<SuratItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'creatorName'>,
    file?: File | null
  ): Promise<boolean> => {
    if (!currentUser) return false;

    let fileUrl: string | undefined = undefined;
    let fileName = data.fileName;
    let fileSize = data.fileSize;
    let fileExtension = data.fileExtension;

    if (file) {
      fileName = file.name;
      fileSize = file.size;
      fileExtension = file.name.split('.').pop()?.toLowerCase();
      try {
        fileUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch {
        fileUrl = undefined;
      }
    }

    const newSurat: SuratItem = {
      ...data,
      id: `surat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fileName,
      fileSize,
      fileExtension,
      fileUrl,
      createdBy: currentUser.id,
      creatorName: currentUser.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const nextSuratList = [newSurat, ...suratList];
    setSuratList(nextSuratList);

    AuditLogService.logSurat({
      action: 'SURAT_INPUT',
      user: currentUser,
      nomorSurat: newSurat.nomorSurat,
      perihal: newSurat.perihal,
      status: 'success',
    });

    // Sync surat database and attachment to Nextcloud
    if (nextcloudConfig.isEnabled && nextcloudConfig.serverUrl) {
      try {
        await NextcloudService.syncSuratDatabase(
          nextcloudConfig.serverUrl,
          nextcloudConfig.username,
          nextcloudConfig.appPassword,
          'save',
          nextSuratList
        );
        if (file && fileUrl) {
          await NextcloudService.uploadFile(
            nextcloudConfig.serverUrl,
            nextcloudConfig.username,
            nextcloudConfig.appPassword,
            `ArsipCloud/Manajemen_Surat/${fileName}`,
            fileUrl,
            file.type
          );
        }
      } catch (err) {
        console.warn('Nextcloud surat sync warning:', err);
      }
    }

    return true;
  };

  const updateSurat = async (
    id: string,
    updates: Partial<SuratItem>,
    file?: File | null
  ): Promise<boolean> => {
    let fileUrl = updates.fileUrl;
    let fileName = updates.fileName;
    let fileSize = updates.fileSize;
    let fileExtension = updates.fileExtension;

    if (file) {
      fileName = file.name;
      fileSize = file.size;
      fileExtension = file.name.split('.').pop()?.toLowerCase();
      try {
        fileUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } catch {
        fileUrl = undefined;
      }
    }

    const nextSuratList = suratList.map((s) => {
      if (s.id !== id) return s;
      return {
        ...s,
        ...updates,
        ...(file ? { fileName, fileSize, fileExtension, fileUrl } : {}),
        updatedAt: new Date().toISOString(),
      };
    });

    setSuratList(nextSuratList);

    if (currentUser) {
      const targetSurat = suratList.find((s) => s.id === id);
      AuditLogService.logSurat({
        action: 'SURAT_UPDATE',
        user: currentUser,
        nomorSurat: targetSurat?.nomorSurat,
        perihal: targetSurat?.perihal,
        status: 'success',
      });
    }

    if (nextcloudConfig.isEnabled && nextcloudConfig.serverUrl) {
      try {
        await NextcloudService.syncSuratDatabase(
          nextcloudConfig.serverUrl,
          nextcloudConfig.username,
          nextcloudConfig.appPassword,
          'save',
          nextSuratList
        );
      } catch (err) {
        console.warn('Nextcloud surat update warning:', err);
      }
    }

    return true;
  };

  const deleteSurat = async (id: string): Promise<boolean> => {
    const targetSurat = suratList.find((s) => s.id === id);
    const nextSuratList = suratList.filter((s) => s.id !== id);
    setSuratList(nextSuratList);

    if (currentUser && targetSurat) {
      AuditLogService.logSurat({
        action: 'SURAT_DELETE',
        user: currentUser,
        nomorSurat: targetSurat.nomorSurat,
        perihal: targetSurat.perihal,
        status: 'warning',
      });
    }

    if (nextcloudConfig.isEnabled && nextcloudConfig.serverUrl) {
      try {
        await NextcloudService.syncSuratDatabase(
          nextcloudConfig.serverUrl,
          nextcloudConfig.username,
          nextcloudConfig.appPassword,
          'save',
          nextSuratList
        );
      } catch (err) {
        console.warn('Nextcloud delete surat warning:', err);
      }
    }

    return true;
  };

  // Sync from Nextcloud: Reads real files and surat database from Nextcloud server!
  const syncFromNextcloud = async (): Promise<{ success: boolean; message: string; count?: number }> => {
    if (!nextcloudConfig.serverUrl || !nextcloudConfig.username || !nextcloudConfig.appPassword) {
      return { success: false, message: 'Konfigurasi Nextcloud belum diatur.' };
    }

    setIsSyncing(true);
    try {
      // 1. Fetch Surat database from Nextcloud
      const suratDbRes = await NextcloudService.syncSuratDatabase(
        nextcloudConfig.serverUrl,
        nextcloudConfig.username,
        nextcloudConfig.appPassword,
        'get'
      );

      if (suratDbRes.success && Array.isArray(suratDbRes.data) && suratDbRes.data.length > 0) {
        setSuratList(suratDbRes.data);
      }

      // 2. Fetch public files
      const pubRes = await NextcloudService.listFolder(
        nextcloudConfig.serverUrl,
        nextcloudConfig.username,
        nextcloudConfig.appPassword,
        'ArsipCloud/Folder_Publik'
      );

      // 3. Fetch bidang files
      const bidangRes = await NextcloudService.listFolder(
        nextcloudConfig.serverUrl,
        nextcloudConfig.username,
        nextcloudConfig.appPassword,
        'ArsipCloud/Menu_Bidang'
      );

      // Convert Nextcloud WebDAV items to StorageItems
      const pulledItems: StorageItem[] = [];

      if (pubRes.success && Array.isArray(pubRes.items)) {
        for (const item of pubRes.items) {
          pulledItems.push({
            id: `nc_pub_${encodeURIComponent(item.name)}`,
            name: item.name,
            type: item.isFolder ? 'folder' : 'file',
            extension: item.name.split('.').pop()?.toLowerCase(),
            size: item.size,
            mimeType: item.mimeType,
            parentId: null,
            scope: 'public',
            ownerId: 'nextcloud',
            ownerName: 'Nextcloud Storage',
            ownerEmail: nextcloudConfig.username,
            createdAt: item.lastModified,
            updatedAt: item.lastModified,
          });
        }
      }

      if (bidangRes.success && Array.isArray(bidangRes.items)) {
        for (const item of bidangRes.items) {
          pulledItems.push({
            id: `nc_bidang_${encodeURIComponent(item.name)}`,
            name: item.name,
            type: item.isFolder ? 'folder' : 'file',
            extension: item.name.split('.').pop()?.toLowerCase(),
            size: item.size,
            mimeType: item.mimeType,
            parentId: null,
            scope: 'bidang',
            ownerId: 'nextcloud',
            ownerName: 'Nextcloud Bidang',
            ownerEmail: nextcloudConfig.username,
            bidangCategory: 'Bidang PME',
            createdAt: item.lastModified,
            updatedAt: item.lastModified,
          });
        }
      }

      // 4. Fetch private files for each user from isolated account folders
      const allRegisteredUsers = StorageService.getUsers();
      for (const u of allRegisteredUsers) {
        const uFolder = getUserAccountFolder(u);
        try {
          const userRes = await NextcloudService.listFolder(
            nextcloudConfig.serverUrl,
            nextcloudConfig.username,
            nextcloudConfig.appPassword,
            `ArsipCloud/File_Saya/${uFolder}`
          );
          if (userRes.success && Array.isArray(userRes.items)) {
            for (const item of userRes.items) {
              pulledItems.push({
                id: `nc_priv_${uFolder}_${encodeURIComponent(item.name)}`,
                name: item.name,
                type: item.isFolder ? 'folder' : 'file',
                extension: item.name.split('.').pop()?.toLowerCase(),
                size: item.size,
                mimeType: item.mimeType,
                parentId: null,
                scope: 'private',
                ownerId: u.id,
                ownerName: u.name,
                ownerEmail: u.email,
                createdAt: item.lastModified,
                updatedAt: item.lastModified,
              });
            }
          }
        } catch {
          // ignore if folder not yet created
        }
      }

      if (pulledItems.length > 0) {
        // Merge or replace items with Nextcloud real data
        setItems((prev) => {
          const nonNcItems = prev.filter((i) => !i.id.startsWith('nc_'));
          return [...pulledItems, ...nonNcItems];
        });
      }

      const now = new Date().toLocaleTimeString('id-ID');
      updateNextcloudConfig({
        ...nextcloudConfig,
        lastSyncTime: now,
      });

      return {
        success: true,
        message: `Sinkronisasi berhasil! Berkas pribadi ${allRegisteredUsers.length} akun user dan database surat telah tersinkron dari Nextcloud.`,
        count: pulledItems.length,
      };
    } catch (err: any) {
      return { success: false, message: `Gagal sinkronisasi: ${err?.message || err}` };
    } finally {
      setIsSyncing(false);
    }
  };

  // Push local data into Nextcloud
  const pushToNextcloud = async (): Promise<{ success: boolean; message: string }> => {
    if (!nextcloudConfig.serverUrl) {
      return { success: false, message: 'Server URL belum dikonfigurasi.' };
    }

    setIsSyncing(true);
    try {
      // 1. Initialize folders with all registered user account folders
      const allRegisteredUsers = StorageService.getUsers();
      const userAccounts = allRegisteredUsers.map((u) => getUserAccountFolder(u));
      await NextcloudService.initFolderStructure(
        nextcloudConfig.serverUrl,
        nextcloudConfig.username,
        nextcloudConfig.appPassword,
        userAccounts
      );

      // 2. Save Surat Database
      await NextcloudService.syncSuratDatabase(
        nextcloudConfig.serverUrl,
        nextcloudConfig.username,
        nextcloudConfig.appPassword,
        'save',
        suratList
      );

      // 3. Upload local files into Nextcloud separated per user folder
      let uploadedCount = 0;
      for (const item of items) {
        if (item.type === 'file' && item.dataUrl) {
          const ncFolder = getNextcloudFolderPath(
            item.scope,
            item.ownerId || item.ownerEmail,
            item.bidangCategory
          );
          try {
            await NextcloudService.uploadFile(
              nextcloudConfig.serverUrl,
              nextcloudConfig.username,
              nextcloudConfig.appPassword,
              `${ncFolder}/${item.name}`,
              item.dataUrl,
              item.mimeType
            );
            uploadedCount++;
          } catch (uploadErr) {
            console.warn('Error pushing item to Nextcloud', item.name, uploadErr);
          }
        }
      }

      return {
        success: true,
        message: `Struktur folder (${userAccounts.length} akun) dan ${uploadedCount} berkas telah tersimpan rapi di Nextcloud.`,
      };
    } catch (err: any) {
      return { success: false, message: `Gagal mengirim ke Nextcloud: ${err?.message || err}` };
    } finally {
      setIsSyncing(false);
    }
  };

  // Refresh real disk quota from Nextcloud
  const refreshNextcloudQuota = async (): Promise<{ success: boolean; totalBytes?: number; usedBytes?: number; message?: string }> => {
    if (!nextcloudConfig.serverUrl || !nextcloudConfig.username || !nextcloudConfig.appPassword) {
      return { success: false, message: 'Kredensial Nextcloud belum diatur.' };
    }

    try {
      const res = await NextcloudService.getQuota(
        nextcloudConfig.serverUrl,
        nextcloudConfig.username,
        nextcloudConfig.appPassword
      );

      if (res.success && res.quota) {
        const updatedConfig: NextcloudConfig = {
          ...nextcloudConfig,
          diskTotalBytes: res.quota.totalBytes,
          diskUsedBytes: res.quota.usedBytes,
          diskFreeBytes: res.quota.freeBytes,
        };
        updateNextcloudConfig(updatedConfig);
        return {
          success: true,
          totalBytes: res.quota.totalBytes,
          usedBytes: res.quota.usedBytes,
          message: 'Ukuran disk Nextcloud berhasil disesuaikan!',
        };
      }
      return { success: false, message: 'Gagal mengambil informasi kuota disk Nextcloud.' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error saat menghubungi Nextcloud' };
    }
  };

  const getStorageUsage = (userId?: string) => {
    let relevantItems = items;
    if (userId) {
      relevantItems = items.filter((item) => item.ownerId === userId && item.scope === 'private');
    }
    const localUsedBytes = relevantItems
      .filter((i) => i.type === 'file')
      .reduce((acc, curr) => acc + (curr.size || 0), 0);

    // Calculate total disk capacity based on real Nextcloud server disk or configured disk size
    let totalBytes = 500 * 1024 * 1024 * 1024; // Default fallback: 500 GB
    if (nextcloudConfig.diskTotalBytes && nextcloudConfig.diskTotalBytes > 0) {
      totalBytes = nextcloudConfig.diskTotalBytes;
    } else if (nextcloudConfig.customDiskCapacityGB && nextcloudConfig.customDiskCapacityGB > 0) {
      totalBytes = nextcloudConfig.customDiskCapacityGB * 1024 * 1024 * 1024;
    }

    // For Global Capacity (Admin view / whole agency):
    // If Nextcloud reports real used bytes, reflect the real Nextcloud disk usage
    let usedBytes = localUsedBytes;
    if (!userId && nextcloudConfig.isEnabled && nextcloudConfig.diskUsedBytes !== undefined && nextcloudConfig.diskUsedBytes > 0) {
      usedBytes = Math.max(localUsedBytes, nextcloudConfig.diskUsedBytes);
    }

    const fileCount = relevantItems.filter((i) => i.type === 'file').length;

    return { 
      usedBytes, 
      totalBytes, 
      fileCount,
      isNextcloudSynced: nextcloudConfig.isEnabled && Boolean(nextcloudConfig.diskTotalBytes)
    };
  };

  const addIKU = async (data: Omit<IKUItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    const newItem: IKUItem = {
      ...data,
      id: `iku_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setIKUList((prev) => [newItem, ...prev]);
    return true;
  };

  const updateIKU = async (id: string, updates: Partial<IKUItem>): Promise<boolean> => {
    setIKUList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
    return true;
  };

  const deleteIKU = async (id: string): Promise<boolean> => {
    setIKUList((prev) => prev.filter((item) => item.id !== id));
    return true;
  };

  const updateVisi = async (tahun: number, newVisi: string): Promise<boolean> => {
    setIKUList((prev) =>
      prev.map((item) =>
        item.tahun === tahun ? { ...item, visi: newVisi, updatedAt: new Date().toISOString() } : item
      )
    );
    return true;
  };

  const deleteVisi = async (tahun: number): Promise<boolean> => {
    setIKUList((prev) =>
      prev.map((item) =>
        item.tahun === tahun ? { ...item, visi: 'Belum Ditentukan (Visi Dihapus)', updatedAt: new Date().toISOString() } : item
      )
    );
    return true;
  };

  // Tujuan & Sasaran CRUD
  const addTujuanSasaran = async (
    data: Omit<TujuanSasaranItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    const newItem: TujuanSasaranItem = {
      ...data,
      id: `ts_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTujuanSasaranList((prev) => [newItem, ...prev]);
    return true;
  };

  const updateTujuanSasaran = async (
    id: string,
    updates: Partial<TujuanSasaranItem>
  ): Promise<boolean> => {
    setTujuanSasaranList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      )
    );
    return true;
  };

  const deleteTujuanSasaran = async (id: string): Promise<boolean> => {
    setTujuanSasaranList((prev) => prev.filter((item) => item.id !== id));
    return true;
  };

  // Periode RPJMD CRUD
  const addPeriode = async (data: Omit<PeriodeRPJMD, 'id' | 'createdAt'>): Promise<boolean> => {
    const newPeriode: PeriodeRPJMD = {
      ...data,
      id: `periode_${data.tahunMulai}_${data.tahunSelesai}_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    if (newPeriode.isAktif) {
      setPeriodeList((prev) => [newPeriode, ...prev.map((p) => ({ ...p, isAktif: false }))]);
      setActivePeriode(newPeriode);
    } else {
      setPeriodeList((prev) => [newPeriode, ...prev]);
    }
    return true;
  };

  const updatePeriode = async (id: string, updates: Partial<PeriodeRPJMD>): Promise<boolean> => {
    setPeriodeList((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updates };
          if (activePeriode.id === id) setActivePeriode(updated);
          return updated;
        }
        if (updates.isAktif) {
          return { ...p, isAktif: false };
        }
        return p;
      })
    );
    return true;
  };

  const deletePeriode = async (id: string): Promise<boolean> => {
    if (periodeList.length <= 1) {
      throw new Error('Minimal harus ada satu periode RPJMD dalam sistem.');
    }
    const remaining = periodeList.filter((p) => p.id !== id);
    setPeriodeList(remaining);
    if (activePeriode.id === id) {
      setActivePeriode(remaining[0]);
    }
    return true;
  };

  const resetAllData = () => {
    StorageService.resetToDefault();
    setItems(StorageService.getItems());
    setSuratList(StorageService.getSuratList());
    setIKUList(StorageService.getIKUList());
    const restoredPeriodes = StorageService.getPeriodeList();
    setPeriodeList(restoredPeriodes);
    setTujuanSasaranList(StorageService.getTujuanSasaranList());
    setActivePeriode(restoredPeriodes.find((p) => p.isAktif) || restoredPeriodes[0]);
  };

  return (
    <StorageContext.Provider
      value={{
        items,
        suratList,
        ikuList,
        tujuanSasaranList,
        periodeList,
        activePeriode,
        setActivePeriode,
        addTujuanSasaran,
        updateTujuanSasaran,
        deleteTujuanSasaran,
        addPeriode,
        updatePeriode,
        deletePeriode,
        nextcloudConfig,
        updateNextcloudConfig,
        syncFromNextcloud,
        pushToNextcloud,
        isSyncing,
        createFolder,
        uploadFiles,
        deleteItem,
        renameItem,
        toggleStar,
        addSurat,
        updateSurat,
        deleteSurat,
        addIKU,
        updateIKU,
        deleteIKU,
        updateVisi,
        deleteVisi,
        getStorageUsage,
        refreshNextcloudQuota,
        resetAllData,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
};

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}

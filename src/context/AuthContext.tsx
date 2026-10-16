import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { StorageService, getUserAccountFolder } from '../services/storageService';
import { NextcloudService } from '../services/nextcloudService';
import { AuditLogService } from '../services/auditLogService';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (identifier: string, password?: string) => { success: boolean; message?: string };
  loginAs: (user: User) => void;
  logout: () => void;
  register: (name: string, email: string, role: UserRole, department: string) => { success: boolean; message?: string };
  updateUserRole: (userId: string, newRole: UserRole) => void;
  addUser: (userData: {
    name: string;
    email: string;
    username?: string;
    password?: string;
    role: UserRole;
    department?: string;
  }) => { success: boolean; message?: string; user?: User };
  editUser: (
    userId: string,
    updates: Partial<{
      name: string;
      email: string;
      username?: string;
      password?: string;
      role: UserRole;
      department?: string;
      canManageIKU?: boolean;
    }>
  ) => { success: boolean; message?: string };
  deleteUser: (userId: string) => { success: boolean; message?: string };
  isAdmin: boolean;
  isStandardUser: boolean;
  isBidang: boolean;
  canAccessPublic: boolean;
  canAccessSurat: boolean;
  canModifyBidang: boolean;
  canEditProfile: boolean;
  canManageIKU: boolean;
  setUserIKUAccess: (userId: string, allowed: boolean) => void;
  updateOwnProfile: (updates: {
    name?: string;
    email?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    department?: string;
  }) => { success: boolean; message?: string };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());

  useEffect(() => {
    StorageService.saveUsers(users);
  }, [users]);

  useEffect(() => {
    StorageService.setCurrentUser(currentUser);
  }, [currentUser]);

  const login = (identifier: string, password?: string): { success: boolean; message?: string } => {
    const trimmed = identifier.trim().toLowerCase();
    const found = users.find((u) => {
      const emailMatch = u.email.toLowerCase() === trimmed;
      const usernameMatch = u.username && u.username.toLowerCase() === trimmed;
      const adminAlias = trimmed === 'admin' && (u.role === 'admin' || u.id === 'user_admin');
      return emailMatch || usernameMatch || adminAlias;
    });

    if (!found) {
      AuditLogService.logAuth({
        action: 'LOGIN_FAILED',
        attemptName: identifier,
        description: `Percobaan login gagal: Identitas akun "${identifier}" tidak ditemukan dalam sistem.`,
        status: 'danger',
        metadata: { identifier },
      });
      return {
        success: false,
        message: 'Akun dengan username atau email tersebut tidak ditemukan. Silakan periksa kembali kredensial Anda.',
      };
    }

    if (found.password && password !== undefined) {
      if (found.password !== password) {
        AuditLogService.logAuth({
          action: 'LOGIN_FAILED',
          user: found,
          description: `Percobaan login gagal untuk akun "${found.name}": Kata sandi salah.`,
          status: 'danger',
          metadata: { username: found.username || found.email },
        });
        return {
          success: false,
          message: 'Kata sandi tidak sesuai. Silakan gunakan password yang benar.',
        };
      }
    }

    setCurrentUser(found);
    AuditLogService.logAuth({
      action: 'LOGIN_SUCCESS',
      user: found,
      description: `Pengguna "${found.name}" (${found.role.toUpperCase()}) berhasil login ke sistem.`,
      status: 'success',
    });
    return { success: true };
  };

  const loginAs = (user: User) => {
    // Refresh user state from users list in case role changed
    const freshUser = users.find((u) => u.id === user.id) || user;
    setCurrentUser(freshUser);
    AuditLogService.logAuth({
      action: 'LOGIN_SUCCESS',
      user: freshUser,
      description: `Beralih sesi login sebagai "${freshUser.name}".`,
      status: 'success',
    });
  };

  const logout = () => {
    if (currentUser) {
      AuditLogService.logAuth({
        action: 'LOGOUT',
        user: currentUser,
        description: `Pengguna "${currentUser.name}" keluar (logout) dari sistem.`,
        status: 'success',
      });
    }
    setCurrentUser(null);
  };

  const register = (
    name: string,
    email: string,
    role: UserRole,
    department: string
  ): { success: boolean; message?: string } => {
    return addUser({ name, email, role, department });
  };

  const addUser = (userData: {
    name: string;
    email: string;
    username?: string;
    password?: string;
    role: UserRole;
    department?: string;
  }): { success: boolean; message?: string; user?: User } => {
    const trimmedEmail = userData.email.trim().toLowerCase();
    const cleanUsername = userData.username ? userData.username.trim().replace(/^@+/, '').toLowerCase() : '';

    if (users.some((u) => u.email.toLowerCase() === trimmedEmail)) {
      return { success: false, message: 'Email sudah terdaftar dalam sistem.' };
    }

    if (cleanUsername && users.some((u) => u.username && u.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: 'Username sudah digunakan oleh akun lain.' };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name.trim(),
      email: trimmedEmail,
      username: cleanUsername || undefined,
      password: userData.password?.trim() || '123456',
      role: userData.role,
      department: (userData.department || 'Umum').trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    setUsers(updated);

    // Otomatis buat folder pribadi akun baru di Nextcloud WebDAV jika Nextcloud aktif
    try {
      const ncConfig = NextcloudService.getConfig();
      if (ncConfig.isEnabled && ncConfig.serverUrl && ncConfig.username && ncConfig.appPassword) {
        const userFolderName = getUserAccountFolder(newUser);
        NextcloudService.createFolder(
          ncConfig.serverUrl,
          ncConfig.username,
          ncConfig.appPassword,
          `ArsipCloud/File_Saya/${userFolderName}`
        ).catch((err) => console.warn('Nextcloud auto folder create warning:', err));
      }
    } catch (e) {
      // ignore
    }

    if (currentUser) {
      AuditLogService.logAdmin({
        action: 'USER_ADD',
        adminUser: currentUser,
        targetUserName: newUser.name,
        description: `Menambahkan akun pengguna baru "${newUser.name}" dengan role ${newUser.role.toUpperCase()} (Unit: ${newUser.department}).`,
        status: 'success',
      });
    }

    return { success: true, message: 'Pengguna berhasil ditambahkan.', user: newUser };
  };

  const editUser = (
    userId: string,
    updates: Partial<{
      name: string;
      email: string;
      username?: string;
      password?: string;
      role: UserRole;
      department?: string;
      canManageIKU?: boolean;
    }>
  ): { success: boolean; message?: string } => {
    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    if (updates.email) {
      const emailLower = updates.email.trim().toLowerCase();
      if (users.some((u) => u.id !== userId && u.email.toLowerCase() === emailLower)) {
        return { success: false, message: 'Email sudah digunakan oleh akun lain.' };
      }
    }

    if (updates.username) {
      const unameLower = updates.username.trim().toLowerCase();
      if (users.some((u) => u.id !== userId && u.username && u.username.toLowerCase() === unameLower)) {
        return { success: false, message: 'Username sudah digunakan oleh akun lain.' };
      }
    }

    const updatedUsers = users.map((u) => {
      if (u.id === userId) {
        return {
          ...u,
          ...(updates.name !== undefined && { name: updates.name.trim() }),
          ...(updates.email !== undefined && { email: updates.email.trim().toLowerCase() }),
          ...(updates.username !== undefined && { username: updates.username.trim().toLowerCase() }),
          ...(updates.password !== undefined && { password: updates.password.trim() }),
          ...(updates.role !== undefined && { role: updates.role }),
          ...(updates.department !== undefined && { department: updates.department.trim() }),
          ...(updates.canManageIKU !== undefined && { canManageIKU: updates.canManageIKU }),
        };
      }
      return u;
    });

    setUsers(updatedUsers);

    if (currentUser && currentUser.id === userId) {
      const updatedCurrent = updatedUsers.find((u) => u.id === userId);
      if (updatedCurrent) setCurrentUser(updatedCurrent);
    }

    if (currentUser) {
      AuditLogService.logAdmin({
        action: 'USER_EDIT',
        adminUser: currentUser,
        targetUserName: target.name,
        description: `Memperbarui data akun "${target.name}"${updates.password ? ' (Termasuk pembaruan kata sandi)' : ''}.`,
        status: 'success',
      });
    }

    return { success: true, message: 'Data pengguna berhasil diperbarui.' };
  };

  const deleteUser = (userId: string): { success: boolean; message?: string } => {
    if (currentUser && currentUser.id === userId) {
      return { success: false, message: 'Tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.' };
    }

    const target = users.find((u) => u.id === userId);
    if (!target) {
      return { success: false, message: 'Pengguna tidak ditemukan.' };
    }

    // Check if trying to delete the only admin
    if (target.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, message: 'Sistem harus memiliki minimal satu akun Administrator.' };
      }
    }

    const filtered = users.filter((u) => u.id !== userId);
    setUsers(filtered);

    if (currentUser) {
      AuditLogService.logAdmin({
        action: 'USER_DELETE',
        adminUser: currentUser,
        targetUserName: target.name,
        description: `Menghapus akun pengguna "${target.name}" (${target.role.toUpperCase()}) dari sistem.`,
        status: 'warning',
      });
    }

    return { success: true, message: `Akun ${target.name} berhasil dihapus dari sistem.` };
  };

  const updateUserRole = (userId: string, newRole: UserRole) => {
    editUser(userId, { role: newRole });
  };

  const role = currentUser?.role;
  const isAdmin = role === 'admin';
  const isStandardUser = role === 'user';
  const isBidang = role === 'bidang';

  // Rule constraints:
  // - "folder publik yang bisa di akeses oleh semua user kecuali user bidang"
  const canAccessPublic = isAdmin || isStandardUser;

  // - "menu manajemen surat hanya bisa di akses admin dan user tapi user bidang tidak bisa mengaksesnya"
  const canAccessSurat = isAdmin || isStandardUser;

  // - "user bidang hanya bisa melihat menu bidang dan hanya memiliki wewenang melihat dan download tidak bisa upload hapus ataupun edit yang bisa upload hapus edit hanya user dan admin"
  const canModifyBidang = isAdmin || isStandardUser;

  // "atur agar setiap user bisa merubah profil akun dan password akun kecuali akun bidang."
  const canEditProfile = currentUser?.role !== 'bidang';

  const updateOwnProfile = (updates: {
    name?: string;
    email?: string;
    username?: string;
    currentPassword?: string;
    newPassword?: string;
    department?: string;
  }): { success: boolean; message?: string } => {
    if (!currentUser) {
      return { success: false, message: 'Harap login terlebih dahulu.' };
    }

    if (currentUser.role === 'bidang') {
      return {
        success: false,
        message: 'Akun Bidang memiliki otorisasi terbatas (Read-Only) dan tidak diizinkan mengubah profil akun maupun kata sandi.',
      };
    }

    if (updates.newPassword) {
      if (currentUser.password && updates.currentPassword !== undefined && updates.currentPassword !== '') {
        if (currentUser.password !== updates.currentPassword) {
          return { success: false, message: 'Kata sandi saat ini tidak cocok. Silakan periksa kembali.' };
        }
      }
    }

    return editUser(currentUser.id, {
      name: updates.name,
      email: updates.email,
      username: updates.username,
      password: updates.newPassword || undefined,
      department: updates.department,
    });
  };

  // "admin bisa menunjuk hak akses siapa user yang bisa edit atau input menu iku"
  const canManageIKU = isAdmin || Boolean(currentUser?.canManageIKU);

  const setUserIKUAccess = (userId: string, allowed: boolean) => {
    const updated = users.map((u) => (u.id === userId ? { ...u, canManageIKU: allowed } : u));
    setUsers(updated);
    if (currentUser && currentUser.id === userId) {
      setCurrentUser({ ...currentUser, canManageIKU: allowed });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        loginAs,
        logout,
        register,
        updateUserRole,
        addUser,
        editUser,
        deleteUser,
        isAdmin,
        isStandardUser,
        isBidang,
        canAccessPublic,
        canAccessSurat,
        canModifyBidang,
        canEditProfile,
        canManageIKU,
        setUserIKUAccess,
        updateOwnProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

import { AuditLogEntry, AuditActionCategory, AuditStatus, User, UserRole, ActiveUserSession } from '../types';
import * as XLSX from 'xlsx';

const STORAGE_KEY_AUDIT_LOGS = 'arsipcloud_audit_logs_v1';
const STORAGE_KEY_ACTIVE_SESSIONS = 'arsipcloud_active_sessions_v1';

// Format client device info
export function getClientDeviceInfo(): { deviceInfo: string; browser: string } {
  if (typeof window === 'undefined') {
    return { deviceInfo: 'Server', browser: 'Node.js' };
  }
  const ua = navigator.userAgent;
  let browser = 'Browser Standar';
  if (ua.includes('Edg/')) browser = 'Microsoft Edge';
  else if (ua.includes('Chrome/')) browser = 'Google Chrome';
  else if (ua.includes('Firefox/')) browser = 'Mozilla Firefox';
  else if (ua.includes('Safari/')) browser = 'Apple Safari';

  let os = 'Perangkat Desktop';
  if (ua.includes('Windows NT 10.0')) os = 'Windows 11/10';
  else if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux OS';
  else if (ua.includes('Android')) os = 'Android Mobile';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'Apple iOS';

  return {
    deviceInfo: `${os} (${browser})`,
    browser,
  };
}

// Initial seed logs to demonstrate active security and access tracking
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log_001',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 hours ago
    userId: 'user_admin',
    userName: 'Administrator Sistem',
    userRole: 'admin',
    category: 'auth',
    action: 'LOGIN_SUCCESS',
    description: 'Login berhasil via otentikasi kredensial administrator.',
    ipAddress: '192.168.1.10',
    deviceInfo: 'Windows 11/10 (Google Chrome)',
    status: 'success',
  },
  {
    id: 'log_002',
    timestamp: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    userId: 'user_admin',
    userName: 'Administrator Sistem',
    userRole: 'admin',
    category: 'security',
    action: 'ANTI_INSPECT_ACTIVE',
    description: 'Sistem proteksi kode akses dan anti-inspeksi elemen diaktifkan pada portal instansi.',
    ipAddress: '192.168.1.10',
    deviceInfo: 'Windows 11/10 (Google Chrome)',
    status: 'success',
  },
  {
    id: 'log_003',
    timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    userId: 'user_staff_1',
    userName: 'Ahmad Fauzi, S.Kom',
    userRole: 'user',
    category: 'auth',
    action: 'LOGIN_SUCCESS',
    description: 'Pengguna staff masuk ke sistem melalui halaman portal utama.',
    ipAddress: '192.168.1.42',
    deviceInfo: 'Windows 11/10 (Google Chrome)',
    status: 'success',
  },
  {
    id: 'log_004',
    timestamp: new Date(Date.now() - 1000 * 60 * 125).toISOString(),
    userId: 'user_staff_1',
    userName: 'Ahmad Fauzi, S.Kom',
    userRole: 'user',
    category: 'file',
    action: 'FILE_UPLOAD',
    description: 'Mengunggah berkas "Laporan_Capaian_Monev_Renja_Triwulan_I_2026.pdf" (3.42 MB) ke Folder Bidang PME.',
    ipAddress: '192.168.1.42',
    deviceInfo: 'Windows 11/10 (Google Chrome)',
    status: 'success',
  },
  {
    id: 'log_005',
    timestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
    userName: 'Pengguna Tidak Dikenal',
    userRole: 'tamu',
    category: 'auth',
    action: 'LOGIN_FAILED',
    description: 'Percobaan login gagal dengan username "operator_keuangan": Kata sandi salah.',
    ipAddress: '180.252.88.14',
    deviceInfo: 'Linux OS (Google Chrome)',
    status: 'danger',
    metadata: { attemptUsername: 'operator_keuangan' },
  },
  {
    id: 'log_006',
    timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    userId: 'user_admin',
    userName: 'Administrator Sistem',
    userRole: 'admin',
    category: 'surat',
    action: 'SURAT_INPUT',
    description: 'Mencatat Surat Keluar resmi SPT Pendampingan Musrenbangdes (No: 094/015/BAPPERIDA/III/2026).',
    ipAddress: '192.168.1.10',
    deviceInfo: 'Windows 11/10 (Google Chrome)',
    status: 'success',
  },
  {
    id: 'log_007',
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    userName: 'Pengunjung Web (IP: 180.252.88.14)',
    userRole: 'tamu',
    category: 'security',
    action: 'INSPECT_SHORTCUT_BLOCKED',
    description: 'Upaya membuka Developer Tools menggunakan shortcut keyboard (F12) berhasil diblokir.',
    ipAddress: '180.252.88.14',
    deviceInfo: 'Linux OS (Google Chrome)',
    status: 'warning',
    metadata: { key: 'F12', event: 'keydown' },
  },
  {
    id: 'log_008',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    userId: 'user_bidang_pme',
    userName: 'Operator Bidang PME',
    userRole: 'bidang',
    category: 'auth',
    action: 'LOGIN_SUCCESS',
    description: 'Akun Bidang PME masuk ke sistem dengan otorisasi terbatas (Read-Only).',
    ipAddress: '192.168.1.55',
    deviceInfo: 'Windows 11/10 (Microsoft Edge)',
    status: 'success',
  },
  {
    id: 'log_009',
    timestamp: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    userId: 'user_bidang_pme',
    userName: 'Operator Bidang PME',
    userRole: 'bidang',
    category: 'security',
    action: 'RIGHT_CLICK_BLOCKED',
    description: 'Upaya klik kanan untuk inspect element dihalau oleh perisai proteksi kode akses.',
    ipAddress: '192.168.1.55',
    deviceInfo: 'Windows 11/10 (Microsoft Edge)',
    status: 'warning',
  },
  {
    id: 'log_010',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    userId: 'user_admin',
    userName: 'Administrator Sistem',
    userRole: 'admin',
    category: 'admin',
    action: 'USER_PERMISSION_UPDATE',
    description: 'Memperbarui hak akses kelola IKU untuk akun staf Ahmad Fauzi, S.Kom.',
    ipAddress: '192.168.1.10',
    deviceInfo: 'Windows 11/10 (Google Chrome)',
    status: 'success',
  },
];

export class AuditLogService {
  // Retrieve all logs from localStorage
  static getLogs(): AuditLogEntry[] {
    if (typeof window === 'undefined') return INITIAL_AUDIT_LOGS;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      if (!raw) {
        localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
        return INITIAL_AUDIT_LOGS;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
        return INITIAL_AUDIT_LOGS;
      }
      return parsed;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  }

  // Save logs to localStorage
  static saveLogs(logs: AuditLogEntry[]): void {
    if (typeof window === 'undefined') return;
    try {
      // Limit to 2000 most recent entries to maintain snappy performance
      const trimmed = logs.slice(0, 2000);
      localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Gagal menyimpan audit log:', e);
    }
  }

  // Record a new audit log entry
  static log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'> & { timestamp?: string }): AuditLogEntry {
    const { deviceInfo } = getClientDeviceInfo();
    const newEntry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: entry.timestamp || new Date().toISOString(),
      deviceInfo: entry.deviceInfo || deviceInfo,
      ipAddress: entry.ipAddress || '192.168.1.' + Math.floor(10 + Math.random() * 80),
      ...entry,
    };

    const currentLogs = this.getLogs();
    const updated = [newEntry, ...currentLogs];
    this.saveLogs(updated);

    // Also push to server if online
    if (typeof window !== 'undefined') {
      fetch('/api/security/audit-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEntry),
      }).catch(() => {
        // silently fallback to local storage
      });
    }

    return newEntry;
  }

  // Quick helper: Log Auth Events
  static logAuth(params: {
    action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT' | 'PASSWORD_CHANGE';
    user?: User | null;
    attemptName?: string;
    description: string;
    status: AuditStatus;
    metadata?: Record<string, any>;
  }) {
    return this.log({
      userId: params.user?.id,
      userName: params.user?.name || params.attemptName || 'Pengguna Tidak Dikenal',
      userRole: params.user?.role || 'tamu',
      category: 'auth',
      action: params.action,
      description: params.description,
      status: params.status,
      metadata: params.metadata,
    });
  }

  // Quick helper: Log File Operations
  static logFile(params: {
    action: 'FILE_UPLOAD' | 'FILE_DELETE' | 'FOLDER_CREATE' | 'FILE_DOWNLOAD';
    user: User;
    fileName: string;
    scope: string;
    fileSize?: number;
    status?: AuditStatus;
  }) {
    const actionDescriptions: Record<string, string> = {
      FILE_UPLOAD: `Mengunggah berkas "${params.fileName}" ke ruang penyimpanan ${params.scope.toUpperCase()}`,
      FILE_DELETE: `Menghapus berkas/folder "${params.fileName}" dari ${params.scope.toUpperCase()}`,
      FOLDER_CREATE: `Membuat folder baru "${params.fileName}" di ${params.scope.toUpperCase()}`,
      FILE_DOWNLOAD: `Mengunduh berkas "${params.fileName}" dari ${params.scope.toUpperCase()}`,
    };

    return this.log({
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      category: 'file',
      action: params.action,
      description: actionDescriptions[params.action] || `Tindakan berkas ${params.fileName}`,
      status: params.status || 'success',
      metadata: {
        fileName: params.fileName,
        scope: params.scope,
        fileSize: params.fileSize,
      },
    });
  }

  // Quick helper: Log Surat Operations
  static logSurat(params: {
    action: 'SURAT_INPUT' | 'SURAT_UPDATE' | 'SURAT_DELETE' | 'SURAT_EXPORT';
    user: User;
    nomorSurat?: string;
    perihal?: string;
    status?: AuditStatus;
  }) {
    const textMap = {
      SURAT_INPUT: `Mencatat surat baru (No: ${params.nomorSurat || '-'}): "${params.perihal || '-'}"`,
      SURAT_UPDATE: `Memperbarui status/disposisi surat (No: ${params.nomorSurat || '-'})`,
      SURAT_DELETE: `Menghapus arsip surat (No: ${params.nomorSurat || '-'})`,
      SURAT_EXPORT: `Mengekspor rekapitulasi data surat ke dokumen Excel`,
    };

    return this.log({
      userId: params.user.id,
      userName: params.user.name,
      userRole: params.user.role,
      category: 'surat',
      action: params.action,
      description: textMap[params.action],
      status: params.status || 'success',
      metadata: { nomorSurat: params.nomorSurat, perihal: params.perihal },
    });
  }

  // Quick helper: Log Security Incidents
  static logSecurity(params: {
    action: 'INSPECT_SHORTCUT_BLOCKED' | 'RIGHT_CLICK_BLOCKED' | 'DEVTOOLS_DETECTED' | 'CONFIG_CHANGE';
    description: string;
    user?: User | null;
    status?: AuditStatus;
    metadata?: Record<string, any>;
  }) {
    return this.log({
      userId: params.user?.id,
      userName: params.user ? params.user.name : 'Pengunjung / Klien Tidak Dikenal',
      userRole: params.user?.role || 'tamu',
      category: 'security',
      action: params.action,
      description: params.description,
      status: params.status || 'warning',
      metadata: params.metadata,
    });
  }

  // Quick helper: Log Admin Actions
  static logAdmin(params: {
    action: 'USER_ADD' | 'USER_EDIT' | 'USER_DELETE' | 'USER_PERMISSION_UPDATE';
    adminUser: User;
    targetUserName: string;
    description: string;
    status?: AuditStatus;
  }) {
    return this.log({
      userId: params.adminUser.id,
      userName: params.adminUser.name,
      userRole: 'admin',
      category: 'admin',
      action: params.action,
      description: params.description,
      status: params.status || 'success',
      metadata: { targetUser: params.targetUserName },
    });
  }

  // Clear all logs
  static clearLogs(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify([]));
    fetch('/api/security/clear-logs', { method: 'POST' }).catch(() => {});
  }

  // Reset to initial sample logs
  static resetToDefault(): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
  }

  // Export audit logs to Excel (.xlsx) using SheetJS
  static exportLogsToExcel(logs: AuditLogEntry[]): void {
    const dataRows = logs.map((log, index) => {
      const date = new Date(log.timestamp);
      const formattedDate = date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) + ' ' + date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      return {
        'No': index + 1,
        'Waktu (WIB)': formattedDate,
        'Nama Pengguna': log.userName,
        'Role Akun': log.userRole ? log.userRole.toUpperCase() : 'TAMU',
        'Kategori': log.category.toUpperCase(),
        'Kode Tindakan': log.action,
        'Deskripsi Aktivitas': log.description,
        'Status': log.status === 'success' ? 'BERHASIL' : log.status === 'warning' ? 'PERINGATAN' : 'DIBLOKIR / BAHAYA',
        'Alamat IP': log.ipAddress || '-',
        'Perangkat & Browser': log.deviceInfo || '-',
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Column widths
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 22 },
      { wch: 26 },
      { wch: 12 },
      { wch: 14 },
      { wch: 24 },
      { wch: 55 },
      { wch: 20 },
      { wch: 18 },
      { wch: 32 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Log_Akses_Keamanan');

    const fileName = `Audit_Log_Keamanan_E-PMPED_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  // Active user sessions tracking
  static getActiveSessions(currentUserId?: string): ActiveUserSession[] {
    const now = new Date();
    const { deviceInfo } = getClientDeviceInfo();

    return [
      {
        id: 'sess_1',
        userId: currentUserId || 'user_admin',
        userName: 'Administrator Sistem',
        userRole: 'admin',
        department: 'Pusdatin Bapperida',
        loginTime: new Date(now.getTime() - 1000 * 60 * 45).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        lastActive: 'Aktif Sekarang (Sesi Ini)',
        ipAddress: '192.168.1.10',
        deviceInfo: deviceInfo,
        isCurrent: true,
      },
      {
        id: 'sess_2',
        userId: 'user_staff_1',
        userName: 'Ahmad Fauzi, S.Kom',
        userRole: 'user',
        department: 'Subbag Perencanaan',
        loginTime: new Date(now.getTime() - 1000 * 60 * 120).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        lastActive: '5 menit yang lalu',
        ipAddress: '192.168.1.42',
        deviceInfo: 'Windows 11/10 (Google Chrome)',
        isCurrent: false,
      },
      {
        id: 'sess_3',
        userId: 'user_bidang_pme',
        userName: 'Operator Bidang PME',
        userRole: 'bidang',
        department: 'Bidang PME',
        loginTime: new Date(now.getTime() - 1000 * 60 * 65).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        lastActive: '12 menit yang lalu',
        ipAddress: '192.168.1.55',
        deviceInfo: 'Windows 11/10 (Microsoft Edge)',
        isCurrent: false,
      },
    ];
  }
}

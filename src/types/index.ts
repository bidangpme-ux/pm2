export type UserRole = 'admin' | 'user' | 'bidang';

export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  password?: string;
  role: UserRole;
  department?: string;
  canManageIKU?: boolean; // Granted by admin to input or edit IKU data
  createdAt: string;
}

export type StorageScope = 'private' | 'public' | 'bidang';

export type FileCategory = 'document' | 'spreadsheet' | 'presentation' | 'image' | 'archive' | 'audio' | 'video' | 'other';

export interface StorageItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  extension?: string;
  size: number; // in bytes
  mimeType?: string;
  parentId: string | null; // null represents root of current scope
  scope: StorageScope;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  bidangCategory?: string; // e.g. "Bidang PME", "Bidang Tata Ruang", etc.
  createdAt: string;
  updatedAt: string;
  dataUrl?: string; // for preview or downloaded file blob / base64
  starred?: boolean;
  tags?: string[];
  description?: string;
}

export type TipeSurat = 'masuk' | 'keluar';

export type KategoriSuratKeluar =
  | 'Surat Perintah / Surat Perintah Tugas'
  | 'Surat Keterangan'
  | 'Surat Izin'
  | 'Surat Pengantar'
  | 'Berita Acara'
  | 'Surat Perintah Perjalanan Dinas (SPPD)'
  | 'Undangan'
  | 'Pengumuman'
  | 'Laporan'
  | 'Sertifikat / Piagam';

export const KATEGORI_SURAT_KELUAR_LIST: KategoriSuratKeluar[] = [
  'Surat Perintah / Surat Perintah Tugas',
  'Surat Keterangan',
  'Surat Izin',
  'Surat Pengantar',
  'Berita Acara',
  'Surat Perintah Perjalanan Dinas (SPPD)',
  'Undangan',
  'Pengumuman',
  'Laporan',
  'Sertifikat / Piagam',
];

export type JenisSurat = 
  | 'Surat Masuk'
  | 'Surat Keluar'
  | 'Surat Keputusan (SK)'
  | 'Surat Tugas'
  | 'Nota Dinas'
  | 'Undangan Resmi'
  | 'Surat Edaran'
  | KategoriSuratKeluar;

export type TingkatUrgensi = 
  | 'Sangat Segera'
  | 'Segera'
  | 'Biasa'
  | 'Rahasia';

export type StatusSurat = 
  | 'Baru'
  | 'Didisposisi'
  | 'Ditindaklanjuti'
  | 'Diarsipkan';

export interface SuratItem {
  id: string;
  nomorSurat: string;
  tanggalSurat: string; // YYYY-MM-DD
  tanggalDiterima: string; // YYYY-MM-DD
  tipe?: TipeSurat; // 'masuk' | 'keluar'
  jenis: JenisSurat;
  kategoriKeluar?: KategoriSuratKeluar;
  tingkatUrgensi: TingkatUrgensi;
  pengirim: string;
  penerima: string;
  perihal: string;
  ringkasan: string;
  status: StatusSurat;
  disposisiKepada?: string;
  catatanDisposisi?: string;
  fileName?: string;
  fileSize?: number;
  fileUrl?: string;
  fileExtension?: string;
  createdBy: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
}

export type KategoriCapaianIKU = 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah' | 'Belum Dinilai';

export interface IKUItem {
  id: string;
  tahun: number; // e.g. 2024, 2025, 2026
  visi: string;
  misi: string;
  misiNomor?: number; // e.g. 1, 2, 3, 4
  tujuan: string; // Tujuan Pemda / RPJMD
  sasaran: string; // Sasaran Pemda / RPJMD
  tujuanPD: string; // Tujuan Perangkat Daerah (Renstra)
  sasaranPD: string; // Sasaran Perangkat Daerah (Renstra)
  perangkatDaerah: string; // Nama OPD (e.g. Bapperida, Dinkes, PUPR)
  bidangPengampu?: string; // Bidang pengampu (e.g. Bidang PME, PPM, Infraswil)
  indikatorKinerja: string; // Nama Indikator Kinerja Utama (IKU)
  formula?: string; // Rumus / formulasi perhitungan
  satuan: string; // %, Indeks, Dokumen, Nilai, dll.
  target: number; // Nilai target
  realisasi?: number; // Nilai realisasi
  capaianPersen?: number; // (realisasi/target)*100
  kategoriCapaian?: KategoriCapaianIKU;
  penanggungJawab?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PeriodeRPJMD {
  id: string;
  nama: string; // e.g. "Periode 2025 - 2030 (RPJMD Teknokratik)"
  tahunMulai: number; // e.g. 2025
  tahunSelesai: number; // e.g. 2030
  tahunList: number[]; // [2025, 2026, 2027, 2028, 2029, 2030]
  isAktif: boolean;
  keterangan?: string;
  createdAt: string;
}

export interface TujuanSasaranItem {
  id: string;
  periodeId: string; // ID dari PeriodeRPJMD
  visi: string;
  misi: string;
  misiNomor?: number;
  tujuan: string;
  sasaran: string;
  indikator: string;
  satuan: string; // Ditulis manual (e.g. %, Indeks, Dokumen, Nilai, dll.)
  targetTahunan: Record<number, number | string>; // Target per tahun [2025, 2026, 2027, 2028, 2029, 2030]
  perangkatDaerahList: string[]; // Satu indikator bisa dipilih lebih dari 1 perangkat daerah (multi-OPD)
  bidangPengampu?: string;
  formula?: string;
  penanggungJawab?: string;
  keterangan?: string;
  createdAt: string;
  updatedAt: string;
}

// ================= SECURITY & AUDIT LOG TYPES =================
export type AuditActionCategory = 'auth' | 'file' | 'surat' | 'iku' | 'admin' | 'security';
export type AuditStatus = 'success' | 'warning' | 'danger';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO string
  userId?: string;
  userName: string;
  userRole?: UserRole | 'tamu';
  category: AuditActionCategory;
  action: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  status: AuditStatus;
  metadata?: Record<string, any>;
}

export interface SecurityConfig {
  antiInspectEnabled: boolean;
  blockContextMenu: boolean;
  blockKeyboardShortcuts: boolean;
  detectDevTools: boolean;
  showWarningToast: boolean;
  maskAccessCodes: boolean;
}

export interface ActiveUserSession {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  department?: string;
  loginTime: string;
  lastActive: string;
  ipAddress: string;
  deviceInfo: string;
  isCurrent: boolean;
}




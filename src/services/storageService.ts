import { User, StorageItem, SuratItem, IKUItem, PeriodeRPJMD, TujuanSasaranItem } from '../types';
import { INITIAL_IKU_ITEMS } from './ikuData';
import { INITIAL_PERIODE_LIST, INITIAL_TUJUAN_SASARAN_ITEMS } from './tujuanSasaranData';

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    name: 'Administrator Sistem',
    email: 'admin@instansi.go.id',
    username: 'admin',
    password: 'admin',
    role: 'admin',
    department: 'Pusat Data & Informasi (Pusdatin)',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user_staff_1',
    name: 'Ahmad Fauzi, S.Kom',
    email: 'user@instansi.go.id',
    username: 'ahmad_fauzi',
    password: 'user',
    role: 'user',
    department: 'Subbag Perencanaan & Program',
    createdAt: '2026-01-10T09:30:00Z',
  },
  {
    id: 'user_bidang_pme',
    name: 'Operator Bidang PME',
    email: 'bidangpme@gmail.com',
    username: 'bidang_pme',
    password: 'pme',
    role: 'bidang',
    department: 'Bidang PME (Pengendalian, Monev & Evaluasi)',
    createdAt: '2026-01-15T11:00:00Z',
  },
  {
    id: 'user_staff_2',
    name: 'Budi Santoso, M.Si',
    email: 'budi@instansi.go.id',
    username: 'budi_santoso',
    password: '123',
    role: 'user',
    department: 'Subbag Keuangan & Perlengkapan',
    createdAt: '2026-02-01T10:00:00Z',
  },
];

export const INITIAL_ITEMS: StorageItem[] = [
  // --- FOLDER PUBLIK (Accessible by Admin and User, forbidden for User Bidang) ---
  {
    id: 'pub_folder_sop',
    name: 'Pedoman & SOP Instansi',
    type: 'folder',
    size: 0,
    parentId: null,
    scope: 'public',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    createdAt: '2026-01-05T08:00:00Z',
    updatedAt: '2026-01-05T08:00:00Z',
    description: 'Kumpulan SOP dan pedoman kerja resmi instansi tahun 2026',
  },
  {
    id: 'pub_file_sop_1',
    name: 'SOP_Pengelolaan_Arsip_Elektronik_2026.pdf',
    type: 'file',
    extension: 'pdf',
    size: 2840000,
    mimeType: 'application/pdf',
    parentId: 'pub_folder_sop',
    scope: 'public',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    createdAt: '2026-01-05T08:15:00Z',
    updatedAt: '2026-01-05T08:15:00Z',
  },
  {
    id: 'pub_file_sop_2',
    name: 'Pedoman_Tata_Naskah_Dinas_Terbaru.pdf',
    type: 'file',
    extension: 'pdf',
    size: 4210000,
    mimeType: 'application/pdf',
    parentId: 'pub_folder_sop',
    scope: 'public',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    createdAt: '2026-01-06T09:00:00Z',
    updatedAt: '2026-01-06T09:00:00Z',
  },
  {
    id: 'pub_folder_template',
    name: 'Formulir & Template Resmi',
    type: 'folder',
    size: 0,
    parentId: null,
    scope: 'public',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    createdAt: '2026-01-08T10:00:00Z',
    updatedAt: '2026-01-08T10:00:00Z',
    description: 'Format dokumen standar untuk efisiensi administrasi',
  },
  {
    id: 'pub_file_template_1',
    name: 'Template_Format_Nota_Dinas.docx',
    type: 'file',
    extension: 'docx',
    size: 145000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    parentId: 'pub_folder_template',
    scope: 'public',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    createdAt: '2026-01-08T10:30:00Z',
    updatedAt: '2026-01-08T10:30:00Z',
  },
  {
    id: 'pub_file_template_2',
    name: 'Format_Laporan_Kinerja_Kegiatan.xlsx',
    type: 'file',
    extension: 'xlsx',
    size: 685000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    parentId: 'pub_folder_template',
    scope: 'public',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    createdAt: '2026-01-09T11:00:00Z',
    updatedAt: '2026-01-09T11:00:00Z',
  },
  {
    id: 'pub_file_root_1',
    name: 'Kalender_Agenda_Kegiatan_Instansi_2026.pdf',
    type: 'file',
    extension: 'pdf',
    size: 1950000,
    mimeType: 'application/pdf',
    parentId: null,
    scope: 'public',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    createdAt: '2026-01-10T14:00:00Z',
    updatedAt: '2026-01-10T14:00:00Z',
  },

  // --- MENU BIDANG (Accessible by Admin, User, and User Bidang; Bidang has View/Download only) ---
  {
    id: 'bidang_folder_pme',
    name: 'Bidang PME (Pengendalian, Monev & Evaluasi)',
    type: 'folder',
    size: 0,
    parentId: null,
    scope: 'bidang',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    bidangCategory: 'Bidang PME',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-01-10T08:00:00Z',
    description: 'Arsip dokumen pengendalian, monitoring, dan evaluasi program',
  },
  {
    id: 'bidang_file_pme_1',
    name: 'Laporan_Capaian_Monev_Renja_Triwulan_I_2026.pdf',
    type: 'file',
    extension: 'pdf',
    size: 3420000,
    mimeType: 'application/pdf',
    parentId: 'bidang_folder_pme',
    scope: 'bidang',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    bidangCategory: 'Bidang PME',
    createdAt: '2026-02-15T09:20:00Z',
    updatedAt: '2026-02-15T09:20:00Z',
  },
  {
    id: 'bidang_file_pme_2',
    name: 'Matriks_Evaluasi_Indikator_Sasaran_Pembangunan.xlsx',
    type: 'file',
    extension: 'xlsx',
    size: 1520000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    parentId: 'bidang_folder_pme',
    scope: 'bidang',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    bidangCategory: 'Bidang PME',
    createdAt: '2026-02-18T10:45:00Z',
    updatedAt: '2026-02-18T10:45:00Z',
  },
  {
    id: 'bidang_file_pme_3',
    name: 'Bahan_Paparan_Evaluasi_Pembangunan_Daerah.pptx',
    type: 'file',
    extension: 'pptx',
    size: 5800000,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    parentId: 'bidang_folder_pme',
    scope: 'bidang',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    bidangCategory: 'Bidang PME',
    createdAt: '2026-02-20T14:10:00Z',
    updatedAt: '2026-02-20T14:10:00Z',
  },
  {
    id: 'bidang_folder_infra',
    name: 'Bidang Infrastruktur & Kewilayahan',
    type: 'folder',
    size: 0,
    parentId: null,
    scope: 'bidang',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    bidangCategory: 'Bidang Infrastruktur',
    createdAt: '2026-01-12T09:00:00Z',
    updatedAt: '2026-01-12T09:00:00Z',
  },
  {
    id: 'bidang_file_infra_1',
    name: 'Rekapitulasi_Progres_Fisik_Proyek_Strategis.xlsx',
    type: 'file',
    extension: 'xlsx',
    size: 2100000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    parentId: 'bidang_folder_infra',
    scope: 'bidang',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    bidangCategory: 'Bidang Infrastruktur',
    createdAt: '2026-02-10T11:00:00Z',
    updatedAt: '2026-02-10T11:00:00Z',
  },
  {
    id: 'bidang_file_infra_2',
    name: 'Peta_Jaringan_Jalan_Dan_Irigasi_2026.pdf',
    type: 'file',
    extension: 'pdf',
    size: 7800000,
    mimeType: 'application/pdf',
    parentId: 'bidang_folder_infra',
    scope: 'bidang',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    bidangCategory: 'Bidang Infrastruktur',
    createdAt: '2026-02-12T13:30:00Z',
    updatedAt: '2026-02-12T13:30:00Z',
  },
  {
    id: 'bidang_folder_tataruang',
    name: 'Bidang Tata Ruang & Lingkungan Hidup',
    type: 'folder',
    size: 0,
    parentId: null,
    scope: 'bidang',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    bidangCategory: 'Bidang Tata Ruang',
    createdAt: '2026-01-14T10:00:00Z',
    updatedAt: '2026-01-14T10:00:00Z',
  },
  {
    id: 'bidang_file_tataruang_1',
    name: 'Ringkasan_Revisi_RTRW_Kabupaten_2026-2046.pdf',
    type: 'file',
    extension: 'pdf',
    size: 4950000,
    mimeType: 'application/pdf',
    parentId: 'bidang_folder_tataruang',
    scope: 'bidang',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    bidangCategory: 'Bidang Tata Ruang',
    createdAt: '2026-02-19T08:45:00Z',
    updatedAt: '2026-02-19T08:45:00Z',
  },

  // --- PRIVATE STORAGE FOR user@instansi.go.id (Ahmad Fauzi) ---
  {
    id: 'pvt_fauzi_folder_1',
    name: 'Laporan Kinerja Pribadi',
    type: 'folder',
    size: 0,
    parentId: null,
    scope: 'private',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-01-20T08:00:00Z',
  },
  {
    id: 'pvt_fauzi_file_1',
    name: 'Draft_Laporan_Kinerja_Individu_Januari.docx',
    type: 'file',
    extension: 'docx',
    size: 320000,
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    parentId: 'pvt_fauzi_folder_1',
    scope: 'private',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    createdAt: '2026-01-22T09:30:00Z',
    updatedAt: '2026-01-22T09:30:00Z',
  },
  {
    id: 'pvt_fauzi_file_2',
    name: 'Bukti_Dukung_Capaian_SKP_2026.pdf',
    type: 'file',
    extension: 'pdf',
    size: 2150000,
    mimeType: 'application/pdf',
    parentId: 'pvt_fauzi_folder_1',
    scope: 'private',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    createdAt: '2026-01-25T14:15:00Z',
    updatedAt: '2026-01-25T14:15:00Z',
  },
  {
    id: 'pvt_fauzi_folder_2',
    name: 'Berkas Kepegawaian & Sertifikasi',
    type: 'folder',
    size: 0,
    parentId: null,
    scope: 'private',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    createdAt: '2026-01-21T10:00:00Z',
    updatedAt: '2026-01-21T10:00:00Z',
  },
  {
    id: 'pvt_fauzi_file_3',
    name: 'Sertifikat_Keahlian_Data_Analyst.pdf',
    type: 'file',
    extension: 'pdf',
    size: 1420000,
    mimeType: 'application/pdf',
    parentId: 'pvt_fauzi_folder_2',
    scope: 'private',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    createdAt: '2026-01-26T16:00:00Z',
    updatedAt: '2026-01-26T16:00:00Z',
  },
  {
    id: 'pvt_fauzi_file_root',
    name: 'Catatan_Rencana_Kerja_Internal.txt',
    type: 'file',
    extension: 'txt',
    size: 24000,
    mimeType: 'text/plain',
    parentId: null,
    scope: 'private',
    ownerId: 'user_staff_1',
    ownerName: 'Ahmad Fauzi, S.Kom',
    ownerEmail: 'user@instansi.go.id',
    createdAt: '2026-02-01T10:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
  },

  // --- PRIVATE STORAGE FOR budi@instansi.go.id (Budi Santoso - Keuangan) ---
  {
    id: 'pvt_budi_folder_1',
    name: 'Berkas SPJ & Pertanggungjawaban',
    type: 'folder',
    size: 0,
    parentId: null,
    scope: 'private',
    ownerId: 'user_staff_2',
    ownerName: 'Budi Santoso, M.Si',
    ownerEmail: 'budi@instansi.go.id',
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'pvt_budi_file_1',
    name: 'Rekapitulasi_SPJ_Bulan_Januari_2026.xlsx',
    type: 'file',
    extension: 'xlsx',
    size: 2450000,
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    parentId: 'pvt_budi_folder_1',
    scope: 'private',
    ownerId: 'user_staff_2',
    ownerName: 'Budi Santoso, M.Si',
    ownerEmail: 'budi@instansi.go.id',
    createdAt: '2026-02-06T09:30:00Z',
    updatedAt: '2026-02-06T09:30:00Z',
  },
  {
    id: 'pvt_budi_file_2',
    name: 'Bukti_Transfer_Pajak_Daerah_Januari.pdf',
    type: 'file',
    extension: 'pdf',
    size: 1120000,
    mimeType: 'application/pdf',
    parentId: 'pvt_budi_folder_1',
    scope: 'private',
    ownerId: 'user_staff_2',
    ownerName: 'Budi Santoso, M.Si',
    ownerEmail: 'budi@instansi.go.id',
    createdAt: '2026-02-07T11:00:00Z',
    updatedAt: '2026-02-07T11:00:00Z',
  },

  // --- PRIVATE STORAGE FOR admin (Admin Personal Files) ---
  {
    id: 'pvt_admin_folder_1',
    name: 'Konfigurasi & Backup Sistem',
    type: 'folder',
    size: 0,
    parentId: null,
    scope: 'private',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'pvt_admin_file_1',
    name: 'Database_Backup_Schema_2026.sql',
    type: 'file',
    extension: 'sql',
    size: 3890000,
    mimeType: 'application/sql',
    parentId: 'pvt_admin_folder_1',
    scope: 'private',
    ownerId: 'user_admin',
    ownerName: 'Administrator Sistem',
    ownerEmail: 'admin@instansi.go.id',
    createdAt: '2026-01-02T12:00:00Z',
    updatedAt: '2026-01-02T12:00:00Z',
  },
];

export const INITIAL_SURAT: SuratItem[] = [
  // --- SURAT MASUK ---
  {
    id: 'surat_001',
    nomorSurat: '005/142/Bappeda/2026',
    tanggalSurat: '2026-03-01',
    tanggalDiterima: '2026-03-02',
    tipe: 'masuk',
    jenis: 'Surat Masuk',
    tingkatUrgensi: 'Sangat Segera',
    pengirim: 'Kementerian PPN / Bappenas Republik Indonesia',
    penerima: 'Kepala Bapperida Kabupaten Tanggamus',
    perihal: 'Undangan Rapat Koordinasi Nasional Penyusunan Rencana Kerja Pemerintah 2027',
    ringkasan: 'Permohonan kehadiran Kepala Bapperida dalam Rakornas RKP 2027 via Hybrid Meeting di Hotel Mulia Jakarta.',
    status: 'Didisposisi',
    disposisiKepada: 'Kepala Bidang PME & Subbag Perencanaan',
    catatanDisposisi: 'Segera siapkan bahan paparan capaian prioritas daerah dan hadiri bersama tim teknis.',
    fileName: 'Surat_Bappenas_Rakornas_RKP_2027.pdf',
    fileSize: 1820000,
    fileExtension: 'pdf',
    createdBy: 'user_admin',
    creatorName: 'Administrator Sistem',
    createdAt: '2026-03-02T08:30:00Z',
    updatedAt: '2026-03-02T09:15:00Z',
  },
  {
    id: 'surat_002',
    nomorSurat: '188.4/045/HK-SETDA/2026',
    tanggalSurat: '2026-02-15',
    tanggalDiterima: '2026-02-16',
    tipe: 'masuk',
    jenis: 'Surat Keputusan (SK)',
    tingkatUrgensi: 'Segera',
    pengirim: 'Bupati / Sekretariat Daerah Tanggamus',
    penerima: 'Seluruh Kepala Perangkat Daerah / OPD',
    perihal: 'Penetapan Tim Koordinasi Pengendalian dan Evaluasi RKPD Tahun 2026',
    ringkasan: 'Surat Keputusan mengenai susunan tim koordinasi lintas perangkat daerah dalam mengawal target sasaran makro daerah.',
    status: 'Ditindaklanjuti',
    disposisiKepada: 'Bidang PME',
    catatanDisposisi: 'Jadikan acuan SK Tim dalam pelaksanaan rapat evaluasi bulanan.',
    fileName: 'SK_Bupati_Tim_Koordinasi_Monev_2026.pdf',
    fileSize: 3120000,
    fileExtension: 'pdf',
    createdBy: 'user_staff_1',
    creatorName: 'Ahmad Fauzi, S.Kom',
    createdAt: '2026-02-16T10:00:00Z',
    updatedAt: '2026-02-17T11:00:00Z',
  },
  {
    id: 'surat_006',
    nomorSurat: '700/019/INSP-KAB/CONF/2026',
    tanggalSurat: '2026-03-12',
    tanggalDiterima: '2026-03-13',
    tipe: 'masuk',
    jenis: 'Surat Masuk',
    tingkatUrgensi: 'Rahasia',
    pengirim: 'Inspektorat Daerah Kabupaten Tanggamus',
    penerima: 'Kepala Bapperida',
    perihal: 'Hasil Audit Ketaatan Kinerja dan Tata Kelola Pengadaan',
    ringkasan: 'Laporan hasil pengawasan berkala dengan rekomendasi tindak lanjut penyempurnaan administrasi keuangan.',
    status: 'Baru',
    disposisiKepada: 'Kepala Badan & Sekretaris (Tertutup)',
    catatanDisposisi: 'Khusus untuk dipelajari pimpinan, siapkan matriks tindak lanjut rekomendasi.',
    fileName: 'LHP_Inspektorat_Konfidensial_2026.pdf',
    fileSize: 4500000,
    fileExtension: 'pdf',
    createdBy: 'user_admin',
    creatorName: 'Administrator Sistem',
    createdAt: '2026-03-13T14:00:00Z',
    updatedAt: '2026-03-13T14:00:00Z',
  },

  // --- 10 KATEGORI SURAT KELUAR RESMI ---
  // 1. Surat Perintah / Surat Perintah Tugas
  {
    id: 'surat_keluar_spt_1',
    nomorSurat: '094/015/BAPPERIDA/III/2026',
    tanggalSurat: '2026-03-14',
    tanggalDiterima: '2026-03-14',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Surat Perintah / Surat Perintah Tugas',
    tingkatUrgensi: 'Segera',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Tim Teknis Fasilitasi Musrenbang Kecamatan',
    perihal: 'Surat Perintah Tugas Pendampingan Musrenbangdes Kecamatan Talang Padang',
    ringkasan: 'Menugaskan 4 orang staf perencana untuk melakukan fasilitasi dan verifikasi usulan prioritas desa.',
    status: 'Ditindaklanjuti',
    disposisiKepada: 'Tim Fasilitasi Bidang PME',
    catatanDisposisi: 'Pastikan seluruh berita acara musrenbangdes terinput di aplikasi SIPD.',
    fileName: 'SPT_Pendampingan_Musrenbangdes_TalangPadang.pdf',
    fileSize: 840000,
    fileExtension: 'pdf',
    createdBy: 'user_admin',
    creatorName: 'Administrator Sistem',
    createdAt: '2026-03-14T08:00:00Z',
    updatedAt: '2026-03-14T08:00:00Z',
  },
  // 2. Surat Keterangan
  {
    id: 'surat_keluar_sket_1',
    nomorSurat: '470/022/BAPPERIDA/2026',
    tanggalSurat: '2026-03-10',
    tanggalDiterima: '2026-03-10',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Surat Keterangan',
    tingkatUrgensi: 'Biasa',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Dekan Fakultas Ekonomi & Bisnis Universitas Lampung',
    perihal: 'Surat Keterangan Telah Melaksanakan Penelitian Skripsi Mahasiswa',
    ringkasan: 'Keterangan izin dan penyelesaian pengambilan data penelitian skripsi analisis disparitas pendapatan daerah.',
    status: 'Diarsipkan',
    fileName: 'Surat_Keterangan_Selesai_Penelitian_Unila.pdf',
    fileSize: 620000,
    fileExtension: 'pdf',
    createdBy: 'user_staff_1',
    creatorName: 'Ahmad Fauzi, S.Kom',
    createdAt: '2026-03-10T10:30:00Z',
    updatedAt: '2026-03-10T10:30:00Z',
  },
  // 3. Surat Izin
  {
    id: 'surat_keluar_izin_1',
    nomorSurat: '800/035/BAPPERIDA-Sekr/2026',
    tanggalSurat: '2026-03-08',
    tanggalDiterima: '2026-03-08',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Surat Izin',
    tingkatUrgensi: 'Biasa',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Kepala SMK Negeri 1 Kota Agung',
    perihal: 'Surat Izin Penerimaan Praktik Kerja Lapangan (PKL) Siswa Jurusan RPL',
    ringkasan: 'Persetujuan penerimaan 3 orang siswa SMK untuk melaksanakan magang PKL di Pusdatin Bapperida.',
    status: 'Ditindaklanjuti',
    fileName: 'Surat_Izin_PKL_Siswa_SMKN1_KotaAgung.pdf',
    fileSize: 510000,
    fileExtension: 'pdf',
    createdBy: 'user_staff_1',
    creatorName: 'Ahmad Fauzi, S.Kom',
    createdAt: '2026-03-08T09:15:00Z',
    updatedAt: '2026-03-08T09:15:00Z',
  },
  // 4. Surat Pengantar
  {
    id: 'surat_keluar_pengantar_1',
    nomorSurat: '045.2/067/BAPPERIDA-PME/2026',
    tanggalSurat: '2026-03-06',
    tanggalDiterima: '2026-03-06',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Surat Pengantar',
    tingkatUrgensi: 'Segera',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Kepala Bappeda Provinsi Lampung',
    perihal: 'Surat Pengantar Pengiriman Dokumen Laporan Realisasi DAK Fisik Triwulan I',
    ringkasan: 'Pengantar resmi penyampaian bundel dokumen fisik dan softcopy pelaporan DAK Fisik & Non-Fisik.',
    status: 'Diarsipkan',
    fileName: 'Surat_Pengantar_Laporan_DAK_Triwulan_I.pdf',
    fileSize: 1150000,
    fileExtension: 'pdf',
    createdBy: 'user_staff_1',
    creatorName: 'Ahmad Fauzi, S.Kom',
    createdAt: '2026-03-06T11:45:00Z',
    updatedAt: '2026-03-06T11:45:00Z',
  },
  // 5. Berita Acara
  {
    id: 'surat_keluar_ba_1',
    nomorSurat: '005/012/BA-MUSRENBANG/2026',
    tanggalSurat: '2026-03-04',
    tanggalDiterima: '2026-03-04',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Berita Acara',
    tingkatUrgensi: 'Sangat Segera',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Bupati Tanggamus & Seluruh Delegasi Pemangku Kepentingan',
    perihal: 'Berita Acara Kesepakatan Hasil Musrenbang RKPD Kabupaten Tanggamus 2027',
    ringkasan: 'Berita acara penandatanganan kesepakatan program prioritas pembangunan daerah tahun rencana 2027.',
    status: 'Ditindaklanjuti',
    fileName: 'Berita_Acara_Kesepakatan_Musrenbang_RKPD_2027.pdf',
    fileSize: 2480000,
    fileExtension: 'pdf',
    createdBy: 'user_admin',
    creatorName: 'Administrator Sistem',
    createdAt: '2026-03-04T16:00:00Z',
    updatedAt: '2026-03-04T16:00:00Z',
  },
  // 6. Surat Perintah Perjalanan Dinas (SPPD)
  {
    id: 'surat_keluar_sppd_1',
    nomorSurat: '090/042/SPPD-BAPPERIDA/2026',
    tanggalSurat: '2026-03-02',
    tanggalDiterima: '2026-03-02',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Surat Perintah Perjalanan Dinas (SPPD)',
    tingkatUrgensi: 'Segera',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Pejabat Pembuat Komitmen & Pelaksana Perjalanan Dinas',
    perihal: 'SPPD Koordinasi Sinkronisasi Program Prioritas Bappeda Provinsi di Bandar Lampung',
    ringkasan: 'Surat perintah perjalanan dinas dalam rangka konsultasi teknis indikator makro kabupaten ke provinsi.',
    status: 'Diarsipkan',
    fileName: 'SPPD_Konsultasi_Indikator_Makro_Provinsi.pdf',
    fileSize: 930000,
    fileExtension: 'pdf',
    createdBy: 'user_staff_1',
    creatorName: 'Ahmad Fauzi, S.Kom',
    createdAt: '2026-03-02T13:00:00Z',
    updatedAt: '2026-03-02T13:00:00Z',
  },
  // 7. Undangan
  {
    id: 'surat_keluar_undangan_1',
    nomorSurat: '005/118/BAPPERIDA/2026',
    tanggalSurat: '2026-02-27',
    tanggalDiterima: '2026-02-27',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Undangan',
    tingkatUrgensi: 'Segera',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Seluruh Kepala Perangkat Daerah / Camat Se-Kabupaten Tanggamus',
    perihal: 'Undangan Rapat Forum Konsultasi Publik Rancangan Awal RKPD Kabupaten Tanggamus',
    ringkasan: 'Undangan pembukaan forum konsultasi publik bertempat di Aula Utama Islamic Center Kota Agung.',
    status: 'Diarsipkan',
    fileName: 'Undangan_Forum_Konsultasi_Publik_Ranwal_RKPD.pdf',
    fileSize: 1220000,
    fileExtension: 'pdf',
    createdBy: 'user_admin',
    creatorName: 'Administrator Sistem',
    createdAt: '2026-02-27T10:00:00Z',
    updatedAt: '2026-02-27T10:00:00Z',
  },
  // 8. Pengumuman
  {
    id: 'surat_keluar_pengumuman_1',
    nomorSurat: '800/004/PENG-BAPPERIDA/2026',
    tanggalSurat: '2026-02-25',
    tanggalDiterima: '2026-02-25',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Pengumuman',
    tingkatUrgensi: 'Biasa',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Masyarakat Umum, Akademisi, & ASN Se-Kabupaten Tanggamus',
    perihal: 'Pengumuman Pembukaan Lomba Inovasi Daerah (Inovasi Bapperida) Tanggamus 2026',
    ringkasan: 'Pengumuman resmi tahapan registrasi, kriteria penilaian, dan jadwal seleksi lomba inovasi daerah.',
    status: 'Baru',
    fileName: 'Pengumuman_Lomba_Inovasi_Daerah_Tanggamus_2026.pdf',
    fileSize: 1740000,
    fileExtension: 'pdf',
    createdBy: 'user_admin',
    creatorName: 'Administrator Sistem',
    createdAt: '2026-02-25T14:30:00Z',
    updatedAt: '2026-02-25T14:30:00Z',
  },
  // 9. Laporan
  {
    id: 'surat_keluar_laporan_1',
    nomorSurat: '050/081/LAP-BAPPERIDA/2026',
    tanggalSurat: '2026-02-20',
    tanggalDiterima: '2026-02-20',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Laporan',
    tingkatUrgensi: 'Biasa',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Bupati Tanggamus & DPRD Kabupaten Tanggamus',
    perihal: 'Laporan Capaian Indikator Kinerja Makro Pembangunan Daerah Semester I',
    ringkasan: 'Laporan komprehensif pertumbuhan ekonomi, IPM, tingkat kemiskinan, dan realisasi investasi daerah.',
    status: 'Ditindaklanjuti',
    fileName: 'Laporan_Kinerja_Makro_Pembangunan_Semester_I.pdf',
    fileSize: 5200000,
    fileExtension: 'pdf',
    createdBy: 'user_staff_1',
    creatorName: 'Ahmad Fauzi, S.Kom',
    createdAt: '2026-02-20T11:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z',
  },
  // 10. Sertifikat / Piagam
  {
    id: 'surat_keluar_piagam_1',
    nomorSurat: '002.6/010/PIAGAM-BAPPERIDA/2026',
    tanggalSurat: '2026-02-18',
    tanggalDiterima: '2026-02-18',
    tipe: 'keluar',
    jenis: 'Surat Keluar',
    kategoriKeluar: 'Sertifikat / Piagam',
    tingkatUrgensi: 'Biasa',
    pengirim: 'BAPPERIDA Kabupaten Tanggamus',
    penerima: 'Dinas Penanaman Modal & PTSP Kabupaten Tanggamus',
    perihal: 'Piagam Penghargaan Perangkat Daerah Terinovatif Kategori Pelayanan Publik Terpadu',
    ringkasan: 'Pemberian piagam penghargaan resmi atas implementasi sistem perizinan digital terintegrasi.',
    status: 'Diarsipkan',
    fileName: 'Piagam_Penghargaan_Inovasi_DPMPTSP_2026.pdf',
    fileSize: 3400000,
    fileExtension: 'pdf',
    createdBy: 'user_admin',
    creatorName: 'Administrator Sistem',
    createdAt: '2026-02-18T15:20:00Z',
    updatedAt: '2026-02-18T15:20:00Z',
  },
];

// LocalStorage Keys
const STORAGE_KEY_ITEMS = 'arsipcloud_storage_items_v1';
const STORAGE_KEY_USERS = 'arsipcloud_users_v1';
const STORAGE_KEY_SURAT = 'arsipcloud_surat_v1';
const STORAGE_KEY_CURRENT_USER = 'arsipcloud_current_user_v1';
const STORAGE_KEY_IKU = 'arsipcloud_iku_data_v1';
const STORAGE_KEY_PERIODE_RPJMD = 'arsipcloud_periode_rpjmd_v1';
const STORAGE_KEY_TUJUAN_SASARAN = 'arsipcloud_tujuan_sasaran_v1';


export class StorageService {
  static getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    let list = INITIAL_USERS;
    if (raw) {
      try {
        list = JSON.parse(raw);
      } catch {
        list = INITIAL_USERS;
      }
    }
    const hasAdmin = list.some((u) => u.role === 'admin' || u.username === 'admin' || u.email === 'admin@instansi.go.id');
    if (!hasAdmin) {
      list.unshift(INITIAL_USERS[0]);
    }
    // Ensure primary default admin has username and password, and strip photo avatars
    list = list.map((u) => {
      const { avatar, ...rest } = u as any;
      if (rest.id === 'user_admin') {
        return {
          ...rest,
          username: rest.username || 'admin',
          password: rest.password || 'admin',
        };
      }
      return rest;
    });
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(list));
    return list;
  }

  static saveUsers(users: User[]): void {
    const cleaned = users.map((u) => {
      const { avatar, ...rest } = u as any;
      return rest;
    });
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(cleaned));
  }

  static getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        delete parsed.avatar;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  static setCurrentUser(user: User | null): void {
    if (user) {
      const { avatar, ...rest } = user as any;
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(rest));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }

  static getItems(): StorageItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_ITEMS));
      return INITIAL_ITEMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ITEMS;
    }
  }

  static saveItems(items: StorageItem[]): void {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }

  static getSuratList(): SuratItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_SURAT);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_SURAT, JSON.stringify(INITIAL_SURAT));
      return INITIAL_SURAT;
    }
    try {
      let list: SuratItem[] = JSON.parse(raw);
      // Ensure all initial items are preserved or merged if list was from earlier version
      const existingIds = new Set(list.map((s) => s.id));
      let changed = false;
      for (const item of INITIAL_SURAT) {
        if (!existingIds.has(item.id)) {
          list.push(item);
          changed = true;
        }
      }
      // Normalize tipe for each item
      list = list.map((s) => {
        if (!s.tipe) {
          s.tipe = s.jenis === 'Surat Masuk' ? 'masuk' : 'keluar';
        }
        return s;
      });
      if (changed) {
        localStorage.setItem(STORAGE_KEY_SURAT, JSON.stringify(list));
      }
      return list;
    } catch {
      return INITIAL_SURAT;
    }
  }

  static saveSuratList(list: SuratItem[]): void {
    localStorage.setItem(STORAGE_KEY_SURAT, JSON.stringify(list));
  }

  static getIKUList(): IKUItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_IKU);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_IKU, JSON.stringify(INITIAL_IKU_ITEMS));
      return INITIAL_IKU_ITEMS;
    }
    try {
      let list: IKUItem[] = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) {
        localStorage.setItem(STORAGE_KEY_IKU, JSON.stringify(INITIAL_IKU_ITEMS));
        return INITIAL_IKU_ITEMS;
      }
      return list;
    } catch {
      return INITIAL_IKU_ITEMS;
    }
  }

  static saveIKUList(list: IKUItem[]): void {
    localStorage.setItem(STORAGE_KEY_IKU, JSON.stringify(list));
  }

  static getPeriodeList(): PeriodeRPJMD[] {
    const raw = localStorage.getItem(STORAGE_KEY_PERIODE_RPJMD);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PERIODE_RPJMD, JSON.stringify(INITIAL_PERIODE_LIST));
      return INITIAL_PERIODE_LIST;
    }
    try {
      const list: PeriodeRPJMD[] = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) {
        localStorage.setItem(STORAGE_KEY_PERIODE_RPJMD, JSON.stringify(INITIAL_PERIODE_LIST));
        return INITIAL_PERIODE_LIST;
      }
      return list;
    } catch {
      return INITIAL_PERIODE_LIST;
    }
  }

  static savePeriodeList(list: PeriodeRPJMD[]): void {
    localStorage.setItem(STORAGE_KEY_PERIODE_RPJMD, JSON.stringify(list));
  }

  static getTujuanSasaranList(): TujuanSasaranItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_TUJUAN_SASARAN);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_TUJUAN_SASARAN, JSON.stringify(INITIAL_TUJUAN_SASARAN_ITEMS));
      return INITIAL_TUJUAN_SASARAN_ITEMS;
    }
    try {
      const list: TujuanSasaranItem[] = JSON.parse(raw);
      if (!Array.isArray(list) || list.length === 0) {
        localStorage.setItem(STORAGE_KEY_TUJUAN_SASARAN, JSON.stringify(INITIAL_TUJUAN_SASARAN_ITEMS));
        return INITIAL_TUJUAN_SASARAN_ITEMS;
      }
      return list;
    } catch {
      return INITIAL_TUJUAN_SASARAN_ITEMS;
    }
  }

  static saveTujuanSasaranList(list: TujuanSasaranItem[]): void {
    localStorage.setItem(STORAGE_KEY_TUJUAN_SASARAN, JSON.stringify(list));
  }

  static resetToDefault(): void {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_ITEMS));
    localStorage.setItem(STORAGE_KEY_SURAT, JSON.stringify(INITIAL_SURAT));
    localStorage.setItem(STORAGE_KEY_IKU, JSON.stringify(INITIAL_IKU_ITEMS));
    localStorage.setItem(STORAGE_KEY_PERIODE_RPJMD, JSON.stringify(INITIAL_PERIODE_LIST));
    localStorage.setItem(STORAGE_KEY_TUJUAN_SASARAN, JSON.stringify(INITIAL_TUJUAN_SASARAN_ITEMS));
  }
}


// Helpers
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes <= 0 || isNaN(bytes)) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i < 0 || i >= sizes.length) return '0 B';
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function formatDateIndo(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generates clean, standard folder name in Nextcloud for a user's private data:
 * Example:
 *  - username 'admin' -> 'admin'
 *  - username 'ahmad_fauzi' -> 'ahmad_fauzi'
 *  - name 'Ahmad Fauzi, S.Kom' without username -> 'ahmad_fauzi'
 * Separating private folders by user account name makes Nextcloud backups easy to manage.
 */
export function getUserAccountFolder(user?: { name?: string; username?: string; email?: string }): string {
  if (!user) return 'umum';
  if (user.username && user.username.trim()) {
    const cleanUname = user.username.trim().replace(/^@+/, '').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
    if (cleanUname) return cleanUname;
  }
  if (user.name && user.name.trim()) {
    const clean = user.name
      .replace(/,\s*[A-Za-z.\s]+$/g, '')
      .replace(/^(Dr\.|Drs\.|Ir\.|H\.|Hj\.)\s+/gi, '')
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '');
    if (clean) return clean.toLowerCase();
  }
  if (user.email && user.email.trim()) {
    return user.email.split('@')[0].toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
  }
  return 'user';
}


import React, { useState, useEffect } from 'react';
import { AuditLogEntry, AuditActionCategory, AuditStatus, SecurityConfig } from '../../types';
import { AuditLogService } from '../../services/auditLogService';
import { SecurityService } from '../../services/securityService';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Trash2,
  RefreshCw,
  Clock,
  Laptop,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  UserCheck,
  FileText,
  Mail,
  Users,
  Settings,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export const AdminSecurityAuditView: React.FC = () => {
  const { currentUser, isAdmin } = useAuth();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig>(() => SecurityService.getConfig());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'all' | 'today' | '7days'>('all');
  const [selectedLogDetail, setSelectedLogDetail] = useState<AuditLogEntry | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string>('');

  // Load logs on mount
  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const data = AuditLogService.getLogs();
    setLogs(data);
  };

  const showToast = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(''), 3500);
  };

  // Toggle security setting
  const handleToggleSecurity = (key: keyof SecurityConfig) => {
    const updated = SecurityService.saveConfig({ [key]: !securityConfig[key] });
    setSecurityConfig(updated);
    loadLogs();
    showToast(`Pengaturan keamanan "${key}" berhasil diubah.`);
  };

  // Export logs to Excel
  const handleExportExcel = () => {
    if (filteredLogs.length === 0) {
      showToast('Tidak ada data log untuk diekspor.');
      return;
    }
    AuditLogService.exportLogsToExcel(filteredLogs);
    showToast('Berkas Excel Log Keamanan berhasil diunduh.');
  };

  // Clear logs
  const handleClearLogs = () => {
    if (window.confirm('Apakah Anda yakin ingin mengosongkan seluruh riwayat log keamanan dan akses?')) {
      AuditLogService.clearLogs();
      loadLogs();
      showToast('Seluruh riwayat log telah dibersihkan.');
    }
  };

  // Simulate security test
  const handleSimulateInspectBlocked = () => {
    AuditLogService.logSecurity({
      action: 'INSPECT_SHORTCUT_BLOCKED',
      description: 'Simulasi Keamanan: Percobaan membuka Developer Tools (F12) berhasil diblokir oleh perisai sistem.',
      user: currentUser,
      status: 'warning',
      metadata: { key: 'F12', simulated: true },
    });
    loadLogs();
    showToast('Event simulasi keamanan berhasil dicatat dalam log.');
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    // 1. Category
    if (selectedCategory !== 'all' && log.category !== selectedCategory) {
      return false;
    }
    // 2. Status
    if (selectedStatus !== 'all' && log.status !== selectedStatus) {
      return false;
    }
    // 3. Date
    if (selectedDateRange !== 'all') {
      const logDate = new Date(log.timestamp).getTime();
      const now = Date.now();
      if (selectedDateRange === 'today') {
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        if (logDate < oneDayAgo) return false;
      } else if (selectedDateRange === '7days') {
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
        if (logDate < sevenDaysAgo) return false;
      }
    }
    // 4. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchUser = log.userName.toLowerCase().includes(q);
      const matchDesc = log.description.toLowerCase().includes(q);
      const matchIp = log.ipAddress?.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      if (!matchUser && !matchDesc && !matchIp && !matchAction) {
        return false;
      }
    }
    return true;
  });

  // Calculate stats
  const totalLogins = logs.filter((l) => l.action === 'LOGIN_SUCCESS').length;
  const failedLogins = logs.filter((l) => l.action === 'LOGIN_FAILED').length;
  const blockedInspects = logs.filter((l) => l.category === 'security' || l.action.includes('BLOCKED')).length;
  const totalActions = logs.length;

  const activeSessions = AuditLogService.getActiveSessions(currentUser?.id);

  if (!isAdmin) {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-slate-50">
        <ShieldAlert className="w-12 h-12 text-rose-500 mb-3" />
        <h2 className="text-base font-bold text-slate-800">Akses Khusus Administrator</h2>
        <p className="text-xs text-slate-500">Anda tidak memiliki hak otorisasi untuk memantau log keamanan sistem.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden font-sans">
      {/* Header Panel */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center shadow-sm shadow-rose-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Pemantauan Akses &amp; Log Keamanan
                </h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-rose-200 bg-rose-50 text-rose-700 font-mono">
                  Sistem Audit Terpadu
                </span>
              </div>
              <p className="text-xs text-slate-500 max-w-2xl mt-0.5">
                Pantau riwayat login pengguna, deteksi anomali, tindakan berkas/surat, serta kendalikan perlindungan kode akses dan anti-inspeksi.
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateInspectBlocked}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors cursor-pointer"
              title="Uji coba simulasi deteksi inspeksi elemen yang diblokir"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tes Simulasi</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors shadow-2xs cursor-pointer"
              title="Unduh seluruh log keamanan dalam format Excel .xlsx"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>

            <button
              onClick={handleClearLogs}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title="Kosongkan riwayat log"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
        {/* Floating Notification */}
        {noticeMessage && (
          <div className="p-3 rounded-xl bg-slate-900 text-white text-xs flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{noticeMessage}</span>
            </div>
          </div>
        )}

        {/* 1. KEY METRICS STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Sesi Login */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Sesi Login Berhasil</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{totalLogins}</span>
              <span className="text-[10px] text-emerald-600 font-medium">Otentikasi Sah</span>
            </div>
          </div>

          {/* Card 2: Login Gagal */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Percobaan Gagal</span>
              <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-red-600">{failedLogins}</span>
              <span className="text-[10px] text-slate-400 font-medium">Kata Sandi Salah</span>
            </div>
          </div>

          {/* Card 3: Upaya Inspeksi Dihalau */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Inspeksi Dihalau</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-amber-600">{blockedInspects}</span>
              <span className="text-[10px] text-amber-700 font-medium">F12 / Klik Kanan</span>
            </div>
          </div>

          {/* Card 4: Total Log Tindakan */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Tindakan Sistem</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{totalActions}</span>
              <span className="text-[10px] text-blue-600 font-medium">Audit Lengkap</span>
            </div>
          </div>
        </div>

        {/* 2. SECURITY CONTROLS PANEL */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-5 text-white shadow-md border border-slate-800">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-700/80">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-tight">
                  Perisai Keamanan &amp; Perlindungan Kode Akses
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                  PROTEKSI AKTIF
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                Fitur ini secara otomatis mengunci kode akses dan kata sandi agar tidak dapat diekstrak atau di-inspect melalui Developer Tools peramban (F12, Inspect Element, Shortcut Keyboard, dan Klik Kanan).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-300 font-medium">Status Penyamaran Kode:</span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
                Terselubung (Masked)
              </span>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {/* Toggle 1 */}
            <div
              onClick={() => handleToggleSecurity('antiInspectEnabled')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                securityConfig.antiInspectEnabled
                  ? 'bg-slate-800/90 border-indigo-500/50 hover:border-indigo-400'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Kunci Anti-Inspect (F12)</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Blokir F12, Ctrl+Shift+I/C/J
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  securityConfig.antiInspectEnabled
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {securityConfig.antiInspectEnabled ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </div>

            {/* Toggle 2 */}
            <div
              onClick={() => handleToggleSecurity('blockContextMenu')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                securityConfig.blockContextMenu
                  ? 'bg-slate-800/90 border-indigo-500/50 hover:border-indigo-400'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Kunci Klik Kanan</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Nonaktifkan Menu Konteks
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  securityConfig.blockContextMenu
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {securityConfig.blockContextMenu ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </div>

            {/* Toggle 3 */}
            <div
              onClick={() => handleToggleSecurity('detectDevTools')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                securityConfig.detectDevTools
                  ? 'bg-slate-800/90 border-indigo-500/50 hover:border-indigo-400'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Deteksi DevTools</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Pantau Jendela Terbuka
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  securityConfig.detectDevTools
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {securityConfig.detectDevTools ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </div>

            {/* Toggle 4 */}
            <div
              onClick={() => handleToggleSecurity('showWarningToast')}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                securityConfig.showWarningToast
                  ? 'bg-slate-800/90 border-indigo-500/50 hover:border-indigo-400'
                  : 'bg-slate-900/50 border-slate-700 text-slate-400'
              }`}
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Pop-up Peringatan</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Tampilkan Banner Peringatan
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  securityConfig.showWarningToast
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {securityConfig.showWarningToast ? 'AKTIF' : 'NONAKTIF'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. ACTIVE SESSIONS MONITOR */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Laptop className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sesi Pengguna Yang Sedang Aktif ({activeSessions.length})
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">
              Sinkronisasi Waktu Nyata
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {activeSessions.map((sess) => (
              <div
                key={sess.id}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                  sess.isCurrent
                    ? 'bg-indigo-50/50 border-indigo-200'
                    : 'bg-slate-50 border-slate-200/80'
                }`}
              >
                <UserAvatar name={sess.userName} role={sess.userRole} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {sess.userName}
                    </span>
                    {sess.isCurrent && (
                      <span className="text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.2 rounded">
                        Anda
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {sess.department}
                  </div>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>IP: {sess.ipAddress}</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {sess.lastActive}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. REAL-TIME AUDIT LOG TABLE WITH FILTERS */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari user, IP, atau tindakan..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Kategori</option>
                <option value="auth">Otentikasi &amp; Login</option>
                <option value="file">Berkas &amp; Penyimpanan</option>
                <option value="surat">Kearsipan Surat</option>
                <option value="security">Peristiwa Keamanan</option>
                <option value="admin">Administrasi User</option>
                <option value="iku">IKU &amp; Perencanaan</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Status</option>
                <option value="success">Berhasil</option>
                <option value="warning">Peringatan / Dihalau</option>
                <option value="danger">Gagal / Bahaya</option>
              </select>

              {/* Date Filter */}
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value as any)}
                className="text-xs px-2.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Periode</option>
                <option value="today">24 Jam Terakhir</option>
                <option value="7days">7 Hari Terakhir</option>
              </select>

              <button
                onClick={loadLogs}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Segarkan Log"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3 px-4">Waktu (WIB)</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Aktivitas &amp; Rincian Tindakan</th>
                  <th className="py-3 px-4">Alamat IP &amp; Perangkat</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-semibold text-slate-600">Tidak ada log aktivitas yang cocok dengan kriteria filter.</p>
                      <p className="text-[11px] mt-0.5">Coba ubah kata kunci pencarian atau reset filter.</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const date = new Date(log.timestamp);
                    const timeStr = date.toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });
                    const dateStr = date.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Waktu */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono text-slate-900 font-semibold">{timeStr}</div>
                          <div className="text-[10px] text-slate-400">{dateStr}</div>
                        </td>

                        {/* Pengguna */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <UserAvatar name={log.userName} role={log.userRole} size="xs" />
                            <div className="min-w-0">
                              <div className="font-semibold text-slate-900 truncate max-w-[130px]" title={log.userName}>
                                {log.userName}
                              </div>
                              <span className="text-[9px] uppercase font-mono text-slate-400">
                                {log.userRole || 'tamu'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Kategori */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          {log.category === 'auth' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              <UserCheck className="w-3 h-3" />
                              Login &amp; Sesi
                            </span>
                          )}
                          {log.category === 'file' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <FileText className="w-3 h-3" />
                              Berkas
                            </span>
                          )}
                          {log.category === 'surat' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                              <Mail className="w-3 h-3" />
                              Surat Dinas
                            </span>
                          )}
                          {log.category === 'security' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <ShieldAlert className="w-3 h-3" />
                              Keamanan
                            </span>
                          )}
                          {log.category === 'admin' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              <Users className="w-3 h-3" />
                              Admin User
                            </span>
                          )}
                          {log.category === 'iku' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              IKU / Kinerja
                            </span>
                          )}
                        </td>

                        {/* Rincian Tindakan */}
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 leading-snug">
                            {log.description}
                          </div>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                            Aksi: {log.action}
                          </div>
                        </td>

                        {/* IP & Perangkat */}
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-mono text-slate-700 font-semibold text-[11px]">
                            {log.ipAddress || '-'}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[140px]" title={log.deviceInfo}>
                            {log.deviceInfo || '-'}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          {log.status === 'success' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Berhasil
                            </span>
                          )}
                          {log.status === 'warning' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              Dihalau
                            </span>
                          )}
                          {log.status === 'danger' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                              <XCircle className="w-3 h-3" />
                              Gagal / Bahaya
                            </span>
                          )}
                        </td>

                        {/* Detail Trigger */}
                        <td className="py-3 px-4 text-center whitespace-nowrap">
                          <button
                            onClick={() => setSelectedLogDetail(log)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Lihat Detail Log"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Table Info */}
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Menampilkan <strong>{filteredLogs.length}</strong> dari total <strong>{logs.length}</strong> catatan aktivitas
            </span>
            <span className="font-mono text-slate-400">
              Perlindungan Kode Akses &amp; Anti-Inspect: Aktif
            </span>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Rincian Audit Log Keamanan</h3>
                  <span className="text-[10px] font-mono text-slate-400">ID: {selectedLogDetail.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Waktu Pencatatan</span>
                <span className="text-slate-800 font-mono font-medium">
                  {new Date(selectedLogDetail.timestamp).toLocaleString('id-ID')} WIB
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pengguna &amp; Peran</span>
                <span className="text-slate-900 font-bold">
                  {selectedLogDetail.userName} ({selectedLogDetail.userRole || 'tamu'})
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Aksi / Tindakan</span>
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-bold">
                  {selectedLogDetail.action}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Deskripsi Aktivitas</span>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-0.5 leading-relaxed">
                  {selectedLogDetail.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Alamat IP</span>
                  <span className="font-mono text-slate-800">{selectedLogDetail.ipAddress || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Status Tindakan</span>
                  <span className="font-semibold text-slate-800 uppercase">{selectedLogDetail.status}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Perangkat / Peramban</span>
                <span className="text-slate-700">{selectedLogDetail.deviceInfo || '-'}</span>
              </div>

              {selectedLogDetail.metadata && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Metadata Tambahan</span>
                  <pre className="bg-slate-900 text-slate-200 p-2 rounded text-[10px] font-mono overflow-x-auto mt-0.5">
                    {JSON.stringify(selectedLogDetail.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLogDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

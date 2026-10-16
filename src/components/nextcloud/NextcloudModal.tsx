import React, { useState } from 'react';
import { useStorage } from '../../context/StorageContext';
import { NextcloudService } from '../../services/nextcloudService';
import { formatBytes, StorageService, getUserAccountFolder } from '../../services/storageService';
import { 
  Cloud, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  Key, 
  User, 
  FolderSync, 
  Database, 
  BookOpen, 
  ExternalLink,
  ShieldCheck,
  Send,
  Layers,
  ArrowRight,
  HardDrive
} from 'lucide-react';

interface NextcloudModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NextcloudModal: React.FC<NextcloudModalProps> = ({ isOpen, onClose }) => {
  const { 
    nextcloudConfig, 
    updateNextcloudConfig, 
    syncFromNextcloud, 
    pushToNextcloud,
    refreshNextcloudQuota,
    isSyncing 
  } = useStorage();

  const [activeTab, setActiveTab] = useState<'config' | 'guide' | 'arch'>('config');

  // Form states
  const [serverUrl, setServerUrl] = useState(nextcloudConfig.serverUrl);
  const [username, setUsername] = useState(nextcloudConfig.username);
  const [appPassword, setAppPassword] = useState(nextcloudConfig.appPassword);
  const [isEnabled, setIsEnabled] = useState(nextcloudConfig.isEnabled);
  const [customDiskCapacityGB, setCustomDiskCapacityGB] = useState<number>(
    nextcloudConfig.customDiskCapacityGB || 500
  );

  // Status feedback
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    version?: string;
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!serverUrl || !username || !appPassword) {
      setTestResult({
        tested: true,
        success: false,
        message: 'Mohon isi Server URL, Username, dan App Password terlebih dahulu.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await NextcloudService.testConnection(serverUrl, username, appPassword);
      if (res.success) {
        setTestResult({
          tested: true,
          success: true,
          message: res.message || 'Koneksi ke WebDAV Nextcloud Berhasil!',
          version: res.serverVersion,
        });
      } else {
        setTestResult({
          tested: true,
          success: false,
          message: res.message || 'Gagal terhubung ke Nextcloud.',
        });
      }
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: `Koneksi gagal: ${err?.message || 'Network error'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    const customGB = Math.max(1, Number(customDiskCapacityGB) || 500);
    const updated = {
      ...nextcloudConfig,
      serverUrl: serverUrl.trim().replace(/\/+$/, ''),
      username: username.trim(),
      appPassword: appPassword.trim(),
      isEnabled,
      customDiskCapacityGB: customGB,
      diskTotalBytes: customGB * 1024 * 1024 * 1024,
    };
    updateNextcloudConfig(updated);
    setActionMessage({
      text: `Konfigurasi Nextcloud & Kapasitas Global (${customGB} GB) berhasil disimpan!`,
      isError: false,
    });
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleCheckDiskQuota = async () => {
    if (!serverUrl || !username || !appPassword) {
      setActionMessage({ text: 'Lengkapi Server URL, Username, dan App Password terlebih dahulu.', isError: true });
      return;
    }
    setIsCheckingQuota(true);
    try {
      const res = await NextcloudService.getQuota(serverUrl, username, appPassword);
      if (res.success && res.quota) {
        const totalGB = Math.max(1, Math.round(res.quota.totalBytes / (1024 * 1024 * 1024)));
        setCustomDiskCapacityGB(totalGB);
        updateNextcloudConfig({
          ...nextcloudConfig,
          serverUrl: serverUrl.trim().replace(/\/+$/, ''),
          username: username.trim(),
          appPassword: appPassword.trim(),
          isEnabled,
          customDiskCapacityGB: totalGB,
          diskTotalBytes: res.quota.totalBytes,
          diskUsedBytes: res.quota.usedBytes,
          diskFreeBytes: res.quota.freeBytes,
        });
        setActionMessage({
          text: `Kapasitas disk Nextcloud terdeteksi: ${formatBytes(res.quota.totalBytes)}. Kapasitas Global telah disesuaikan!`,
          isError: false,
        });
      } else {
        setActionMessage({
          text: 'Nextcloud tidak membatasi kuota. Anda dapat memilih ukuran harddisk server Anda di bawah ini.',
          isError: false,
        });
      }
    } catch (err: any) {
      setActionMessage({ text: `Gagal membaca kuota Nextcloud: ${err?.message}`, isError: true });
    } finally {
      setIsCheckingQuota(false);
    }
  };

  const handleInitStructure = async () => {
    if (!serverUrl || !username || !appPassword) {
      setActionMessage({ text: 'Lengkapi kredensial server terlebih dahulu.', isError: true });
      return;
    }
    setIsTesting(true);
    try {
      const allUserAccountFolders = StorageService.getUsers().map((u) => getUserAccountFolder(u));
      const res = await NextcloudService.initFolderStructure(serverUrl, username, appPassword, allUserAccountFolders);
      setActionMessage({
        text: res.message || 'Folder ArsipCloud berhasil dibuat di Nextcloud!',
        isError: !res.success,
      });
    } catch (err: any) {
      setActionMessage({ text: `Gagal inisialisasi: ${err?.message}`, isError: true });
    } finally {
      setIsTesting(false);
    }
  };

  const handlePullRealData = async () => {
    const res = await syncFromNextcloud();
    await refreshNextcloudQuota();
    setActionMessage({
      text: res.message,
      isError: !res.success,
    });
  };

  const handlePushData = async () => {
    const res = await pushToNextcloud();
    setActionMessage({
      text: res.message,
      isError: !res.success,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shadow-xs">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Integrasi Nextcloud Server &amp; Database Real
                </h2>
                {nextcloudConfig.isEnabled && (
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-700">
                    Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Hubungkan penyimpanan dan database persuratan langsung ke server Nextcloud Anda
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 px-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'config'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Koneksi Server Nextcloud</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'guide'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Panduan Langkah Demi Langkah</span>
          </button>
          <button
            onClick={() => setActiveTab('arch')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'arch'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Arsitektur &amp; Database</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {actionMessage && (
            <div
              className={`mb-4 p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                actionMessage.isError
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              {actionMessage.isError ? (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {/* TAB 1: CONFIGURATION */}
          {activeTab === 'config' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-sky-950 flex items-start gap-3">
                <Cloud className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block mb-0.5">
                    Sinkronisasi Data Real via Nextcloud WebDAV API
                  </strong>
                  Ketika diaktifkan, seluruh berkas (PDF, Excel, Word, scan surat) dan basis data arsip surat akan disimpan langsung ke server Nextcloud Anda secara permanen.
                </div>
              </div>

              {/* Form Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Server Nextcloud <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={serverUrl}
                      onChange={(e) => setServerUrl(e.target.value)}
                      placeholder="contoh: https://cloud.instansi.go.id atau https://nextcloud.example.com"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Alamat domain atau IP server Nextcloud instansi Anda (disarankan protokol HTTPS).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Nextcloud <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="contoh: admin atau operator_arsip"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    App Password / Token Aplikasi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={appPassword}
                      onChange={(e) => setAppPassword(e.target.value)}
                      placeholder="Token 24 digit dari Nextcloud Keamanan"
                      autoComplete="new-password"
                      spellCheck={false}
                      data-lpignore="true"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Dibuat di: Pengaturan Pribadi &gt; Keamanan &gt; Perangkat &amp; Sesi (Terlindungi).
                  </span>
                </div>
              </div>

              {/* Live Test Connection Area */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Uji Konektivitas Server (Ping WebDAV)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Memeriksa respon HTTP endpoint /remote.php/dav/files
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isTesting}
                  onClick={handleTestConnection}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Sedang Memeriksa...' : 'Uji Koneksi'}</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold block">{testResult.message}</span>
                    {testResult.version && (
                      <span className="text-[11px] font-mono text-emerald-700">
                        Versi Server: {testResult.version}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Mode Toggle */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Aktifkan Penyimpanan Real Nextcloud
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Bila aktif, setiap upload, buat folder, dan simpan surat langsung diproses ke Nextcloud.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => setIsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Kapasitas Global & Ukuran Disk Nextcloud */}
              <div className="p-4 bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/70 border border-indigo-200/90 rounded-xl space-y-3 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Kapasitas Global &amp; Ukuran Disk Nextcloud
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Sesuaikan batas kuota penyimpanan global aplikasi dengan kapasitas harddisk server Nextcloud Anda
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isCheckingQuota}
                    onClick={handleCheckDiskQuota}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs shrink-0 cursor-pointer"
                    title="Cek kapasitas harddisk langsung dari server Nextcloud"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isCheckingQuota ? 'animate-spin' : ''}`} />
                    <span>{isCheckingQuota ? 'Mengecek...' : 'Deteksi Disk Nextcloud'}</span>
                  </button>
                </div>

                {/* Quota Summary cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Kapasitas Global</span>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {customDiskCapacityGB} GB
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {nextcloudConfig.diskTotalBytes ? formatBytes(nextcloudConfig.diskTotalBytes) : `${customDiskCapacityGB} Gigabytes`}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Terpakai Real</span>
                    <span className="text-sm font-extrabold text-indigo-700 font-mono">
                      {nextcloudConfig.diskUsedBytes !== undefined ? formatBytes(nextcloudConfig.diskUsedBytes) : '0 B'}
                    </span>
                    <span className="text-[10px] text-slate-500 block">Data arsip &amp; surat</span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Integrasi</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Terkoneksi ke Global
                    </span>
                    <span className="text-[10px] text-slate-500 block">Sidebar &amp; Dashboard</span>
                  </div>
                </div>

                {/* Manual Preset / Custom Input */}
                <div className="pt-1.5">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                    Pilih atau Masukkan Ukuran Harddisk / Storage Nextcloud Anda:
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[120, 250, 500, 1000, 2000, 4000].map((gb) => (
                      <button
                        key={gb}
                        type="button"
                        onClick={() => setCustomDiskCapacityGB(gb)}
                        className={`px-2.5 py-1 text-xs rounded-lg border font-mono font-medium transition-colors cursor-pointer ${
                          customDiskCapacityGB === gb
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {gb >= 1000 ? `${gb / 1000} TB` : `${gb} GB`}
                      </button>
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        value={customDiskCapacityGB}
                        onChange={(e) => setCustomDiskCapacityGB(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="w-20 px-2 py-1 text-xs border border-slate-300 rounded-lg font-mono text-center focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-500 font-semibold">GB</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Bila server Nextcloud Anda di CasaOS memiliki harddisk 500 GB atau 1 TB, pilih ukuran di atas agar kapasitas global di aplikasi langsung sesuai 100%.
                  </span>
                </div>
              </div>

              {/* Action Buttons for Nextcloud Tasks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleInitStructure}
                  className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-left shadow-xs transition-all hover:bg-slate-50"
                >
                  <FolderSync className="w-4 h-4 text-indigo-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900 block">Inisialisasi Folder</span>
                  <span className="text-[10px] text-slate-500">
                    Otomatis buat struktur /ArsipCloud di Nextcloud
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handlePullRealData}
                  className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-left shadow-xs transition-all hover:bg-slate-50"
                >
                  <RefreshCw className={`w-4 h-4 text-sky-600 mb-1 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span className="text-xs font-bold text-slate-900 block">Tarik Data Real</span>
                  <span className="text-[10px] text-slate-500">
                    Sinkronkan berkas &amp; database dari server
                  </span>
                </button>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handlePushData}
                  className="p-3 bg-white border border-slate-200 hover:border-indigo-300 rounded-xl text-left shadow-xs transition-all hover:bg-slate-50"
                >
                  <Send className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-xs font-bold text-slate-900 block">Kirim Data Lokal</span>
                  <span className="text-[10px] text-slate-500">
                    Unggah data surat &amp; berkas saat ini ke Nextcloud
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: STEP-BY-STEP USER GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900">
                <strong className="block font-semibold mb-1">
                  Panduan Menghubungkan Aplikasi ke Nextcloud Milik Anda
                </strong>
                Ikuti 4 langkah mudah berikut untuk menghasilkan kredensial yang aman tanpa menggunakan kata sandi akun utama.
              </div>

              <div className="space-y-3">
                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs mb-1">
                      Buka Menu Keamanan di Nextcloud
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Login ke Nextcloud Anda di peramban (browser). Klik <strong>Inisial Nama / Profil Akun Anda di sudut kanan atas</strong>, lalu pilih menu <strong>Pengaturan Pribadi (Personal Settings)</strong>. Kemudian di bilah sisi kiri, klik menu <strong>Keamanan (Security)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs mb-1">
                      Buat Kata Sandi Aplikasi (App Password)
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Gulir halaman ke bagian paling bawah berlabel <strong>"Perangkat &amp; sesi" (Devices &amp; sessions)</strong>. Pada kotak input <em>Nama aplikasi</em>, ketik <strong>ArsipCloud</strong>, lalu klik tombol <strong>"Buat kata sandi aplikasi baru" (Create new app password)</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs mb-1">
                      Salin Kredensial ke Form Konfigurasi
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Nextcloud akan menampilkan nama pengguna dan token kata sandi acak (format misalnya: <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">xxxx-xxxx-xxxx-xxxx</code>). Salin token tersebut dan tempelkan ke kolom <strong>App Password</strong> pada tab <em>Koneksi Server Nextcloud</em> di atas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-xs mb-1">
                      Klik "Inisialisasi Folder" &amp; "Tarik Data Real"
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      Klik tombol <strong>Inisialisasi Folder</strong> untuk otomatis menyusun direktori <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/ArsipCloud/</code> di Nextcloud Anda, lalu aktifkan toggle <strong>"Aktifkan Penyimpanan Real Nextcloud"</strong>. Semua data berkas dan surat kini tersimpan nyata di server Nextcloud Anda!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ARCHITECTURE & DATABASE */}
          {activeTab === 'arch' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs mb-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Struktur Penyimpanan Berkas &amp; Database di Nextcloud</span>
                </div>
                <p className="text-slate-600 leading-relaxed mb-3">
                  Sistem menghubungkan frontend dan backend Node.js ke Nextcloud menggunakan standar <strong>WebDAV Protocol (RFC 4918)</strong> yang merupakan fondasi inti Nextcloud.
                </p>

                <div className="font-mono text-[11px] bg-slate-900 text-emerald-400 p-4 rounded-xl space-y-1 overflow-x-auto shadow-inner">
                  <div className="text-white font-bold pb-1 mb-1 border-b border-slate-800">📁 /ArsipCloud/ (Struktur Terpisah Sesuai Akun User)</div>
                  <div>├── 📁 File_Saya/ <span className="text-slate-400">← Folder induk data pribadi (Terisolasi per user)</span></div>
                  <div>│&nbsp;&nbsp;&nbsp;├── 📁 admin/ <span className="text-slate-400">← Data pribadi Administrator Sistem</span></div>
                  <div>│&nbsp;&nbsp;&nbsp;├── 📁 ahmad_fauzi/ <span className="text-slate-400">← Data pribadi Ahmad Fauzi, S.Kom</span></div>
                  <div>│&nbsp;&nbsp;&nbsp;├── 📁 budi_santoso/ <span className="text-slate-400">← Data pribadi Budi Santoso, M.Si</span></div>
                  <div>│&nbsp;&nbsp;&nbsp;├── 📁 bidang_pme/ <span className="text-slate-400">← Data pribadi Operator Bidang PME</span></div>
                  <div>│&nbsp;&nbsp;&nbsp;└── 📁 [nama_akun]/ <span className="text-amber-300">← Otomatis dibuat terpisah untuk setiap user baru</span></div>
                  <div>├── 📁 Folder_Publik/ <span className="text-slate-400">← SOP, regulasi, dan pedoman umum instansi</span></div>
                  <div>├── 📁 Menu_Bidang/ <span className="text-slate-400">← Arsip kinerja bidang teknis</span></div>
                  <div>│&nbsp;&nbsp;&nbsp;├── 📁 Bidang PME/</div>
                  <div>│&nbsp;&nbsp;&nbsp;├── 📁 Bidang Infrastruktur/</div>
                  <div>│&nbsp;&nbsp;&nbsp;└── 📁 Bidang Tata Ruang/</div>
                  <div>└── 📁 Manajemen_Surat/</div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;├── 📄 database_surat.json <span className="text-sky-300">← Basis data real arsip surat &amp; disposisi</span></div>
                  <div>&nbsp;&nbsp;&nbsp;&nbsp;└── 📄 [Lampiran-Surat-*.pdf]</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                  <span className="font-bold text-indigo-950 text-xs flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Kemudahan Backup Per Akun User
                  </span>
                  <p className="text-indigo-900/90 leading-relaxed text-[11px]">
                    Dengan pemisahan folder berdasarkan <strong>nama akun</strong> (<code className="bg-indigo-100 px-1 py-0.5 rounded font-mono text-[10px]">/File_Saya/[nama_akun]</code>), Admin dapat mem-backup berkas individu seorang pegawai secara mandiri dan cepat melalui aplikasi Nextcloud atau file manager CasaOS tanpa khawatir data tertukar.
                  </p>
                </div>

                <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl">
                  <span className="font-bold text-sky-950 text-xs flex items-center gap-1.5 mb-1">
                    <Database className="w-4 h-4 text-sky-600" />
                    Integritas &amp; Pemulihan Terpadu (Disaster Recovery)
                  </span>
                  <p className="text-sky-900/90 leading-relaxed text-[11px]">
                    Jika sewaktu-waktu komputer staf rusak atau berganti perangkat, seluruh dokumen pribadi mereka di server Nextcloud langsung dapat diunduh utuh sesuai nama akun mereka tanpa kehilangan struktur arsip.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            {nextcloudConfig.lastSyncTime ? (
              <span>Terakhir sinkron: {nextcloudConfig.lastSyncTime}</span>
            ) : (
              <span>Belum pernah disinkronkan</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Tutup
            </button>
            {activeTab === 'config' && (
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
              >
                Simpan Konfigurasi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

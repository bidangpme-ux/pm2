import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { useAuth } from '../../context/AuthContext';
import { IKUItem } from '../../types';
import { IKUDiagram } from './IKUDiagram';
import { IKUFormModal } from './IKUFormModal';
import { IKUDetailModal } from './IKUDetailModal';
import { VisiModal } from './VisiModal';
import { IKUPermissionsModal } from './IKUPermissionsModal';
import * as XLSX from 'xlsx';
import { 
  GitFork, 
  Calendar, 
  Plus, 
  Download, 
  Search, 
  Layers, 
  BarChart3, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  FileSpreadsheet,
  Lock,
  Eye,
  Edit3,
  Trash2,
  Filter,
  ShieldCheck,
  UserCheck,
  Sparkles,
  KeyRound
} from 'lucide-react';

export const IKUManagementView: React.FC = () => {
  const { ikuList, addIKU, updateIKU, deleteIKU, updateVisi, deleteVisi } = useStorage();
  const { currentUser, isAdmin, canManageIKU } = useAuth();

  // Distinct sorted years available in dataset
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(ikuList.map((i) => i.tahun))).sort((a, b) => b - a);
    return years.length > 0 ? years : [2025, 2026];
  }, [ikuList]);

  // Selected Year state (default to highest or current year)
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const years = Array.from(new Set(ikuList.map((i) => i.tahun))).sort((a, b) => b - a);
    return years.includes(2025) ? 2025 : years[0] || 2025;
  });

  // Active view tab: 'diagram' or 'matrix'
  const [activeSubTab, setActiveSubTab] = useState<'diagram' | 'matrix'>('diagram');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<IKUItem | null>(null);
  const [inspectingItem, setInspectingItem] = useState<IKUItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<IKUItem | null>(null);

  // Visi modal states
  const [isVisiModalOpen, setIsVisiModalOpen] = useState(false);
  const [editingVisiYear, setEditingVisiYear] = useState<number>(selectedYear);
  const [editingVisiText, setEditingVisiText] = useState<string>('');

  // Admin permission modal state
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);

  // Table filter state
  const [tableSearch, setTableSearch] = useState('');
  const [tableOpdFilter, setTableOpdFilter] = useState('all');

  // Items for the selected year
  const yearItems = useMemo(() => {
    return ikuList.filter((i) => i.tahun === selectedYear);
  }, [ikuList, selectedYear]);

  // Year statistics
  const stats = useMemo(() => {
    const total = yearItems.length;
    const evaluated = yearItems.filter((i) => i.realisasi !== undefined && i.realisasi > 0);
    const avgCapaian = evaluated.length > 0
      ? evaluated.reduce((sum, i) => sum + (i.capaianPersen || 0), 0) / evaluated.length
      : 0;
    const targetMet = evaluated.filter((i) => (i.capaianPersen || 0) >= 100).length;
    const distinctOPD = new Set(yearItems.map((i) => i.perangkatDaerah)).size;

    return {
      total,
      evaluatedCount: evaluated.length,
      avgCapaian,
      targetMet,
      distinctOPD,
    };
  }, [yearItems]);

  // Table filtered items
  const tableFilteredItems = useMemo(() => {
    let result = yearItems;
    if (tableOpdFilter !== 'all') {
      result = result.filter((i) => i.perangkatDaerah === tableOpdFilter);
    }
    if (tableSearch.trim()) {
      const q = tableSearch.toLowerCase();
      result = result.filter(
        (i) =>
          i.visi.toLowerCase().includes(q) ||
          i.misi.toLowerCase().includes(q) ||
          i.tujuan.toLowerCase().includes(q) ||
          i.sasaran.toLowerCase().includes(q) ||
          i.tujuanPD.toLowerCase().includes(q) ||
          i.sasaranPD.toLowerCase().includes(q) ||
          i.perangkatDaerah.toLowerCase().includes(q) ||
          i.indikatorKinerja.toLowerCase().includes(q) ||
          (i.bidangPengampu && i.bidangPengampu.toLowerCase().includes(q))
      );
    }
    return result;
  }, [yearItems, tableOpdFilter, tableSearch]);

  // Export to Excel function using XLSX
  const exportToExcel = () => {
    const rows = yearItems.map((item, index) => ({
      No: index + 1,
      Tahun: item.tahun,
      Visi: item.visi,
      Misi: item.misi,
      'Tujuan Pemda': item.tujuan,
      'Sasaran Pemda': item.sasaran,
      'Tujuan Perangkat Daerah': item.tujuanPD,
      'Sasaran Perangkat Daerah': item.sasaranPD,
      'Perangkat Daerah (OPD)': item.perangkatDaerah,
      'Bidang Pengampu': item.bidangPengampu || '-',
      'Indikator Kinerja Utama (IKU)': item.indikatorKinerja,
      Formula: item.formula || '-',
      Target: item.target,
      Satuan: item.satuan,
      Realisasi: item.realisasi !== undefined ? item.realisasi : '-',
      'Capaian (%)': item.capaianPersen !== undefined ? `${item.capaianPersen.toFixed(2)}%` : '-',
      Kategori: item.kategoriCapaian || 'Belum Dinilai',
      'Penanggung Jawab': item.penanggungJawab || '-',
      Keterangan: item.keterangan || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `IKU_${selectedYear}`);
    XLSX.writeFile(workbook, `Cascading_IKU_Tanggamus_${selectedYear}.xlsx`);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: IKUItem) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    await deleteIKU(deleteCandidate.id);
    setDeleteCandidate(null);
  };

  const handleSaveForm = async (
    data: Omit<IKUItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      await updateIKU(id, data);
    } else {
      await addIKU(data);
    }
  };

  const handleOpenEditVisi = (tahun: number, currentVisi: string) => {
    setEditingVisiYear(tahun);
    setEditingVisiText(currentVisi);
    setIsVisiModalOpen(true);
  };

  const handleSaveVisi = async (tahun: number, newVisi: string) => {
    await updateVisi(tahun, newVisi);
  };

  const handleDeleteVisi = async (tahun: number) => {
    await deleteVisi(tahun);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-slate-100">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <GitFork className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Indikator Kinerja Utama (IKU)
                </h1>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Cascading Berjenjang
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Penyelarasan Visi → Misi → Tujuan → Sasaran → Tujuan PD → Sasaran PD → Perangkat Daerah
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Delegated Access Info for Non-Admin who has canManageIKU */}
            {!isAdmin && canManageIKU && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Wewenang Input &amp; Edit IKU Aktif</span>
              </div>
            )}

            {/* Read-Only Notice Badge for Non-Admin without canManageIKU */}
            {!isAdmin && !canManageIKU && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Mode Pratinjau (Read-Only)</span>
              </div>
            )}

            {/* Admin Only: Button to Manage User IKU Permissions */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsPermissionsModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                title="Tunjuk staf user atau bidang yang memiliki wewenang input/edit IKU"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Hak Akses Pengelola IKU</span>
              </button>
            )}

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={exportToExcel}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
              title="Unduh data cascading IKU dalam format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor Excel</span>
            </button>

            {/* Input Data Button (Available for Admin and Users with canManageIKU) */}
            {canManageIKU && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Input Data IKU</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAMPILAN PERTAMA: PILIH TAHUN (LEVEL 0)                        */}
        {/* ============================================================== */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Langkah 1: Pilih Tahun Anggaran Kinerja
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Tahun Aktif: <strong className="text-emerald-700">{selectedYear}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableYears.map((yr) => {
              const isSelected = selectedYear === yr;
              const countInYear = ikuList.filter((i) => i.tahun === yr).length;
              const evalItems = ikuList.filter((i) => i.tahun === yr && i.realisasi !== undefined && i.realisasi > 0);
              const avg = evalItems.length > 0
                ? evalItems.reduce((acc, i) => acc + (i.capaianPersen || 0), 0) / evalItems.length
                : 0;

              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25 border-emerald-500 ring-2 ring-emerald-500/30'
                      : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-lg font-black tracking-tight ${isSelected ? 'text-white' : 'text-slate-900 group-hover:text-emerald-600'}`}>
                      {yr}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}>
                      {countInYear} IKU
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] flex items-center justify-between">
                    <span className={isSelected ? 'text-emerald-100' : 'text-slate-500'}>
                      Capaian Rata-Rata:
                    </span>
                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-emerald-700'}`}>
                      {avg > 0 ? `${avg.toFixed(1)}%` : '-'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="mt-5 flex items-center gap-2 border-b border-slate-200 -mb-5">
          <button
            type="button"
            onClick={() => setActiveSubTab('diagram')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'diagram'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GitFork className="w-4 h-4" />
            <span>Diagram Cascading Interaktif</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('matrix')}
            className={`pb-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'matrix'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tabel Matriks Kinerja ({yearItems.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* KPI Metrics Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Indikator</span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {stats.total} <span className="text-xs font-semibold text-slate-400">IKU</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Tahun Anggaran {selectedYear}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Rata-rata Capaian</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-2">
              {stats.avgCapaian > 0 ? `${stats.avgCapaian.toFixed(1)}%` : '-'}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {stats.evaluatedCount} dari {stats.total} dinilai
            </span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Target Tercapai (≥100%)</span>
              <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {stats.targetMet}{' '}
              <span className="text-xs font-semibold text-emerald-600">
                ({stats.total > 0 ? ((stats.targetMet / stats.total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Kategori Sangat Tinggi</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Perangkat Daerah</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              {stats.distinctOPD}{' '}
              <span className="text-xs font-semibold text-slate-400">OPD</span>
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Pengampu Kinerja Daerah</span>
          </div>
        </div>

        {/* TAB 1: DIAGRAM CASCADING INTERAKTIF */}
        {activeSubTab === 'diagram' && (
          <IKUDiagram
            items={ikuList}
            selectedYear={selectedYear}
            isAdmin={isAdmin}
            canManage={canManageIKU}
            onSelectItem={(item) => setInspectingItem(item)}
            onEditItem={(item) => handleOpenEdit(item)}
            onDeleteItem={(item) => setDeleteCandidate(item)}
            onEditVisi={(yr, currentVisi) => handleOpenEditVisi(yr, currentVisi)}
            onDeleteVisi={(yr) => handleDeleteVisi(yr)}
          />
        )}

        {/* TAB 2: TABEL MATRIKS KINERJA */}
        {activeSubTab === 'matrix' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Cari indikator, sasaran, OPD, penanggung jawab..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={tableOpdFilter}
                  onChange={(e) => setTableOpdFilter(e.target.value)}
                  className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-700 cursor-pointer"
                >
                  <option value="all">Semua Perangkat Daerah</option>
                  {Array.from(new Set(yearItems.map((i) => i.perangkatDaerah))).map((opd) => (
                    <option key={opd} value={opd}>
                      {opd}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Perangkat Daerah / Bidang</th>
                    <th className="px-4 py-3">Indikator Kinerja Utama (IKU)</th>
                    <th className="px-4 py-3">Sasaran Pemda</th>
                    <th className="px-4 py-3">Sasaran Perangkat Daerah</th>
                    <th className="px-4 py-3 text-right">Target</th>
                    <th className="px-4 py-3 text-right">Realisasi</th>
                    <th className="px-4 py-3 text-center">Capaian</th>
                    <th className="px-4 py-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableFilteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                        Tidak ada data yang cocok dengan kriteria filter.
                      </td>
                    </tr>
                  ) : (
                    tableFilteredItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{item.perangkatDaerah}</span>
                          {item.bidangPengampu && (
                            <span className="text-[10px] text-slate-500">{item.bidangPengampu}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-bold text-slate-900 block">{item.indikatorKinerja}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.satuan ? `Satuan: ${item.satuan}` : ''}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={item.sasaran}>
                          {item.sasaran}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={item.sasaranPD}>
                          {item.sasaranPD}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {item.target}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          {item.realisasi !== undefined ? item.realisasi : '-'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.capaianPersen !== undefined ? (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.capaianPersen >= 100
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.capaianPersen >= 90
                                  ? 'bg-blue-100 text-blue-800'
                                  : item.capaianPersen >= 75
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {item.capaianPersen.toFixed(1)}%
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">Belum Dinilai</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => setInspectingItem(item)}
                              className="p-1 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                              title="Lihat Detail & Silsilah Cascading"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            {canManageIKU && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteCandidate(item)}
                                  className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Input / Edit Data IKU */}
      <IKUFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveForm}
        editItem={editingItem}
        defaultYear={selectedYear}
        existingItems={ikuList}
      />

      {/* MODAL: Detail IKU & Cascading Lineage */}
      <IKUDetailModal
        item={inspectingItem}
        isOpen={Boolean(inspectingItem)}
        onClose={() => setInspectingItem(null)}
        isAdmin={canManageIKU}
        onEdit={(item) => handleOpenEdit(item)}
        onDelete={(item) => setDeleteCandidate(item)}
      />

      {/* MODAL: Edit & Hapus Visi Daerah */}
      <VisiModal
        isOpen={isVisiModalOpen}
        onClose={() => setIsVisiModalOpen(false)}
        tahun={editingVisiYear}
        currentVisi={editingVisiText}
        onSaveVisi={handleSaveVisi}
        onDeleteVisi={handleDeleteVisi}
      />

      {/* MODAL: Kelola Hak Akses Pengelola IKU (Admin Only) */}
      <IKUPermissionsModal
        isOpen={isPermissionsModalOpen}
        onClose={() => setIsPermissionsModalOpen(false)}
      />

      {/* MODAL: Konfirmasi Hapus Data */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus IKU</h3>
            <p className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus indikator{' '}
              <strong className="text-slate-800">"{deleteCandidate.indikatorKinerja}"</strong> ({deleteCandidate.perangkatDaerah})?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer shadow-xs"
              >
                Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

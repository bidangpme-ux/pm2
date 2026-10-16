import React, { useState, useMemo } from 'react';
import { useStorage } from '../../context/StorageContext';
import { useAuth } from '../../context/AuthContext';
import { TujuanSasaranItem, PeriodeRPJMD } from '../../types';
import { TujuanSasaranFormModal } from './TujuanSasaranFormModal';
import { PeriodeModal } from './PeriodeModal';
import { TujuanSasaranDetailModal } from './TujuanSasaranDetailModal';
import * as XLSX from 'xlsx';
import { 
  Target, 
  Compass, 
  Award, 
  Building2, 
  CalendarRange, 
  Plus, 
  Download, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Layers, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Lock,
  Sparkles,
  ChevronRight,
  Settings,
  FolderKanban
} from 'lucide-react';

export const TujuanSasaranManagementView: React.FC = () => {
  const { 
    tujuanSasaranList, 
    periodeList, 
    activePeriode, 
    setActivePeriode,
    addTujuanSasaran, 
    updateTujuanSasaran, 
    deleteTujuanSasaran,
    addPeriode,
    updatePeriode,
    deletePeriode
  } = useStorage();

  const { currentUser, isAdmin, canManageIKU } = useAuth();

  // Permission: Admin and users with delegated canManageIKU can modify
  const canEdit = isAdmin || canManageIKU;

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TujuanSasaranItem | null>(null);
  const [inspectingItem, setInspectingItem] = useState<TujuanSasaranItem | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<TujuanSasaranItem | null>(null);
  const [isPeriodeModalOpen, setIsPeriodeModalOpen] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [misiFilter, setMisiFilter] = useState('all');
  const [opdFilter, setOpdFilter] = useState('all');

  // Filter items by active periode
  const itemsInActivePeriode = useMemo(() => {
    return tujuanSasaranList.filter((item) => item.periodeId === activePeriode.id);
  }, [tujuanSasaranList, activePeriode.id]);

  // Distinct Misi list for filtering
  const distinctMisiList = useMemo(() => {
    return Array.from(new Set(itemsInActivePeriode.map((i) => i.misi).filter(Boolean))).sort();
  }, [itemsInActivePeriode]);

  // Distinct OPD list for filtering
  const distinctOPDList = useMemo(() => {
    const set = new Set<string>();
    itemsInActivePeriode.forEach((item) => {
      (item.perangkatDaerahList || []).forEach((opd) => set.add(opd));
    });
    return Array.from(set).sort();
  }, [itemsInActivePeriode]);

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = itemsInActivePeriode;

    if (misiFilter !== 'all') {
      result = result.filter((i) => i.misi === misiFilter);
    }

    if (opdFilter !== 'all') {
      result = result.filter((i) => (i.perangkatDaerahList || []).includes(opdFilter));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.visi.toLowerCase().includes(q) ||
          i.misi.toLowerCase().includes(q) ||
          i.tujuan.toLowerCase().includes(q) ||
          i.sasaran.toLowerCase().includes(q) ||
          i.indikator.toLowerCase().includes(q) ||
          i.satuan.toLowerCase().includes(q) ||
          (i.perangkatDaerahList || []).some((opd) => opd.toLowerCase().includes(q)) ||
          (i.bidangPengampu && i.bidangPengampu.toLowerCase().includes(q)) ||
          (i.keterangan && i.keterangan.toLowerCase().includes(q))
      );
    }

    return result;
  }, [itemsInActivePeriode, misiFilter, opdFilter, searchQuery]);

  // Quick stats
  const stats = useMemo(() => {
    const totalIndikator = itemsInActivePeriode.length;
    const totalTujuan = new Set(itemsInActivePeriode.map((i) => i.tujuan)).size;
    const totalSasaran = new Set(itemsInActivePeriode.map((i) => i.sasaran)).size;
    const allOPD = new Set<string>();
    itemsInActivePeriode.forEach((i) => {
      (i.perangkatDaerahList || []).forEach((opd) => allOPD.add(opd));
    });

    return {
      totalIndikator,
      totalTujuan,
      totalSasaran,
      totalOPD: allOPD.size,
    };
  }, [itemsInActivePeriode]);

  // Action handlers
  const handleOpenAdd = () => {
    setEditingItem(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (item: TujuanSasaranItem) => {
    setEditingItem(item);
    setIsFormModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    await deleteTujuanSasaran(deleteCandidate.id);
    setDeleteCandidate(null);
  };

  const handleSaveForm = async (
    data: Omit<TujuanSasaranItem, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
  ) => {
    if (id) {
      await updateTujuanSasaran(id, data);
    } else {
      await addTujuanSasaran(data);
    }
  };

  // Export to Excel with full 5-year columns
  const exportToExcel = () => {
    const rows = filteredItems.map((item, idx) => {
      const rowData: Record<string, any> = {
        No: idx + 1,
        Visi: item.visi,
        Misi: item.misi,
        Tujuan: item.tujuan,
        Sasaran: item.sasaran,
        'Indikator Kinerja': item.indikator,
        Satuan: item.satuan,
      };

      // Append each target year as its own column
      activePeriode.tahunList.forEach((yr) => {
        rowData[`Target ${yr}`] = item.targetTahunan?.[yr] !== undefined ? item.targetTahunan[yr] : '-';
      });

      rowData['Perangkat Daerah (Multi-OPD)'] = (item.perangkatDaerahList || []).join(', ');
      rowData['Bidang Pengampu'] = item.bidangPengampu || '-';
      rowData['Formula Perhitungan'] = item.formula || '-';
      rowData['Keterangan'] = item.keterangan || '-';

      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `TujuanSasaran_${activePeriode.tahunMulai}_${activePeriode.tahunSelesai}`);
    XLSX.writeFile(workbook, `Tujuan_Sasaran_RPJMD_${activePeriode.tahunMulai}_${activePeriode.tahunSelesai}.xlsx`);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto bg-slate-100">
      {/* Top Header Banner */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-blue-700 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Tujuan &amp; Sasaran RPJMD
                </h1>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
                  Periode 5 Tahunan
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Penyelarasan Visi, Misi, Tujuan, Sasaran, Indikator, Satuan, Target Tahunan &amp; Perangkat Daerah (Multi-OPD)
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Active Periode Selector / Button */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 shadow-2xs">
              <CalendarRange className="w-4 h-4 text-indigo-600 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                  Periode Aktif
                </div>
                <div className="text-xs font-extrabold text-slate-800">
                  {activePeriode.nama}
                </div>
              </div>
            </div>

            {/* Manage Periode Modal Button (Admin only or all can view) */}
            <button
              type="button"
              onClick={() => setIsPeriodeModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Kelola Daftar Periode 5 Tahunan RPJMD"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Kelola Periode</span>
            </button>

            {/* Read-only notification badge for users who cannot edit */}
            {!canEdit && (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Pratinjau (Read-Only)</span>
              </div>
            )}

            {/* Add Indicator Button (Admin or authorized user) */}
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenAdd}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:from-indigo-700 hover:to-blue-700 transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Indikator</span>
              </button>
            )}

            {/* Export Excel Button */}
            <button
              type="button"
              onClick={exportToExcel}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Ekspor Seluruh Matriks ke Format Microsoft Excel (.xlsx)"
            >
              <Download className="w-4 h-4" />
              <span>Ekspor Excel</span>
            </button>
          </div>
        </div>

        {/* Periode Switcher Tabs */}
        {periodeList.length > 1 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Pilih Periode:
            </span>
            {periodeList.map((p) => {
              const isSelected = p.id === activePeriode.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePeriode(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <CalendarRange className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{p.nama}</span>
                  {p.isAktif && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      Aktif
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Workspace Body */}
      <div className="p-4 sm:p-6 space-y-5">
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-tight">
                {stats.totalIndikator}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Total Indikator Sasaran
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-tight">
                {stats.totalTujuan}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Tujuan Pembangunan
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-tight">
                {stats.totalSasaran}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Sasaran Strategis
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-slate-900 leading-tight">
                {stats.totalOPD}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
                Perangkat Daerah Terkait
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Visi, Misi, Tujuan, Sasaran, Indikator, Perangkat Daerah..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Filter Misi */}
            <select
              value={misiFilter}
              onChange={(e) => setMisiFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Semua Misi</option>
              {distinctMisiList.map((m, idx) => (
                <option key={idx} value={m}>
                  {m.length > 50 ? m.substring(0, 50) + '...' : m}
                </option>
              ))}
            </select>

            {/* Filter Perangkat Daerah */}
            <select
              value={opdFilter}
              onChange={(e) => setOpdFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Semua Perangkat Daerah</option>
              {distinctOPDList.map((opd, idx) => (
                <option key={idx} value={opd}>
                  {opd}
                </option>
              ))}
            </select>

            {/* Clear filters */}
            {(searchQuery || misiFilter !== 'all' || opdFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setMisiFilter('all');
                  setOpdFilter('all');
                }}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Main Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Matriks Tabel Tujuan &amp; Sasaran
              </span>
              <span className="text-xs text-slate-400">
                ({filteredItems.length} dari {itemsInActivePeriode.length} data)
              </span>
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Target Periode: {activePeriode.tahunList.join(', ')}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-3 px-3 text-center w-12 sticky left-0 bg-slate-900 z-10">No</th>
                  <th className="py-3 px-4 w-44">Visi</th>
                  <th className="py-3 px-4 w-48">Misi</th>
                  <th className="py-3 px-4 w-52">Tujuan</th>
                  <th className="py-3 px-4 w-52">Sasaran</th>
                  <th className="py-3 px-4 w-60">Indikator</th>
                  <th className="py-3 px-3 w-28 text-center">Satuan</th>
                  {/* Dynamic 5-year target columns */}
                  {activePeriode.tahunList.map((tahun) => (
                    <th key={tahun} className="py-3 px-3 text-center w-24 bg-slate-800 text-indigo-200">
                      Target {tahun}
                    </th>
                  ))}
                  <th className="py-3 px-4 w-64">Perangkat Daerah (Multi-OPD)</th>
                  <th className="py-3 px-3 text-center w-28 sticky right-0 bg-slate-900 z-10">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={8 + activePeriode.tahunList.length} 
                      className="py-12 text-center text-slate-400 font-medium"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Target className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                        <p className="text-sm font-semibold text-slate-600">Tidak ada data Tujuan &amp; Sasaran</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {searchQuery || misiFilter !== 'all' || opdFilter !== 'all'
                            ? 'Coba sesuaikan kata kunci atau reset filter pencarian.'
                            : 'Belum ada data untuk periode ini. Klik "Tambah Indikator" untuk memulai.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => {
                    return (
                      <tr 
                        key={item.id} 
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        {/* No */}
                        <td className="py-3.5 px-3 text-center font-bold text-slate-400 sticky left-0 bg-white group-hover:bg-indigo-50/30 z-10">
                          {index + 1}
                        </td>

                        {/* Visi */}
                        <td className="py-3.5 px-4 font-medium text-slate-800 align-top">
                          <p className="line-clamp-3 text-[11px] leading-relaxed" title={item.visi}>
                            {item.visi}
                          </p>
                        </td>

                        {/* Misi */}
                        <td className="py-3.5 px-4 font-medium text-slate-800 align-top">
                          <div className="flex items-start gap-1.5">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                              Misi {item.misiNomor || '1'}
                            </span>
                          </div>
                          <p className="line-clamp-3 text-[11px] text-slate-600 mt-1 leading-relaxed" title={item.misi}>
                            {item.misi}
                          </p>
                        </td>

                        {/* Tujuan */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900 align-top">
                          <p className="line-clamp-3 text-xs leading-relaxed" title={item.tujuan}>
                            {item.tujuan}
                          </p>
                        </td>

                        {/* Sasaran */}
                        <td className="py-3.5 px-4 font-semibold text-slate-800 align-top">
                          <p className="line-clamp-3 text-xs leading-relaxed" title={item.sasaran}>
                            {item.sasaran}
                          </p>
                        </td>

                        {/* Indikator */}
                        <td className="py-3.5 px-4 font-bold text-indigo-950 align-top">
                          <div className="flex items-start gap-1.5">
                            <Target className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">{item.indikator}</span>
                          </div>
                          {item.formula && (
                            <p className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-1 font-mono" title={item.formula}>
                              Formula: {item.formula}
                            </p>
                          )}
                        </td>

                        {/* Satuan (ditulis manual) */}
                        <td className="py-3.5 px-3 text-center align-top">
                          <span className="inline-block px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            {item.satuan}
                          </span>
                        </td>

                        {/* Dynamic 5-year target columns */}
                        {activePeriode.tahunList.map((tahun) => {
                          const targetVal = item.targetTahunan?.[tahun];
                          return (
                            <td 
                              key={tahun} 
                              className="py-3.5 px-3 text-center font-extrabold text-indigo-700 bg-indigo-50/20 align-top"
                            >
                              <div className="text-xs">
                                {targetVal !== undefined && targetVal !== '' ? targetVal : '-'}
                              </div>
                            </td>
                          );
                        })}

                        {/* Perangkat Daerah (Satu indikator bisa lebih dari 1 perangkat daerah) */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {item.perangkatDaerahList && item.perangkatDaerahList.length > 0 ? (
                              item.perangkatDaerahList.map((opd, opdIdx) => (
                                <span
                                  key={opdIdx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 group-hover:border-indigo-200 group-hover:bg-white transition-colors"
                                  title={opd}
                                >
                                  <Building2 className="w-3 h-3 text-indigo-600 shrink-0" />
                                  <span>{opd}</span>
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Belum dipilih</span>
                            )}
                          </div>
                        </td>

                        {/* Aksi: Edit, Hapus, Detail */}
                        <td className="py-3.5 px-3 text-center sticky right-0 bg-white group-hover:bg-indigo-50/30 z-10 align-top">
                          <div className="flex items-center justify-center gap-1">
                            {/* Inspect Detail Button */}
                            <button
                              type="button"
                              onClick={() => setInspectingItem(item)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Detail Lengkap"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Edit Button (Restricted to canEdit) */}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                title="Edit Data Indikator & Target"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete Button (Restricted to canEdit) */}
                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => setDeleteCandidate(item)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Data Indikator"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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
      </div>

      {/* Form Modal for Add & Edit Tujuan-Sasaran */}
      <TujuanSasaranFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleSaveForm}
        editItem={editingItem}
        activePeriode={activePeriode}
        existingItems={itemsInActivePeriode}
      />

      {/* Periode Management Modal (RPJMD 5 Tahunan) */}
      <PeriodeModal
        isOpen={isPeriodeModalOpen}
        onClose={() => setIsPeriodeModalOpen(false)}
        periodeList={periodeList}
        activePeriode={activePeriode}
        onSelectActivePeriode={(p) => setActivePeriode(p)}
        onAddPeriode={addPeriode}
        onUpdatePeriode={updatePeriode}
        onDeletePeriode={deletePeriode}
        isAdmin={isAdmin}
      />

      {/* Detail Inspection Modal */}
      <TujuanSasaranDetailModal
        isOpen={!!inspectingItem}
        onClose={() => setInspectingItem(null)}
        item={inspectingItem}
        activePeriode={activePeriode}
      />

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center gap-3.5 mb-4 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Konfirmasi Hapus Indikator
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus indikator{' '}
              <strong className="text-slate-900">"{deleteCandidate.indikator}"</strong> dari periode{' '}
              <strong className="text-slate-900">{activePeriode.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

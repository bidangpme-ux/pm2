import React, { useState, useMemo } from 'react';
import { IKUItem } from '../../types';
import { 
  Compass, 
  Target, 
  Building2, 
  Award, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Filter, 
  Layers, 
  Eye, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Maximize2,
  Minimize2,
  GitFork,
  ArrowDown,
  Sparkles,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';

interface IKUDiagramProps {
  items: IKUItem[];
  selectedYear: number;
  isAdmin: boolean;
  canManage?: boolean;
  onSelectItem: (item: IKUItem) => void;
  onEditItem?: (item: IKUItem) => void;
  onDeleteItem?: (item: IKUItem) => void;
  onEditVisi?: (tahun: number, currentVisi: string) => void;
  onDeleteVisi?: (tahun: number) => void;
}

export const IKUDiagram: React.FC<IKUDiagramProps> = ({
  items,
  selectedYear,
  isAdmin,
  canManage = isAdmin,
  onSelectItem,
  onEditItem,
  onDeleteItem,
  onEditVisi,
  onDeleteVisi,
}) => {
  const [selectedMisi, setSelectedMisi] = useState<string | null>(null);
  const [selectedTujuan, setSelectedTujuan] = useState<string | null>(null);
  const [selectedSasaran, setSelectedSasaran] = useState<string | null>(null);
  const [selectedOPDFilter, setSelectedOPDFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'stepped' | 'fullTree'>('stepped');

  // Filter items for the selected year
  const yearItems = useMemo(() => {
    return items.filter((item) => item.tahun === selectedYear);
  }, [items, selectedYear]);

  // Distinct OPDs for filter
  const opdList = useMemo(() => {
    return Array.from(new Set(yearItems.map((i) => i.perangkatDaerah).filter(Boolean))).sort();
  }, [yearItems]);

  // Filter by search and OPD
  const filteredItems = useMemo(() => {
    let result = yearItems;
    if (selectedOPDFilter !== 'all') {
      result = result.filter((i) => i.perangkatDaerah === selectedOPDFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
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
  }, [yearItems, selectedOPDFilter, searchQuery]);

  // Visi (usually 1 for the district)
  const currentVisi = useMemo(() => {
    if (filteredItems.length > 0) return filteredItems[0].visi;
    if (yearItems.length > 0) return yearItems[0].visi;
    return 'Terwujudnya Kabupaten Tanggamus yang Tangguh, Agamis, Mandiri, Unggul dan Sejahtera (TANGGAMUS TAMUS)';
  }, [filteredItems, yearItems]);

  // Distinct Misi list under this year
  const misiList = useMemo(() => {
    const map = new Map<string, { misi: string; nomor: number; count: number; opdSet: Set<string> }>();
    yearItems.forEach((item) => {
      const key = item.misi;
      if (!map.has(key)) {
        map.set(key, {
          misi: item.misi,
          nomor: item.misiNomor || 1,
          count: 0,
          opdSet: new Set<string>(),
        });
      }
      const entry = map.get(key)!;
      entry.count += 1;
      entry.opdSet.add(item.perangkatDaerah);
    });
    return Array.from(map.values()).sort((a, b) => a.nomor - b.nomor);
  }, [yearItems]);

  // Set default active Misi when year changes
  React.useEffect(() => {
    if (misiList.length > 0 && (!selectedMisi || !misiList.some((m) => m.misi === selectedMisi))) {
      setSelectedMisi(misiList[0].misi);
      setSelectedTujuan(null);
      setSelectedSasaran(null);
    }
  }, [misiList, selectedYear]);

  // Active items based on selected Misi in stepped mode
  const activeMisiItems = useMemo(() => {
    if (!selectedMisi) return filteredItems;
    return filteredItems.filter((i) => i.misi === selectedMisi);
  }, [filteredItems, selectedMisi]);

  // Tujuan list under active Misi
  const tujuanList = useMemo(() => {
    const map = new Map<string, { tujuan: string; count: number }>();
    activeMisiItems.forEach((i) => {
      const prev = map.get(i.tujuan)?.count || 0;
      map.set(i.tujuan, { tujuan: i.tujuan, count: prev + 1 });
    });
    return Array.from(map.values());
  }, [activeMisiItems]);

  // Active items based on selected Tujuan
  const activeTujuanItems = useMemo(() => {
    if (!selectedTujuan) return activeMisiItems;
    return activeMisiItems.filter((i) => i.tujuan === selectedTujuan);
  }, [activeMisiItems, selectedTujuan]);

  // Sasaran list under active Tujuan
  const sasaranList = useMemo(() => {
    const map = new Map<string, { sasaran: string; count: number }>();
    activeTujuanItems.forEach((i) => {
      const prev = map.get(i.sasaran)?.count || 0;
      map.set(i.sasaran, { sasaran: i.sasaran, count: prev + 1 });
    });
    return Array.from(map.values());
  }, [activeTujuanItems]);

  // Active items based on selected Sasaran
  const activeSasaranItems = useMemo(() => {
    if (!selectedSasaran) return activeTujuanItems;
    return activeTujuanItems.filter((i) => i.sasaran === selectedSasaran);
  }, [activeTujuanItems, selectedSasaran]);

  // Helper toggle node expansion for Full Tree
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: prev[nodeId] === undefined ? false : !prev[nodeId],
    }));
  };

  const isExpanded = (nodeId: string, defaultOpen = true) => {
    if (expandedNodes[nodeId] !== undefined) return expandedNodes[nodeId];
    return defaultOpen;
  };

  const expandAll = () => {
    const newMap: Record<string, boolean> = {};
    yearItems.forEach((_, idx) => {
      newMap[`misi_${idx}`] = true;
      newMap[`tujuan_${idx}`] = true;
      newMap[`sasaran_${idx}`] = true;
      newMap[`tujuanPD_${idx}`] = true;
    });
    setExpandedNodes(newMap);
  };

  const collapseAll = () => {
    const newMap: Record<string, boolean> = {};
    misiList.forEach((_, idx) => {
      newMap[`misi_${idx}`] = false;
    });
    setExpandedNodes(newMap);
  };

  const getCapaianColor = (persen?: number) => {
    if (persen === undefined || persen === 0) return 'text-slate-500 bg-slate-100 border-slate-200';
    if (persen >= 100) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (persen >= 90) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (persen >= 75) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari indikator, tujuan, sasaran, atau perangkat daerah..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-slate-800 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              ×
            </button>
          )}
        </div>

        {/* Middle: Filter OPD */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedOPDFilter}
            onChange={(e) => setSelectedOPDFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Semua Perangkat Daerah ({opdList.length})</option>
            {opdList.map((opd) => (
              <option key={opd} value={opd}>
                {opd}
              </option>
            ))}
          </select>
        </div>

        {/* Right: View Mode Toggle */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('stepped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'stepped'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Diagram Bertingkat
          </button>
          <button
            type="button"
            onClick={() => setViewMode('fullTree')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'fullTree'
                ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bagan Pohon Penuh
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODE 1: DIAGRAM BERTINGKAT INTERAKTIF (STEP-BY-STEP CASCADING) */}
      {/* ============================================================== */}
      {viewMode === 'stepped' && (
        <div className="space-y-6">
          {/* LEVEL 1: VISI DAERAH */}
          <div className="relative p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white shadow-md border border-indigo-700/50 overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
                  <Compass className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Level 1: Visi Daerah (RPJMD {selectedYear})
                    </span>
                    <span className="text-[11px] text-indigo-200">
                      Kabupaten Tanggamus
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-1 leading-snug">
                    "{currentVisi}"
                  </h3>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-indigo-200 block">Total Indikator</span>
                  <span className="text-xl font-black text-white">{filteredItems.length} IKU</span>
                </div>

                {canManage && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => onEditVisi?.(selectedYear, currentVisi)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/15 hover:bg-white/25 text-white border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      title="Edit Uraian Visi Daerah"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Edit Visi</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteVisi?.(selectedYear)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 border border-rose-400/30 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Hapus / Reset Visi Daerah"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                      <span>Hapus Visi</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Connecting flow pointer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-indigo-200">
              <div className="flex items-center gap-1.5 font-medium">
                <span>Cascading Alur:</span>
                <span className="text-emerald-300 font-bold">Visi</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                <span className="text-blue-300 font-bold">Misi</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                <span className="text-violet-300 font-bold">Tujuan</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                <span className="text-purple-300 font-bold">Sasaran</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                <span className="text-amber-300 font-bold">Tujuan PD</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                <span className="text-rose-300 font-bold">Sasaran PD</span>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                <span className="text-teal-300 font-bold">Perangkat Daerah</span>
              </div>
              <span className="text-[11px] text-white/60">Klik kartu di bawah untuk menelusuri</span>
            </div>
          </div>

          {/* LEVEL 2: MISI DAERAH */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Level 2: Pilih Misi RPJMD
                </h4>
              </div>
              <span className="text-xs text-slate-500">{misiList.length} Misi Terdaftar</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {misiList.map((m) => {
                const isSelected = selectedMisi === m.misi;
                return (
                  <div
                    key={m.misi}
                    onClick={() => {
                      setSelectedMisi(m.misi);
                      setSelectedTujuan(null);
                      setSelectedSasaran(null);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden group ${
                      isSelected
                        ? 'bg-blue-50/90 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                      }`}>
                        Misi {m.nomor}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {m.count} IKU
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-slate-800 line-clamp-3 leading-snug">
                      {m.misi}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{m.opdSet.size} OPD Terkait</span>
                      {isSelected ? (
                        <span className="text-blue-600 font-bold flex items-center gap-0.5">
                          Aktif <ChevronRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <span className="text-slate-400 group-hover:text-blue-600">Pilih</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LEVEL 3 & 4: TUJUAN & SASARAN DAERAH (RPJMD) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-violet-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Level 3 &amp; 4: Tujuan &amp; Sasaran Daerah (RPJMD)
                </h4>
              </div>

              {/* Breadcrumb path */}
              <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
                <span className="font-semibold text-slate-700">Misi Aktif:</span>
                <span className="text-blue-600 font-medium truncate max-w-[280px]">
                  {selectedMisi || 'Semua'}
                </span>
                {selectedTujuan && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-violet-600 font-medium truncate max-w-[200px]">
                      {selectedTujuan}
                    </span>
                  </>
                )}
                {selectedSasaran && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-purple-600 font-medium truncate max-w-[200px]">
                      {selectedSasaran}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Filter buttons for Tujuan */}
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Tujuan Daerah:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTujuan(null);
                    setSelectedSasaran(null);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedTujuan === null
                      ? 'bg-violet-600 text-white shadow-2xs font-bold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Semua Tujuan ({tujuanList.length})
                </button>
                {tujuanList.map((t) => (
                  <button
                    key={t.tujuan}
                    type="button"
                    onClick={() => {
                      setSelectedTujuan(t.tujuan);
                      setSelectedSasaran(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer max-w-md text-left truncate ${
                      selectedTujuan === t.tujuan
                        ? 'bg-violet-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                    title={t.tujuan}
                  >
                    {t.tujuan} ({t.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Filter buttons for Sasaran */}
            {sasaranList.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Sasaran Daerah:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSasaran(null)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedSasaran === null
                        ? 'bg-purple-600 text-white shadow-2xs font-bold'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Semua Sasaran ({sasaranList.length})
                  </button>
                  {sasaranList.map((s) => (
                    <button
                      key={s.sasaran}
                      type="button"
                      onClick={() => setSelectedSasaran(s.sasaran)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer max-w-md text-left truncate ${
                        selectedSasaran === s.sasaran
                          ? 'bg-purple-600 text-white shadow-2xs font-bold'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                      title={s.sasaran}
                    >
                      {s.sasaran} ({s.count})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LEVEL 5, 6, 7: TUJUAN PD, SASARAN PD & PERANGKAT DAERAH */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Level 5, 6, &amp; 7: Tujuan PD, Sasaran PD &amp; Indikator Kinerja Perangkat Daerah
                </h4>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Menampilkan {activeSasaranItems.length} Indikator Kinerja
              </span>
            </div>

            {activeSasaranItems.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Tidak ada data IKU yang cocok.</p>
                <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau filter Misi/Tujuan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeSasaranItems.map((item) => {
                  const capaianStyle = getCapaianColor(item.capaianPersen);
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 hover:shadow-md transition-all p-4.5 flex flex-col justify-between group relative overflow-hidden"
                    >
                      {/* OPD Header Badge */}
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>{item.perangkatDaerah}</span>
                          </span>
                          {item.bidangPengampu && (
                            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[160px]" title={item.bidangPengampu}>
                              · {item.bidangPengampu}
                            </span>
                          )}
                        </div>

                        {/* Capaian Badge */}
                        <div className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border shrink-0 ${capaianStyle}`}>
                          {item.capaianPersen !== undefined ? `${item.capaianPersen.toFixed(1)}%` : 'Belum Dinilai'}
                        </div>
                      </div>

                      {/* Indikator Title */}
                      <div className="mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-0.5">
                          Indikator Kinerja Utama:
                        </span>
                        <h5 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                          {item.indikatorKinerja}
                        </h5>
                      </div>

                      {/* Cascading Trace Summary */}
                      <div className="bg-slate-50/80 rounded-xl p-2.5 mb-3 border border-slate-100 text-[11px] space-y-1 text-slate-600">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-amber-700 shrink-0">Tujuan PD:</span>
                          <span className="text-slate-800 line-clamp-1">{item.tujuanPD}</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-semibold text-rose-700 shrink-0">Sasaran PD:</span>
                          <span className="text-slate-800 line-clamp-1">{item.sasaranPD}</span>
                        </div>
                      </div>

                      {/* Target vs Realisasi Grid */}
                      <div className="grid grid-cols-2 gap-2 mb-3.5 pt-2 border-t border-slate-100">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Target</span>
                          <div className="font-extrabold text-slate-800 text-sm">
                            {item.target} <span className="text-xs font-normal text-slate-500">{item.satuan}</span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Realisasi</span>
                          <div className="font-extrabold text-slate-800 text-sm">
                            {item.realisasi !== undefined ? item.realisasi : '-'}{' '}
                            <span className="text-xs font-normal text-slate-500">{item.satuan}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
                        <button
                          type="button"
                          onClick={() => onSelectItem(item)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail Cascading</span>
                        </button>

                        {/* Admin / Authorized Action Buttons */}
                        {canManage && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onEditItem?.(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Edit Data IKU"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteItem?.(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Data IKU"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: BAGAN POHON PENUH (FULL EXPANDABLE TREE DIAGRAM)       */}
      {/* ============================================================== */}
      {viewMode === 'fullTree' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-600 font-medium">
              Struktur Bagan Pohon Cascading Tahun <strong>{selectedYear}</strong> ({filteredItems.length} Indikator)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={expandAll}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Buka Semua
              </button>
              <button
                type="button"
                onClick={collapseAll}
                className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Tutup Semua
              </button>
            </div>
          </div>

          {/* Root: Visi Node */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <Compass className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                    Visi Daerah (RPJMD {selectedYear}):
                  </span>
                  <p className="text-sm font-bold text-indigo-950 mt-0.5">{currentVisi}</p>
                </div>
              </div>

              {canManage && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onEditVisi?.(selectedYear, currentVisi)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-300 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Edit Visi Daerah"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Visi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteVisi?.(selectedYear)}
                    className="px-2.5 py-1 text-xs font-semibold bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    title="Hapus / Reset Visi"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tree Branch: Misi List */}
            <div className="space-y-4 pl-3 sm:pl-6 border-l-2 border-indigo-200 relative">
              {misiList.map((m, mIdx) => {
                const nodeMisiId = `misi_${mIdx}`;
                const mOpen = isExpanded(nodeMisiId, true);
                const itemsInMisi = filteredItems.filter((i) => i.misi === m.misi);

                // Group by Tujuan
                const goalsMap = new Map<string, IKUItem[]>();
                itemsInMisi.forEach((i) => {
                  const list = goalsMap.get(i.tujuan) || [];
                  list.push(i);
                  goalsMap.set(i.tujuan, list);
                });

                return (
                  <div key={m.misi} className="space-y-3 relative">
                    {/* Misi Header Box */}
                    <div
                      onClick={() => toggleNode(nodeMisiId)}
                      className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3 cursor-pointer hover:bg-blue-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <button className="text-blue-700">
                          {mOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <span className="text-xs font-bold text-blue-900">
                          {m.misi}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                        {itemsInMisi.length} IKU
                      </span>
                    </div>

                    {/* Tujuan Branches */}
                    {mOpen && (
                      <div className="space-y-3 pl-3 sm:pl-6 border-l-2 border-blue-200">
                        {Array.from(goalsMap.entries()).map(([tujuanText, itemsInTujuan], tIdx) => {
                          const nodeTujuanId = `tujuan_${mIdx}_${tIdx}`;
                          const tOpen = isExpanded(nodeTujuanId, true);

                          // Group by Sasaran
                          const sasaranMap = new Map<string, IKUItem[]>();
                          itemsInTujuan.forEach((i) => {
                            const list = sasaranMap.get(i.sasaran) || [];
                            list.push(i);
                            sasaranMap.set(i.sasaran, list);
                          });

                          return (
                            <div key={tujuanText} className="space-y-2.5">
                              {/* Tujuan Box */}
                              <div
                                onClick={() => toggleNode(nodeTujuanId)}
                                className="p-2.5 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-between gap-3 cursor-pointer hover:bg-violet-100/70 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <button className="text-violet-700">
                                    {tOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                  </button>
                                  <span className="text-xs font-semibold text-violet-950">
                                    Tujuan Pemda: {tujuanText}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-violet-200 text-violet-800">
                                  {itemsInTujuan.length}
                                </span>
                              </div>

                              {/* Sasaran Branches */}
                              {tOpen && (
                                <div className="space-y-2 pl-3 sm:pl-6 border-l-2 border-violet-200">
                                  {Array.from(sasaranMap.entries()).map(([sasaranText, itemsInSasaran], sIdx) => {
                                    return (
                                      <div key={sasaranText} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 border-b border-slate-200 pb-1.5">
                                          <Target className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                          <span>Sasaran Pemda: {sasaranText}</span>
                                        </div>

                                        {/* Perangkat Daerah Leaf Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                          {itemsInSasaran.map((leaf) => (
                                            <div
                                              key={leaf.id}
                                              onClick={() => onSelectItem(leaf)}
                                              className="p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                                            >
                                              <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-teal-700 px-1.5 py-0.5 rounded bg-teal-50 border border-teal-200">
                                                  {leaf.perangkatDaerah}
                                                </span>
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getCapaianColor(leaf.capaianPersen)}`}>
                                                  {leaf.capaianPersen !== undefined ? `${leaf.capaianPersen.toFixed(0)}%` : '-'}
                                                </span>
                                              </div>
                                              <p className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                                                {leaf.indikatorKinerja}
                                              </p>
                                              <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                                                <span>Target: {leaf.target} {leaf.satuan}</span>
                                                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                                  Detail <ChevronRight className="w-3 h-3" />
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

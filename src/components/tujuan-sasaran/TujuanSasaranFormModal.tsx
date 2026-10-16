import React, { useState, useEffect } from 'react';
import { PeriodeRPJMD, TujuanSasaranItem } from '../../types';
import { 
  X, 
  Target, 
  Compass, 
  Building2, 
  Check, 
  Plus, 
  Trash2, 
  Layers, 
  HelpCircle,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface TujuanSasaranFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TujuanSasaranItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>;
  editItem?: TujuanSasaranItem | null;
  activePeriode: PeriodeRPJMD;
  existingItems?: TujuanSasaranItem[];
}

const DEFAULT_OPD_LIST = [
  'Bapperida',
  'Dinas Kesehatan',
  'Dinas Pendidikan',
  'Dinas Pekerjaan Umum dan Penataan Ruang',
  'Dinas Komunikasi dan Informatika',
  'Dinas Sosial',
  'Dinas Pemberdayaan Masyarakat dan Desa (PMD)',
  'Dinas Tanaman Pangan dan Hortikultura',
  'Dinas Perkebunan dan Peternakan',
  'Dinas Perikanan',
  'Dinas Koperasi, UKM, Perindustrian dan Perdagangan',
  'Dinas Tenaga Kerja',
  'Dinas Lingkungan Hidup',
  'Dinas Perhubungan',
  'Inspektorat Daerah',
  'Badan Pengelolaan Keuangan dan Aset Daerah',
  'Badan Pendapatan Daerah',
  'Badan Penanggulangan Bencana Daerah (BPBD)',
  'Satuan Polisi Pamong Praja',
  'Bagian Organisasi Setda',
  'Bagian Perekonomian dan SDA Setda',
];

export const TujuanSasaranFormModal: React.FC<TujuanSasaranFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  activePeriode,
  existingItems = [],
}) => {
  const [visi, setVisi] = useState('');
  const [misi, setMisi] = useState('');
  const [misiNomor, setMisiNomor] = useState<number>(1);
  const [tujuan, setTujuan] = useState('');
  const [sasaran, setSasaran] = useState('');
  const [indikator, setIndikator] = useState('');
  const [satuan, setSatuan] = useState(''); // "ditulis manual"
  const [targetTahunan, setTargetTahunan] = useState<Record<number, string>>({});
  const [selectedOPDList, setSelectedOPDList] = useState<string[]>([]);
  const [bidangPengampu, setBidangPengampu] = useState('');
  const [formula, setFormula] = useState('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [keterangan, setKeterangan] = useState('');
  
  // Custom OPD input
  const [customOPDInput, setCustomOPDInput] = useState('');
  const [opdSearch, setOpdSearch] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Collect distinct values for autocomplete
  const distinctVisi = Array.from(new Set(existingItems.map((i) => i.visi).filter(Boolean)));
  const distinctMisi = Array.from(new Set(existingItems.map((i) => i.misi).filter(Boolean)));
  const distinctTujuan = Array.from(new Set(existingItems.map((i) => i.tujuan).filter(Boolean)));
  const distinctSasaran = Array.from(new Set(existingItems.map((i) => i.sasaran).filter(Boolean)));

  // Combine distinct OPDs from existing items and defaults
  const allAvailableOPDs = Array.from(
    new Set([
      ...DEFAULT_OPD_LIST,
      ...existingItems.flatMap((i) => i.perangkatDaerahList || []),
    ])
  ).sort();

  useEffect(() => {
    if (editItem) {
      setVisi(editItem.visi);
      setMisi(editItem.misi);
      setMisiNomor(editItem.misiNomor || 1);
      setTujuan(editItem.tujuan);
      setSasaran(editItem.sasaran);
      setIndikator(editItem.indikator);
      setSatuan(editItem.satuan || '');
      
      const targets: Record<number, string> = {};
      activePeriode.tahunList.forEach((yr) => {
        targets[yr] = editItem.targetTahunan?.[yr] !== undefined ? String(editItem.targetTahunan[yr]) : '';
      });
      setTargetTahunan(targets);
      setSelectedOPDList(editItem.perangkatDaerahList || []);
      setBidangPengampu(editItem.bidangPengampu || '');
      setFormula(editItem.formula || '');
      setPenanggungJawab(editItem.penanggungJawab || '');
      setKeterangan(editItem.keterangan || '');
    } else {
      setVisi(
        distinctVisi[0] ||
        'Terwujudnya Kabupaten Tanggamus yang Tangguh, Agamis, Mandiri, Unggul dan Sejahtera (TANGGAMUS TAMUS)'
      );
      setMisi(
        distinctMisi[0] ||
        'Misi 1: Mewujudkan Sumber Daya Manusia yang Berkualitas, Berdaya Saing dan Berakhlak Mulia'
      );
      setMisiNomor(1);
      setTujuan('');
      setSasaran('');
      setIndikator('');
      setSatuan('%'); // default suggested, user can edit manually
      
      const initialTargets: Record<number, string> = {};
      activePeriode.tahunList.forEach((yr) => {
        initialTargets[yr] = '';
      });
      setTargetTahunan(initialTargets);
      setSelectedOPDList(['Bapperida']);
      setBidangPengampu('');
      setFormula('');
      setPenanggungJawab('');
      setKeterangan('');
    }
    setCustomOPDInput('');
    setOpdSearch('');
    setErrorMessage('');
  }, [editItem, isOpen, activePeriode]);

  if (!isOpen) return null;

  const handleTargetChange = (tahun: number, val: string) => {
    setTargetTahunan((prev) => ({
      ...prev,
      [tahun]: val,
    }));
  };

  const toggleOPD = (opd: string) => {
    setSelectedOPDList((prev) =>
      prev.includes(opd) ? prev.filter((o) => o !== opd) : [...prev, opd]
    );
  };

  const handleAddCustomOPD = () => {
    const trimmed = customOPDInput.trim();
    if (trimmed && !selectedOPDList.includes(trimmed)) {
      setSelectedOPDList((prev) => [...prev, trimmed]);
      setCustomOPDInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!visi.trim()) {
      setErrorMessage('Visi Daerah wajib diisi.');
      return;
    }
    if (!misi.trim()) {
      setErrorMessage('Misi RPJMD wajib diisi.');
      return;
    }
    if (!tujuan.trim()) {
      setErrorMessage('Tujuan Daerah wajib diisi.');
      return;
    }
    if (!sasaran.trim()) {
      setErrorMessage('Sasaran Daerah wajib diisi.');
      return;
    }
    if (!indikator.trim()) {
      setErrorMessage('Nama Indikator wajib diisi.');
      return;
    }
    if (!satuan.trim()) {
      setErrorMessage('Satuan wajib ditulis manual.');
      return;
    }
    if (selectedOPDList.length === 0) {
      setErrorMessage('Pilih minimal 1 Perangkat Daerah pengampu indikator ini.');
      return;
    }

    // Convert target values to numbers or strings
    const parsedTargets: Record<number, number | string> = {};
    activePeriode.tahunList.forEach((yr) => {
      const raw = targetTahunan[yr];
      if (raw !== undefined && raw.trim() !== '') {
        const num = parseFloat(raw);
        parsedTargets[yr] = isNaN(num) ? raw.trim() : num;
      }
    });

    try {
      setIsSubmitting(true);
      await onSubmit(
        {
          periodeId: activePeriode.id,
          visi: visi.trim(),
          misi: misi.trim(),
          misiNomor,
          tujuan: tujuan.trim(),
          sasaran: sasaran.trim(),
          indikator: indikator.trim(),
          satuan: satuan.trim(),
          targetTahunan: parsedTargets,
          perangkatDaerahList: selectedOPDList,
          bidangPengampu: bidangPengampu.trim() || undefined,
          formula: formula.trim() || undefined,
          penanggungJawab: penanggungJawab.trim() || undefined,
          keterangan: keterangan.trim() || undefined,
        },
        editItem?.id
      );
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan data Tujuan & Sasaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered OPDs for the search box
  const filteredAvailableOPDs = allAvailableOPDs.filter((opd) =>
    opd.toLowerCase().includes(opdSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Target className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  {activePeriode.nama}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold mt-0.5">
                {editItem ? 'Edit Tujuan, Sasaran & Target 5 Tahunan' : 'Tambah Tujuan, Sasaran & Target 5 Tahunan'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* SECTION 1: VISI & MISI */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              <Compass className="w-4 h-4 text-indigo-600" />
              <span>Visi &amp; Misi Daerah</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Visi Daerah *
              </label>
              <input
                type="text"
                list="visi-list-suggestions"
                value={visi}
                onChange={(e) => setVisi(e.target.value)}
                placeholder="Uraian Visi Daerah..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                required
              />
              <datalist id="visi-list-suggestions">
                {distinctVisi.map((v, i) => (
                  <option key={i} value={v} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Misi
                </label>
                <select
                  value={misiNomor}
                  onChange={(e) => setMisiNomor(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value={1}>Misi 1</option>
                  <option value={2}>Misi 2</option>
                  <option value={3}>Misi 3</option>
                  <option value={4}>Misi 4</option>
                  <option value={5}>Misi 5</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Uraian Misi RPJMD *
                </label>
                <input
                  type="text"
                  list="misi-list-suggestions"
                  value={misi}
                  onChange={(e) => setMisi(e.target.value)}
                  placeholder="Contoh: Misi 1: Mewujudkan SDM yang Berkualitas..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900"
                  required
                />
                <datalist id="misi-list-suggestions">
                  {distinctMisi.map((m, i) => (
                    <option key={i} value={m} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* SECTION 2: TUJUAN & SASARAN */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              <Target className="w-4 h-4 text-violet-600" />
              <span>Tujuan &amp; Sasaran RPJMD</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tujuan Daerah *
                </label>
                <textarea
                  rows={3}
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  placeholder="Contoh: Meningkatkan Kualitas dan Pemerataan Akses Pendidikan Serta Kesehatan Masyarakat..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sasaran Daerah *
                </label>
                <textarea
                  rows={3}
                  value={sasaran}
                  onChange={(e) => setSasaran(e.target.value)}
                  placeholder="Contoh: Meningkatnya Derajat Pendidikan, Kesehatan dan Daya Saing SDM Daerah..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: INDIKATOR & SATUAN MANUAL */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Indikator &amp; Satuan (Ditulis Manual)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Indikator *
                </label>
                <input
                  type="text"
                  value={indikator}
                  onChange={(e) => setIndikator(e.target.value)}
                  placeholder="Contoh: Indeks Pembangunan Manusia (IPM) / Prevalensi Penurunan Stunting"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Satuan *</span>
                  <span className="text-[10px] text-emerald-600 font-normal">Tulis Manual Bebas</span>
                </label>
                <input
                  type="text"
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  placeholder="Contoh: %, Indeks, Poin, Dokumen, Tahun"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold text-emerald-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Formula / Metode Perhitungan (Opsional)
              </label>
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="Rumus atau metodologi perhitungan indikator..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* SECTION 4: TARGET PERIODE 5 TAHUNAN (2025, 2026, 2027, 2028, 2029, 2030) */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Target Setiap Tahun Dalam Periode ({activePeriode.tahunList.join(', ')})
              </span>
              <span className="text-[11px] text-blue-700 font-medium">Satuan: <strong>{satuan || '-'}</strong></span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {activePeriode.tahunList.map((tahun) => (
                <div key={tahun} className="p-2.5 rounded-xl bg-white border border-blue-200 shadow-2xs">
                  <label className="block text-[11px] font-black text-blue-900 text-center uppercase mb-1">
                    Th {tahun}
                  </label>
                  <input
                    type="text"
                    value={targetTahunan[tahun] ?? ''}
                    onChange={(e) => handleTargetChange(tahun, e.target.value)}
                    placeholder="Nilai target"
                    className="w-full px-2 py-1.5 text-xs text-center font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 5: PERANGKAT DAERAH (BISA DIPILIH LEBIH DARI 1 OPD) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-teal-600" />
                <span>Perangkat Daerah Pengampu (Bisa Pilih &gt; 1 OPD) *</span>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                {selectedOPDList.length} OPD Dipilih
              </span>
            </div>

            {/* Selected OPD Tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-white rounded-xl border border-slate-200">
              {selectedOPDList.length === 0 ? (
                <span className="text-xs text-slate-400 italic">Belum ada OPD yang dipilih. Klik daftar di bawah untuk memilih.</span>
              ) : (
                selectedOPDList.map((opd) => (
                  <span
                    key={opd}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs"
                  >
                    <span>{opd}</span>
                    <button
                      type="button"
                      onClick={() => toggleOPD(opd)}
                      className="text-teal-600 hover:text-rose-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Search OPD and Quick Select Grid */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={opdSearch}
                  onChange={(e) => setOpdSearch(e.target.value)}
                  placeholder="Cari perangkat daerah..."
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={customOPDInput}
                    onChange={(e) => setCustomOPDInput(e.target.value)}
                    placeholder="Tambah OPD kustom..."
                    className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomOPD}
                    className="px-3 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg cursor-pointer"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              {/* OPD Checkbox Grid */}
              <div className="max-h-40 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {filteredAvailableOPDs.map((opd) => {
                  const isChecked = selectedOPDList.includes(opd);
                  return (
                    <label
                      key={opd}
                      className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-teal-50 text-teal-900 font-semibold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOPD(opd)}
                        className="rounded text-teal-600 focus:ring-teal-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="truncate" title={opd}>{opd}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bidang Pengampu (Opsional)
                </label>
                <input
                  type="text"
                  value={bidangPengampu}
                  onChange={(e) => setBidangPengampu(e.target.value)}
                  placeholder="Contoh: Bidang PPM, Bidang Infraswil, Bidang PME"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penanggung Jawab Kinerja
                </label>
                <input
                  type="text"
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                  placeholder="Contoh: Tim Pokja RPJMD / Kabid Terkait"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan / Keterangan (Opsional)
              </label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Catatan sumber data, kebijakan pengungkit..."
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 hidden sm:block">
            Target periode dan multi-perangkat daerah akan langsung diperbarui di tabel.
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm shadow-blue-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : editItem ? 'Simpan Perubahan' : 'Simpan Data'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

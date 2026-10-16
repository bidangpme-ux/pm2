import React, { useState, useEffect } from 'react';
import { IKUItem, KategoriCapaianIKU } from '../../types';
import { 
  X, 
  Target, 
  Calendar, 
  Compass, 
  Building2, 
  Award, 
  Check, 
  HelpCircle,
  Layers,
  Sparkles
} from 'lucide-react';

interface IKUFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<IKUItem, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>;
  editItem?: IKUItem | null;
  defaultYear?: number;
  existingItems?: IKUItem[];
}

export const IKUFormModal: React.FC<IKUFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  defaultYear = 2025,
  existingItems = [],
}) => {
  const [tahun, setTahun] = useState<number>(defaultYear);
  const [visi, setVisi] = useState('');
  const [misi, setMisi] = useState('');
  const [misiNomor, setMisiNomor] = useState<number>(1);
  const [tujuan, setTujuan] = useState('');
  const [sasaran, setSasaran] = useState('');
  const [tujuanPD, setTujuanPD] = useState('');
  const [sasaranPD, setSasaranPD] = useState('');
  const [perangkatDaerah, setPerangkatDaerah] = useState('');
  const [bidangPengampu, setBidangPengampu] = useState('');
  const [indikatorKinerja, setIndikatorKinerja] = useState('');
  const [formula, setFormula] = useState('');
  const [satuan, setSatuan] = useState('%');
  const [target, setTarget] = useState<string>('100');
  const [realisasi, setRealisasi] = useState<string>('');
  const [penanggungJawab, setPenanggungJawab] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Collect distinct values for autocomplete from existing items
  const distinctVisi = Array.from(new Set(existingItems.map((i) => i.visi).filter(Boolean)));
  const distinctMisi = Array.from(new Set(existingItems.map((i) => i.misi).filter(Boolean)));
  const distinctTujuan = Array.from(new Set(existingItems.map((i) => i.tujuan).filter(Boolean)));
  const distinctSasaran = Array.from(new Set(existingItems.map((i) => i.sasaran).filter(Boolean)));
  const distinctTujuanPD = Array.from(new Set(existingItems.map((i) => i.tujuanPD).filter(Boolean)));
  const distinctSasaranPD = Array.from(new Set(existingItems.map((i) => i.sasaranPD).filter(Boolean)));
  const distinctOPD = Array.from(new Set([
    'Bapperida',
    'Dinas Kesehatan',
    'Dinas Pendidikan',
    'Dinas Komunikasi dan Informatika',
    'Dinas Pekerjaan Umum dan Penataan Ruang',
    'Dinas Tanaman Pangan dan Hortikultura',
    'Inspektorat Daerah',
    'Badan Pengelolaan Keuangan dan Aset Daerah',
    ...existingItems.map((i) => i.perangkatDaerah).filter(Boolean),
  ]));

  useEffect(() => {
    if (editItem) {
      setTahun(editItem.tahun);
      setVisi(editItem.visi);
      setMisi(editItem.misi);
      setMisiNomor(editItem.misiNomor || 1);
      setTujuan(editItem.tujuan);
      setSasaran(editItem.sasaran);
      setTujuanPD(editItem.tujuanPD);
      setSasaranPD(editItem.sasaranPD);
      setPerangkatDaerah(editItem.perangkatDaerah);
      setBidangPengampu(editItem.bidangPengampu || '');
      setIndikatorKinerja(editItem.indikatorKinerja);
      setFormula(editItem.formula || '');
      setSatuan(editItem.satuan || '%');
      setTarget(editItem.target !== undefined ? String(editItem.target) : '100');
      setRealisasi(editItem.realisasi !== undefined ? String(editItem.realisasi) : '');
      setPenanggungJawab(editItem.penanggungJawab || '');
      setKeterangan(editItem.keterangan || '');
    } else {
      setTahun(defaultYear);
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
      setTujuanPD('');
      setSasaranPD('');
      setPerangkatDaerah('Bapperida');
      setBidangPengampu('');
      setIndikatorKinerja('');
      setFormula('');
      setSatuan('%');
      setTarget('100');
      setRealisasi('');
      setPenanggungJawab('');
      setKeterangan('');
    }
    setErrorMessage('');
  }, [editItem, isOpen, defaultYear]);

  if (!isOpen) return null;

  // Real-time calculation of Capaian & Kategori
  const numTarget = parseFloat(target) || 0;
  const numRealisasi = realisasi.trim() !== '' ? parseFloat(realisasi) : undefined;
  
  let capaianPersen: number | undefined = undefined;
  let kategoriCapaian: KategoriCapaianIKU = 'Belum Dinilai';

  if (numRealisasi !== undefined && numTarget > 0) {
    capaianPersen = (numRealisasi / numTarget) * 100;
    if (capaianPersen >= 100) {
      kategoriCapaian = 'Sangat Tinggi';
    } else if (capaianPersen >= 90) {
      kategoriCapaian = 'Tinggi';
    } else if (capaianPersen >= 75) {
      kategoriCapaian = 'Sedang';
    } else {
      kategoriCapaian = 'Rendah';
    }
  }

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
      setErrorMessage('Tujuan Pemda wajib diisi.');
      return;
    }
    if (!sasaran.trim()) {
      setErrorMessage('Sasaran Pemda wajib diisi.');
      return;
    }
    if (!tujuanPD.trim()) {
      setErrorMessage('Tujuan Perangkat Daerah wajib diisi.');
      return;
    }
    if (!sasaranPD.trim()) {
      setErrorMessage('Sasaran Perangkat Daerah wajib diisi.');
      return;
    }
    if (!perangkatDaerah.trim()) {
      setErrorMessage('Perangkat Daerah pelaksana wajib diisi.');
      return;
    }
    if (!indikatorKinerja.trim()) {
      setErrorMessage('Nama Indikator Kinerja Utama (IKU) wajib diisi.');
      return;
    }
    if (isNaN(numTarget) || numTarget <= 0) {
      setErrorMessage('Target kinerja harus berupa angka lebih besar dari 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(
        {
          tahun,
          visi: visi.trim(),
          misi: misi.trim(),
          misiNomor,
          tujuan: tujuan.trim(),
          sasaran: sasaran.trim(),
          tujuanPD: tujuanPD.trim(),
          sasaranPD: sasaranPD.trim(),
          perangkatDaerah: perangkatDaerah.trim(),
          bidangPengampu: bidangPengampu.trim() || undefined,
          indikatorKinerja: indikatorKinerja.trim(),
          formula: formula.trim() || undefined,
          satuan: satuan.trim() || '%',
          target: numTarget,
          realisasi: numRealisasi,
          capaianPersen,
          kategoriCapaian,
          penanggungJawab: penanggungJawab.trim() || undefined,
          keterangan: keterangan.trim() || undefined,
        },
        editItem?.id
      );
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan data IKU.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Layers className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {editItem ? 'Edit Data Cascading IKU' : 'Input Data Cascading IKU Baru'}
              </h2>
              <p className="text-xs text-emerald-100">
                Penyelarasan Visi → Misi → Tujuan → Sasaran → Tujuan PD → Sasaran PD → Perangkat Daerah
              </p>
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
            <span className="font-bold">Perhatian:</span> {errorMessage}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: TAHUN & VISI & MISI */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Level 0 &amp; 1 &amp; 2: Tahun, Visi &amp; Misi Daerah</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahun Anggaran *
                </label>
                <input
                  type="number"
                  min={2020}
                  max={2035}
                  value={tahun}
                  onChange={(e) => setTahun(parseInt(e.target.value) || defaultYear)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-slate-800"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visi Daerah *
                </label>
                <input
                  type="text"
                  list="visi-suggestions"
                  value={visi}
                  onChange={(e) => setVisi(e.target.value)}
                  placeholder="Contoh: Terwujudnya Kabupaten Tanggamus yang Tangguh, Agamis, Mandiri, Unggul dan Sejahtera"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  required
                />
                <datalist id="visi-suggestions">
                  {distinctVisi.map((v, idx) => (
                    <option key={idx} value={v} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor Misi
                </label>
                <select
                  value={misiNomor}
                  onChange={(e) => {
                    const no = parseInt(e.target.value) || 1;
                    setMisiNomor(no);
                    const matched = distinctMisi.find((m) => m.startsWith(`Misi ${no}:`));
                    if (matched) setMisi(matched);
                  }}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
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
                  list="misi-suggestions"
                  value={misi}
                  onChange={(e) => setMisi(e.target.value)}
                  placeholder="Contoh: Misi 1: Mewujudkan Sumber Daya Manusia yang Berkualitas, Berdaya Saing dan Berakhlak Mulia"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  required
                />
                <datalist id="misi-suggestions">
                  {distinctMisi.map((m, idx) => (
                    <option key={idx} value={m} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* SECTION 2: TUJUAN & SASARAN DAERAH (RPJMD) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              <Compass className="w-4 h-4 text-violet-600" />
              <span>Level 3 &amp; 4: Tujuan &amp; Sasaran Daerah (RPJMD)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tujuan Daerah (RPJMD) *
                </label>
                <textarea
                  rows={2}
                  value={tujuan}
                  onChange={(e) => setTujuan(e.target.value)}
                  placeholder="Contoh: Meningkatkan Kualitas dan Pemerataan Akses Pendidikan Serta Kesehatan Masyarakat"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sasaran Daerah (RPJMD) *
                </label>
                <textarea
                  rows={2}
                  value={sasaran}
                  onChange={(e) => setSasaran(e.target.value)}
                  placeholder="Contoh: Meningkatnya Derajat Pendidikan, Kesehatan dan Daya Saing SDM Daerah"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-500 text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: TUJUAN & SASARAN PERANGKAT DAERAH (RENSTRA) */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Level 5 &amp; 6: Tujuan &amp; Sasaran Perangkat Daerah (Renstra)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tujuan Perangkat Daerah *
                </label>
                <textarea
                  rows={2}
                  value={tujuanPD}
                  onChange={(e) => setTujuanPD(e.target.value)}
                  placeholder="Contoh: Meningkatkan Kualitas Perencanaan Bidang Pembangunan Manusia dan Masyarakat"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sasaran Perangkat Daerah *
                </label>
                <textarea
                  rows={2}
                  value={sasaranPD}
                  onChange={(e) => setSasaranPD(e.target.value)}
                  placeholder="Contoh: Meningkatnya Kualitas Dokumen Perencanaan Pembangunan Sosial Budaya dan Kesejahteraan Masyarakat"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: PERANGKAT DAERAH & INDIKATOR KINERJA UTAMA */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Level 7: Perangkat Daerah &amp; Indikator Kinerja Utama (IKU)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Perangkat Daerah (OPD) *
                </label>
                <input
                  type="text"
                  list="opd-suggestions"
                  value={perangkatDaerah}
                  onChange={(e) => setPerangkatDaerah(e.target.value)}
                  placeholder="Contoh: Bapperida / Dinas Kesehatan"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800 font-semibold"
                  required
                />
                <datalist id="opd-suggestions">
                  {distinctOPD.map((opd, idx) => (
                    <option key={idx} value={opd} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bidang Pengampu (Opsional)
                </label>
                <input
                  type="text"
                  value={bidangPengampu}
                  onChange={(e) => setBidangPengampu(e.target.value)}
                  placeholder="Contoh: Bidang PPM, Bidang PME, Infraswil"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Indikator Kinerja Utama (IKU) *
              </label>
              <input
                type="text"
                value={indikatorKinerja}
                onChange={(e) => setIndikatorKinerja(e.target.value)}
                placeholder="Contoh: Persentase Keselarasan Program Bidang PPM terhadap Dokumen RPJMD"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800 font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Formula / Rumus Perhitungan
              </label>
              <input
                type="text"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="Contoh: (Jumlah Program Selaras / Total Program) x 100%"
                className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800 font-mono"
              />
            </div>

            {/* Target, Realisasi, Satuan, Kategori */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3 rounded-xl bg-white border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Satuan
                </label>
                <input
                  type="text"
                  value={satuan}
                  onChange={(e) => setSatuan(e.target.value)}
                  placeholder="%, Dokumen, Indeks"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nilai Target *
                </label>
                <input
                  type="number"
                  step="any"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Nilai Realisasi
                </label>
                <input
                  type="number"
                  step="any"
                  value={realisasi}
                  onChange={(e) => setRealisasi(e.target.value)}
                  placeholder="Kosongkan jika belum ada"
                  className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Kalkulasi Capaian
                </label>
                <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                  {capaianPersen !== undefined ? `${capaianPersen.toFixed(1)}% (${kategoriCapaian})` : 'Belum Dinilai'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Penanggung Jawab Kinerja
                </label>
                <input
                  type="text"
                  value={penanggungJawab}
                  onChange={(e) => setPenanggungJawab(e.target.value)}
                  placeholder="Contoh: Kabid PPM Bapperida"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Evaluasi / Keterangan
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: Capaian melampaui target perencanaan..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 hidden sm:block">
            Semua field bertanda bintang (*) wajib diisi untuk menjaga integritas cascading.
          </p>
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editItem ? 'Simpan Perubahan' : 'Simpan Data IKU'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

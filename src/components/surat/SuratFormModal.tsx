import React, { useState, useEffect } from 'react';
import { SuratItem, JenisSurat, TingkatUrgensi, StatusSurat, TipeSurat, KategoriSuratKeluar, KATEGORI_SURAT_KELUAR_LIST } from '../../types';
import { Mail, X, UploadCloud, FileText, CheckCircle2, Send } from 'lucide-react';

interface SuratFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<SuratItem, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'creatorName'>, file?: File | null) => Promise<void>;
  initialData?: SuratItem | null;
  defaultTipe?: TipeSurat;
  defaultKategoriKeluar?: KategoriSuratKeluar;
}

export const SuratFormModal: React.FC<SuratFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultTipe,
  defaultKategoriKeluar,
}) => {
  const [tipe, setTipe] = useState<TipeSurat>(defaultTipe || 'masuk');
  const [nomorSurat, setNomorSurat] = useState('');
  const [tanggalSurat, setTanggalSurat] = useState('');
  const [tanggalDiterima, setTanggalDiterima] = useState('');
  const [jenis, setJenis] = useState<JenisSurat>('Surat Masuk');
  const [kategoriKeluar, setKategoriKeluar] = useState<KategoriSuratKeluar>(
    defaultKategoriKeluar || 'Surat Perintah / Surat Perintah Tugas'
  );
  const [tingkatUrgensi, setTingkatUrgensi] = useState<TingkatUrgensi>('Biasa');
  const [pengirim, setPengirim] = useState('');
  const [penerima, setPenerima] = useState('');
  const [perihal, setPerihal] = useState('');
  const [ringkasan, setRingkasan] = useState('');
  const [status, setStatus] = useState<StatusSurat>('Baru');
  const [disposisiKepada, setDisposisiKepada] = useState('');
  const [catatanDisposisi, setCatatanDisposisi] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      const isKeluar = initialData.tipe === 'keluar' || initialData.jenis === 'Surat Keluar' || Boolean(initialData.kategoriKeluar);
      setTipe(isKeluar ? 'keluar' : 'masuk');
      setNomorSurat(initialData.nomorSurat);
      setTanggalSurat(initialData.tanggalSurat);
      setTanggalDiterima(initialData.tanggalDiterima);
      setJenis(initialData.jenis);
      if (initialData.kategoriKeluar) {
        setKategoriKeluar(initialData.kategoriKeluar);
      }
      setTingkatUrgensi(initialData.tingkatUrgensi);
      setPengirim(initialData.pengirim);
      setPenerima(initialData.penerima);
      setPerihal(initialData.perihal);
      setRingkasan(initialData.ringkasan);
      setStatus(initialData.status);
      setDisposisiKepada(initialData.disposisiKepada || '');
      setCatatanDisposisi(initialData.catatanDisposisi || '');
      setSelectedFile(null);
    } else {
      const today = new Date().toISOString().split('T')[0];
      const initialTipe = defaultTipe || 'masuk';
      setTipe(initialTipe);
      setNomorSurat('');
      setTanggalSurat(today);
      setTanggalDiterima(today);
      if (initialTipe === 'keluar') {
        setJenis('Surat Keluar');
        setKategoriKeluar(defaultKategoriKeluar || 'Surat Perintah / Surat Perintah Tugas');
        setPengirim('BAPPERIDA Kabupaten Tanggamus');
      } else {
        setJenis('Surat Masuk');
        setPengirim('');
      }
      setTingkatUrgensi('Biasa');
      setPenerima('');
      setPerihal('');
      setRingkasan('');
      setStatus('Baru');
      setDisposisiKepada('');
      setCatatanDisposisi('');
      setSelectedFile(null);
    }
    setError('');
  }, [initialData, isOpen, defaultTipe, defaultKategoriKeluar]);

  if (!isOpen) return null;

  const handleTipeChange = (newTipe: TipeSurat) => {
    setTipe(newTipe);
    if (newTipe === 'keluar') {
      setJenis('Surat Keluar');
      if (!pengirim || pengirim === 'Kementerian PPN / Bappenas Republik Indonesia') {
        setPengirim('BAPPERIDA Kabupaten Tanggamus');
      }
    } else {
      setJenis('Surat Masuk');
      if (pengirim === 'BAPPERIDA Kabupaten Tanggamus') {
        setPengirim('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorSurat.trim() || !perihal.trim() || !pengirim.trim()) {
      setError('Nomor Surat, Pengirim, dan Perihal wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(
        {
          nomorSurat: nomorSurat.trim(),
          tanggalSurat,
          tanggalDiterima,
          tipe,
          jenis: tipe === 'keluar' ? 'Surat Keluar' : jenis,
          kategoriKeluar: tipe === 'keluar' ? kategoriKeluar : undefined,
          tingkatUrgensi,
          pengirim: pengirim.trim(),
          penerima: penerima.trim(),
          perihal: perihal.trim(),
          ringkasan: ringkasan.trim(),
          status,
          disposisiKepada: disposisiKepada.trim() || undefined,
          catatanDisposisi: catatanDisposisi.trim() || undefined,
          fileName: initialData?.fileName,
          fileSize: initialData?.fileSize,
          fileExtension: initialData?.fileExtension,
          fileUrl: initialData?.fileUrl,
        },
        selectedFile
      );
      onClose();
    } catch (err) {
      console.error(err);
      setError('Gagal menyimpan arsip surat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            {tipe === 'keluar' ? (
              <Send className="w-4 h-4 text-indigo-600" />
            ) : (
              <Mail className="w-4 h-4 text-blue-600" />
            )}
            <span>
              {initialData 
                ? 'Perbarui Data Arsip Surat' 
                : tipe === 'keluar' 
                  ? 'Arsipkan Surat Keluar Baru' 
                  : 'Arsipkan Surat Masuk Baru'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
              {error}
            </div>
          )}

          {/* Selector Tipe: Surat Masuk vs Surat Keluar */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Alur / Tipe Naskah Dinas <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleTipeChange('masuk')}
                className={`py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipe === 'masuk'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Surat Masuk</span>
              </button>
              <button
                type="button"
                onClick={() => handleTipeChange('keluar')}
                className={`py-2 px-3 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  tipe === 'keluar'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Surat Keluar</span>
              </button>
            </div>
          </div>

          {/* Row 1: Nomor Surat & Kategori / Klasifikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nomorSurat}
                onChange={(e) => setNomorSurat(e.target.value)}
                placeholder={tipe === 'keluar' ? 'contoh: 094/015/BAPPERIDA/III/2026' : 'contoh: 005/142/Bappeda/2026'}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Kategori Berdasarkan Tipe */}
            {tipe === 'keluar' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori Surat Keluar (10 Kategori) <span className="text-red-500">*</span>
                </label>
                <select
                  value={kategoriKeluar}
                  onChange={(e) => setKategoriKeluar(e.target.value as KategoriSuratKeluar)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-950 bg-indigo-50/30"
                >
                  {KATEGORI_SURAT_KELUAR_LIST.map((kat) => (
                    <option key={kat} value={kat}>
                      {kat}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kategori / Jenis Surat Masuk <span className="text-red-500">*</span>
                </label>
                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value as JenisSurat)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="Surat Masuk">Surat Masuk Resmi</option>
                  <option value="Surat Keputusan (SK)">Surat Keputusan (SK)</option>
                  <option value="Surat Tugas">Surat Tugas</option>
                  <option value="Nota Dinas">Nota Dinas</option>
                  <option value="Undangan Resmi">Undangan Resmi</option>
                  <option value="Surat Edaran">Surat Edaran</option>
                </select>
              </div>
            )}
          </div>

          {/* Row 2: Tanggal Surat & Tanggal Diterima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Surat <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalSurat}
                onChange={(e) => setTanggalSurat(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Diterima / Diarsipkan <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalDiterima}
                onChange={(e) => setTanggalDiterima(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Row 3: Tingkat Urgensi & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat Urgensi <span className="text-red-500">*</span>
              </label>
              <select
                value={tingkatUrgensi}
                onChange={(e) => setTingkatUrgensi(e.target.value as TingkatUrgensi)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Biasa">Biasa (Standar Operasional)</option>
                <option value="Segera">Segera (Memerlukan Tindakan Cepat)</option>
                <option value="Sangat Segera">Sangat Segera / Kilat (Prioritas Utama)</option>
                <option value="Rahasia">Rahasia / Konfidensial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Alur Surat
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusSurat)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Baru">Baru Diterima / Belum Diproses</option>
                <option value="Didisposisi">Didisposisikan ke Bidang/Staff</option>
                <option value="Ditindaklanjuti">Dalam Tindak Lanjut</option>
                <option value="Diarsipkan">Selesai &amp; Diarsipkan Permanen</option>
              </select>
            </div>
          </div>

          {/* Row 4: Pengirim & Penerima */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pengirim / Instansi Asal <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pengirim}
                onChange={(e) => setPengirim(e.target.value)}
                placeholder="contoh: Bappenas RI atau Sekretariat Daerah"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Penerima / Tujuan Surat
              </label>
              <input
                type="text"
                value={penerima}
                onChange={(e) => setPenerima(e.target.value)}
                placeholder="contoh: Kepala Bappeda atau Kabid PME"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Perihal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Perihal / Pokok Surat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={perihal}
              onChange={(e) => setPerihal(e.target.value)}
              placeholder="contoh: Undangan Rapat Evaluasi Capaian Kinerja Pembangunan Daerah Triwulan I"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Ringkasan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ringkasan Isi / Catatan Khusus
            </label>
            <textarea
              rows={2}
              value={ringkasan}
              onChange={(e) => setRingkasan(e.target.value)}
              placeholder="Catatan pokok materi surat dan poin-poin yang perlu diperhatikan..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Disposisi Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-800 block">
              Instruksi Lembar Disposisi (Opsional)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Disposisi Diteruskan Kepada:
                </label>
                <input
                  type="text"
                  value={disposisiKepada}
                  onChange={(e) => setDisposisiKepada(e.target.value)}
                  placeholder="contoh: Kepala Bidang PME"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Catatan Instruksi Pimpinan:
                </label>
                <input
                  type="text"
                  value={catatanDisposisi}
                  onChange={(e) => setCatatanDisposisi(e.target.value)}
                  placeholder="contoh: Segera tindak lanjuti dan buat matriks analisa"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* File Upload / Attachment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lampiran Scan / Berkas Surat (PDF, Word, Gambar)
            </label>
            <div className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <input
                type="file"
                id="suratFile"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <label htmlFor="suratFile" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-5 h-5 text-indigo-600 mb-1" />
                <span className="text-xs font-semibold text-indigo-600">
                  {selectedFile ? selectedFile.name : initialData?.fileName ? `Ubah Lampiran (${initialData.fileName})` : 'Pilih Berkas Lampiran Surat'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Mendukung berkas PDF, DOCX, scan JPG/PNG
                </span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
            >
              {isSubmitting ? 'Menyimpan...' : initialData ? 'Simpan Perubahan' : 'Arsipkan Surat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

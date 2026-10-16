import React, { useState } from 'react';
import { PeriodeRPJMD } from '../../types';
import { 
  X, 
  CalendarRange, 
  Plus, 
  Check, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  Clock
} from 'lucide-react';

interface PeriodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodeList: PeriodeRPJMD[];
  activePeriode: PeriodeRPJMD;
  onSelectActivePeriode: (periode: PeriodeRPJMD) => void;
  onAddPeriode: (data: Omit<PeriodeRPJMD, 'id' | 'createdAt'>) => Promise<boolean>;
  onUpdatePeriode: (id: string, updates: Partial<PeriodeRPJMD>) => Promise<boolean>;
  onDeletePeriode: (id: string) => Promise<boolean>;
  isAdmin: boolean;
}

export const PeriodeModal: React.FC<PeriodeModalProps> = ({
  isOpen,
  onClose,
  periodeList,
  activePeriode,
  onSelectActivePeriode,
  onAddPeriode,
  onUpdatePeriode,
  onDeletePeriode,
  isAdmin,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [tahunMulai, setTahunMulai] = useState(2025);
  const [tahunSelesai, setTahunSelesai] = useState(2030);
  const [isAktif, setIsAktif] = useState(false);
  const [keterangan, setKeterangan] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<PeriodeRPJMD | null>(null);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setNama('RPJMD Periode 2025 - 2030');
    setTahunMulai(2025);
    setTahunSelesai(2030);
    setIsAktif(false);
    setKeterangan('');
    setErrorMessage('');
  };

  const handleStartEdit = (p: PeriodeRPJMD) => {
    setIsAdding(false);
    setEditingId(p.id);
    setNama(p.nama);
    setTahunMulai(p.tahunMulai);
    setTahunSelesai(p.tahunSelesai);
    setIsAktif(p.isAktif);
    setKeterangan(p.keterangan || '');
    setErrorMessage('');
  };

  const handleCancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setErrorMessage('');
  };

  const handleSavePeriode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!nama.trim()) {
      setErrorMessage('Nama periode wajib diisi.');
      return;
    }
    if (tahunSelesai <= tahunMulai) {
      setErrorMessage('Tahun selesai harus lebih besar dari tahun mulai.');
      return;
    }

    // Generate list of years inclusively
    const tahunList: number[] = [];
    for (let yr = tahunMulai; yr <= tahunSelesai; yr++) {
      tahunList.push(yr);
    }

    try {
      setIsSubmitting(true);
      if (isAdding) {
        await onAddPeriode({
          nama: nama.trim(),
          tahunMulai,
          tahunSelesai,
          tahunList,
          isAktif,
          keterangan: keterangan.trim() || undefined,
        });
      } else if (editingId) {
        await onUpdatePeriode(editingId, {
          nama: nama.trim(),
          tahunMulai,
          tahunSelesai,
          tahunList,
          isAktif,
          keterangan: keterangan.trim() || undefined,
        });
      }
      setIsAdding(false);
      setEditingId(null);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan periode RPJMD.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      setIsSubmitting(true);
      await onDeletePeriode(deleteCandidate.id);
      setDeleteCandidate(null);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menghapus periode.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
              <CalendarRange className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Perencanaan Daerah
                </span>
                <span className="text-xs text-blue-200">{periodeList.length} Periode Tersimpan</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Kelola Periode 5 Tahunan RPJMD
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

        {/* Form Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Add / Edit Form */}
          {(isAdding || editingId) ? (
            <form onSubmit={handleSavePeriode} className="p-4 rounded-xl bg-slate-50 border border-slate-300 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {isAdding ? 'Tambah Periode 5 Tahunan Baru' : 'Edit Periode RPJMD'}
                </span>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Batal
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Periode RPJMD *
                </label>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: RPJMD Periode 2025 - 2030 (Teknokratik)"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-900 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Mulai *
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2050}
                    value={tahunMulai}
                    onChange={(e) => setTahunMulai(parseInt(e.target.value) || 2025)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Selesai *
                  </label>
                  <input
                    type="number"
                    min={2000}
                    max={2050}
                    value={tahunSelesai}
                    onChange={(e) => setTahunSelesai(parseInt(e.target.value) || 2030)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold"
                    required
                  />
                </div>
              </div>

              <div className="text-[11px] text-blue-700 bg-blue-50 p-2.5 rounded-lg border border-blue-200">
                <span>Rentang Tahun Target: </span>
                <strong className="font-mono">
                  {Array.from(
                    { length: Math.max(0, tahunSelesai - tahunMulai + 1) },
                    (_, i) => tahunMulai + i
                  ).join(', ')}
                </strong>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Catatan dokumen RPJMD atau nomor perda..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isAktifCheckbox"
                  checked={isAktif}
                  onChange={(e) => setIsAktif(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isAktifCheckbox" className="text-xs font-semibold text-slate-800 cursor-pointer">
                  Jadikan periode ini sebagai periode aktif utama
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-200"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Periode'}</span>
                </button>
              </div>
            </form>
          ) : (
            isAdmin && (
              <div className="flex items-center justify-between pb-2">
                <span className="text-xs text-slate-500">Pilih periode untuk ditampilkan pada tabel matriks kinerja.</span>
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Periode Baru</span>
                </button>
              </div>
            )
          )}

          {/* List of Periods */}
          <div className="space-y-3">
            {periodeList.map((p) => {
              const isActive = activePeriode.id === p.id;
              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{p.nama}</h4>
                      {isActive && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Aktif Digunakan</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
                      <span className="font-semibold text-slate-700">
                        {p.tahunMulai} - {p.tahunSelesai}
                      </span>
                      <span>·</span>
                      <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.2 rounded">
                        {p.tahunList.join(', ')}
                      </span>
                    </div>

                    {p.keterangan && (
                      <p className="text-[11px] text-slate-500 italic mt-0.5">{p.keterangan}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => onSelectActivePeriode(p)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer"
                      >
                        Pilih Periode Ini
                      </button>
                    )}

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(p)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Edit Periode"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {periodeList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setDeleteCandidate(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus Periode"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteCandidate && (
          <div className="p-4 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-900">
            <span>Hapus periode "{deleteCandidate.nama}"? Data target yang terasosiasi tidak akan hilang.</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-3 py-1 bg-rose-600 text-white rounded font-bold hover:bg-rose-700"
              >
                Hapus
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Periode aktif menentukan kolom target tahunan pada tabel matriks kinerja.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Compass, Check, Trash2, Sparkles, AlertCircle } from 'lucide-react';

interface VisiModalProps {
  isOpen: boolean;
  onClose: () => void;
  tahun: number;
  currentVisi: string;
  onSaveVisi: (tahun: number, newVisi: string) => Promise<void>;
  onDeleteVisi: (tahun: number) => Promise<void>;
}

export const VisiModal: React.FC<VisiModalProps> = ({
  isOpen,
  onClose,
  tahun,
  currentVisi,
  onSaveVisi,
  onDeleteVisi,
}) => {
  const [visiText, setVisiText] = useState(currentVisi);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const defaultTanggamusVisi =
    'Terwujudnya Kabupaten Tanggamus yang Tangguh, Agamis, Mandiri, Unggul dan Sejahtera (TANGGAMUS TAMUS)';

  useEffect(() => {
    setVisiText(currentVisi);
    setShowDeleteConfirm(false);
    setErrorMessage('');
  }, [currentVisi, isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visiText.trim()) {
      setErrorMessage('Uraian Visi Daerah tidak boleh kosong.');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSaveVisi(tahun, visiText.trim());
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menyimpan perubahan Visi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsSubmitting(true);
      await onDeleteVisi(tahun);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Gagal menghapus Visi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
              <Compass className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Level 1
                </span>
                <span className="text-xs text-indigo-200">Tahun Anggaran {tahun}</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-0.5">
                Kelola Visi Daerah (RPJMD)
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

        {/* Delete Confirmation View */}
        {showDeleteConfirm ? (
          <div className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus Visi</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Apakah Anda yakin ingin menghapus uraian Visi Daerah untuk tahun{' '}
                <strong className="text-slate-800">{tahun}</strong>? Seluruh indikator pada tahun ini
                akan disetel dengan status visi belum ditentukan.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
              <span className="font-semibold block mb-0.5">Visi yang akan dihapus:</span>
              <p className="italic text-slate-700">"{currentVisi}"</p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Menghapus...' : 'Ya, Hapus Visi Ini'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Normal Edit View */
          <form onSubmit={handleSave} className="p-6 space-y-5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Uraian Visi Daerah (Tahun {tahun}) *
                </label>
                <button
                  type="button"
                  onClick={() => setVisiText(defaultTanggamusVisi)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gunakan Visi Resmi Tanggamus</span>
                </button>
              </div>

              <textarea
                rows={4}
                value={visiText}
                onChange={(e) => setVisiText(e.target.value)}
                placeholder="Tuliskan rumusan visi pembangunan daerah..."
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 text-slate-900 font-medium leading-relaxed"
                required
              />
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                <span>Visi ini akan diterapkan ke seluruh indikator cascading di tahun {tahun}.</span>
                <span>{visiText.length} karakter</span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Visi</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-sm shadow-indigo-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Visi'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

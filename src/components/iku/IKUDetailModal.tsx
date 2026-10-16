import React from 'react';
import { IKUItem } from '../../types';
import { 
  X, 
  Calendar, 
  Compass, 
  Target, 
  Building2, 
  Award, 
  TrendingUp, 
  FileText, 
  User, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface IKUDetailModalProps {
  item: IKUItem | null;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: (item: IKUItem) => void;
  onDelete?: (item: IKUItem) => void;
}

export const IKUDetailModal: React.FC<IKUDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  isAdmin = false,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !item) return null;

  const getKategoriBadge = (kategori?: string, persen?: number) => {
    if (!kategori || kategori === 'Belum Dinilai') {
      return {
        label: 'Belum Dinilai',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
    }
    if (kategori === 'Sangat Tinggi' || (persen && persen >= 100)) {
      return {
        label: 'Sangat Tinggi (≥100%)',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    }
    if (kategori === 'Tinggi' || (persen && persen >= 90)) {
      return {
        label: 'Tinggi (90% - 99%)',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    }
    if (kategori === 'Sedang' || (persen && persen >= 75)) {
      return {
        label: 'Sedang (75% - 89%)',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    }
    return {
      label: 'Rendah (<75%)',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      dot: 'bg-rose-500',
    };
  };

  const badge = getKategoriBadge(item.kategoriCapaian, item.capaianPersen);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20 shrink-0">
              <Award className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  Tahun {item.tahun}
                </span>
                <span className="text-[11px] font-medium text-emerald-100">
                  {item.perangkatDaerah}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold leading-snug mt-1 text-white">
                {item.indikatorKinerja}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm">
          {/* Target & Realisasi Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-medium block">Target</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">{item.target}</span>
                <span className="text-xs text-slate-500 font-semibold">{item.satuan}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] text-slate-500 font-medium block">Realisasi</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-slate-900">
                  {item.realisasi !== undefined ? item.realisasi : '-'}
                </span>
                <span className="text-xs text-slate-500 font-semibold">{item.satuan}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <span className="text-[11px] text-emerald-700 font-medium block">Capaian Kinerja</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xl font-extrabold text-emerald-800">
                  {item.capaianPersen !== undefined ? `${item.capaianPersen.toFixed(1)}%` : '-'}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
              <span className="text-[11px] text-slate-500 font-medium block">Kategori</span>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold border ${badge.bg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
                  <span>{item.kategoriCapaian || 'Belum Dinilai'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Cascading Trace / Lineage Flow */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Jejak Cascading Kinerja (Silsilah Kebijakan)</span>
            </h3>

            <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Level 1: Visi */}
              <div className="relative pl-7">
                <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white shadow-2xs"></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">1. Visi Daerah</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{item.visi}</div>
              </div>

              {/* Level 2: Misi */}
              <div className="relative pl-7">
                <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-2xs"></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700">2. Misi RPJMD</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{item.misi}</div>
              </div>

              {/* Level 3: Tujuan Pemda */}
              <div className="relative pl-7">
                <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-violet-600 border-2 border-white shadow-2xs"></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-700">3. Tujuan Pemda</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{item.tujuan}</div>
              </div>

              {/* Level 4: Sasaran Pemda */}
              <div className="relative pl-7">
                <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white shadow-2xs"></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">4. Sasaran Pemda</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{item.sasaran}</div>
              </div>

              {/* Level 5: Tujuan Perangkat Daerah */}
              <div className="relative pl-7">
                <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-amber-600 border-2 border-white shadow-2xs"></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">5. Tujuan Perangkat Daerah (Renstra)</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{item.tujuanPD}</div>
              </div>

              {/* Level 6: Sasaran Perangkat Daerah */}
              <div className="relative pl-7">
                <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-rose-600 border-2 border-white shadow-2xs"></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-rose-700">6. Sasaran Perangkat Daerah (Renstra)</div>
                <div className="text-xs font-semibold text-slate-800 mt-0.5">{item.sasaranPD}</div>
              </div>

              {/* Level 7: Perangkat Daerah & Bidang */}
              <div className="relative pl-7">
                <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-2xs"></div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">7. Perangkat Daerah Pelaksana</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 flex items-center gap-2">
                  <span>{item.perangkatDaerah}</span>
                  {item.bidangPengampu && (
                    <span className="text-[11px] font-normal text-slate-500">
                      ({item.bidangPengampu})
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Indikator Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {item.formula && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Formula / Metode Perhitungan
                </span>
                <p className="text-xs text-slate-800 font-mono bg-white p-2 rounded-lg border border-slate-200">
                  {item.formula}
                </p>
              </div>
            )}

            {item.penanggungJawab && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Penanggung Jawab Kinerja
                </span>
                <p className="text-xs text-slate-800 font-medium flex items-center gap-1.5 mt-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{item.penanggungJawab}</span>
                </p>
              </div>
            )}
          </div>

          {item.keterangan && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-blue-900">
              <span className="text-[11px] font-bold uppercase tracking-wider block text-blue-800 mb-1">
                Catatan Analisis &amp; Evaluasi Kinerja
              </span>
              <p className="text-xs text-blue-950 leading-relaxed">
                {item.keterangan}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {isAdmin ? (
              <span className="text-indigo-600 font-medium">Mode Administrator (Dapat Mengubah / Menghapus)</span>
            ) : (
              <span className="text-slate-400">Mode Read-Only (Hanya dapat membaca)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete?.(item);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                >
                  Hapus Data
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit?.(item);
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
                >
                  Edit Data
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

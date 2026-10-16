import React from 'react';
import { TujuanSasaranItem, PeriodeRPJMD } from '../../types';
import { 
  X, 
  Target, 
  Compass, 
  Building2, 
  Layers, 
  CalendarRange, 
  Award, 
  TrendingUp, 
  FileText, 
  User, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface TujuanSasaranDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TujuanSasaranItem | null;
  activePeriode: PeriodeRPJMD;
}

export const TujuanSasaranDetailModal: React.FC<TujuanSasaranDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  activePeriode,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 uppercase tracking-wider">
                  Detail Indikator RPJMD
                </span>
                <span className="text-[11px] font-medium text-slate-300 flex items-center gap-1">
                  <CalendarRange className="w-3.5 h-3.5 text-indigo-300" />
                  {activePeriode.nama}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1.5 leading-snug">
                {item.indikator}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Tutup Detail"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700">
          {/* Target 5 Tahunan Grid */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-slate-50 p-5 rounded-2xl border border-indigo-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Target Capaian 5 Tahunan RPJMD</span>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700">
                Satuan: <strong className="font-bold">{item.satuan}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {activePeriode.tahunList.map((tahun) => {
                const targetVal = item.targetTahunan?.[tahun];
                return (
                  <div 
                    key={tahun}
                    className="p-3 rounded-xl bg-white border border-indigo-100/90 shadow-2xs text-center flex flex-col justify-between"
                  >
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      {tahun}
                    </div>
                    <div className="text-base font-extrabold text-indigo-700">
                      {targetVal !== undefined && targetVal !== '' ? targetVal : '-'}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {item.satuan}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cascading RPJMD Hierarchy */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Hierarki Penyelarasan RPJMD</span>
            </div>

            {/* Visi */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Compass className="w-3 h-3 text-indigo-600" />
                <span>Visi Daerah</span>
              </div>
              <p className="font-semibold text-slate-900 leading-relaxed text-xs sm:text-sm">
                "{item.visi}"
              </p>
            </div>

            {/* Misi */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Award className="w-3 h-3 text-blue-600" />
                <span>Misi Pembangunan</span>
              </div>
              <p className="font-semibold text-slate-900 leading-relaxed text-xs sm:text-sm">
                {item.misi}
              </p>
            </div>

            {/* Tujuan & Sasaran Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
                <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-indigo-600" />
                  <span>Tujuan RPJMD</span>
                </div>
                <p className="font-medium text-slate-800 text-xs sm:text-sm leading-relaxed">
                  {item.tujuan}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Sasaran RPJMD</span>
                </div>
                <p className="font-medium text-slate-800 text-xs sm:text-sm leading-relaxed">
                  {item.sasaran}
                </p>
              </div>
            </div>
          </div>

          {/* Perangkat Daerah Pengampu (Multi-OPD) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Perangkat Daerah Penanggung Jawab ({item.perangkatDaerahList.length} OPD Terkait)</span>
            </div>
            
            <div className="flex flex-wrap gap-2 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              {item.perangkatDaerahList && item.perangkatDaerahList.length > 0 ? (
                item.perangkatDaerahList.map((opd, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-800 shadow-2xs"
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>{opd}</span>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Belum ada perangkat daerah yang dipilih</span>
              )}
            </div>
          </div>

          {/* Metodologi, Formula & Penanggung Jawab */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3 h-3 text-slate-600" />
                <span>Formula / Metode Perhitungan</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-slate-200">
                {item.formula || 'Formula perhitungan belum ditambahkan.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <User className="w-3 h-3 text-slate-600" />
                  <span>Bidang Pengampu di Bapperida</span>
                </div>
                <p className="text-xs font-medium text-slate-800">
                  {item.bidangPengampu || 'Semua Bidang Terkait'}
                </p>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3 h-3 text-slate-600" />
                  <span>Keterangan Tambahan</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.keterangan || 'Tidak ada catatan tambahan.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            ID: <span className="font-mono">{item.id}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

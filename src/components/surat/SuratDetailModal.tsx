import React, { useState } from 'react';
import { SuratItem, StatusSurat } from '../../types';
import { formatDateIndo, formatBytes } from '../../services/storageService';
import { BapperidaLogo } from '../common/BapperidaLogo';
import { 
  X, 
  Download, 
  Mail, 
  FileText, 
  Calendar, 
  Building2, 
  Send, 
  ShieldAlert, 
  Printer, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';

interface SuratDetailModalProps {
  surat: SuratItem | null;
  onClose: () => void;
  onUpdateStatus?: (status: StatusSurat, disposisiKepada?: string, catatan?: string) => void;
}

export const SuratDetailModal: React.FC<SuratDetailModalProps> = ({
  surat,
  onClose,
  onUpdateStatus,
}) => {
  if (!surat) return null;

  const [newStatus, setNewStatus] = useState<StatusSurat>(surat.status);
  const [newDisposisi, setNewDisposisi] = useState(surat.disposisiKepada || '');
  const [newCatatan, setNewCatatan] = useState(surat.catatanDisposisi || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleDownloadAttachment = () => {
    if (surat.fileUrl) {
      const a = document.createElement('a');
      a.href = surat.fileUrl;
      a.download = surat.fileName || `Surat_${surat.nomorSurat}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      const content = `====================================================\nLEMBAR DISPOSISI & ARSIP PERSURATAN RESMI\n====================================================\nNomor Surat     : ${surat.nomorSurat}\nTanggal Surat   : ${surat.tanggalSurat}\nTanggal Terima  : ${surat.tanggalDiterima}\nKategori Jenis  : ${surat.jenis}\nTingkat Urgensi : ${surat.tingkatUrgensi}\nPengirim        : ${surat.pengirim}\nPenerima        : ${surat.penerima}\nPerihal         : ${surat.perihal}\nRingkasan       : ${surat.ringkasan}\nStatus          : ${surat.status}\nDisposisi Kepada: ${surat.disposisiKepada || '-'}\nInstruksi       : ${surat.catatanDisposisi || '-'}\nDiarsipkan Oleh : ${surat.creatorName}\n====================================================`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${surat.fileName || 'Arsip_Surat_' + surat.nomorSurat.replace(/[\/\\]/g, '_')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveDisposisi = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateStatus) {
      onUpdateStatus(newStatus, newDisposisi, newCatatan);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'Sangat Segera':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'Segera':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Rahasia':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50 print:hidden">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>Detail Dokumen Surat &amp; Lembar Disposisi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-md text-slate-600 hover:bg-slate-200/60 text-xs font-medium flex items-center gap-1 border border-slate-200"
              title="Cetak Lembar Disposisi"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Surat Card & Disposisi Sheet */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 print:p-0">
          {/* Official Letter Header / Kop Surat Bapperida Tanggamus */}
          <div className="border-b-2 border-slate-900 pb-4 flex items-center gap-4">
            <BapperidaLogo size="md" className="w-16 h-16 shrink-0" />
            <div className="flex-1 text-center pr-12">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
                Pemerintah Kabupaten Tanggamus
              </h2>
              <h3 className="text-xs font-extrabold uppercase tracking-tight text-slate-800">
                Badan Perencanaan Pembangunan, Riset dan Inovasi Daerah (BAPPERIDA)
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                SISTEM INFORMASI KEARSIPAN &amp; PERSURATAN ELEKTRONIK E-PMPED
              </p>
            </div>
          </div>

          {/* Letter Meta Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[11px] text-slate-400 block">Nomor Surat</span>
              <span className="font-bold font-mono text-slate-900 text-sm block">
                {surat.nomorSurat}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Jenis &amp; Klasifikasi</span>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="font-semibold text-slate-800">
                  {surat.kategoriKeluar ? `Surat Keluar: ${surat.kategoriKeluar}` : surat.jenis}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-medium ${getUrgencyBadge(surat.tingkatUrgensi)}`}>
                  {surat.tingkatUrgensi}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Tanggal Surat</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDateIndo(surat.tanggalSurat)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Tanggal Diterima / Arsip</span>
              <span className="font-medium text-slate-800 flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatDateIndo(surat.tanggalDiterima)}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Pengirim</span>
              <span className="font-semibold text-slate-900 block mt-0.5">{surat.pengirim}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Penerima / Tujuan</span>
              <span className="font-semibold text-slate-900 block mt-0.5">{surat.penerima}</span>
            </div>
          </div>

          {/* Perihal & Summary */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Perihal / Isi Ringkas Surat:
            </h3>
            <div className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs">
              <p className="font-bold text-slate-900 text-sm mb-2">{surat.perihal}</p>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                {surat.ringkasan || 'Tidak ada uraian ringkasan tambahan.'}
              </p>
            </div>
          </div>

          {/* Lampiran Berkas Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 truncate pr-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <span className="text-xs font-bold text-slate-900 truncate block">
                  {surat.fileName || 'Lampiran_Dokumen_Surat.pdf'}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {surat.fileSize ? formatBytes(surat.fileSize) : '1.8 MB'} · Arsip Terverifikasi
                </span>
              </div>
            </div>

            <button
              onClick={handleDownloadAttachment}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Berkas</span>
            </button>
          </div>

          {/* Lembar Disposisi / Disposition Form */}
          <form onSubmit={handleSaveDisposisi} className="border-t border-slate-200 pt-4 space-y-3 print:border-t-2 print:border-black">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Catatan &amp; Instruksi Disposisi Pimpinan
              </span>
              <span className="text-[11px] text-slate-500">
                Status saat ini: <strong className="text-slate-700">{surat.status}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Disposisi Diteruskan Kepada:
                </label>
                <input
                  type="text"
                  value={newDisposisi}
                  onChange={(e) => setNewDisposisi(e.target.value)}
                  placeholder="contoh: Kabid PME &amp; Staf Teknis"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ubah Status Alur:
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as StatusSurat)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="Baru">Baru</option>
                  <option value="Didisposisi">Didisposisi</option>
                  <option value="Ditindaklanjuti">Ditindaklanjuti</option>
                  <option value="Diarsipkan">Diarsipkan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Instruksi Tindak Lanjut:
              </label>
              <textarea
                rows={2}
                value={newCatatan}
                onChange={(e) => setNewCatatan(e.target.value)}
                placeholder="Instruksi pimpinan untuk penyelesaian disposisi..."
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              {savedSuccess ? (
                <span className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Disposisi berhasil diperbarui!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-xs"
              >
                Perbarui Lembar Disposisi
              </button>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 print:hidden">
          <span>Diarsipkan oleh: <strong className="text-slate-700">{surat.creatorName}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { SuratItem, KATEGORI_SURAT_KELUAR_LIST, KategoriSuratKeluar, TipeSurat } from '../../types';
import { formatDateIndo } from '../../services/storageService';
import { BapperidaLogo } from '../common/BapperidaLogo';
import { 
  Printer, 
  FileSpreadsheet, 
  Calendar, 
  Filter, 
  Search, 
  Download, 
  Copy, 
  Check, 
  ArrowLeft,
  Mail,
  Send,
  FileCheck
} from 'lucide-react';

interface SuratRekapViewProps {
  suratList: SuratItem[];
  onBack?: () => void;
  onOpenDetail?: (surat: SuratItem) => void;
}

export const SuratRekapView: React.FC<SuratRekapViewProps> = ({
  suratList,
  onBack,
  onOpenDetail,
}) => {
  // Filters
  const [filterTipe, setFilterTipe] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [filterKategoriKeluar, setFilterKategoriKeluar] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Filtered letters for rekap
  const rekapData = useMemo(() => {
    return suratList.filter((item) => {
      // 1. Tipe filter
      const isKeluar = item.tipe === 'keluar' || item.jenis === 'Surat Keluar' || (item.kategoriKeluar !== undefined) || KATEGORI_SURAT_KELUAR_LIST.includes(item.jenis as any);
      if (filterTipe === 'masuk' && isKeluar) return false;
      if (filterTipe === 'keluar' && !isKeluar) return false;

      // 2. Kategori surat keluar filter
      if (filterTipe === 'keluar' && filterKategoriKeluar !== 'all') {
        const itemCat = item.kategoriKeluar || item.jenis;
        if (itemCat !== filterKategoriKeluar) return false;
      }

      // 3. Date range filter
      if (startDate && item.tanggalSurat < startDate) return false;
      if (endDate && item.tanggalSurat > endDate) return false;

      // 4. Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          item.nomorSurat.toLowerCase().includes(q) ||
          item.perihal.toLowerCase().includes(q) ||
          item.pengirim.toLowerCase().includes(q) ||
          item.penerima.toLowerCase().includes(q) ||
          (item.ringkasan && item.ringkasan.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [suratList, filterTipe, filterKategoriKeluar, startDate, endDate, searchQuery]);

  // Statistics
  const masukCount = rekapData.filter((s) => s.tipe === 'masuk' || s.jenis === 'Surat Masuk').length;
  const keluarCount = rekapData.length - masukCount;

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Export Excel (.xlsx)
  const handleExportExcel = () => {
    const headers = [
      'No',
      'Nomor Surat',
      'Tanggal Surat',
      'Jenis / Klasifikasi',
      'Pengirim & Penerima',
      'Perihal & Ringkasan',
    ];

    const rows = rekapData.map((s, index) => {
      const isKeluar = s.tipe === 'keluar' || s.jenis === 'Surat Keluar' || Boolean(s.kategoriKeluar);
      const jenisLabel = s.kategoriKeluar
        ? `Surat Keluar - ${s.kategoriKeluar}`
        : s.jenis !== 'Surat Masuk' && s.jenis !== 'Surat Keluar'
        ? s.jenis
        : isKeluar
        ? 'Surat Keluar'
        : 'Surat Masuk';
      const pengirimPenerima = `Pengirim: ${s.pengirim} | Penerima: ${s.penerima}`;
      const perihalRingkasan = s.ringkasan ? `${s.perihal} (Ringkasan: ${s.ringkasan})` : s.perihal;

      return [
        index + 1,
        s.nomorSurat,
        s.tanggalSurat,
        jenisLabel,
        pengirimPenerima,
        perihalRingkasan,
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // Format proper column widths in Excel
    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 28 },
      { wch: 15 },
      { wch: 32 },
      { wch: 42 },
      { wch: 55 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Surat Bapperida');

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `Rekap_Surat_Bapperida_${dateStr}.xlsx`);
  };

  // Copy plain text table
  const handleCopyClipboard = () => {
    let text = 'NO\tNOMOR SURAT\tTANGGAL SURAT\tJENIS / KLASIFIKASI\tPENGIRIM & PENERIMA\tPERIHAL & RINGKASAN\n';
    rekapData.forEach((s, i) => {
      const jenisLabel = s.kategoriKeluar ? `Surat Keluar - ${s.kategoriKeluar}` : s.jenis;
      text += `${i + 1}\t${s.nomorSurat}\t${s.tanggalSurat}\t${jenisLabel}\tPengirim: ${s.pengirim} | Penerima: ${s.penerima}\t${s.perihal} - ${s.ringkasan || ''}\n`;
    });
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
      {/* Print-Only Kop Surat Header (Visible only when printed) */}
      <div className="hidden print:block p-6 text-center border-b-2 border-black mb-4">
        <div className="flex items-center justify-center gap-4 mb-2">
          <BapperidaLogo size="md" className="w-16 h-16" />
          <div className="text-center">
            <h2 className="text-base font-bold tracking-wider uppercase text-black">
              PEMERINTAH KABUPATEN TANGGAMUS
            </h2>
            <h1 className="text-lg font-extrabold tracking-wide uppercase text-black">
              BADAN PERENCANAAN PEMBANGUNAN, RISET DAN INOVASI DAERAH (BAPPERIDA)
            </h1>
            <p className="text-xs text-black">
              Jl. Jenderal Sudirman No. 1 Komplek Perkantoran Pemkab Tanggamus, Kota Agung
            </p>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-black text-center">
          <h3 className="text-sm font-bold uppercase underline">
            DAFTAR REKAPITULASI AGENDA TATA NASKAH DINAS
          </h3>
          <p className="text-xs text-black mt-0.5">
            {startDate || endDate
              ? `Periode: ${startDate ? formatDateIndo(startDate) : 'Awal'} s/d ${endDate ? formatDateIndo(endDate) : 'Sekarang'}`
              : `Dicetak pada: ${formatDateIndo(new Date().toISOString().split('T')[0])}`}
          </p>
        </div>
      </div>

      {/* Screen Toolbar & Action Buttons (Hidden when printed) */}
      <div className="print:hidden bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-10 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Kembali ke Daftar Surat"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                  <span>Tool Rekap Surat &amp; Agenda Resmi</span>
                </h1>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-700 font-mono">
                  Format Tabel Ber-border
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Tabel rekapitulasi data surat masuk dan keluar dengan garis pembatas (border) rapi, siap cetak atau ekspor.
              </p>
            </div>
          </div>

          {/* Action buttons: Print, Export, Copy */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Salin isi tabel rekap ke papan klip (clipboard)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copied ? 'Tersalin!' : 'Salin Tabel'}</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors shadow-2xs cursor-pointer"
              title="Unduh rekapitulasi rapi dalam format Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
              title="Cetak lembar rekapitulasi surat ke printer atau simpan PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Rekap</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Tipe Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => {
                setFilterTipe('all');
                setFilterKategoriKeluar('all');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                filterTipe === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Surat ({suratList.length})
            </button>

            <button
              onClick={() => {
                setFilterTipe('masuk');
                setFilterKategoriKeluar('all');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTipe === 'masuk'
                  ? 'bg-white text-blue-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Surat Masuk</span>
            </button>

            <button
              onClick={() => setFilterTipe('keluar')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTipe === 'keluar'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Surat Keluar</span>
            </button>
          </div>

          {/* Additional Filter Selectors */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Kategori Surat Keluar (Only shown when filterTipe is keluar or all) */}
            {filterTipe === 'keluar' && (
              <select
                value={filterKategoriKeluar}
                onChange={(e) => setFilterKategoriKeluar(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              >
                <option value="all">Semua Kategori Surat Keluar (10 Kategori)</option>
                {KATEGORI_SURAT_KELUAR_LIST.map((kat) => (
                  <option key={kat} value={kat}>
                    {kat}
                  </option>
                ))}
              </select>
            )}

            {/* Date Range */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2 py-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-[11px] text-slate-700 focus:outline-none"
                title="Tanggal Awal"
              />
              <span className="text-slate-400 text-[10px]">s/d</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-[11px] text-slate-700 focus:outline-none"
                title="Tanggal Akhir"
              />
              {(startDate || endDate) && (
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-slate-400 hover:text-slate-700 text-[11px] ml-1 cursor-pointer"
                  title="Reset rentang tanggal"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari perihal, nomor, pihak..."
                className="pl-8 pr-2.5 py-1 text-xs rounded-lg border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-48 sm:w-56"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Rekap Table Area */}
      <div className="p-4 sm:p-6 print:p-0">
        {/* Rekap Summary Header Box (Screen view) */}
        <div className="print:hidden mb-4 p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">
              Total Data Rekapitulasi: <span className="font-mono text-indigo-600">{rekapData.length}</span> Arsip
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">
              Surat Masuk: <strong className="text-blue-700">{masukCount}</strong> • Surat Keluar: <strong className="text-indigo-700">{keluarCount}</strong>
            </span>
          </div>

          <div className="text-[11px] text-slate-400">
            Ketuk baris surat untuk melihat pratinjau detail lengkap
          </div>
        </div>

        {/* ================= EXACT TABLE REQUIRED BY USER ================= */}
        {/* Judul tabel: no, nomor surat, tanggal surat, Jenis / Klasifikasi, Pengirim & Penerima, Perihal & Ringkasan dengan border */}
        <div className="bg-white border-2 border-slate-300 print:border-black rounded-lg overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse border border-slate-300 print:border-black">
              <thead className="bg-slate-100 print:bg-slate-200 text-slate-800 border-b-2 border-slate-300 print:border-black">
                <tr>
                  {/* Kolom 1: no */}
                  <th className="py-2.5 px-3 font-bold border border-slate-300 print:border-black text-center w-12 uppercase tracking-wide">
                    no
                  </th>
                  {/* Kolom 2: nomor surat */}
                  <th className="py-2.5 px-3 font-bold border border-slate-300 print:border-black whitespace-nowrap uppercase tracking-wide w-48">
                    nomor surat
                  </th>
                  {/* Kolom 3: tanggal surat */}
                  <th className="py-2.5 px-3 font-bold border border-slate-300 print:border-black whitespace-nowrap uppercase tracking-wide w-36">
                    tanggal surat
                  </th>
                  {/* Kolom 4: Jenis / Klasifikasi */}
                  <th className="py-2.5 px-3 font-bold border border-slate-300 print:border-black whitespace-nowrap uppercase tracking-wide w-44">
                    Jenis / Klasifikasi
                  </th>
                  {/* Kolom 5: Pengirim & Penerima */}
                  <th className="py-2.5 px-3 font-bold border border-slate-300 print:border-black uppercase tracking-wide min-w-[200px]">
                    Pengirim &amp; Penerima
                  </th>
                  {/* Kolom 6: Perihal & Ringkasan */}
                  <th className="py-2.5 px-3 font-bold border border-slate-300 print:border-black uppercase tracking-wide min-w-[280px]">
                    Perihal &amp; Ringkasan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rekapData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-12 text-center text-slate-400 border border-slate-300 print:border-black font-medium"
                    >
                      Tidak ada data surat yang sesuai dengan filter rekapitulasi saat ini.
                    </td>
                  </tr>
                ) : (
                  rekapData.map((item, index) => {
                    const isKeluar = item.tipe === 'keluar' || item.jenis === 'Surat Keluar' || Boolean(item.kategoriKeluar);
                    const kategoriLabel = item.kategoriKeluar || (item.jenis !== 'Surat Masuk' && item.jenis !== 'Surat Keluar' ? item.jenis : isKeluar ? 'Surat Keluar' : 'Surat Masuk');

                    return (
                      <tr
                        key={item.id}
                        onClick={() => onOpenDetail && onOpenDetail(item)}
                        className="hover:bg-slate-50/90 transition-colors print:hover:bg-transparent cursor-pointer"
                      >
                        {/* 1. no */}
                        <td className="py-2.5 px-3 border border-slate-300 print:border-black text-center font-mono font-medium text-slate-700 print:text-black">
                          {index + 1}
                        </td>

                        {/* 2. nomor surat */}
                        <td className="py-2.5 px-3 border border-slate-300 print:border-black font-mono font-bold text-slate-900 print:text-black">
                          <span className="block leading-tight">{item.nomorSurat}</span>
                          {item.fileName && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-sans mt-0.5 print:hidden">
                              <FileCheck className="w-3 h-3 text-emerald-600" />
                              Lampiran Berkas
                            </span>
                          )}
                        </td>

                        {/* 3. tanggal surat */}
                        <td className="py-2.5 px-3 border border-slate-300 print:border-black text-slate-800 print:text-black whitespace-nowrap">
                          <div className="font-medium">{formatDateIndo(item.tanggalSurat)}</div>
                          <div className="text-[10px] text-slate-400 print:hidden mt-0.5">
                            Diterima: {formatDateIndo(item.tanggalDiterima)}
                          </div>
                        </td>

                        {/* 4. Jenis / Klasifikasi */}
                        <td className="py-2.5 px-3 border border-slate-300 print:border-black">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded border inline-block leading-tight ${
                                isKeluar
                                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200 print:border-black print:bg-transparent'
                                  : 'bg-blue-50 text-blue-800 border-blue-200 print:border-black print:bg-transparent'
                              }`}
                            >
                              {kategoriLabel}
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium">
                              {isKeluar ? 'Tata Naskah Keluar' : 'Surat Masuk'}
                            </span>
                          </div>
                        </td>

                        {/* 5. Pengirim & Penerima */}
                        <td className="py-2.5 px-3 border border-slate-300 print:border-black text-slate-800 print:text-black">
                          <div className="space-y-1">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-black block leading-none">
                                Dari (Pengirim):
                              </span>
                              <span className="font-semibold text-slate-900 print:text-black leading-tight block">
                                {item.pengirim}
                              </span>
                            </div>
                            <div className="pt-0.5 border-t border-slate-100 print:border-slate-300">
                              <span className="text-[10px] uppercase font-bold text-slate-400 print:text-black block leading-none">
                                Kepada (Penerima):
                              </span>
                              <span className="text-slate-700 print:text-black leading-tight block">
                                {item.penerima}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 6. Perihal & Ringkasan */}
                        <td className="py-2.5 px-3 border border-slate-300 print:border-black text-slate-800 print:text-black">
                          <div className="font-bold text-slate-900 print:text-black leading-snug">
                            {item.perihal}
                          </div>
                          {item.ringkasan && (
                            <div className="text-[11px] text-slate-600 print:text-black mt-1 leading-relaxed line-clamp-3">
                              {item.ringkasan}
                            </div>
                          )}
                          {item.catatanDisposisi && (
                            <div className="mt-1 text-[10px] text-amber-800 bg-amber-50 print:bg-transparent print:border-black px-1.5 py-0.5 rounded border border-amber-200 inline-block">
                              Disposisi: {item.catatanDisposisi}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Print Signature Section (Visible when printed) */}
        <div className="hidden print:flex justify-between items-start mt-8 pt-4 text-xs text-black">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold mt-1">Kepala BAPPERIDA Kabupaten Tanggamus</p>
            <div className="h-16"></div>
            <p className="font-bold underline">(.........................................................)</p>
            <p>NIP. .....................................................</p>
          </div>
          <div className="text-right">
            <p>Kota Agung, {formatDateIndo(new Date().toISOString().split('T')[0])}</p>
            <p className="font-bold mt-1">Petugas Pengelola Kearsipan / Agenda</p>
            <div className="h-16"></div>
            <p className="font-bold underline">(.........................................................)</p>
            <p>NIP. .....................................................</p>
          </div>
        </div>
      </div>
    </div>
  );
};

# Panduan Menjalankan E-PMPED di CasaOS (Setup IP Otomatis & Port Kosong Otomatis)

Panduan ini menjawab dua kebutuhan utama Anda:
1. **Mengikuti IP / Domain bawaan CasaOS** (tidak perlu setup IP manual).
2. **Port otomatis terisi dengan port yang kosong** (mencegah bentrok port).

---

## 💡 Solusi Error yang Sering Terjadi:

### 1. Error `Cannot find native binding ... @rolldown/binding-linux-x64-musl`:
- **Penyebab**: Vite versi 8 menggunakan bundler *Rolldown* yang membutuhkan binary native C. Image Docker `node:20-alpine` menggunakan C library `musl` yang sering gagal diinstal oleh npm karena bug npm #4828.
- **Solusi Tuntas**:
  1. Base image Dockerfile telah diganti dari `node:20-alpine` ke **`node:20-slim` (Debian)** yang menggunakan standar `glibc` lengkap.
  2. Binary native Rolldown (`@rolldown/binding-linux-x64-gnu`) otomatis terinstal sempurna dan `npm run build` berjalan mulus.
  3. Cukup jalankan perintah instalasi di bawah, skrip akan otomatis memperbarui Dockerfile dan mem-build ulang.

### 2. Error `process "/bin/sh -c npm install" did not complete successfully`:
- **Penyebab**: Terjadi bentrok versi ketergantungan paket (*peer dependency conflict* pada npm).
- **Solusi**: File `package.json` dan `Dockerfile` sudah menggunakan `--legacy-peer-deps`.

### 3. Error `open Dockerfile: no such file or directory`:
- **Penyebab**: Folder `/DATA/AppData/epmped` di CasaOS belum berisi file aplikasi.
- **Solusi**: Pastikan file-file aplikasi sudah disalin ke folder tersebut.

---

## 🚀 CARA 1: Paling Mudah & Otomatis (Lewat Terminal CasaOS)
*Cara ini paling direkomendasikan karena skrip akan **otomatis mendeteksi port kosong**, menangani izin root, dan memasang ikon di CasaOS.*

### Langkah 1: Pastikan File Aplikasi Berada di Folder CasaOS
1. Buka dashboard CasaOS di browser Anda.
2. Klik ikon aplikasi **Files** (File Manager bawaan CasaOS).
3. Masuk ke direktori: `/DATA/AppData/epmped` (jika folder `epmped` belum ada, buat foldernya).
4. Upload file proyek ini ke dalam folder tersebut (Anda bisa upload file ZIP lalu klik kanan **Extract**).
5. Pastikan di dalam `/DATA/AppData/epmped` terdapat file `package.json`, `server.ts`, `casaos-install.sh`, `Dockerfile`, dan folder `src`.

### Langkah 2: Jalankan Script di Terminal CasaOS
Buka **Terminal** di CasaOS (atau lewat SSH), lalu ketik:
```bash
cd /DATA/AppData/epmped && sudo bash casaos-install.sh
```

**Apa yang dilakukan skrip ini secara otomatis?**
- 🧹 Membersihkan container dan cache lama yang gagal.
- 📄 Memastikan Dockerfile menggunakan **`node:20-slim` (Debian glibc)** agar bebas dari error native binding.
- 🔍 Memindai port host (mulai dari 3000, 3001, 3002...) dan **otomatis memilih port yang belum dipakai**.
- 🌐 Menghubungkan aplikasi ke IP / domain CasaOS Anda.
- ⚡ Membangun dan menyalakan server aplikasi E-PMPED.
- 📱 Mendaftarkan ikon **E-PMPED Bapperida** di Dashboard CasaOS.

---

## 🖱️ CARA 2: Lewat Web UI CasaOS (Custom Install / Import)
Jika Anda ingin memasang langsung dari tampilan grafis web CasaOS:

1. Buka **Dashboard CasaOS** di browser Anda.
2. Masuk ke **App Store**.
3. Di sudut kanan atas, klik tombol **"Custom Install"**.
4. Klik tombol **Import** (ikon dokumen / panah di kanan atas form).
5. Tempel (*paste*) konfigurasi Docker Compose berikut:

```yaml
name: epmped-bapperida

services:
  epmped:
    image: node:20-slim
    container_name: epmped-bapperida
    restart: unless-stopped
    ports:
      - "3000" # Biarkan tanpa host port spesifik jika ingin CasaOS mengalokasikan port otomatis
    working_dir: /app
    volumes:
      - /DATA/AppData/epmped:/app
    command: sh -c "npm install --legacy-peer-deps && npm run build && npx tsx server.ts"
    environment:
      - PORT=3000
      - NODE_ENV=production
    x-casaos:
      icon: "https://cdn-icons-png.flaticon.com/512/906/906334.png"
      title:
        en_us: E-PMPED Bapperida
        id_id: E-PMPED Bapperida
      author: Bapperida Tanggamus
      category: Office
      description:
        en_us: Sistem Elektronik Bidang Perencanaan Makro Pengendalian dan Evaluasi Pembangunan Daerah
        id_id: Sistem Elektronik Bidang Perencanaan Makro Pengendalian dan Evaluasi Pembangunan Daerah
      developer: Bapperida Tanggamus
      index: /
      port_map: "3000"
      scheme: http
```


6. **Pengaturan Port di Form CasaOS:**
   - Di bagian **Ports**:
     - **Container Port**: `3000`
     - **Host Port**: Jika port `3000` sudah terisi oleh aplikasi lain, masukkan port kosong berikutnya (contoh: `3001`, `3002`, atau `8085`).
     - **Web UI**: Masukkan angka port yang sama dengan Host Port yang Anda pilih.
7. **Pengaturan IP:**
   - Anda **TIDAK PERLU** memasukkan IP address manual!
   - CasaOS secara otomatis mengarahkan ikon aplikasi ke IP atau domain yang sedang Anda buka di browser (misalnya `http://casa.cloudpme.my.id:PORT` atau `http://192.168.x.x:PORT`).
8. Klik **Submit** lalu **Install**.

---

## 🔑 Login Default Aplikasi
Setelah aplikasi aktif:
- **Username**: `admin`
- **Password**: `admin`

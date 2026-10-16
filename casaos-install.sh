#!/usr/bin/env bash
# ==============================================================================
# Script Instalasi Otomatis E-PMPED Bapperida Tanggamus untuk CasaOS / Linux
# Fitur: Otomatis eskalasi sudo, mencari port kosong & integrasi IP bawaan CasaOS
# ==============================================================================

set -e

# Otomatis gunakan hak akses root / sudo agar tidak muncul "Permission denied"
if [ "$(id -u)" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then
        echo "🔑 Memerlukan hak akses administrator untuk mengonfigurasi CasaOS..."
        exec sudo bash "$0" "$@"
    else
        echo "❌ Script ini memerlukan hak akses root. Silakan jalankan: sudo bash $0"
        exit 1
    fi
fi

echo "=========================================================="
echo "    🚀 INSTALASI OTOMATIS E-PMPED BAPPERIDA DI CASAOS     "
echo "=========================================================="
echo ""

# 1. Cek Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker belum terpasang di sistem ini!"
    echo "   Silakan pastikan Docker aktif di CasaOS Anda."
    exit 1
fi
echo "✅ Docker terdeteksi: $(docker --version)"

# 2. Hentikan container lama yang salah / blank (misal Nginx kosong) jika ada
echo "🧹 Memeriksa & membersihkan container lama jika ada..."
docker stop epmped epmped-bapperida 2>/dev/null || true
docker rm epmped epmped-bapperida 2>/dev/null || true

# 3. Fungsi otomatis mencari port host yang BENAR-BENAR KOSONG (mulai dari 3000)
find_free_port() {
    local port=${1:-3000}
    while true; do
        local in_use=0
        if (ss -tuln 2>/dev/null | grep -q ":$port ") || \
           (netstat -tuln 2>/dev/null | grep -q ":$port ") || \
           (command -v lsof >/dev/null 2>&1 && lsof -i :$port >/dev/null 2>&1) || \
           (docker ps --format '{{.Ports}}' 2>/dev/null | grep -q ":$port->"); then
            in_use=1
        fi

        if [ $in_use -eq 0 ]; then
            echo "$port"
            return 0
        fi
        port=$((port + 1))
    done
}

echo "🔍 Memeriksa ketersediaan port secara otomatis..."
APP_PORT=$(find_free_port 3000)
echo "✅ Port kosong berhasil didapatkan otomatis: $APP_PORT"

# 4. Tentukan direktori aplikasi di CasaOS
INSTALL_DIR="/DATA/AppData/epmped"
if [ ! -d "/DATA/AppData" ]; then
    INSTALL_DIR="./epmped-app"
    echo "ℹ️ Direktori /DATA/AppData tidak ditemukan. Menggunakan folder: ${INSTALL_DIR}"
else
    echo "ℹ️ Menggunakan direktori resmi CasaOS: ${INSTALL_DIR}"
fi

mkdir -p "$INSTALL_DIR"

# Cari lokasi source code jika dijalankan di luar folder instalasi
CURRENT_DIR=$(pwd)
SOURCE_DIR=""

if [ -f "$CURRENT_DIR/package.json" ]; then
    SOURCE_DIR="$CURRENT_DIR"
elif [ -f "$INSTALL_DIR/package.json" ]; then
    SOURCE_DIR="$INSTALL_DIR"
elif [ -f "$HOME/epmped/package.json" ]; then
    SOURCE_DIR="$HOME/epmped"
elif [ -f "/root/epmped/package.json" ]; then
    SOURCE_DIR="/root/epmped"
fi

if [ -n "$SOURCE_DIR" ] && [ "$SOURCE_DIR" != "$INSTALL_DIR" ]; then
    echo "📋 Menyalin file aplikasi dari $SOURCE_DIR ke $INSTALL_DIR..."
    cp -ru "$SOURCE_DIR"/* "$INSTALL_DIR"/ 2>/dev/null || cp -r "$SOURCE_DIR"/* "$INSTALL_DIR"/ 2>/dev/null || true
fi

# 5. Pindah ke direktori instalasi
cd "$INSTALL_DIR"

# Validasi keberadaan file source code aplikasi
if [ ! -f "package.json" ]; then
    echo ""
    echo "=========================================================="
    echo "⚠️  FILE APLIKASI BELUM DITEMUKAN DI: $INSTALL_DIR"
    echo "=========================================================="
    echo "Pesan error 'Dockerfile: no such file or directory' terjadi"
    echo "karena folder ini masih kosong (belum ada file aplikasi)."
    echo ""
    echo "📌 CARA MUDAH MENARUH FILE APLIKASI DI CASAOS:"
    echo "1. Buka Dashboard CasaOS di browser Anda."
    echo "2. Klik aplikasi 'Files' (Manajer File bawaan CasaOS)."
    echo "3. Masuk ke folder: /DATA/AppData/epmped"
    echo "4. Upload file-file aplikasi hasil download dari AI Studio ini"
    echo "   (atau upload file zip lalu ekstrak di folder tersebut)."
    echo "5. Setelah file terupload (ada package.json, server.ts, src, dll),"
    echo "   jalankan kembali perintah ini di Terminal:"
    echo "   👉 cd $INSTALL_DIR && sudo bash casaos-install.sh"
    echo "=========================================================="
    exit 1
fi

# Pastikan Dockerfile selalu menggunakan node:20-slim (Debian glibc) untuk kompatibilitas Rolldown/Vite
if [ ! -f "Dockerfile" ] || grep -q "alpine" "Dockerfile" 2>/dev/null; then
    echo "📄 Memperbarui Dockerfile ke node:20-slim (Debian glibc)..."
    cat << 'DOCKERFILE_EOF' > Dockerfile
# ===================================================
# Dockerfile E-PMPED Bapperida Tanggamus untuk CasaOS
# Menggunakan Debian-based (node:20-slim) untuk kompatibilitas
# penuh glibc dengan Vite & Rolldown native binding
# ===================================================
FROM node:20-slim

WORKDIR /app

# Copy dependency definition (hanya package.json agar bebas konflik lockfile)
COPY package.json ./

# Install dependensi (termasuk native binding untuk Linux glibc)
RUN npm install --legacy-peer-deps

# Copy seluruh source code aplikasi
COPY . .

# Build frontend production bundle (Vite + Rolldown)
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Health check mandiri via Node.js HTTP
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http = require('http'); const req = http.request({host: '127.0.0.1', port: 3000, path: '/', timeout: 2000}, (res) => process.exit(res.statusCode < 500 ? 0 : 1)); req.on('error', () => process.exit(1)); req.end();"

CMD ["npx", "tsx", "server.ts"]
DOCKERFILE_EOF
fi

# Buat .dockerignore jika belum ada agar build ringan dan cepat
cat << 'IGNORE_EOF' > .dockerignore
node_modules
dist
.git
.gitignore
.env
bun.lock
package-lock.json
*.log
.aistudio
IGNORE_EOF


# Bersihkan file docker-compose.yml lama yang mungkin permission-nya terkunci
rm -f docker-compose.yml 2>/dev/null || true

# 6. Buat file docker-compose.yml dengan port kosong yang ditemukan
echo "📦 Mengonfigurasi docker-compose.yml untuk CasaOS..."
cat << EOF > docker-compose.yml
name: epmped-bapperida

services:
  epmped:
    image: epmped-bapperida:latest
    build:
      context: .
      dockerfile: Dockerfile
    container_name: epmped-bapperida
    restart: unless-stopped
    ports:
      - "${APP_PORT}:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
    x-casaos:
      envs:
        - container: PORT
          description:
            en_us: Port internal aplikasi E-PMPED
          value: "3000"
      ports:
        - container: "3000"
          description:
            en_us: Web UI port E-PMPED
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
      port_map: "${APP_PORT}"
      scheme: http
      store_cache: false
EOF

# 7. Build dan jalankan aplikasi di latar belakang
echo "⚡ Membangun dan menjalankan container E-PMPED pada port ${APP_PORT}..."
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

# 8. Deteksi IP Host CasaOS
HOST_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$HOST_IP" ]; then
    HOST_IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+')
fi
if [ -z "$HOST_IP" ]; then
    HOST_IP="<IP-CASAOS-ANDA>"
fi

echo ""
echo "=========================================================="
echo "    🎉 INSTALASI BERHASIL! E-PMPED SUDAH AKTIF           "
echo "=========================================================="
echo "🌐 Buka aplikasi di browser Anda melalui:"
echo "   👉 http://${HOST_IP}:${APP_PORT}"
echo ""
echo "📱 Ikon aplikasi juga otomatis muncul di Dashboard CasaOS."
echo "🔑 Login Default:"
echo "   - Username : admin"
echo "   - Password : admin"
echo "=========================================================="

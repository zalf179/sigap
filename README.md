# SIGAP (Sistem Informasi Tanggap Darurat dan Edukasi Pengelolaan Sampah Perumahan Berbasis Web)

## Stack
- Frontend: Vite + React + React Router + Tailwind CSS
- Backend: Node.js + Express (REST API) di folder `/server`
- AI classifier: FastAPI + TensorFlow/Keras di folder `/server/ai-waste`
- Database: MySQL

## Menjalankan dengan Docker Compose

Persyaratan: Docker Engine/Desktop dengan plugin Docker Compose.

1. Salin file environment contoh ke `.env` di root project, lalu ganti nilai rahasia contoh:

```bash
cp .env.docker.example .env
```

Di PowerShell, gunakan:

```powershell
Copy-Item .env.docker.example .env
```

Isi `JWT_SECRET` dengan nilai acak minimal 32 karakter (misalnya `openssl rand -hex 32`). Buat akun admin setelah stack berjalan dengan perintah bootstrap di bawah; perintah itu menghasilkan kata sandi acak.

2. Bangun image dan jalankan semua service dari root project:

```bash
docker compose up --build
```

3. Buka **http://localhost:8080**. Backend API tersedia di **http://localhost:5000**.

Compose menjalankan frontend, backend, AI classifier, dan MySQL. Inisialisasi database berjalan otomatis saat pertama kali dijalankan. Model AI diunduh saat startup pertama, sehingga proses awal bisa lebih lama. Database, foto unggahan, dan cache model disimpan di Docker volumes dan tetap ada setelah `docker compose down`.

Buat akun admin dengan kata sandi acak menggunakan perintah berikut setelah stack berjalan. Jika akun `admin@sigap.local` sudah ada, perintah ini akan mengganti kata sandinya. Simpan kata sandi yang ditampilkan; kata sandi hanya dicetak pada output perintah tersebut.

```bash
docker compose exec backend npm run admin:bootstrap -- admin@sigap.local
```

Untuk menghentikan aplikasi:

```bash
docker compose down
```

Jangan gunakan `docker compose down -v` jika ingin mempertahankan data dalam volumes.

## Struktur
```
/client  -> frontend (Vite)
/server  -> backend (Express)
/server/{routes,controllers,middleware,db,uploads}
/client/src/{pages,components,api,context}
```

## Menjalankan (PowerShell)

### 1) Install dependensi
```powershell
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

### 2) Konfigurasi environment
Salin `.env.example` ke `.env` di folder `server/`, lalu isi nilai database dan buat rahasia acak untuk `JWT_SECRET` (minimal 32 karakter). Contoh: `openssl rand -hex 32`.

```powershell
Copy-Item server\.env.example server\.env
```

### 3) Inisialisasi database
Pastikan MySQL berjalan di `localhost:3306` dengan nilai yang sama seperti di `server/.env`. Jalankan:

```powershell
cd server
npm run db:init
```

Script ini akan membuat database `sigap` jika belum ada, membuat tabel, serta men-seed blok dan kategori sampah. Buat admin dengan kata sandi acak menggunakan `npm run admin:bootstrap -- admin@sigap.local`. Perintah itu akan mencetak kata sandi sekali; simpan sebelum menutup terminal. Jika akun admin tersebut sudah ada, kata sandinya akan diganti. Akun petugas dapat dibuat oleh administrator setelah masuk. Artikel contoh dibuat jika akun administrator tersedia.

### 4) Menjalankan aplikasi
Buka dua terminal PowerShell.

Terminal 1 (Backend):
```powershell
cd server
npm run dev
```

Terminal 2 (Frontend):
```powershell
cd client
npm run dev
```

Akses:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

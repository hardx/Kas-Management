# Kas Management

Aplikasi manajemen keuangan pribadi yang dibangun menggunakan React (Vite), TypeScript, dan Express JS dengan database MySQL.

## Prasyarat

Pastikan Anda telah menginstal aplikasi berikut di komputer Anda:

- [Node.js](https://nodejs.org/) (versi 16 atau lebih baru)
- [MySQL](https://www.mysql.com/) (atau gunakan Laragon/XAMPP)

## Cara Menjalankan Project

### 1. Konfigurasi Database

Buat file bernama `.env` di direktori utama (root) project. Salin konfigurasi di bawah ini:

```env
# Konfigurasi Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=notes_new

# Konfigurasi JWT (Untuk login)
JWT_SECRET=kunci_rahasia_aman_anda
```

> **Catatan:** Sesuaikan `DB_USER` dan `DB_PASSWORD` dengan pengaturan MySQL di komputer Anda. Jika menggunakan default XAMPP/Laragon, password biasanya kosong.

### 2. Instalasi Dependensi

Buka terminal di folder project, lalu jalankan perintah berikut secara berurutan:

```bash
# 1. Install dependensi untuk Frontend (Root folder)
npm install

# 2. Install dependensi untuk Backend (Server folder)
cd server
npm install
cd ..
```

### 3. Inisialisasi Database

Jalankan perintah ini untuk membuat database dan tabel secara otomatis:

```bash
node server/init_db.js
```

Jika berhasil, akan muncul pesan "Database initialized successfully!".

### 4. Menjalankan Aplikasi

Anda perlu menjalankan **Backend** dan **Frontend** secara bersamaan. Gunakan dua terminal terpisah.

**Terminal 1 (Untuk Backend Server):**

```bash
cd server
npm run dev
```

Server akan berjalan (biasanya di port 3000).

**Terminal 2 (Untuk Frontend React):**

```bash
# Pastikan Anda berada di folder root (bukan folder server)
npm run dev
```

Akses aplikasi melalui browser di URL yang muncul (biasanya `http://localhost:5173`).

## Fitur Utama

- **Dashboard**: Ringkasan keuangan.
- **Transaksi**: Catat pemasukan dan pengeluaran dengan filter & pagination.
- **Kategori**: Kelola kategori transaksi.
- **Hutang & Piutang**: Catat hutang piutang.
- **Jurnal Besar**: Laporan lengkap semua transaksi.

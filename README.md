# 👛 DuitKu — Aplikasi Pencatat Keuangan Pribadi PWA

[![Netlify Status](https://api.netlify.com/api/v1/badges/5678abcd-1234-efgh-5678-1234567890ab/deploy-status)](https://duitkuarj.netlify.app/)
[![Platform PWA](https://img.shields.io/badge/PWA-Supported-black.svg?style=flat&logo=progressive-web-apps&logoColor=white)](https://duitkuarj.netlify.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-zinc.svg)](https://opensource.org/licenses/MIT)

**DuitKu** adalah aplikasi pencatat keuangan pribadi berbasis web (PWA - Progressive Web App) yang dirancang dengan antarmuka minimalis bertema **White and Black (WNB)** yang elegan, bersih, dan responsif. Aplikasi ini berjalan 100% offline secara lokal di browser Anda untuk menjamin keamanan dan privasi data keuangan Anda.

📱 **Coba Demo Aplikasi Online:** [https://duitkuarj.netlify.app/](https://duitkuarj.netlify.app/)

---

## ✨ Fitur Utama

- **📊 Dashboard Interaktif**:
  <img width="670" height="903" alt="image" src="https://github.com/user-attachments/assets/2a643e86-129e-405c-b902-f13b60711354" />

  - Tampilan Saldo Total, Total Pemasukan, dan Pengeluaran bulan berjalan.
  - Grafik donat dinamis untuk komposisi pengeluaran per kategori.
  - Grafik batang tren keuangan (Pemasukan vs Pengeluaran) periode **Juli s.d. Desember 2026**.
- **📋 Riwayat Terkelompok**:
  <img width="676" height="901" alt="image" src="https://github.com/user-attachments/assets/1e444c1f-00f5-4bb8-a54e-acae0e51f2a2" />

  - Riwayat transaksi dikelompokkan rapi berdasarkan kategori masing-masing.
  - Diurutkan dari tanggal transaksi terbaru (newest first).
  - Dilengkapi fitur pencarian (*live search*) dan filter jenis transaksi (Semua, Pemasukan, Pengeluaran).
- **🎯 Pengaturan Budget Bulanan**:
<img width="653" height="893" alt="image" src="https://github.com/user-attachments/assets/299b003e-2990-4ec2-8f81-e093e4ef5735" />

  - Tetapkan budget pengeluaran bulanan secara global maupun per kategori.
  - Progress bar dinamis berwarna untuk memantau sisa budget.
  - Banner peringatan otomatis di Dashboard jika pengeluaran telah mencapai 80% atau melebihi budget yang ditentukan.

- **📱 Dukungan PWA (Offline-First)**:
  - Dapat di-install langsung di layar utama handphone (iOS & Android) seperti aplikasi native.
  - Berjalan lancar tanpa internet menggunakan caching Service Worker.
- **🔒 Keamanan Data**:
  - Tidak memerlukan akun atau pendaftaran. Data keuangan Anda disimpan sepenuhnya di memori browser lokal (*localStorage*).

---

## 🎨 Kategori Pengeluaran

Kategori pengeluaran dirancang dengan ikon visual dari *Phosphor Icons* dan kode warna khusus agar mudah diidentifikasi:
- 🍴 **Makanan & Minuman** (Oranye)
- 🚗 **Transport** (Biru)
- 🛍️ **Belanja** (Pink)
- 🎮 **Hiburan** (Ungu)
- 🧾 **Tagihan** (Kuning)
- 🩺 **Kesehatan** (Tosca)
- 📚 **Pendidikan** (Indigo)
- 📦 **Lainnya** (Abu-abu)

---

## 🛠️ Stack Teknologi

- **Bahasa Utama**: HTML5, PHP Native (`index.php`), dan Vanilla JavaScript (`app.js`)
- **Styling & Tata Letak**: [Tailwind CSS v3 (via CDN)](https://tailwindcss.com/)
- **Kumpulan Ikon**: [Phosphor Icons](https://phosphoricons.com/)
- **Visualisasi Grafik**: HTML5 Canvas API (Grafik Donat & Batang Kustom Tanpa Library Pihak Ketiga)
- **Fitur Mobile**: Web App Manifest (`manifest.json`) & Service Worker (`sw.js`)

---

## 🚀 Cara Menjalankan Secara Lokal

Anda tidak memerlukan server khusus (seperti Apache/XAMPP) jika hanya ingin membuka versi HTML. Cukup ikuti langkah berikut:

1. **Clone repositori ini**:
   ```bash
   git clone https://github.com/ArjuN00b/duitku.git
   ```
2. **Masuk ke folder proyek**:
   ```bash
   cd duitku
   ```
3. **Jalankan aplikasi**:
   - Klik dua kali file `index.html` untuk membukanya langsung di browser Chrome/Edge/Safari Anda.
   - Atau, jika ingin menggunakan web server lokal (PHP):
     ```bash
     php -S localhost:8000
     ```
     Lalu buka `http://localhost:8000/index.php` di browser Anda.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi MIT. Silakan gunakan, modifikasi, dan distribusikan secara bebas.

---

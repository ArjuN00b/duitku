# 📘 Panduan Setup Supabase untuk DuitKu

## Langkah 1: Setup Database di Supabase

1. **Login ke Supabase Dashboard**
   - Buka https://supabase.com
   - Login dengan akun Anda
   - Pilih project yang sudah Anda buat

2. **Buat Tabel Database**
   - Di dashboard Supabase, buka **SQL Editor** (menu sebelah kiri)
   - Klik **New Query**
   - Copy seluruh isi file `supabase-schema.sql`
   - Paste ke SQL Editor
   - Klik **Run** untuk menjalankan script
   - Pastikan muncul pesan sukses dan tidak ada error

3. **Verifikasi Tabel Berhasil Dibuat**
   - Buka **Table Editor** (menu sebelah kiri)
   - Anda harus melihat 2 tabel baru:
     - `transactions` (untuk menyimpan data transaksi)
     - `budgets` (untuk menyimpan data budget bulanan)

## Langkah 2: Dapatkan API Credentials

1. **Buka Settings > API**
   - Di dashboard Supabase, klik **Settings** (icon gear di kiri bawah)
   - Pilih **API**

2. **Copy Credentials**
   - **Project URL**: Copy URL yang ada di bagian "Project URL"
     - Contoh: `https://xxxxxxxxxxxxx.supabase.co`
   
   - **API Key (anon/public)**: Copy key yang ada di bagian "Project API keys" > "anon public"
     - Ini adalah key yang panjang mulai dengan `eyJ...`

## Langkah 3: Konfigurasi Aplikasi

1. **Edit file `config.js`**
   - Buka file `config.js` di folder project Anda
   - Ganti `YOUR_SUPABASE_PROJECT_URL` dengan Project URL Anda
   - Ganti `YOUR_SUPABASE_ANON_KEY` dengan Anon Key Anda

   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://xxxxxxxxxxxxx.supabase.co',  // Project URL Anda
     anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // Anon Key Anda
   };
   ```

2. **Simpan file config.js**

## Langkah 4: Test Koneksi

1. **Buka Aplikasi di Browser**
   - Buka file `index.html` di browser Anda
   - Atau jalankan dengan web server lokal

2. **Buka Developer Console**
   - Tekan `F12` atau `Ctrl+Shift+I`
   - Pilih tab **Console**
   - Anda harus melihat pesan: `✅ Supabase client berhasil diinisialisasi`

3. **Test Sinkronisasi**
   - Klik icon cloud di pojok kanan atas aplikasi
   - Masukkan kode kunci sinkronisasi (contoh: `TEST123`)
   - Klik "Hubungkan & Sinkronkan"
   - Jika berhasil, akan muncul pesan sukses

4. **Test Tambah Transaksi**
   - Klik tombol `+` di tengah bawah
   - Tambahkan transaksi test
   - Klik Simpan
   - Cek di Supabase Dashboard > Table Editor > transactions
   - Data transaksi Anda harus muncul di sana!

## Langkah 5: Security (Opsional tapi Disarankan)

Untuk keamanan yang lebih baik, Anda bisa mengatur Row Level Security (RLS) policies di Supabase:

1. Buka **Authentication** di Supabase Dashboard
2. Enable email authentication atau provider lain
3. Update RLS policies untuk membatasi akses berdasarkan user authentication

Untuk saat ini, aplikasi menggunakan `sync_key` sebagai mekanisme isolasi data sederhana.

## Troubleshooting

### ❌ "Gagal mengambil data dari Supabase"
- Pastikan Project URL dan Anon Key sudah benar di `config.js`
- Cek koneksi internet Anda
- Pastikan tabel sudah dibuat dengan benar di Supabase

### ❌ "Supabase belum dikonfigurasi"
- Pastikan `config.js` sudah diisi dengan credential yang benar
- Jangan lupa replace `YOUR_SUPABASE_PROJECT_URL` dan `YOUR_SUPABASE_ANON_KEY`

### ❌ Data tidak tersimpan ke cloud
- Pastikan Anda sudah setting sync_key melalui tombol cloud
- Cek browser console untuk error messages
- Verifikasi RLS policies di Supabase (harus allow insert/update)

## Keamanan Credential

⚠️ **PENTING**: 
- File `config.js` berisi credential sensitif
- **JANGAN** commit file ini ke GitHub atau repository publik
- File `.gitignore` sudah dibuat untuk mencegah hal ini
- Jika tidak sengaja ter-commit, segera regenerate API keys di Supabase Dashboard

## Fitur Sinkronisasi

Dengan Supabase terhubung, aplikasi Anda sekarang memiliki:
- ✅ Backup otomatis ke cloud
- ✅ Sinkronisasi antar device (gunakan sync_key yang sama)
- ✅ Data persistent (tidak hilang meski clear browser cache)
- ✅ Akses dari mana saja

## Support

Jika ada pertanyaan atau masalah, silakan cek:
- Dokumentasi Supabase: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

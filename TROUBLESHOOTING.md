# 🔧 TROUBLESHOOTING - DuitKu

## 🚨 MASALAH: Aplikasi Loading Terus / Stuck di Splash Screen

### Solusi 1: Test dengan File Diagnostic
1. Buka file `test.html` di browser
2. Lihat hasil test - semua harus PASS
3. Jika ada FAIL, ikuti petunjuk di layar

### Solusi 2: Buka Developer Console
1. Buka `index.html` di browser
2. Tekan `F12` (atau `Ctrl+Shift+I`)
3. Pilih tab **Console**
4. Lihat error yang muncul (warna merah)
5. Screenshot dan kirim ke developer

### Solusi 3: Hard Refresh
1. Tekan `Ctrl + Shift + R` (Windows/Linux)
2. Atau `Cmd + Shift + R` (Mac)
3. Ini akan clear cache browser

### Solusi 4: Clear Browser Data
1. Tekan `Ctrl + Shift + Delete`
2. Pilih "Cached images and files"
3. Pilih "Cookies and site data"
4. Klik "Clear data"
5. Refresh halaman

### Solusi 5: Cek config.js
1. Buka file `config.js`
2. Pastikan sudah diisi dengan benar:
   ```javascript
   url: 'https://xxxxx.supabase.co',  // URL dari Supabase
   anonKey: 'eyJhbG...'                // Key dari Supabase
   ```
3. **JANGAN** ada `YOUR_SUPABASE_PROJECT_URL` atau `YOUR_SUPABASE_ANON_KEY`

### Solusi 6: Mode Offline (Tanpa Supabase)
Jika Supabase bermasalah, aplikasi tetap bisa jalan mode offline:

1. Buka `config.js`
2. Ubah menjadi:
   ```javascript
   const SUPABASE_CONFIG = {
     url: '',
     anonKey: ''
   };
   ```
3. Simpan dan refresh browser
4. Aplikasi akan jalan tanpa cloud sync (data hanya di browser)

---

## 🚨 MASALAH: "Supabase belum dikonfigurasi"

### Penyebab:
- File `config.js` belum diisi dengan credential yang benar

### Solusi:
1. Buka Supabase Dashboard: https://supabase.com
2. Pilih project Anda
3. Klik Settings (⚙️) → API
4. Copy **Project URL** dan **anon public key**
5. Paste ke `config.js`
6. Simpan file
7. Hard refresh browser (`Ctrl + Shift + R`)

---

## 🚨 MASALAH: "Gagal mengambil data dari Supabase"

### Penyebab:
1. Koneksi internet bermasalah
2. Tabel database belum dibuat
3. URL atau Key salah

### Solusi:

#### Cek Koneksi Internet
- Pastikan internet aktif
- Coba buka supabase.com di browser

#### Cek Tabel Database
1. Buka Supabase Dashboard
2. Klik **Table Editor**
3. Harus ada 2 tabel:
   - `transactions`
   - `budgets`
4. Jika belum ada, jalankan file `supabase-schema.sql`:
   - SQL Editor → New Query
   - Copy paste isi file `supabase-schema.sql`
   - Klik Run

#### Cek Credential
1. Buka Supabase Dashboard → Settings → API
2. Compare Project URL dan anon key dengan yang di `config.js`
3. Harus SAMA PERSIS (case-sensitive)

---

## 🚨 MASALAH: Data Tidak Tersimpan ke Cloud

### Cek Sync Key
1. Klik icon ☁️ cloud di pojok kanan atas
2. Masukkan kode sync (contoh: USER123)
3. Klik "Hubungkan & Sinkronkan"
4. Harus muncul alert sukses

### Cek RLS Policy
1. Buka Supabase Dashboard → Authentication
2. Pastikan RLS policies sudah di-set dengan benar
3. Jika ragu, jalankan ulang `supabase-schema.sql`

---

## 🚨 MASALAH: Console Error "Cannot read property..."

### Penyebab:
Ada bug di JavaScript

### Solusi:
1. Screenshot error lengkap dari Console
2. Catat langkah yang dilakukan sebelum error
3. Report ke developer

---

## 🚨 MASALAH: Splash Screen Tidak Hilang

### Solusi Cepat:
1. Buka Developer Console (`F12`)
2. Ketik di Console:
   ```javascript
   document.getElementById('splashScreen').remove()
   ```
3. Tekan Enter
4. Screenshot error yang muncul

---

## 📋 Checklist Debugging

Sebelum lapor error, pastikan sudah cek:

- [ ] File `config.js` sudah diisi dengan benar
- [ ] Koneksi internet aktif
- [ ] Tabel `transactions` dan `budgets` sudah dibuat di Supabase
- [ ] Browser console tidak ada error merah
- [ ] Sudah coba hard refresh (`Ctrl + Shift + R`)
- [ ] Sudah coba clear browser cache
- [ ] Sudah coba buka file `test.html` dan lihat hasilnya

---

## 🆘 Masih Bermasalah?

### Test Mode Offline
Untuk memastikan aplikasi bisa jalan:

1. Rename `config.js` menjadi `config.js.backup`
2. Buat file `config.js` baru dengan isi:
   ```javascript
   const SUPABASE_CONFIG = {
     url: '',
     anonKey: ''
   };
   
   if (typeof module !== 'undefined' && module.exports) {
     module.exports = SUPABASE_CONFIG;
   }
   ```
3. Refresh browser
4. Aplikasi harus jalan (tanpa cloud sync)

Jika tetap tidak jalan, berarti ada masalah di kode lain (bukan Supabase).

---

## 🔍 Diagnostic Tools

### 1. test.html
File untuk test koneksi Supabase

### 2. Browser Console
Tekan `F12` → Tab Console

### 3. Network Tab
Tekan `F12` → Tab Network → Refresh page
Lihat apakah ada request yang failed (warna merah)

---

## 📞 Kontak Support

Jika masih bermasalah setelah ikuti semua troubleshooting:

1. Screenshot console errors
2. Screenshot hasil `test.html`
3. Catat langkah-langkah yang sudah dilakukan
4. Catat browser dan versi yang digunakan

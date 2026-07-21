// =============================================
// SUPABASE CONFIGURATION TEMPLATE
// =============================================
// Copy file ini menjadi 'config.js' dan isi dengan credential Anda

const SUPABASE_CONFIG = {
  // 1. Project URL dari Supabase Dashboard > Settings > API
  // Format: https://xxxxxxxxxxxxx.supabase.co
  url: 'YOUR_SUPABASE_PROJECT_URL',
  
  // 2. Anon/Public Key dari Supabase Dashboard > Settings > API > Project API keys
  // Ini adalah key yang panjang mulai dengan eyJ...
  anonKey: 'YOUR_SUPABASE_ANON_KEY'
};

// Export configuration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SUPABASE_CONFIG;
}

// =============================================
// LANGKAH SETUP:
// =============================================
// 1. Copy file ini menjadi 'config.js'
// 2. Ganti YOUR_SUPABASE_PROJECT_URL dengan Project URL Anda
// 3. Ganti YOUR_SUPABASE_ANON_KEY dengan Anon Key Anda
// 4. Simpan file
// 5. Buka aplikasi di browser dan test koneksi
//
// KEAMANAN:
// - JANGAN commit file config.js ke Git/GitHub
// - File .gitignore sudah diset untuk mengabaikan config.js
// - Hanya commit config.example.js (template tanpa credential)

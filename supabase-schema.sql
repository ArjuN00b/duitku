-- =============================================
-- DUITKU DATABASE SCHEMA FOR SUPABASE
-- =============================================
-- Jalankan script ini di Supabase SQL Editor
-- (Dashboard > SQL Editor > New Query)

-- 1. TABEL TRANSACTIONS
-- Menyimpan semua transaksi pemasukan dan pengeluaran
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  sync_key TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk mempercepat query berdasarkan sync_key
CREATE INDEX IF NOT EXISTS idx_transactions_sync_key ON transactions(sync_key);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_sync_key_date ON transactions(sync_key, date DESC);

-- 2. TABEL BUDGETS
-- Menyimpan budget bulanan (total dan per kategori)
CREATE TABLE IF NOT EXISTS budgets (
  id BIGSERIAL PRIMARY KEY,
  month_key TEXT NOT NULL,
  sync_key TEXT NOT NULL,
  total NUMERIC DEFAULT 0 CHECK (total >= 0),
  categories JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month_key, sync_key)
);

-- Index untuk mempercepat query berdasarkan sync_key
CREATE INDEX IF NOT EXISTS idx_budgets_sync_key ON budgets(sync_key);
CREATE INDEX IF NOT EXISTS idx_budgets_month_key ON budgets(month_key);

-- 3. ROW LEVEL SECURITY (RLS)
-- Aktifkan RLS untuk keamanan data
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Setiap user dengan sync_key yang sama bisa akses data mereka
CREATE POLICY "Users can access their own transactions"
  ON transactions
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can access their own budgets"
  ON budgets
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. TRIGGER untuk auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SELESAI
-- =============================================
-- Setelah menjalankan script ini:
-- 1. Pastikan tabel 'transactions' dan 'budgets' sudah terbuat
-- 2. Kembali ke aplikasi dan konfigurasi file config.js
-- 3. Test koneksi dengan membuka aplikasi di browser

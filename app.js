'use strict';

// =============================================
// CATEGORIES & CONFIG
// =============================================

const EXPENSE_CATEGORIES = [
  { key: 'makanan',    icon: '<i class="ph ph-fork-knife"></i>',      label: 'Makanan & Minuman', color: '#f97316' },
  { key: 'transport',  icon: '<i class="ph ph-car"></i>',             label: 'Transport',  color: '#3b82f6' },
  { key: 'belanja',    icon: '<i class="ph ph-shopping-bag"></i>',    label: 'Belanja',    color: '#ec4899' },
  { key: 'hiburan',    icon: '<i class="ph ph-game-controller"></i>', label: 'Hiburan',    color: '#a855f7' },
  { key: 'tagihan',    icon: '<i class="ph ph-receipt"></i>',         label: 'Tagihan',    color: '#eab308' },
  { key: 'kesehatan',  icon: '<i class="ph ph-first-aid"></i>',       label: 'Kesehatan',  color: '#14b8a6' },
  { key: 'pendidikan', icon: '<i class="ph ph-book"></i>',            label: 'Pendidikan', color: '#6366f1' },
  { key: 'lainnya',    icon: '<i class="ph ph-package"></i>',         label: 'Lainnya',    color: '#64748b' },
];

const INCOME_CATEGORY = { key: 'pemasukan', icon: '<i class="ph ph-money"></i>', label: 'Pemasukan', color: '#10b981' };
const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, INCOME_CATEGORY];
const STORAGE_KEYS = { transactions: 'duitku_transactions', budgets: 'duitku_budgets' };

// =============================================
// STORAGE LOGIC (Purely Offline Local Storage)
// =============================================
function loadTransactions() { 
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions)) || []; } catch { return []; } 
}

function saveTransactions(txns) { 
  localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(txns)); 
}

function loadBudgets() { 
  try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.budgets)) || {}; } catch { return {}; } 
}

function saveBudgets(budgets) { 
  localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets));
}

function getCurrentMonthKey() { 
  const now = new Date(); 
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`; 
}

function getBudgetForMonth(monthKey) { 
  return loadBudgets()[monthKey] || { total: 0, categories: {} }; 
}

function saveBudgetForMonth(monthKey, budgetData) { 
  const b = loadBudgets(); 
  b[monthKey] = budgetData; 
  saveBudgets(b); 
}

// =============================================
// HELPERS
// =============================================
function formatRupiah(amount) { return amount == null ? 'Rp 0' : 'Rp ' + Math.abs(amount).toLocaleString('id-ID'); }
function parseRupiahInput(str) { return parseInt(String(str).replace(/\D/g, ''), 10) || 0; }

function getCategoryInfo(key) { 
  if (key === 'pemasukan' || key === 'gaji' || key === 'bonus' || key === 'hadiah' || key === 'investasi') {
    return INCOME_CATEGORY;
  }
  return ALL_CATEGORIES.find(c => c.key === key) || { icon: '<i class="ph ph-money"></i>', label: key, color: '#10b981' }; 
}

function generateId() { return 'txn_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7); }

function formatDateLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00'), today = new Date(), yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Hari ini';
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function getMonthName(monthKey) {
  const [y, m] = monthKey.split('-');
  return new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
}

function getAvailableMonths(txns) {
  const months = new Set([getCurrentMonthKey()]);
  txns.forEach(t => months.add(t.date.slice(0, 7)));
  return Array.from(months).sort().reverse();
}

function filterByMonth(txns, monthKey) { return txns.filter(t => t.date.startsWith(monthKey)); }

function makeStrictNumericInput(inputEl) {
  if (!inputEl) return;
  inputEl.addEventListener('keydown', (e) => {
    const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  });

  inputEl.addEventListener('input', (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseInt(raw, 10);
    e.target.value = isNaN(num) ? '' : num.toLocaleString('id-ID');
  });
}

// =============================================
// STATE & NAVIGATION
// =============================================
let state = {
  transactions: [], currentPage: 'pageDashboard',
  historyFilter: { month: getCurrentMonthKey(), type: 'all', search: '' },
  statMonth: getCurrentMonthKey(), editingTxnId: null,
  txnForm: { type: 'expense', category: null }, budgetEditKey: null,
};

function navigateTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('text-black');
    n.classList.add('text-zinc-400');
  });

  const page = document.getElementById(pageId);
  if (page) page.classList.remove('hidden');

  const navMap = { pageDashboard: 'navDashboard', pageRiwayat: 'navRiwayat', pageBudget: 'navBudget', pageStatistik: 'navStatistik' };
  const activeNav = document.getElementById(navMap[pageId]);
  if (activeNav) {
    activeNav.classList.remove('text-zinc-400');
    activeNav.classList.add('text-black');
  }

  if (pageId === 'pageRiwayat') {
    state.historyFilter.type = 'all';
    resetRiwayatFilterUI();
  }

  state.currentPage = pageId;
  refreshCurrentPage();
}

function resetRiwayatFilterUI() {
  document.querySelectorAll('#filterType button').forEach(b => {
    if (b.dataset.type === 'all') {
      b.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md transition bg-black text-white shadow-sm';
    } else {
      b.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md transition text-zinc-500 bg-transparent';
    }
  });
}

function refreshCurrentPage() {
  if (state.currentPage === 'pageDashboard') renderDashboard();
  else if (state.currentPage === 'pageRiwayat') renderHistory();
  else if (state.currentPage === 'pageBudget') renderBudget();
  else if (state.currentPage === 'pageStatistik') renderStatistik();
}

// =============================================
// DASHBOARD
// =============================================
function renderDashboard() {
  const txns = state.transactions;
  const monthKey = getCurrentMonthKey();
  
  const totalBalance = txns.reduce((s, t) => t.type === 'income' ? s + t.amount : s - t.amount, 0);
  const monthTxns = filterByMonth(txns, monthKey);
  const monthIncome = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const monthExpense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  document.getElementById('totalBalance').textContent = formatRupiah(totalBalance);
  document.getElementById('monthIncome').textContent = formatRupiah(monthIncome);
  document.getElementById('monthExpense').textContent = formatRupiah(monthExpense);

  renderBudgetBanner(monthKey, monthExpense);
  renderCategoryChart(monthTxns);
  
  const recent = [...txns].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
  renderTransactionList('recentList', recent, true);
}

function renderBudgetBanner(monthKey, monthExpense) {
  const budget = getBudgetForMonth(monthKey), banner = document.getElementById('budgetBanner');
  if (!budget.total) { banner.classList.add('hidden'); return; }
  const pct = monthExpense / budget.total;
  banner.classList.remove('hidden', 'bg-amber-50', 'border-amber-200', 'text-amber-800', 'bg-red-50', 'border-red-200', 'text-red-800');
  
  if (pct >= 1) {
    banner.classList.remove('hidden');
    banner.classList.add('bg-red-50', 'border', 'border-red-200', 'text-red-800');
    document.getElementById('bannerText').textContent = `Budget terlampaui! (${formatRupiah(monthExpense)} / ${formatRupiah(budget.total)})`;
  } else if (pct >= 0.8) {
    banner.classList.remove('hidden');
    banner.classList.add('bg-amber-50', 'border', 'border-amber-200', 'text-amber-800');
    document.getElementById('bannerText').textContent = `Budget menipis — ${Math.round(pct * 100)}% terpakai`;
  } else { banner.classList.add('hidden'); }
}

function renderCategoryChart(monthTxns) {
  const chartEl = document.getElementById('categoryChart'), emptyEl = document.getElementById('emptyChart');
  const expenses = monthTxns.filter(t => t.type === 'expense');
  if (!expenses.length) { if(emptyEl) emptyEl.style.display = 'block'; chartEl.querySelectorAll('.chart-bar-item').forEach(e=>e.remove()); return; }
  if(emptyEl) emptyEl.style.display = 'none';
  chartEl.querySelectorAll('.chart-bar-item').forEach(e=>e.remove());

  const grouped = {};
  expenses.forEach(t => grouped[t.category] = (grouped[t.category] || 0) + t.amount);
  const sorted = Object.entries(grouped).sort((a, b) => b[1] - a[1]);
  const max = sorted[0][1];

  sorted.forEach(([key, amount]) => {
    const cat = getCategoryInfo(key), pct = (amount / max) * 100;
    const item = document.createElement('div');
    item.className = 'chart-bar-item mb-3 last:mb-0 space-y-1.5';
    item.innerHTML = `
      <div class="flex justify-between items-center text-xs">
        <span class="font-medium text-zinc-700 flex items-center gap-1.5"><span style="color:${cat.color}">${cat.icon}</span> ${cat.label}</span>
        <span class="font-semibold text-zinc-900">${formatRupiah(amount)}</span>
      </div>
      <div class="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-700" style="width:0%; background: ${cat.color};" data-target="${pct}"></div>
      </div>
    `;
    chartEl.appendChild(item);
  });
  requestAnimationFrame(() => chartEl.querySelectorAll('.chart-bar-item [data-target]').forEach(b => setTimeout(() => b.style.width = b.dataset.target + '%', 50)));
}

// =============================================
// TRANSACTION LIST (Category Grouped for History)
// =============================================
function renderTransactionList(containerId, txns, isCompact = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  if (!txns.length) {
    container.innerHTML = `<div class="flex flex-col items-center justify-center py-8 gap-2 text-zinc-400 text-center"><i class="ph ph-tray text-3xl"></i><p class="text-xs font-semibold text-zinc-600">Belum ada transaksi</p></div>`;
    return;
  }

  if (isCompact) {
    txns.forEach(t => container.appendChild(buildTxnItem(t, true)));
    return;
  }

  const groups = {};
  txns.forEach(t => { 
    if (!groups[t.category]) groups[t.category] = []; 
    groups[t.category].push(t); 
  });

  Object.entries(groups).forEach(([catKey, items]) => {
    const cat = getCategoryInfo(catKey);
    const group = document.createElement('div');
    group.className = 'space-y-1.5';
    group.innerHTML = `
      <div class="flex items-center gap-1.5 pt-3 pb-1 px-1">
        <span class="text-xs" style="color:${cat.color}">${cat.icon}</span>
        <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">${cat.label}</span>
      </div>
    `;
    items.sort((a, b) => new Date(b.date) - new Date(a.date) || b.id.localeCompare(a.id));
    items.forEach(t => group.appendChild(buildTxnItem(t, false)));
    container.appendChild(group);
  });
}

function buildTxnItem(txn, disableEdit = false) {
  const cat = txn.type === 'income' ? INCOME_CATEGORY : getCategoryInfo(txn.category);
  const item = document.createElement('div');
  item.className = 'flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl transition';
  if (!disableEdit) {
    item.classList.add('hover:border-zinc-300', 'cursor-pointer');
  }
  item.dataset.id = txn.id;
  item.innerHTML = `
    <div class="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-lg shrink-0" style="color:${cat.color}; background:${cat.color}15;">${cat.icon}</div>
    <div class="flex-1 min-w-0">
      <p class="text-xs font-semibold text-zinc-900 truncate">${txn.description || (txn.type === 'income' ? 'Pemasukan' : cat.label)}</p>
      <p class="text-[11px] text-zinc-400 mt-0.5">${formatDateLabel(txn.date)}</p>
    </div>
    <div class="text-right shrink-0">
      <span class="text-xs font-bold ${txn.type === 'income' ? 'text-emerald-600' : 'text-red-600'}">${txn.type === 'income' ? '+' : '-'}${formatRupiah(txn.amount)}</span>
    </div>
  `;
  if (!disableEdit) {
    item.addEventListener('click', () => openTxnModal(txn));
  }
  return item;
}

// =============================================
// HISTORY PAGE
// =============================================
function renderHistory() {
  populateMonthFilter('filterMonth', state.historyFilter.month);
  let txns = filterByMonth(state.transactions, state.historyFilter.month);
  if (state.historyFilter.type !== 'all') txns = txns.filter(t => t.type === state.historyFilter.type);
  const q = state.historyFilter.search.trim().toLowerCase();
  if (q) txns = txns.filter(t => (t.description||'').toLowerCase().includes(q) || getCategoryInfo(t.category).label.toLowerCase().includes(q));
  renderTransactionList('historyList', txns, false);
}

function populateMonthFilter(selectId, current) {
  const sel = document.getElementById(selectId);
  if (sel) sel.innerHTML = getAvailableMonths(state.transactions).map(m => `<option value="${m}" ${m === current ? 'selected' : ''}>${getMonthName(m)}</option>`).join('');
}

// =============================================
// BUDGET PAGE
// =============================================
function renderBudget() {
  const mk = getCurrentMonthKey(), budget = getBudgetForMonth(mk), txns = filterByMonth(state.transactions, mk);
  const spent = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const remain = Math.max(0, budget.total - spent);
  document.getElementById('budgetUsed').textContent = formatRupiah(spent);
  document.getElementById('budgetRemaining').textContent = formatRupiah(remain);
  document.getElementById('budgetTotal').textContent = budget.total ? formatRupiah(budget.total) : 'Belum diset';
  
  const pct = budget.total > 0 ? Math.min(spent / budget.total, 1) : 0;
  document.getElementById('ringPercent').textContent = Math.round(pct * 100) + '%';
  drawBudgetRing(pct);
  
  const list = document.getElementById('categoryBudgetList'); list.innerHTML = '';
  const spentByCat = {};
  txns.filter(t => t.type === 'expense').forEach(t => spentByCat[t.category] = (spentByCat[t.category] || 0) + t.amount);
  
  EXPENSE_CATEGORIES.forEach(cat => {
    const cBud = budget.categories?.[cat.key] || 0, cSp = spentByCat[cat.key] || 0, cPct = cBud > 0 ? Math.min(cSp / cBud, 1) : 0;
    const card = document.createElement('div');
    card.className = 'p-3.5 bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer hover:border-zinc-300 transition space-y-2.5';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg border border-zinc-200 flex items-center justify-center text-sm shrink-0" style="color:${cat.color}; background:${cat.color}15;">${cat.icon}</div>
          <div><p class="text-xs font-bold text-zinc-900">${cat.label}</p><p class="text-[10px] text-zinc-400">${formatRupiah(cSp)} terpakai</p></div>
        </div>
        <div class="flex items-center gap-2.5 text-right">
          <div>
            <p class="text-xs font-extrabold text-zinc-900">${cBud > 0 ? Math.round(cPct * 100) + '%' : '—'}</p>
            <p class="text-[10px] text-zinc-400">${cBud > 0 ? 'dari ' + formatRupiah(cBud) : 'Belum diset'}</p>
          </div>
          <i class="ph ph-pencil-simple text-sm text-zinc-400 hover:text-black p-1"></i>
        </div>
      </div>
      <div class="h-1.5 bg-zinc-200 rounded-full overflow-hidden">
        <div class="h-full rounded-full transition-all duration-700" style="width:0%; background:${cat.color};" data-target="${cPct * 100}"></div>
      </div>
    `;
    card.addEventListener('click', () => openBudgetModal(cat.key));
    list.appendChild(card);
  });
  requestAnimationFrame(() => list.querySelectorAll('[data-target]').forEach(b => setTimeout(() => b.style.width = b.dataset.target + '%', 50)));
}

function drawBudgetRing(pct) {
  const cvs = document.getElementById('budgetRingCanvas'); if(!cvs) return;
  const ctx = cvs.getContext('2d'), s = 160, cx = s/2, cy = s/2, r = 64, lw = 12;
  ctx.clearRect(0, 0, s, s);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.strokeStyle = '#e4e4e7'; ctx.lineWidth = lw; ctx.stroke();
  if (pct > 0) {
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI/2, -Math.PI/2 + Math.PI*2*pct);
    ctx.strokeStyle = pct >= 1 ? '#ef4444' : pct >= 0.8 ? '#f59e0b' : '#10b981';
    ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.stroke();
  }
}

// =============================================
// STATS PAGE
// =============================================
function renderStatistik() {
  populateMonthFilter('statMonth', state.statMonth);
  const txns = filterByMonth(state.transactions, state.statMonth);
  const inc = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const exp = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  document.getElementById('statIncome').textContent = formatRupiah(inc);
  document.getElementById('statExpense').textContent = formatRupiah(exp);
  document.getElementById('statNet').textContent = (inc - exp >= 0 ? '+' : '-') + formatRupiah(Math.abs(inc - exp));
  
  drawDonutChart(txns); drawBarChart();
  
  const container = document.getElementById('topCategories'); container.innerHTML = '';
  const grouped = {}; txns.filter(t => t.type === 'expense').forEach(t => grouped[t.category] = (grouped[t.category] || 0) + t.amount);
  const sorted = Object.entries(grouped).sort((a,b) => b[1]-a[1]).slice(0,3);
  if (!sorted.length) { container.innerHTML = '<p class="text-center text-zinc-400 text-xs py-3">Belum ada data</p>'; return; }
  sorted.forEach(([k, amt], i) => {
    const c = getCategoryInfo(k), item = document.createElement('div');
    item.className = 'flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl';
    item.innerHTML = `<span class="text-xs font-extrabold text-zinc-400 w-5 text-center">#${i+1}</span><div class="w-9 h-9 rounded-lg border border-zinc-200 flex items-center justify-center text-base shrink-0" style="color:${c.color}; background:${c.color}15;">${c.icon}</div><div class="flex-1 min-w-0"><p class="text-xs font-bold text-zinc-900">${c.label}</p><p class="text-xs font-bold text-red-600 mt-0.5">${formatRupiah(amt)}</p></div>`;
    container.appendChild(item);
  });
}

function drawDonutChart(txns) {
  const cvs = document.getElementById('donutCanvas'), leg = document.getElementById('donutLegend');
  if(!cvs) return;
  const ctx = cvs.getContext('2d'), s = 180, cx = s/2, cy = s/2, r = 70, h = 40;
  ctx.clearRect(0,0,s,s); leg.innerHTML = '';
  
  const grouped = {}; txns.filter(t => t.type === 'expense').forEach(t => grouped[t.category] = (grouped[t.category] || 0) + t.amount);
  const sorted = Object.entries(grouped).sort((a,b) => b[1]-a[1]);
  const total = sorted.reduce((s, [,v]) => s+v, 0);
  
  if(!total) { ctx.font='12px Inter'; ctx.fillStyle='#a1a1aa'; ctx.textAlign='center'; ctx.fillText('Belum ada data', cx, cy); return; }
  
  let ang = -Math.PI/2;
  sorted.forEach(([k, amt]) => {
    const c = getCategoryInfo(k), slice = (amt/total)*Math.PI*2;
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.arc(cx,cy,r,ang,ang+slice); ctx.fillStyle = c.color; ctx.fill();
    ang += slice;
  });
  ctx.beginPath(); ctx.arc(cx,cy,h,0,Math.PI*2); ctx.fillStyle = '#fafafa'; ctx.fill();
  ctx.fillStyle='#09090b'; ctx.font='bold 12px Inter'; ctx.textAlign='center'; ctx.fillText('Total', cx, cy-4);
  ctx.fillStyle='#71717a'; ctx.font='10px Inter'; ctx.fillText(formatRupiah(total).replace('Rp ',''), cx, cy+10);
  
  sorted.slice(0,5).forEach(([k, amt]) => {
    const c = getCategoryInfo(k), item = document.createElement('div');
    item.className = 'flex items-center gap-2 text-xs';
    item.innerHTML = `<span class="w-2.5 h-2.5 rounded-sm shrink-0" style="background:${c.color}"></span><span class="flex-1 text-zinc-500 truncate">${c.label}</span><span class="font-bold text-zinc-900">${Math.round((amt/total)*100)}%</span>`;
    leg.appendChild(item);
  });
}

function drawBarChart() {
  const cvs = document.getElementById('barCanvas'); if(!cvs) return;
  const mos = ['2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];
  const data = mos.map(m => {
    const tx = filterByMonth(state.transactions, m);
    return { l: new Date(m+'-01').toLocaleDateString('id-ID',{month:'short'}), i: tx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0), e: tx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0) };
  });
  const max = Math.max(...data.map(d => Math.max(d.i, d.e)), 1), W = cvs.parentElement?.offsetWidth || 400, H = 220;
  cvs.width = W; cvs.height = H; const ctx = cvs.getContext('2d'); ctx.clearRect(0,0,W,H);
  const cH = H - 40, bW = Math.min(16, (W/6)*0.3);
  
  data.forEach((d, i) => {
    const cx = (W/6)*i + (W/6)/2;
    const hi = (d.i/max)*cH; ctx.fillStyle = '#10b981'; ctx.fillRect(cx - bW - 2, 10 + cH - hi, bW, hi);
    const he = (d.e/max)*cH; ctx.fillStyle = '#ef4444'; ctx.fillRect(cx + 2, 10 + cH - he, bW, he);
    ctx.fillStyle = '#71717a'; ctx.font = '10px Inter'; ctx.textAlign = 'center'; ctx.fillText(d.l, cx, H - 10);
  });
  ctx.fillStyle='#10b981'; ctx.fillRect(10, 8, 8, 8); ctx.fillStyle='#52525b'; ctx.textAlign='left'; ctx.fillText('Pemasukan', 24, 15);
  ctx.fillStyle='#ef4444'; ctx.fillRect(90, 8, 8, 8); ctx.fillText('Pengeluaran', 104, 15);
}

// =============================================
// MODALS & ACTIONS
// =============================================
function openTxnModal(ex = null) {
  state.editingTxnId = ex?.id || null;
  state.txnForm.type = ex?.type || 'expense';
  state.txnForm.category = ex?.category || (state.txnForm.type === 'income' ? 'pemasukan' : null);
  
  document.getElementById('modalTitle').textContent = ex ? 'Edit Transaksi' : 'Tambah Transaksi';
  
  updateTypeToggleBtn();
  
  document.getElementById('amountInput').value = ex ? ex.amount.toLocaleString('id-ID') : '';
  document.getElementById('descInput').value = ex?.description || '';
  document.getElementById('dateInput').value = ex?.date || new Date().toISOString().slice(0, 10);
  
  updateCategoryVisibility();
  document.getElementById('txnModal').classList.remove('hidden');
}

function closeTxnModal() {
  document.getElementById('txnModal').classList.add('hidden');
  state.editingTxnId = null;
}

function openBudgetModal(cat = null) {
  state.budgetEditKey = cat;
  const b = getBudgetForMonth(getCurrentMonthKey()), v = cat ? (b.categories?.[cat] || 0) : (b.total || 0);
  document.getElementById('budgetModalTitle').textContent = cat ? `Set Budget ${getCategoryInfo(cat).label}` : 'Set Budget Total';
  document.getElementById('budgetModalLabel').textContent = 'Budget bulan ini (Rp)';
  document.getElementById('budgetAmountInput').value = v ? v.toLocaleString('id-ID') : '';
  document.getElementById('budgetModal').classList.remove('hidden');
}

function closeBudgetModal() {
  document.getElementById('budgetModal').classList.add('hidden');
  state.budgetEditKey = null;
}

function saveBudget() {
  const amt = parseRupiahInput(document.getElementById('budgetAmountInput').value);
  const mk = getCurrentMonthKey(), b = getBudgetForMonth(mk);
  if (state.budgetEditKey) {
    if(!b.categories) b.categories = {};
    b.categories[state.budgetEditKey] = amt;
  } else {
    b.total = amt;
  }
  saveBudgetForMonth(mk, b);
  closeBudgetModal();
  refreshCurrentPage();
}

function updateTypeToggleBtn() {
  const incBtn = document.getElementById('typeIncome');
  const expBtn = document.getElementById('typeExpense');
  if (state.txnForm.type === 'income') {
    incBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition bg-black text-white shadow-sm';
    expBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition bg-transparent text-zinc-500 hover:text-black';
  } else {
    expBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition bg-black text-white shadow-sm';
    incBtn.className = 'flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition bg-transparent text-zinc-500 hover:text-black';
  }
}

function updateCategoryVisibility() {
  const catGroup = document.getElementById('categoryGroup');
  if (state.txnForm.type === 'income') {
    catGroup.classList.add('hidden');
    state.txnForm.category = 'pemasukan';
    document.getElementById('modalBudgetWarn').classList.add('hidden');
  } else {
    catGroup.classList.remove('hidden');
    renderCategoryGrid();
  }
}

function renderCategoryGrid() {
  const grid = document.getElementById('categoryGrid'); grid.innerHTML = '';
  EXPENSE_CATEGORIES.forEach(c => {
    const isSel = state.txnForm.category === c.key;
    const item = document.createElement('div');
    item.className = `flex flex-col items-center gap-1.5 p-2.5 rounded-xl border cursor-pointer transition text-center ${isSel ? 'border-black bg-zinc-100 font-bold' : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'}`;
    item.innerHTML = `<span class="text-xl" style="color:${c.color}">${c.icon}</span><span class="text-[10px] ${isSel ? 'text-black font-bold' : 'text-zinc-500'}">${c.label}</span>`;
    item.addEventListener('click', () => { state.txnForm.category = c.key; renderCategoryGrid(); checkModalWarn(); });
    grid.appendChild(item);
  });
  if(!state.txnForm.category && grid.firstChild) grid.firstChild.click();
}

function checkModalWarn() {
  const warn = document.getElementById('modalBudgetWarn');
  if (state.txnForm.type !== 'expense' || !state.txnForm.category) { warn.classList.add('hidden'); return; }
  const mk = getCurrentMonthKey(), b = getBudgetForMonth(mk).categories?.[state.txnForm.category] || 0;
  if(!b) { warn.classList.add('hidden'); return; }
  const sp = filterByMonth(state.transactions, mk).filter(t=>t.type==='expense'&&t.category===state.txnForm.category).reduce((s,t)=>s+t.amount,0);
  const amt = parseRupiahInput(document.getElementById('amountInput').value);
  if (sp + amt > b) warn.classList.remove('hidden'); else warn.classList.add('hidden');
}

function saveTxn() {
  const amt = parseRupiahInput(document.getElementById('amountInput').value), desc = document.getElementById('descInput').value.trim();
  const date = document.getElementById('dateInput').value;
  const cat = state.txnForm.type === 'income' ? 'pemasukan' : state.txnForm.category;
  
  if(!amt || !date || !cat) return;
  const tx = [...state.transactions];
  if (state.editingTxnId) { const i = tx.findIndex(t=>t.id===state.editingTxnId); if(i!==-1) tx[i]={...tx[i], type:state.txnForm.type, amount:amt, category:cat, description:desc, date}; }
  else { tx.push({ id:generateId(), type:state.txnForm.type, amount:amt, category:cat, description:desc, date }); }
  state.transactions = tx; saveTransactions(tx);
  closeTxnModal();
  refreshCurrentPage();
}

// =============================================
// EVENT LISTENERS & INIT
// =============================================
function initListeners() {
  document.querySelectorAll('.nav-item').forEach(b => b.addEventListener('click', () => navigateTo(b.dataset.page)));
  document.getElementById('fabBtn').addEventListener('click', () => openTxnModal());
  document.getElementById('seeAllBtn').addEventListener('click', () => navigateTo('pageRiwayat'));
  
  document.getElementById('modalClose').addEventListener('click', closeTxnModal);
  document.getElementById('budgetModalClose').addEventListener('click', closeBudgetModal);

  document.getElementById('txnModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('txnModal')) closeTxnModal();
  });
  document.getElementById('budgetModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('budgetModal')) closeBudgetModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeTxnModal();
      closeBudgetModal();
    }
  });
  
  document.getElementById('typeIncome').addEventListener('click', () => { 
    state.txnForm.type='income'; 
    updateTypeToggleBtn();
    updateCategoryVisibility();
  });
  
  document.getElementById('typeExpense').addEventListener('click', () => { 
    state.txnForm.type='expense'; 
    updateTypeToggleBtn();
    updateCategoryVisibility();
  });

  makeStrictNumericInput(document.getElementById('amountInput'));
  makeStrictNumericInput(document.getElementById('budgetAmountInput'));

  document.getElementById('saveBtn').addEventListener('click', saveTxn);
  
  document.getElementById('filterMonth').addEventListener('change', (e) => { state.historyFilter.month = e.target.value; renderHistory(); });
  
  document.querySelectorAll('#filterType button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('#filterType button').forEach(x => {
      x.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md transition text-zinc-500 bg-transparent';
    });
    b.className = 'flex-1 py-1.5 text-xs font-semibold rounded-md transition bg-black text-white shadow-sm';
    state.historyFilter.type = b.dataset.type;
    renderHistory();
  }));

  document.getElementById('searchInput').addEventListener('input', (e) => { state.historyFilter.search = e.target.value; renderHistory(); });
  
  document.getElementById('setBudgetTotalBtn').addEventListener('click', () => openBudgetModal(null));
  document.getElementById('saveBudgetBtn').addEventListener('click', saveBudget);
  
  document.getElementById('statMonth').addEventListener('change', (e) => { state.statMonth = e.target.value; renderStatistik(); });
}

function init() {
  // 1. Unconditionally fade out and remove Splash Screen first to prevent UI freezing
  setTimeout(() => {
    const splash = document.getElementById('splashScreen');
    if (splash) {
      splash.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => splash.remove(), 500);
    }
  }, 1000);

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  
  // Clean demo data on first launch
  if (!localStorage.getItem('duitku_clean_reset')) {
    localStorage.removeItem('duitku_transactions');
    localStorage.removeItem('duitku_budgets');
    localStorage.removeItem('duitku_seeded');
    localStorage.setItem('duitku_clean_reset', '1');
  }

  state.transactions = loadTransactions();
  initListeners();
  populateMonthFilter('filterMonth', state.historyFilter.month);
  populateMonthFilter('statMonth', state.statMonth);
  renderDashboard();
}
document.addEventListener('DOMContentLoaded', init);

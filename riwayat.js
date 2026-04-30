// ═══════════════════════════════════════════════════════
//  riwayat.js  –  Halaman Aktivitas Riwayat
//  Baca dari localStorage key: 'riwayat'
//  Filter dropdown waktu, tombol Beli lagi
// ═══════════════════════════════════════════════════════

const getRiwayat = () => JSON.parse(localStorage.getItem('riwayat')) || [];
const formatRp   = (n)  => `Rp ${Number(n).toLocaleString('id-ID')}`;

// ── Badge CSS class berdasarkan kategori ────────────────
function badgeClass(kategori = '') {
    const k = kategori.toLowerCase();
    if (k.includes('diet'))      return 'badge-diet';
    if (k.includes('harian'))    return 'badge-harian';
    if (k.includes('prasmanan')) return 'badge-prasmanan';
    if (k.includes('lauk'))      return 'badge-lauk';
    if (k.includes('personal'))  return 'badge-personal';
    return 'badge-default';
}

// ── Filter berdasarkan pilihan dropdown ─────────────────
function filterData(data, pilihan) {
    if (pilihan === 'all') return data;
    const HARI = 24 * 60 * 60 * 1000;
    const now  = Date.now();

    if (pilihan === '7')    return data.filter(p => now - p.timestamp <= 7  * HARI);
    if (pilihan === '30')   return data.filter(p => now - p.timestamp <= 30 * HARI);
    if (pilihan === 'lama') return data.filter(p => now - p.timestamp  > 30 * HARI);
    return data;
}

// ── Tambah kembali item ke keranjang pesanan ────────────
function beliLagi(item) {
    const pesanan = JSON.parse(localStorage.getItem('pesanan')) || [];
    const ada = pesanan.find(p => p.nama === item.nama);
    if (ada) {
        ada.jumlah += item.jumlah;
    } else {
        pesanan.push({
            id      : Date.now(),
            nama    : item.nama,
            harga   : item.harga,
            jumlah  : item.jumlah,
            kategori: item.kategori,
            gambar  : item.gambar,
            opsi    : item.opsi || 'Paket Standar',
            status  : 'Proses'
        });
    }
    localStorage.setItem('pesanan', JSON.stringify(pesanan));
}

// ═══════════════════════════════════════════════════════
//  RENDER KARTU RIWAYAT
// ═══════════════════════════════════════════════════════
function renderRiwayat(pilihan = 'all') {
    const grid = document.querySelector('#history-grid');
    if (!grid) return;

    const semua = getRiwayat();
    const data  = filterData(semua, pilihan);

    if (data.length === 0) {
        grid.innerHTML = `
            <article class="order-card" style="justify-content:center;text-align:center;padding:44px;">
                <p style="color:#888;">
                    Belum ada riwayat pemesanan.
                    <a href="menumakancustomer.html"
                       style="color:#12b368;font-weight:600;text-decoration:none;">
                        → Pesan sekarang
                    </a>
                </p>
            </article>`;
        return;
    }

    grid.innerHTML = data.map((item, idx) => `
        <article class="order-card" data-idx="${idx}">

            <section class="order-left">
                <img src="${item.gambar}" alt="${item.nama}"
                     onerror="this.src='placeholder.jpg'">
                <section class="order-info">
                    <h4>${item.nama}</h4>
                    <span class="badge ${badgeClass(item.kategori)}">
                        Kategori: ${item.kategori}
                    </span>
                    <p class="price">${formatRp(item.harga)}</p>
                </section>
            </section>

            <p class="order-date">Dibeli pada: ${item.tanggal || '—'}</p>

            <section class="order-right">
                <p class="qty">Jumlah: ${item.jumlah} Kotak</p>
                <button class="btn-beli-lagi" data-idx="${idx}"
                        aria-label="Beli lagi ${item.nama}">
                    Beli lagi
                </button>
            </section>

        </article>
    `).join('');
}

// ═══════════════════════════════════════════════════════
//  EVENT: Filter Waktu
// ═══════════════════════════════════════════════════════
document.querySelector('#filter-waktu')?.addEventListener('change', (e) => {
    renderRiwayat(e.target.value);
});

// ═══════════════════════════════════════════════════════
//  EVENT DELEGATION: Tombol "Beli lagi"
// ═══════════════════════════════════════════════════════
document.querySelector('#history-grid')?.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-beli-lagi')) return;

    const pilihan = document.querySelector('#filter-waktu')?.value || 'all';
    const data    = filterData(getRiwayat(), pilihan);
    const idx     = parseInt(e.target.dataset.idx);
    const item    = data[idx];
    if (!item) return;

    beliLagi(item);

    // Feedback visual di tombol
    const btn = e.target;
    const teksAsli = btn.textContent;
    btn.textContent = '✅ Ditambahkan!';
    btn.style.background = '#0e8a50';
    btn.disabled = true;

    setTimeout(() => {
        btn.textContent = teksAsli;
        btn.style.background = '';
        btn.disabled = false;
    }, 1600);
});

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    renderRiwayat('all');
});
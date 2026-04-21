//  1. localstorage
 let daftarProduk = JSON.parse(localStorage.getItem('produk')) || [
            { id: 1, nama: 'Nasi Kuning', harga: 12000, kategori: 'Menu Harian', gambar: 'nasi kuning tumpeng.jpg' },
            { id: 2, nama: 'Nasi Uduk Ayam', harga: 19000, kategori: 'Menu Harian', gambar: 'Nasi Uduk dengan Ayam Goreng.jpg' },
            { id: 3, nama: 'Nasi Ayam Goreng', harga: 17000, kategori: 'Menu Harian', gambar: 'nasi ayam.jpg' },
            { id: 4, nama: 'Nasi Campur', harga: 13000, kategori: 'Menu Harian', gambar: 'nasi campur.jpg' },
            { id: 5, nama: 'Nasi Jagung', harga: 15000, kategori: 'Menu Diet', gambar: 'nasi jagung.jpg' },
            { id: 6, nama: 'Nasi Merah Tumis Brokoli', harga: 19000, kategori: 'Menu Diet', gambar: 'nasi merah tumis brokoli.jpg' },
];

// 2. Format rupiah
const formatRupiah = (angka) => `Rp ${angka.toLocaleString('id-ID')}`;
 
// 3. Format tanggal dari timestamp
const formatTanggal = (timestamp) => {
    if (!timestamp) return '—';
    const d = new Date(timestamp);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// 4. Gabungkan data pesanan dengan detail produk
const buildPesananLengkap = () => {
    const pesanan  = getDaftarPesanan();
    const produk   = getDaftarProduk();
    return pesanan.map(p => {
        const detail = produk.find(pr => pr.id === p.produkId) || {};
        return {
            ...p,
            kategori : detail.kategori || 'Lainnya',
            gambar   : detail.gambar   || 'placeholder.jpg',
            subtotal : (p.harga || detail.harga || 0) * p.jumlah,
            tanggal  : p.id   // id = Date.now() saat dipesan
        };
    });
};

// 5. Hitung ringkasan statistik
const hitungRingkasan = (data) => ({
    totalItem  : data.reduce((acc, p) => acc + p.jumlah, 0),
    totalHarga : data.reduce((acc, p) => acc + p.subtotal, 0),
    totalMenu  : data.length,
});
 
// 6. Render Kartu Ringkasan (stats bar)
const renderRingkasan = (data) => {
    const { totalItem, totalHarga, totalMenu } = hitungRingkasan(data);
    const el = document.querySelector('#ringkasan-bar');
    if (!el) return;
    el.innerHTML = `
        <article class="stat-card">
            <span class="stat-icon">🛒</span>
            <section>
                <p class="stat-angka">${totalMenu}</p>
                <p class="stat-label">Total Transaksi</p>
            </section>
        </article>
        <article class="stat-card">
            <span class="stat-icon">🍱</span>
            <section>
                <p class="stat-angka">${totalItem}</p>
                <p class="stat-label">Total Porsi</p>
            </section>
        </article>
        <article class="stat-card">
            <span class="stat-icon">💰</span>
            <section>
                <p class="stat-angka">${formatRupiah(totalHarga)}</p>
                <p class="stat-label">Total Pengeluaran</p>
            </section>
        </article>
    `;
};

// 7. Render Tabel Riwayat (dengan zebra striping dari CSS)
const renderTabel = (data) => {
    const tbody = document.querySelector('#tabel-pesanan tbody');
    if (!tbody) return;
 
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:#888;">
            Belum ada pesanan. <a href="menumakan.html" style="color:#12b368;">Pesan sekarang →</a>
        </td></tr>`;
        return;
    }
 
    tbody.innerHTML = data.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>
                <section class="tabel-nama">
                    <img src="${p.gambar}" alt="${p.nama}" class="tabel-img">
                    <span>${p.nama}</span>
                </section>
            </td>
            <td><span class="badge badge-${p.kategori === 'Menu Diet' ? 'diet' : 'harian'}">${p.kategori}</span></td>
            <td>${formatRupiah(p.harga)}</td>
            <td>${p.jumlah} porsi</td>
            <td class="subtotal-cell">${formatRupiah(p.subtotal)}</td>
        </tr>
    `).join('');
};
 
// 8. Render Grid Kartu Pesanan
const renderKartu = (data) => {
    const grid = document.querySelector('#kartu-pesanan');
    if (!grid) return;
 
    if (data.length === 0) {
        grid.innerHTML = `<p class="kosong-info">Belum ada pesanan tercatat. <a href="menumakan.html">Lihat menu →</a></p>`;
        return;
    }
 
    grid.innerHTML = data.map(p => `
        <article class="order-card" data-id="${p.id}">
            <section class="order-left">
                <img src="${p.gambar}" alt="${p.nama}">
                <section class="order-info">
                    <h4>${p.nama}</h4>
                    <p>${formatRupiah(p.subtotal)}</p>
                    <small>${p.jumlah} porsi &nbsp;·&nbsp; ${formatTanggal(p.tanggal)}</small>
                    <span class="badge badge-${p.kategori === 'Menu Diet' ? 'diet' : 'harian'}">${p.kategori}</span>
                </section>
            </section>
            <button class="btn-hapus" data-id="${p.id}" title="Hapus pesanan ini">✕</button>
        </article>
    `).join('');
};
 
// 9. Filter berdasarkan checkbox kategori + tanggal
let filterAktif = { kategori: [], hari: '' };
 
const applyFilter = () => {
    let data = buildPesananLengkap();
 
    // Filter kategori (checkbox)
    if (filterAktif.kategori.length > 0) {
        data = data.filter(p => filterAktif.kategori.includes(p.kategori));
    }
 
    // Filter rentang hari terakhir
    if (filterAktif.hari) {
        const batasWaktu = Date.now() - parseInt(filterAktif.hari) * 24 * 60 * 60 * 1000;
        data = data.filter(p => p.id >= batasWaktu);
    }
 
    renderRingkasan(data);
    renderTabel(data);
    renderKartu(data);
};
 
// 10. Event: Checkbox Kategori (event delegation pada sidebar)
document.querySelector('#sidebar-filter')?.addEventListener('change', (e) => {
    if (e.target.name === 'kategori') {
        const val = e.target.value;
        if (e.target.checked) {
            filterAktif.kategori.push(val);
        } else {
            filterAktif.kategori = filterAktif.kategori.filter(k => k !== val);
        }
        applyFilter();
    }
 
    if (e.target.name === 'hari') {
        filterAktif.hari = e.target.checked ? e.target.value : '';
        // Pastikan hanya satu checkbox hari aktif sekaligus
        document.querySelectorAll('input[name="hari"]').forEach(cb => {
            if (cb !== e.target) cb.checked = false;
        });
        applyFilter();
    }
});
 
// 11. Event: Hapus Pesanan (event delegation pada grid kartu)
document.querySelector('#kartu-pesanan')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-hapus')) {
        const idHapus = parseInt(e.target.dataset.id);
        const konfirmasi = confirm('Hapus pesanan ini dari riwayat?');
        if (!konfirmasi) return;
 
        let pesanan = getDaftarPesanan();
        pesanan = pesanan.filter(p => p.id !== idHapus);
        localStorage.setItem('pesanan', JSON.stringify(pesanan));
        applyFilter();
    }
});
 
// 12. Event: Tombol Hapus Semua
document.querySelector('#btn-hapus-semua')?.addEventListener('click', () => {
    if (confirm('Hapus SEMUA riwayat pesanan?')) {
        localStorage.removeItem('pesanan');
        applyFilter();
    }
});
 
// 13. Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
    applyFilter();
});
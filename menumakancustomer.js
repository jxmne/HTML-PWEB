// ═══════════════════════════════════════════════════════
//  menumakancustomer.js
//  - Sidebar filter checkbox berfungsi (Menu Harian / Menu Diet)
//  - Cari nama menu
//  - Modal <dialog> pilih opsi: Take Away / Dine In
//  - Simpan pesanan ke localStorage (tanpa undefined)
// ═══════════════════════════════════════════════════════

// ── Data produk ─────────────────────────────────────────
let daftarProduk = JSON.parse(localStorage.getItem('produk')) || [
    { id: 1, nama: 'Nasi Kuning',              harga: 12000, kategori: 'Menu Harian', gambar: 'nasi kuning tumpeng.jpg' },
    { id: 2, nama: 'Nasi Uduk Ayam',           harga: 19000, kategori: 'Menu Harian', gambar: 'Nasi Uduk dengan Ayam Goreng.jpg' },
    { id: 3, nama: 'Nasi Ayam Goreng',         harga: 17000, kategori: 'Menu Harian', gambar: 'nasi ayam.jpg' },
    { id: 4, nama: 'Nasi Campur',              harga: 13000, kategori: 'Menu Harian', gambar: 'nasi campur.jpg' },
    { id: 5, nama: 'Nasi Jagung',              harga: 15000, kategori: 'Menu Diet',   gambar: 'nasi jagung.jpg' },
    { id: 6, nama: 'Nasi Merah Tumis Brokoli', harga: 19000, kategori: 'Menu Diet',   gambar: 'nasi merah tumis brokoli.jpg' },
];

// ── Helpers ─────────────────────────────────────────────
const getPesanan = () => JSON.parse(localStorage.getItem('pesanan')) || [];
const setPesanan = (d) => localStorage.setItem('pesanan', JSON.stringify(d));

// ── State sementara (produk yang sedang dipilih) ─────────
let produkDipilih = null;

// ═══════════════════════════════════════════════════════
//  RENDER KARTU MENU
// ═══════════════════════════════════════════════════════
function renderMenu(data) {
    const container = document.querySelector('#menu-display');
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = `
            <p style="grid-column:1/-1; text-align:center; color:#888; padding:30px;">
                Menu tidak ditemukan.
            </p>`;
        return;
    }

    container.innerHTML = data.map(produk => `
        <article class="card-menu" data-id="${produk.id}">
            <img src="${produk.gambar}" alt="${produk.nama}"
                 onerror="this.src='placeholder.jpg'">
            <section class="card-content">
                <h4>${produk.nama}</h4>
                <p class="card-harga">Rp ${produk.harga.toLocaleString('id-ID')}</p>
                <small class="card-kategori">${produk.kategori}</small>
                <button class="btn-pesan" data-id="${produk.id}">Pesan Sekarang</button>
            </section>
        </article>
    `).join('');
}

// ═══════════════════════════════════════════════════════
//  FILTER & CARI (sidebar checkbox + input teks)
// ═══════════════════════════════════════════════════════
function applyFilter() {
    const keyword    = (document.querySelector('#input-cari')?.value || '').toLowerCase().trim();
    const checkboxes = document.querySelectorAll('#sidebar-filter input[type="checkbox"]');

    // Kumpulkan kategori yang dicentang
    const kategoriAktif = [];
    checkboxes.forEach(cb => {
        if (cb.checked) kategoriAktif.push(cb.value);
    });

    let hasil = daftarProduk.filter(p => {
        const cocokNama     = p.nama.toLowerCase().includes(keyword);
        const cocokKategori = kategoriAktif.length === 0 || kategoriAktif.includes(p.kategori);
        return cocokNama && cocokKategori;
    });

    renderMenu(hasil);
}

// ── Pasang event pada elemen filter ─────────────────────
document.querySelector('#input-cari')?.addEventListener('input', applyFilter);

// Event delegation untuk semua checkbox di sidebar
document.querySelector('#sidebar-filter')?.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox') applyFilter();
});

// Tombol Cari (jaga-jaga jika form disubmit)
document.querySelector('.search-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    applyFilter();
});

// ═══════════════════════════════════════════════════════
//  EVENT: Klik Pesan Sekarang → buka modal input jumlah
// ═══════════════════════════════════════════════════════
document.querySelector('#menu-display')?.addEventListener('click', (e) => {
    if (!e.target.classList.contains('btn-pesan')) return;

    const id = parseInt(e.target.dataset.id);
    produkDipilih = daftarProduk.find(p => p.id === id);
    if (!produkDipilih) return;

    // Isi nama produk di modal
    const namaEl = document.querySelector('#modal-nama-produk');
    if (namaEl) namaEl.textContent = produkDipilih.nama;

    // Reset input jumlah
    const inputJml = document.querySelector('#modal-jumlah');
    if (inputJml) inputJml.value = 1;

    // Buka modal
    const modal = document.querySelector('#modal-opsi');
    if (modal) modal.showModal();
});

// ═══════════════════════════════════════════════════════
//  EVENT: Pilih opsi di modal (Take Away / Dine In)
// ═══════════════════════════════════════════════════════
function simpanPesanan(opsi) {
    if (!produkDipilih) return;

    const inputJml  = document.querySelector('#modal-jumlah');
    const jumlah    = parseInt(inputJml?.value) || 1;

    if (jumlah < 1 || isNaN(jumlah)) {
        if (inputJml) {
            inputJml.style.border = '2px solid red';
            inputJml.focus();
        }
        return;
    }

    const pesanan = getPesanan();
    pesanan.push({
        id       : Date.now(),
        nama     : produkDipilih.nama,
        harga    : produkDipilih.harga,
        kategori : produkDipilih.kategori,
        gambar   : produkDipilih.gambar,
        jumlah   : jumlah,
        opsi     : opsi,          // 'Take Away' atau 'Dine In'
        status   : 'Proses'
    });

    setPesanan(pesanan);

    // Tutup modal
    document.querySelector('#modal-opsi')?.close();
    produkDipilih = null;

    // Notif singkat
    tampilNotif(`✅ Berhasil ditambahkan ke pesanan!`);
}

document.querySelector('#btn-ta')?.addEventListener('click', () => simpanPesanan('Take Away'));
document.querySelector('#btn-di')?.addEventListener('click', () => simpanPesanan('Dine In'));

// Tutup modal jika klik backdrop (klik di luar dialog)
document.querySelector('#modal-opsi')?.addEventListener('click', (e) => {
    const rect = e.target.getBoundingClientRect();
    const hitBackdrop =
        e.clientX < rect.left || e.clientX > rect.right ||
        e.clientY < rect.top  || e.clientY > rect.bottom;
    if (hitBackdrop) document.querySelector('#modal-opsi')?.close();
});

// ═══════════════════════════════════════════════════════
//  NOTIF TOAST (tanpa alert browser)
// ═══════════════════════════════════════════════════════
function tampilNotif(pesan) {
    let toast = document.querySelector('#toast-notif');
    if (!toast) {
        toast = document.createElement('output');
        toast.id = 'toast-notif';
        Object.assign(toast.style, {
            position   : 'fixed',
            bottom     : '28px',
            right      : '28px',
            background : '#12b368',
            color      : '#fff',
            padding    : '12px 22px',
            borderRadius: '10px',
            fontFamily : 'Segoe UI, sans-serif',
            fontSize   : '0.9rem',
            fontWeight : '600',
            boxShadow  : '0 6px 20px rgba(0,0,0,0.2)',
            zIndex     : '9999',
            opacity    : '0',
            transition : 'opacity 0.3s ease',
        });
        document.body.appendChild(toast);
    }
    toast.textContent = pesan;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
}

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    renderMenu(daftarProduk);
});
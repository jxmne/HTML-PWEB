// Inisialisasi data dari localStorage
let daftarProduk = JSON.parse(localStorage.getItem('produk')) || [
    { id: 1, nama: 'Nasi Kuning',              harga: 12000, kategori: 'Menu Harian', gambar: 'nasi kuning tumpeng.jpg' },
    { id: 2, nama: 'Nasi Uduk Ayam',           harga: 19000, kategori: 'Menu Harian', gambar: 'Nasi Uduk dengan Ayam Goreng.jpg' },
    { id: 3, nama: 'Nasi Ayam Goreng',         harga: 17000, kategori: 'Menu Harian', gambar: 'nasi ayam.jpg' },
    { id: 4, nama: 'Nasi Campur',              harga: 13000, kategori: 'Menu Harian', gambar: 'nasi campur.jpg' },
    { id: 5, nama: 'Nasi Jagung',              harga: 15000, kategori: 'Menu Diet',   gambar: 'nasi jagung.jpg' },
    { id: 6, nama: 'Nasi Merah Tumis Brokoli', harga: 19000, kategori: 'Menu Diet',   gambar: 'nasi merah tumis brokoli.jpg' },
];

let daftarPesanan = JSON.parse(localStorage.getItem('pesanan')) || [];

// 2. Fungsi untuk Menampilkan Menu ke HTML
const renderMenu = (data = daftarProduk) => {
    const container = document.querySelector('#menu-display');
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Menu tidak ditemukan.</p>';
        return;
    }

    container.innerHTML = data.map(produk => `
        <article class="card-menu" data-id="${produk.id}">
            <img src="${produk.gambar || 'placeholder.jpg'}" alt="${produk.nama}">
            <section class="card-content">
                <h4>${produk.nama}</h4>
                <p>Rp ${produk.harga.toLocaleString('id-ID')}</p>
                <small style="color: #666; display: block; margin-bottom: 10px;">${produk.kategori}</small>
                <button class="btn-pesan" style="width: 100%; background-color: #309e6c; color: white; border: none; padding: 10px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: background 0.3s;">
                    Pesan Sekarang
                </button>
            </section>
        </article>
    `).join('');
};

// 3. Fitur Cari dan Filter
const inputCari = document.querySelector('#input-cari');
const selectFilter = document.querySelector('#filter-kategori');

const cariDanFilter = () => {
    const keyword = inputCari.value.toLowerCase();
    const kategori = selectFilter ? selectFilter.value : 'Semua';

    const hasil = daftarProduk.filter(p => {
        const cocokNama = p.nama.toLowerCase().includes(keyword);
        const cocokKategori = kategori === 'Semua' || p.kategori === kategori;
        return cocokNama && cocokKategori;
    });

    renderMenu(hasil);
};

inputCari?.addEventListener('input', cariDanFilter);
selectFilter?.addEventListener('change', cariDanFilter);

// 4. Fitur Tambah Pesanan
document.querySelector('#menu-display')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-pesan')) {
        const card = e.target.closest('.card-menu');
        const id = parseInt(card.dataset.id);
        const produk = daftarProduk.find(p => p.id === id);

        const jumlah = prompt(`Jumlah ${produk.nama} yang ingin dipesan?`, 1);


            daftarPesanan.push({
                id       : Date.now(),
                produkId : produk.id,
                nama     : produk.nama,
                harga    : produk.harga,
                kategori : produk.kategori,
                gambar   : produk.gambar,
                jumlah   : parseInt(jumlah),
                opsi     : opsi,       
                status   : "Proses"
            });
            localStorage.setItem('pesanan', JSON.stringify(daftarPesanan));
            alert(`${produk.nama} berhasil ditambah ke pesanan!`);
        }
    }
);

// menjalankan fungsi render saat halaman pertama kali dibuka min
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
});
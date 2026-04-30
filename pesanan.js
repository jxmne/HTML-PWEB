// ═══════════════════════════════════════════════════════
//  pesanan.js  –  Edit · Hapus · Beli → Riwayat
//  Tabel SELALU tampil. Card muncul begitu ada pesanan.
// ═══════════════════════════════════════════════════════

const getPesanan = () => JSON.parse(localStorage.getItem('pesanan'))  || [];
const setPesanan = (d) => localStorage.setItem('pesanan', JSON.stringify(d));
const getRiwayat = () => JSON.parse(localStorage.getItem('riwayat')) || [];
const setRiwayat = (d) => localStorage.setItem('riwayat', JSON.stringify(d));
const formatRp   = (n) => `Rp ${Number(n).toLocaleString('id-ID')}`;

let idHapusPending = null;

function renderKartu() {
    const container = document.querySelector('#daftar-pesanan');
    if (!container) return;

    const data = getPesanan();

    if (data.length === 0) {
        container.innerHTML = `
            <article style="text-align:center; padding:40px; background:white; border-radius:15px; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                <p style="color:#666;">Wah, keranjang belanjamu masih kosong nih.</p>
                <a href="menumakancustomer.html" style="color:var(--hijau); text-decoration:none; font-weight:bold;">Lihat Menu Lezat Kami →</a>
            </article>`;
    } else {
        container.innerHTML = data.map(item => `
            <article class="order-card" data-id="${item.id}">
                <section class="order-left">
                    <img src="${item.gambar}" alt="${item.nama}" onerror="this.src='placeholder.jpg'">
                    <section class="order-info">
                        <h4>${item.nama}</h4>
                        <p class="price">${formatRp(item.harga)}</p>
                        <span class="badge-kategori">${item.kategori}</span>
                        <p class="status-text">📦 ${item.opsi || 'Dine In'}</p>
                    </section>
                </section>

                <section class="order-right">
                    <p class="jumlah-display" id="display-${item.id}">
                        Jumlah: <strong>${item.jumlah}</strong> Kotak
                    </p>

                    <section class="jumlah-editor" id="editor-${item.id}">
                        <input type="number" min="1" value="${item.jumlah}" id="input-${item.id}">
                        <button class="btn-simpan" data-id="${item.id}">Simpan</button>
                    </section>

                    <nav class="order-actions">
                        <button class="btn-edit" data-id="${item.id}">✏️ Edit</button>
                        <button class="btn-hapus" data-id="${item.id}">🗑️ Hapus</button>
                    </nav>
                </section>
            </article>
        `).join('');
    }

    // PENTING: Tabel selalu dirender untuk sinkronisasi data
    renderTabel(data);
}


// ═══════════════════════════════════════════════════════
//  EVENT DELEGATION – Edit · Simpan · Hapus · Modal
// ═══════════════════════════════════════════════════════
document.addEventListener('click', (e) => {

    // ── EDIT: toggle input jumlah inline ─────────────
    if (e.target.classList.contains('btn-edit')) {
        const id      = e.target.dataset.id;
        const display = document.querySelector(`#display-${id}`);
        const editor  = document.querySelector(`#editor-${id}`);
        const input   = document.querySelector(`#input-${id}`);
        if (!display || !editor) return;

        const sedangEdit = editor.classList.contains('aktif');
        display.style.display = sedangEdit ? '' : 'none';
        editor.classList.toggle('aktif', !sedangEdit);
        if (!sedangEdit && input) input.focus();
        return;
    }

    // ── SIMPAN: update jumlah ─────────────────────────
    if (e.target.classList.contains('btn-simpan')) {
        const id      = e.target.dataset.id;
        const input   = document.querySelector(`#input-${id}`);
        if (!input) return;

        const jumlahBaru = parseInt(input.value);
        if (isNaN(jumlahBaru) || jumlahBaru < 1) {
            input.style.border = '1.5px solid #e53e3e';
            input.focus();
            return;
        }

        const data = getPesanan();
        const item = data.find(p => String(p.id) === id);
        if (item) { item.jumlah = jumlahBaru; setPesanan(data); }
        renderKartu();
        return;
    }

    // ── HAPUS: buka modal konfirmasi ─────────────────
    let idHapusPending = null;

document.addEventListener('click', (e) => {
    // 1. Saat tombol 🗑️ Hapus di kartu diklik
    if (e.target.classList.contains('btn-hapus')) {
    idHapusPending = e.target.dataset.id;
    const modalElement = document.querySelector('#modal-hapus dialog');
    
    // Gunakan showModal() supaya otomatis di tengah dan muncul backdrop
    modalElement.showModal(); 
    }

    // 2. Saat klik "Batal" di dalam modal
    if (e.target.id === 'modal-batal') {
        idHapusPending = null;
        const modal = document.querySelector('#modal-hapus dialog');
        if (modal) modal.close();
        return;
    }

    // 3. Saat klik "Ya, Hapus" (Eksekusi Penghapusan)
    if (e.target.id === 'modal-konfirm') {
        if (idHapusPending !== null) {
            // Ambil data lama
            let data = getPesanan();
            
            // Filter: simpan semua KECUALI yang ID-nya sama dengan idHapusPending
            data = data.filter(item => String(item.id) !== String(idHapusPending));
            
            // Simpan kembali ke localStorage
            setPesanan(data);
            
            // Reset state
            idHapusPending = null;
            
            // Tutup modal
            const modal = document.querySelector('#modal-hapus dialog');
            if (modal) modal.close();

            // RENDER ULANG kartu & tabel agar item langsung hilang dari layar
            renderKartu(); 
        }
    }
});

    // Tutup modal klik backdrop
    if (e.target.id === 'modal-hapus') {
        idHapusPending = null;
        e.target.classList.remove('tampil');
    }
});

// ═══════════════════════════════════════════════════════
//  TOMBOL BELI → simpan ke riwayat, redirect
// ═══════════════════════════════════════════════════════
document.querySelector('#btn-beli')?.addEventListener('click', () => {
    const data = getPesanan();
    if (data.length === 0) {
        alert('Tidak ada pesanan untuk dibeli.');
        return;
    }

    const sekarang   = new Date();
    const tanggalStr = sekarang.toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    // Buat entri riwayat dari tiap item
    const entri = data.map(item => ({
        id       : Date.now() + Math.random(),
        nama     : item.nama,
        harga    : item.harga,
        jumlah   : item.jumlah,
        kategori : item.kategori,
        gambar   : item.gambar,
        opsi     : item.opsi || 'Paket Standar',
        tanggal  : tanggalStr,
        timestamp: sekarang.getTime()
    }));

    setRiwayat([...entri, ...getRiwayat()]);
    localStorage.removeItem('pesanan');

    const btn = document.querySelector('#btn-beli');
    if (btn) {
        btn.textContent = '✅ Berhasil! Mengalihkan…';
        btn.style.background = '#2bac83';
        btn.disabled = true;
    }

    setTimeout(() => { window.location.href = 'aktivitasriwayat.html'; }, 900);
});

// ═══════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', renderKartu);
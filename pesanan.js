document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#daftar-pesanan');
    if (!container) return;

    // Ambil data dari localStorage
    const dataPesanan = JSON.parse(localStorage.getItem('pesanan')) || [];

    // Klo data kosong, tampilkan pesan
    if (dataPesanan.length === 0) {
        container.innerHTML = `
            <article style="text-align:center; padding: 40px; background:white; border-radius:14px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <p style="color:#888; margin-bottom:12px;">Belum ada pesanan aktif.</p>
                <a href="menumakan.html" style="color:#12b368; font-weight:600; text-decoration:none;">→ Lihat Menu Catering</a>
            </article>`;
        return;
    }

    // Render grid kartu + tombol edit & hapus
    container.innerHTML = dataPesanan.map(item => `
        <article class="order-card">
            <section class="order-left">
                <img src="${item.gambar}" alt="${item.nama}">
                <aside class="order-info">
                    <h4>${item.nama}</h4>
                    <p class="price">Rp ${item.harga.toLocaleString('id-ID')}</p>
                    <span class="badge-kategori">${item.kategori}</span>
                    <p class="status-text">📦 ${item.opsi}</p>
                </aside>
            </section>
            <section class="order-right">
                <p>Jumlah: <strong>${item.jumlah}</strong> Kotak</p>
                <span class="badge-proses">${item.status || 'Proses'}</span>
            </section>

                <nav class="order-actions">
                    <button class="btn-edit"  data-id="${item.id}">✏️ Edit</button>
                    <button class="btn-hapus" data-id="${item.id}">🗑️ Hapus</button>
                </nav>
            </article>
    `).join('');

    // ── Event Delegation: Edit & Hapus ───────────────────────────
    // Satu listener di #daftar-pesanan menangkap semua klik tombol
    document.querySelector('#daftar-pesanan')?.addEventListener('click', (e) => {
        const id   = parseInt(e.target.dataset.id);
        let   data = getPesanan();
    
        // HAPUS
        if (e.target.classList.contains('btn-hapus')) {
            if (!confirm('Hapus pesanan ini?')) return;
            setPesanan(data.filter(p => p.id !== id));
            render();
            return;
        }
    
        // EDIT 
        if (e.target.classList.contains('btn-edit')) {
            const item = data.find(p => p.id === id);
            if (!item) return;
    
            const inputBaru = prompt(`Edit jumlah untuk "${item.nama}":`, item.jumlah);
            if (inputBaru === null) return;                         
    
            const jumlahBaru = parseInt(inputBaru);
            if (isNaN(jumlahBaru) || jumlahBaru < 1) {
                alert('Jumlah harus berupa angka lebih dari 0!');
                return;
            }
    
            item.jumlah = jumlahBaru;   
            setPesanan(data);
            render();
        }
    });

    // Render tabel ringkasan
    const tabelWrapper = document.querySelector('#tabel-wrapper');
    const tbody = document.querySelector('#tabel-ringkasan tbody');
    const tfoot = document.querySelector('#tabel-ringkasan tfoot');

    if (tabelWrapper && tbody) {
        tabelWrapper.style.display = 'block';

        const totalHarga = dataPesanan.reduce((acc, item) => acc + item.harga * item.jumlah, 0);

        tbody.innerHTML = dataPesanan.map((item, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><img src="${item.gambar}" alt="${item.nama}" style="width:50px; height:50px; object-fit:cover; border-radius:6px;"></td>
                <td>${item.nama}</td>
                <td>${item.opsi}</td>
                <td>Rp ${item.harga.toLocaleString('id-ID')}</td>
                <td>${item.jumlah} kotak</td>
                <td><strong>Rp ${(item.harga * item.jumlah).toLocaleString('id-ID')}</strong></td>
            </tr>
        `).join('');

        tfoot.innerHTML = `
            <tr class="total-row">
                <td colspan="5" style="text-align:right;">Total Keseluruhan</td>
                <td>Rp ${totalHarga.toLocaleString('id-ID')}</td>
            </tr>`;
    }

    // Render tombol terima
    document.querySelector('#btn-diterima')?.addEventListener('click', () => {
        const data = getPesanan();
        if (data.length === 0) { alert('Tidak ada pesanan.'); return; }
        if (!confirm(`Konfirmasi ${data.length} pesanan sebagai "Diterima"?`)) return;
        pindahKeRiwayat(data);
        localStorage.removeItem('pesanan');
        alert('Pesanan diterima! Lihat halaman Aktivitas untuk riwayat.');
        render();
    });
 
    render();

    document.addEventListener('DOMContentLoaded', render);
});

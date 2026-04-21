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

    // Render grid kartu
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
        </article>
    `).join('');

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
});
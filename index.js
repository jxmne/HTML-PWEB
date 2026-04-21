alert("Halo, JS sudah aktif!");

const updateStatistik = () => {
    // 1. Ambil data pesanan dari localStorage
    const daftarPesanan = JSON.parse(localStorage.getItem('pesanan')) || [];

    // 2. Hitung total item menggunakan array method .reduce()
    const totalItem = daftarPesanan.reduce((akumulator, item) => {
        return akumulator + parseInt(item.jumlah);
    }, 0);

    // 3. Update DOM (Manipulasi tampilan)
    const elemenTotal = document.querySelector('#total-terjual');
    const elemenProgress = document.querySelector('#progress-terjual');
    const elemenKet = document.querySelector('#keterangan-kuota');

    if (elemenTotal) {
        elemenTotal.innerText = `${totalItem} pax`;
        
        // Misal target harianmu 100 pax
        elemenProgress.value = totalItem;
        elemenProgress.max = 100; 
        
        elemenKet.innerText = totalItem >= 100 
            ? "Target harian tercapai!" 
            : `Sisa kuota: ${100 - totalItem} pax lagi`;
    }
};

// Jalankan fungsi saat halaman index dibuka
document.addEventListener('DOMContentLoaded', updateStatistik);
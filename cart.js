// File: cart.js

document.addEventListener('DOMContentLoaded', () => { // Jalankan saat dokumen sudah dimuat
    updateCartIcon(); // Update tampilan ikon keranjang
});

function getCart() { // Ambil data keranjang dari localStorage
    return JSON.parse(localStorage.getItem('cart')) || []; // Jika tidak ada, kembalikan array kosong
}

function saveCart(cart) { // Simpan data keranjang ke localStorage
    localStorage.setItem('cart', JSON.stringify(cart)); // Simpan array keranjang dalam bentuk string
    updateCartIcon(); // Update tampilan ikon keranjang
}

function addToCart(product) { // Tambahkan produk ke keranjang
    let cart = getCart(); // Ambil keranjang saat ini
    const existingProduct = cart.find(item => item.id === product.id); // Cek apakah produk sudah ada di keranjang

    if (existingProduct) { // Jika produk sudah ada
        existingProduct.quantity++; // Tambah jumlahnya
    } else {
        cart.push({ ...product, quantity: 1 }); // Jika belum ada, tambahkan produk baru dengan quantity 1
    }

    saveCart(cart); // Simpan perubahan keranjang
    alert(`${product.name} telah ditambahkan ke keranjang!`); // Tampilkan notifikasi ke user
}

function updateCartIcon() { // Update jumlah item di ikon keranjang
    const cart = getCart(); // Ambil keranjang
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0); // Hitung total item
    const cartCountElement = document.getElementById('cart-count'); // Ambil elemen badge jumlah keranjang
    if (cartCountElement) {
        cartCountElement.textContent = cartCount; // Tampilkan jumlah item
    }
}

function clearCart() { // Hapus seluruh isi keranjang
    localStorage.removeItem('cart'); // Hapus data keranjang dari localStorage
    updateCartIcon(); // Update tampilan ikon keranjang
}
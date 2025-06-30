// File: product-management.js (Versi Final dengan Tombol Fungsional)

document.addEventListener('DOMContentLoaded', function() {
    
    const API_URL = 'http://localhost:3000/api';

    const adminLogoutBtn = document.getElementById('adminLogoutBtn');
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function() {
            if (confirm('Apakah Anda yakin ingin logout dari sesi admin?')) {
                localStorage.removeItem('isAdminLoggedIn');
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('username');
                alert('Anda berhasil logout sebagai admin.');
                window.location.href = 'index.html';
            }
        });
    }

    const getProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) {
                throw new Error('Gagal mengambil data dari server.');
            }
            return await response.json();
        } catch (error) {
            console.error("Fetch Error:", error);
            return [];
        }
    };
    
    // --- USER-FACING PRODUCT PAGE LOGIC (`produk.html`) ---
    const productContainer = document.querySelector('.product-container');
    if (productContainer) {
        const renderUserProducts = async () => {
            const products = await getProducts();
            productContainer.innerHTML = ''; 
            if (products.length > 0) {
                products.forEach(p => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product';

                    // --- PERUBAHAN DIMULAI DI SINI ---

                    // 1. Mengganti 1 tombol menjadi 2 tombol dengan style dan ikon
                    productCard.innerHTML = `
                        <div class="product-image">
                            <img src="${p.image}" alt="${p.name}">
                        </div>
                        <h3>${p.name}</h3>
                        <p>${p.description}</p>
                        <div class="product-footer">
                            <span class="price">Rp ${p.price.toLocaleString('id-ID')}</span>
                            <div class="product-actions mt-2">
                                <button class="btn btn-sm btn-outline-primary add-to-cart-btn">
                                    <i class="bi bi-cart-plus"></i> Add to Cart
                                </button>
                                <button class="btn btn-sm btn-success buy-now-btn">
                                    <i class="bi bi-bag-check"></i> Beli Sekarang
                                </button>
                            </div>
                        </div>
                    `;

                    // 2. Menambahkan Event Listener untuk tombol "Add to Cart"
                    productCard.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                        if (!localStorage.getItem('isLoggedIn')) {
                            alert('Silakan login terlebih dahulu untuk menambahkan barang ke keranjang.');
                            document.getElementById('masterLoginBtn')?.click();
                            return;
                        }
                        // Panggil fungsi dari cart.js
                        addToCart(p); 
                    });

                    // 3. Menambahkan Event Listener untuk tombol "Beli Sekarang"
                    productCard.querySelector('.buy-now-btn').addEventListener('click', () => {
                        if (!localStorage.getItem('isLoggedIn')) {
                            alert('Silakan login terlebih dahulu untuk melanjutkan ke pembayaran.');
                            document.getElementById('masterLoginBtn')?.click();
                            return;
                        }
                        // Tambahkan ke keranjang, lalu langsung arahkan ke halaman checkout
                        addToCart(p);
                        window.location.href = 'checkout.html';
                    });
                    
                    // --- AKHIR PERUBAHAN ---

                    productContainer.appendChild(productCard);
                });
            } else {
                productContainer.innerHTML = '<p>Tidak ada produk yang tersedia saat ini.</p>';
            }
        };
        renderUserProducts();
    }

    // --- ADMIN PAGE CRUD LOGIC (`admin.html`) ---
    // Bagian ini tidak diubah dan tetap sama seperti sebelumnya
    const adminPage = document.getElementById('productTableBody');
    if (adminPage) {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('modalTitle');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const addNewProductBtn = document.getElementById('addNewProductBtn');
        const productForm = document.getElementById('productForm');
        const productTableBody = document.getElementById('productTableBody');
        const importFile = document.getElementById('importFile');
        const importBtn = document.getElementById('importBtn');
        const exportBtn = document.getElementById('exportBtn');
        
        const handleExport = async () => {
            const products = await getProducts();
            const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'barang.json';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('Data produk berhasil diekspor ke barang.json!');
        };

        const handleImport = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const importedProducts = JSON.parse(e.target.result);
                    if (!Array.isArray(importedProducts)) {
                       throw new Error("File JSON tidak valid. Harus berisi array produk.");
                    }
                    if (confirm('Apakah Anda yakin ingin menimpa semua produk saat ini dengan data dari file?')) {
                        const response = await fetch(`${API_URL}/import`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(importedProducts),
                        });
                        if (!response.ok) {
                           const errorData = await response.json();
                           throw new Error(errorData.error || 'Gagal mengirim data ke server.');
                        }
                        await renderProductTable();
                        alert('Data produk berhasil diimpor!');
                    }
                } catch (error) {
                    alert('Gagal mengimpor file: ' + error.message);
                } finally {
                    importFile.value = '';
                }
            };
            reader.readAsText(file);
        };

        const renderProductTable = async () => {
            productTableBody.innerHTML = '<tr><td colspan="6">Memuat data...</td></tr>';
            const products = await getProducts();
            productTableBody.innerHTML = '';
            if (products.length === 0) {
                 productTableBody.innerHTML = '<tr><td colspan="6">Tidak ada produk.</td></tr>';
                 return;
            }
            products.forEach(p => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${p.id}</td>
                    <td><img src="${p.image}" alt="${p.name}" width="50"></td>
                    <td>${p.name}</td>
                    <td>${p.description}</td>
                    <td>Rp ${p.price.toLocaleString('id-ID')}</td>
                    <td>
                        <div class="action-btns">
                            <button class="edit-btn" data-id="${p.id}"><i class="bi bi-pencil-square"></i> Edit</button>
                            <button class="delete-btn" data-id="${p.id}"><i class="bi bi-trash"></i> Hapus</button>
                        </div>
                    </td>
                `;
                productTableBody.appendChild(row);
            });
        };

        const openModal = async (product = null) => {
            productForm.reset();
            if (product) {
                modalTitle.textContent = 'Edit Produk';
                document.getElementById('productId').value = product.id;
                document.getElementById('productName').value = product.name;
                document.getElementById('productDesc').value = product.description;
                document.getElementById('productPrice').value = product.price;
                document.getElementById('productImage').value = product.image;
            } else {
                modalTitle.textContent = 'Tambah Produk Baru';
                document.getElementById('productId').value = '';
            }
            modal.style.display = 'block';
        };

        const closeModal = () => {
            modal.style.display = 'none';
        };

        productForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('productId').value;
            const productData = {
                name: document.getElementById('productName').value,
                description: document.getElementById('productDesc').value,
                price: parseInt(document.getElementById('productPrice').value, 10),
                image: document.getElementById('productImage').value,
            };
            let url = `${API_URL}/products`;
            let method = 'POST';
            if (id) {
                url = `${API_URL}/products/${id}`;
                method = 'PUT';
            }
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(productData)
                });
                if (!response.ok) { throw new Error('Gagal menyimpan produk.'); }
                await renderProductTable();
                closeModal();
            } catch(error) {
                alert(error.message);
            }
        });

        productTableBody.addEventListener('click', async (e) => {
            const target = e.target.closest('button');
            if (!target) return;
            const id = target.dataset.id;
            if (target.classList.contains('edit-btn')) {
                const products = await getProducts();
                const productToEdit = products.find(p => p.id == id);
                openModal(productToEdit);
            }
            if (target.classList.contains('delete-btn')) {
                if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
                   try {
                        const response = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
                        if (!response.ok) { throw new Error('Gagal menghapus produk.'); }
                        await renderProductTable();
                   } catch(error) {
                        alert(error.message);
                   }
                }
            }
        });
        
        addNewProductBtn.addEventListener('click', () => openModal());
        closeModalBtn.addEventListener('click', closeModal);
        document.getElementById('cancelBtn').addEventListener('click', closeModal);
        window.addEventListener('click', (e) => { if (e.target == modal) closeModal(); });
        exportBtn.addEventListener('click', handleExport);
        importBtn.addEventListener('click', () => importFile.click());
        importFile.addEventListener('change', handleImport);

        renderProductTable();
    }
});
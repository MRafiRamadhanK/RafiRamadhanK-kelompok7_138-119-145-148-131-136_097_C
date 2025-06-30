document.addEventListener('DOMContentLoaded', () => {
    // Pastikan admin sudah login
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        alert('Akses ditolak. Silakan login sebagai admin.');
        window.location.href = 'index.html';
        return;
    }

    const API_URL = 'http://localhost:3000/api'; // URL dasar untuk API backend
    const sidebarLinks = document.querySelectorAll('.sidebar .nav-link'); // Ambil semua link sidebar
    const contentSections = document.querySelectorAll('.content-section'); // Ambil semua section konten
    const productModal = new bootstrap.Modal(document.getElementById('productModal')); // Modal produk
    const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal')); // Modal detail pesanan

    // Fungsi untuk navigasi antar-section
    const showSection = (targetId) => {
        contentSections.forEach(section => {
            section.style.display = section.id === targetId ? 'block' : 'none'; // Tampilkan section yang dipilih
        });
        sidebarLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${targetId}`); // Aktifkan link sidebar yang sesuai
        });
    };

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Cegah reload halaman
            const sectionId = link.getAttribute('data-section'); // Ambil id section dari data-section
            if (sectionId) {
                showSection(sectionId + '-section'); // Tampilkan section yang dipilih
            }
        });
    });
    
    // Logout
    document.getElementById('logout-btn').addEventListener('click', (e) => {
        e.preventDefault(); // Cegah reload halaman
        if(confirm('Anda yakin ingin logout?')) {
            localStorage.removeItem('isAdminLoggedIn'); // Hapus status login admin
            localStorage.removeItem('isLoggedIn'); // Hapus status login user
            localStorage.removeItem('username'); // Hapus username
            window.location.href = 'index.html'; // Redirect ke halaman utama
        }
    });

    // --- Manajemen Produk ---
    const productsTableBody = document.getElementById('productsTableBody'); // Tabel body produk
    const productForm = document.getElementById('productForm'); // Form produk

    // Ambil data produk dari API
    const fetchProducts = async () => {
        const response = await fetch(`${API_URL}/products`); // Request data produk
        const products = await response.json(); // Parse JSON
        productsTableBody.innerHTML = ''; // Kosongkan tabel
        products.forEach(p => {
            const row = document.createElement('tr'); // Buat baris baru
            row.innerHTML = `
                <td>${p.id}</td>
                <td><img src="${p.image}" alt="${p.name}" width="50"></td>
                <td>${p.name}</td>
                <td>${p.description}</td>
                <td>Rp ${p.price.toLocaleString('id-ID')}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-product" data-id="${p.id}"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-danger delete-product" data-id="${p.id}"><i class="bi bi-trash"></i></button>
                </td>
            `; // Isi baris dengan data produk
            productsTableBody.appendChild(row); // Tambahkan ke tabel
        });
    };

    // Tombol tambah produk
    document.getElementById('addProductBtn').addEventListener('click', () => {
        productForm.reset(); // Reset form
        document.getElementById('productId').value = ''; // Kosongkan id produk
        document.getElementById('productModalTitle').textContent = 'Tambah Produk Baru'; // Judul modal
        productModal.show(); // Tampilkan modal
    });

    // Submit form produk (tambah/edit)
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Cegah reload
        const id = document.getElementById('productId').value; // Ambil id produk
        const productData = {
            name: document.getElementById('productName').value, // Nama produk
            description: document.getElementById('productDesc').value, // Deskripsi produk
            price: parseInt(document.getElementById('productPrice').value), // Harga produk
            image: document.getElementById('productImage').value, // URL gambar produk
        };

        const method = id ? 'PUT' : 'POST'; // PUT jika edit, POST jika tambah
        const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`; // URL API

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' }, // Header JSON
            body: JSON.stringify(productData), // Data produk
        });

        productModal.hide(); // Sembunyikan modal
        fetchProducts(); // Refresh data produk
    });

    // Event edit/hapus produk
    productsTableBody.addEventListener('click', async (e) => {
        const target = e.target.closest('button'); // Ambil tombol yang diklik
        if (!target) return;
        const id = target.dataset.id; // Ambil id produk

        if (target.classList.contains('edit-product')) {
            const response = await fetch(`${API_URL}/products`); // Ambil data produk
            const products = await response.json();
            const product = products.find(p => p.id == id); // Cari produk yang dipilih
            
            document.getElementById('productId').value = product.id; // Isi form dengan data produk
            document.getElementById('productName').value = product.name;
            document.getElementById('productDesc').value = product.description;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productModalTitle').textContent = 'Edit Produk'; // Judul modal
            productModal.show(); // Tampilkan modal
        }

        if (target.classList.contains('delete-product')) {
            if (confirm('Yakin ingin menghapus produk ini?')) {
                await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' }); // Hapus produk
                fetchProducts(); // Refresh data produk
            }
        }
    });


    // --- Manajemen Pesanan ---
    const ordersTableBody = document.getElementById('ordersTableBody'); // Tabel body pesanan

    // Ambil data pesanan dari API
    const fetchOrders = async () => {
        const response = await fetch(`${API_URL}/orders`); // Request data pesanan
        const orders = await response.json(); // Parse JSON
        ordersTableBody.innerHTML = ''; // Kosongkan tabel
        orders.forEach(order => {
            const row = document.createElement('tr'); // Buat baris baru
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.customer_name}</td>
                <td>${order.customer_email}</td>
                <td>Rp ${order.total_amount.toLocaleString('id-ID')}</td>
                <td>${new Date(order.order_date).toLocaleDateString('id-ID')}</td>
                <td>
                    <button class="btn btn-sm btn-info view-order" data-id="${order.id}"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-danger delete-order" data-id="${order.id}"><i class="bi bi-trash"></i></button>
                </td>
            `; // Isi baris dengan data pesanan
            ordersTableBody.appendChild(row); // Tambahkan ke tabel
        });
    };

    // Event lihat/hapus pesanan
    ordersTableBody.addEventListener('click', async (e) => {
        const target = e.target.closest('button'); // Ambil tombol yang diklik
        if (!target) return;
        const id = target.dataset.id; // Ambil id pesanan

        if (target.classList.contains('view-order')) {
            const response = await fetch(`${API_URL}/orders/${id}`); // Ambil detail pesanan
            const data = await response.json();
            const orderDetailsBody = document.getElementById('orderDetailsBody'); // Kontainer detail pesanan
            
            let itemsHtml = data.items.map(item => `
                <tr>
                    <td>${item.product_name}</td>
                    <td>${item.quantity}</td>
                    <td>Rp ${item.price_at_purchase.toLocaleString('id-ID')}</td>
                </tr>
            `).join(''); // Buat baris produk pesanan

            orderDetailsBody.innerHTML = `
                <p><strong>Nama Pelanggan:</strong> ${data.order.customer_name}</p>
                <p><strong>Alamat:</strong> ${data.order.customer_address}</p>
                <table class="table">
                    <thead><tr><th>Produk</th><th>Jumlah</th><th>Harga</th></tr></thead>
                    <tbody>${itemsHtml}</tbody>
                </table>
            `; // Tampilkan detail pesanan
            orderDetailsModal.show(); // Tampilkan modal detail
        }
        if (target.classList.contains('delete-order')) {
            if (confirm('Yakin ingin menghapus pesanan ini? Ini tidak dapat diurungkan.')) {
                await fetch(`${API_URL}/orders/${id}`, { method: 'DELETE' }); // Hapus pesanan
                fetchOrders(); // Refresh data pesanan
            }
        }
    });

    // --- Manajemen Pengguna ---
    const usersTableBody = document.getElementById('usersTableBody'); // Tabel body pengguna
    // Ambil data pengguna dari API
    const fetchUsers = async () => {
         const response = await fetch(`${API_URL}/users`); // Request data pengguna
         const users = await response.json(); // Parse JSON
         usersTableBody.innerHTML = ''; // Kosongkan tabel
         users.forEach(user => {
            const row = document.createElement('tr'); // Buat baris baru
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>
                    <button class="btn btn-sm btn-danger delete-user" data-id="${user.id}"><i class="bi bi-trash"></i></button>
                </td>
            `; // Isi baris dengan data pengguna
            usersTableBody.appendChild(row); // Tambahkan ke tabel
         });
    };

    // Event hapus pengguna
    usersTableBody.addEventListener('click', async (e) => {
        const target = e.target.closest('button.delete-user'); // Ambil tombol hapus
        if (target) {
            const id = target.dataset.id; // Ambil id pengguna
            if (confirm('Yakin ingin menghapus pengguna ini?')) {
                await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' }); // Hapus pengguna
                fetchUsers(); // Refresh data pengguna
            }
        }
    });

    // --- Manajemen Pesan ---
    const messagesContainer = document.getElementById('messagesContainer'); // Kontainer pesan
    // Ambil data pesan dari API
    const fetchMessages = async () => {
        const response = await fetch(`${API_URL}/messages`); // Request data pesan
        const messages = await response.json(); // Parse JSON
        messagesContainer.innerHTML = ''; // Kosongkan kontainer
        if(messages.length === 0) {
            messagesContainer.innerHTML = '<p>Tidak ada pesan masuk.</p>'; // Jika tidak ada pesan
            return;
        }
        messages.forEach(msg => {
            const card = document.createElement('div'); // Buat card pesan
            card.className = 'message-card card';
            card.innerHTML = `
                <div class="card-header d-flex justify-content-between">
                   <strong>Dari: ${msg.name} (${msg.email})</strong>
                   <button class="btn-close delete-message" data-id="${msg.id}"></button>
                </div>
                <div class="card-body">
                    <h6 class="card-subtitle mb-2 text-muted">Subjek: ${msg.subject || '-'}</h6>
                    <p class="card-text">${msg.message}</p>
                    <small class="text-muted">Diterima pada: ${new Date(msg.created_at).toLocaleString('id-ID')}</small>
                </div>
            `; // Isi card dengan data pesan
            messagesContainer.appendChild(card); // Tambahkan ke kontainer
        });
    };
    
    // Event hapus pesan
    messagesContainer.addEventListener('click', async (e) => {
       if (e.target.classList.contains('delete-message')) {
           const id = e.target.dataset.id; // Ambil id pesan
            if (confirm('Yakin ingin menghapus pesan ini?')) {
                await fetch(`${API_URL}/messages/${id}`, { method: 'DELETE' }); // Hapus pesan
                fetchMessages(); // Refresh data pesan
            }
       }
    });


    // Initial fetches
    fetchProducts(); // Ambil data produk saat pertama kali
    fetchOrders(); // Ambil data pesanan saat pertama kali
    fetchUsers(); // Ambil data pengguna saat pertama kali
    fetchMessages(); // Ambil data pesan saat pertama kali
    showSection('products-section'); // Tampilkan section produk secara default
});
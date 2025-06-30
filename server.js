const express = require('express'); // Import library Express untuk membuat server web
const sqlite3 = require('sqlite3').verbose(); // Import library SQLite3 untuk database
const cors = require('cors'); // Import library CORS untuk mengizinkan request lintas domain
const bcrypt = require('bcrypt'); // Import library bcrypt untuk enkripsi password

const app = express(); // Membuat instance aplikasi Express
const PORT = 3000; // Port yang digunakan server

// Middleware
app.use(cors()); // Mengizinkan semua request dari domain lain (CORS)
app.use(express.json()); // Mengizinkan server menerima dan memproses body JSON

// Hubungkan ke database
const db = require('./database.js');  // Menghubungkan ke file database.js

// --- Rute API untuk CRUD Produk ---

// 1. READ (Get All Products)
app.get('/api/products', (req, res) => { // Endpoint untuk mendapatkan semua produk
    const sql = `SELECT * FROM products ORDER BY id`; // Query untuk mengambil semua produk
    db.all(sql, [], (err, rows) => { // Eksekusi query
        if (err) {
            res.status(500).json({ error: err.message }); // Jika error, kirim pesan error
            return;
        }
        res.json(rows); // Kirim data produk dalam format JSON
    });
});

// 2. CREATE (Add New Product)
app.post('/api/products', (req, res) => { // Endpoint untuk menambah produk baru
    const { name, description, price, image } = req.body; // Ambil data produk dari body request
    const sql = `INSERT INTO products (name, description, price, image) VALUES (?, ?, ?, ?)`; // Query insert produk
    db.run(sql, [name, description, price, image], function(err) { // Eksekusi query
        if (err) {
            res.status(400).json({ error: err.message }); // Jika error, kirim pesan error
            return;
        }
        res.status(201).json({ id: this.lastID, ...req.body }); // Kirim data produk yang baru ditambahkan
    });
});

// 3. UPDATE (Edit Product)
app.put('/api/products/:id', (req, res) => { // Endpoint untuk mengedit produk
    const { name, description, price, image } = req.body; // Ambil data produk dari body request
    const sql = `UPDATE products SET name = ?, description = ?, price = ?, image = ? WHERE id = ?`; // Query update produk
    db.run(sql, [name, description, price, image, req.params.id], function(err) { // Eksekusi query
        if (err) {
            res.status(400).json({ error: err.message }); // Jika error, kirim pesan error
            return;
        }
        res.json({ message: 'Produk berhasil diperbarui', changes: this.changes }); // Kirim pesan sukses
    });
});

// 4. DELETE (Remove Product)
app.delete('/api/products/:id', (req, res) => { // Endpoint untuk menghapus produk
    const sql = `DELETE FROM products WHERE id = ?`; // Query delete produk
    db.run(sql, req.params.id, function(err) { // Eksekusi query
        if (err) {
            res.status(400).json({ error: err.message }); // Jika error, kirim pesan error
            return;
        }
        res.json({ message: 'Produk berhasil dihapus', changes: this.changes }); // Kirim pesan sukses
    });
});

// 5. IMPORT (Overwrite all products)
app.post('/api/import', (req, res) => { // Endpoint untuk impor data produk (overwrite semua)
    const products = req.body; // Ambil array produk dari body request
    if (!Array.isArray(products)) {
        return res.status(400).json({ error: 'Data yang dikirim harus berupa array.' }); // Validasi data
    }

    const deleteSql = `DELETE FROM products`; // Query hapus semua produk
    const insertSql = `INSERT INTO products (id, name, description, price, image) VALUES (?, ?, ?, ?, ?)`; // Query insert produk

    db.serialize(() => { // Jalankan query secara berurutan
        db.run('BEGIN TRANSACTION'); // Mulai transaksi
        db.run(deleteSql, function(err) { // Hapus semua produk
            if (err) {
                db.run('ROLLBACK'); // Rollback jika error
                return res.status(500).json({ error: err.message });
            }
        });

        const stmt = db.prepare(insertSql); // Siapkan statement insert
        products.forEach(p => {
            stmt.run(p.id, p.name, p.description, p.price, p.image); // Masukkan setiap produk
        });
        stmt.finalize((err) => { // Selesai insert
            if (err) {
                db.run('ROLLBACK'); // Rollback jika error
                return res.status(500).json({ error: err.message });
            }
            db.run('COMMIT'); // Commit transaksi
            res.status(201).json({ message: 'Data produk berhasil diimpor.' }); // Kirim pesan sukses
        });
    });
});

// --- API UNTUK USER AUTHENTICATION ---
const saltRounds = 10; // Jumlah salt rounds untuk bcrypt

// Endpoint untuk Registrasi User Baru
app.post('/api/register', (req, res) => { // Endpoint registrasi user
    const { username, email, password } = req.body; // Ambil data user dari body

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Semua field harus diisi' }); // Validasi data
    }

    // Hash password sebelum disimpan
    bcrypt.hash(password, saltRounds, (err, hash) => { // Enkripsi password
        if (err) {
            return res.status(500).json({ error: 'Gagal mengenkripsi password' }); // Jika error, kirim pesan error
        }

        const sql = `INSERT INTO users (username, email, password) VALUES (?, ?, ?)`; // Query insert user
        db.run(sql, [username, email, hash], function(err) { // Eksekusi query
            if (err) {
                if (err.code === 'SQLITE_CONSTRAINT') {
                    return res.status(409).json({ error: 'Username atau email sudah terdaftar' }); // Jika user/email sudah ada
                }
                return res.status(500).json({ error: err.message }); // Jika error lain
            }
            res.status(201).json({ message: 'Registrasi berhasil!', userId: this.lastID }); // Kirim pesan sukses
        });
    });
});

// Endpoint untuk Login User
app.post('/api/login', (req, res) => { // Endpoint login user
    const { username, password } = req.body; // Ambil data login dari body

    if (!username || !password) {
        return res.status(400).json({ error: 'Username dan password harus diisi' }); // Validasi data
    }

    const sql = `SELECT * FROM users WHERE username = ?`; // Query cari user
    db.get(sql, [username], (err, user) => { // Eksekusi query
        if (err) {
            return res.status(500).json({ error: err.message }); // Jika error, kirim pesan error
        }
        if (!user) {
            return res.status(401).json({ error: 'Username atau password salah' }); // Jika user tidak ditemukan
        }

        // Bandingkan password yang diinput dengan hash di database
        bcrypt.compare(password, user.password, (err, result) => { // Bandingkan password
            if (result) {
                res.status(200).json({ message: 'Login berhasil!', username: user.username }); // Jika cocok, login sukses
            } else {
                res.status(401).json({ error: 'Username atau password salah' }); // Jika tidak cocok
            }
        });
    });
});

// --- API UNTUK FORM KONTAK ---
app.post('/api/messages', (req, res) => { // Endpoint kirim pesan kontak
    const { name, email, subject, message } = req.body; // Ambil data pesan dari body

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Nama, email, dan pesan harus diisi.' }); // Validasi data
    }

    const sql = `INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)`; // Query insert pesan
    const params = [name, email, subject, message]; // Parameter query

    db.run(sql, params, function(err) { // Eksekusi query
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Gagal menyimpan pesan ke database.' }); // Jika error, kirim pesan error
        }
        res.status(201).json({ 
            message: 'Pesan berhasil terkirim!', // Pesan sukses
            messageId: this.lastID  // ID pesan yang baru
        });
    });
});

// --- API UNTUK CHECKOUT ---
app.post('/api/checkout', (req, res) => { // Endpoint checkout pesanan
    const { cart, customerDetails, username } = req.body; // Ambil data checkout dari body

    if (!cart || cart.length === 0) {
        return res.status(400).json({ error: 'Keranjang belanja kosong.' }); // Validasi keranjang
    }
    if (!customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.address) {
        return res.status(400).json({ error: 'Data pelanggan harus lengkap.' }); // Validasi data pelanggan
    }
    if (!username) {
        return res.status(401).json({ error: 'User tidak terautentikasi.' }); // Validasi user
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0); // Hitung total belanja

    db.get(`SELECT id FROM users WHERE username = ?`, [username], (err, user) => { // Cari user di database
        if (err || !user) {
            console.error('Checkout failed: User not found for username:', username);
            return res.status(404).json({ error: 'User tidak ditemukan.' }); // Jika user tidak ditemukan
        }

        const userId = user.id; // Ambil ID user
        const insertOrderSql = `INSERT INTO orders (user_id, customer_name, customer_email, customer_address, total_amount) VALUES (?, ?, ?, ?, ?)`; // Query insert order
        const insertItemSql = `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES (?, ?, ?, ?)`; // Query insert item order

        db.serialize(() => { // Jalankan query secara berurutan
            db.run('BEGIN TRANSACTION'); // Mulai transaksi

            db.run(insertOrderSql, [userId, customerDetails.name, customerDetails.email, customerDetails.address, totalAmount], function(err) { // Insert order
                if (err) {
                    db.run('ROLLBACK');
                    console.error("Order Insert Error:", err.message);
                    return res.status(500).json({ error: 'Gagal membuat pesanan di database.' }); // Jika error, rollback
                }

                const orderId = this.lastID; // Ambil ID order
                const itemStmt = db.prepare(insertItemSql); // Siapkan statement insert item
                let itemError = null;

                cart.forEach(item => {
                    itemStmt.run(orderId, item.id, item.quantity, item.price, (itemErr) => { // Insert setiap item pesanan
                        if (itemErr) {
                            itemError = itemErr;
                        }
                    });
                });

                itemStmt.finalize((finalizeErr) => { // Selesai insert item
                    if (itemError || finalizeErr) {
                        db.run('ROLLBACK');
                        console.error("Item Insert Error:", itemError?.message || finalizeErr?.message);
                        return res.status(500).json({ error: 'Gagal menyimpan item pesanan.' }); // Jika error, rollback
                    }

                    db.run('COMMIT');
                    res.status(201).json({
                        message: 'Pesanan berhasil dibuat!', // Pesan sukses
                        orderId: orderId
                    });
                });
            });
        });
    });
});

// ===========================================
// --- BARU: ENDPOINT UNTUK DASHBOARD ADMIN ---
// ===========================================

// --- USERS ---
app.get('/api/users', (req, res) => { // Endpoint ambil semua user
    db.all('SELECT id, username, email FROM users', [], (err, rows) => { // Query ambil user
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows); // Kirim data user
    });
});

app.delete('/api/users/:id', (req, res) => { // Endpoint hapus user
    db.run('DELETE FROM users WHERE id = ?', req.params.id, function (err) { // Query hapus user
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'User dihapus', changes: this.changes }); // Pesan sukses
    });
});

// --- ORDERS ---
app.get('/api/orders', (req, res) => { // Endpoint ambil semua order
    db.all('SELECT * FROM orders ORDER BY order_date DESC', [], (err, rows) => { // Query ambil order
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows); // Kirim data order
    });
});

app.get('/api/orders/:id', (req, res) => { // Endpoint ambil detail order
    const orderSql = 'SELECT * FROM orders WHERE id = ?'; // Query ambil order
    const itemsSql = `
        SELECT oi.*, p.name as product_name 
        FROM order_items oi 
        JOIN products p ON p.id = oi.product_id 
        WHERE oi.order_id = ?`; // Query ambil item order

    db.get(orderSql, [req.params.id], (err, order) => { // Eksekusi query order
        if (err) return res.status(500).json({ error: err.message });
        if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

        db.all(itemsSql, [req.params.id], (err, items) => { // Eksekusi query item order
            if (err) return res.status(500).json({ error: err.message });
            res.json({ order, items }); // Kirim detail order dan item
        });
    });
});

app.delete('/api/orders/:id', (req, res) => { // Endpoint hapus order
    // Menghapus item pesanan terlebih dahulu, lalu pesanan itu sendiri
    db.serialize(() => {
        db.run('BEGIN TRANSACTION'); // Mulai transaksi
        db.run('DELETE FROM order_items WHERE order_id = ?', req.params.id); // Hapus item order
        db.run('DELETE FROM orders WHERE id = ?', req.params.id, function(err) { // Hapus order
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message }); // Jika error, rollback
            }
            db.run('COMMIT');
            res.json({ message: 'Pesanan dihapus', changes: this.changes }); // Pesan sukses
        });
    });
});

// --- MESSAGES ---
app.get('/api/messages', (req, res) => { // Endpoint ambil semua pesan
    db.all('SELECT * FROM messages ORDER BY created_at DESC', [], (err, rows) => { // Query ambil pesan
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows); // Kirim data pesan
    });
});

app.delete('/api/messages/:id', (req, res) => { // Endpoint hapus pesan
    db.run('DELETE FROM messages WHERE id = ?', req.params.id, function(err) { // Query hapus pesan
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Pesan dihapus', changes: this.changes }); // Pesan sukses
    });
});

// Jalankan server
app.listen(PORT, () => { // Menjalankan server pada port yang ditentukan
    console.log(`Server berjalan di http://localhost:${PORT}`); // Tampilkan pesan di console
});
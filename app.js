document.addEventListener('DOMContentLoaded', function() { // Jalankan kode setelah seluruh dokumen dimuat
    // Navigation active state
    const currentPage = window.location.pathname.split('/').pop(); // Ambil nama file halaman saat ini
    const navLinks = document.querySelectorAll('nav a'); // Ambil semua link navigasi

    navLinks.forEach(link => { // Loop semua link navigasi
        if (link.getAttribute('href') === currentPage) { // Jika link sesuai dengan halaman saat ini
            link.classList.add('active'); // Tambahkan class 'active'
        } else {
            link.classList.remove('active'); // Hapus class 'active' jika tidak sesuai
        }
    });

    // Product filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn'); // Ambil semua tombol filter produk
    const products = document.querySelectorAll('.product'); // Ambil semua elemen produk

    if (filterButtons.length > 0) { // Jika ada tombol filter
        filterButtons.forEach(button => { // Loop setiap tombol filter
            button.addEventListener('click', function() { // Tambahkan event klik
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active')); // Hapus class 'active' dari semua tombol
                
                // Add active class to clicked button
                this.classList.add('active'); // Tambahkan class 'active' ke tombol yang diklik
                
                const filter = this.textContent; // Ambil teks filter dari tombol
                
                // Filter products
                products.forEach(product => { // Loop semua produk
                    if (filter === 'Semua' || product.querySelector('h3').textContent.includes(filter)) { // Jika filter 'Semua' atau nama produk sesuai
                        product.style.display = 'block'; // Tampilkan produk
                    } else {
                        product.style.display = 'none'; // Sembunyikan produk
                    }
                });
            });
        });
    }

    // Contact form submission
    const contactForm = document.querySelector('.contact-form form'); // Ambil form kontak
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) { // Event submit form kontak
            e.preventDefault(); // Cegah reload halaman

            const submitButton = this.querySelector('button[type="submit"]'); // Ambil tombol submit
            const originalButtonText = submitButton.textContent; // Simpan teks asli tombol
            submitButton.disabled = true; // Nonaktifkan tombol submit
            submitButton.textContent = 'Mengirim...'; // Ubah teks tombol

            const messageData = { // Ambil data dari form
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            try {
                const response = await fetch('http://localhost:3000/api/messages', { // Kirim data ke backend
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(messageData)
                });

                const result = await response.json(); // Ambil hasil response

                if (!response.ok) {
                    throw new Error(result.error || 'Terjadi kesalahan pada server.'); // Tampilkan error jika gagal
                }

                alert('Terima kasih! Pesan Anda telah berhasil terkirim dan disimpan.'); // Tampilkan pesan sukses
                this.reset(); // Reset form

            } catch (error) {
                alert(`Gagal mengirim pesan: ${error.message}`); // Tampilkan pesan error
            } finally {
                submitButton.disabled = false; // Aktifkan kembali tombol submit
                submitButton.textContent = originalButtonText; // Kembalikan teks tombol
            }
        });
    }

    // Newsletter subscription
    const newsletterForm = document.querySelector('.newsletter-form'); // Ambil form newsletter
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) { // Event submit newsletter
            e.preventDefault(); // Cegah reload halaman
            const email = this.querySelector('input[type="email"]').value; // Ambil email dari input
            alert(`Terima kasih telah berlangganan newsletter kami dengan email ${email}`); // Tampilkan pesan sukses
            this.reset(); // Reset form
        });
    }

    // Promo modal implementation
    const promoBtn = document.getElementById('promoBtn'); // Ambil tombol promo
    if (promoBtn) {
        // Create modal HTML if it doesn't exist
        if (!document.getElementById('promoModal')) { // Jika modal belum ada
            const modalHTML = `
                <div id="promoModal" class="promo-modal">
                    <div class="modal-overlay"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2>🎉 PROMO SPESIAL! 🎉</h2>
                            <button class="close-btn" id="closeModal">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="promo-image">
                                <img src="img/promo.jpeg" alt="Promo Banner" />
                            </div>
                            <div class="promo-details">
                                <h3>Diskon 50% untuk Semua Produk!</h3>
                                <p>Dapatkan kesempatan emas untuk berbelanja dengan harga terbaik!</p>
                                <ul>
                                    <li>✅ Gratis ongkir ke seluruh Indonesia</li>
                                    <li>✅ Garansi 100% original</li>
                                    <li>✅ Return 7 hari tanpa ribet</li>
                                    <li>✅ Berlaku sampai 31 Mei 2025</li>
                                </ul>
                                <div class="promo-code">
                                    <span>Gunakan kode: <strong>PROMO50</strong></span>
                                    <button class="copy-code-btn" onclick="copyPromoCode()">Salin Kode</button>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-primary" onclick="window.location.href='produk.html'">
                                Belanja Sekarang!
                            </button>
                            <button class="btn-secondary" id="closeModalBtn">Tutup</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert modal HTML into body
            document.body.insertAdjacentHTML('beforeend', modalHTML); // Tambahkan modal ke body
            
            // Add CSS styles for the modal
            const modalStyles = `
                <style>
                /* CSS untuk tampilan modal promo */
                .promo-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 1000;
                }
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 15px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                    animation: modalSlideIn 0.3s ease-out;
                }
                @keyframes modalSlideIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -60%);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%);
                    }
                }
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #eee;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
                    color: white;
                    border-radius: 15px 15px 0 0;
                }
                .modal-header h2 {
                    margin: 0;
                    font-size: 24px;
                    text-align: center;
                    flex-grow: 1;
                }
                .close-btn {
                    background: none;
                    border: none;
                    font-size: 32px;
                    color: white;
                    cursor: pointer;
                    padding: 0;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    transition: background-color 0.3s;
                }
                .close-btn:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                }
                .modal-body {
                    padding: 30px 20px;
                }
                .promo-image {
                    text-align: center;
                    margin-bottom: 20px;
                }
                .promo-image img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                }
                .promo-details h3 {
                    color: #ff6b6b;
                    text-align: center;
                    margin-bottom: 15px;
                    font-size: 22px;
                }
                .promo-details p {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #666;
                    font-size: 16px;
                }
                .promo-details ul {
                    list-style: none;
                    padding: 0;
                    margin-bottom: 25px;
                }
                .promo-details li {
                    padding: 8px 0;
                    font-size: 14px;
                    color: #555;
                }
                .promo-code {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 10px;
                    text-align: center;
                    border: 2px dashed #ff6b6b;
                    margin-bottom: 20px;
                }
                .promo-code span {
                    display: block;
                    margin-bottom: 10px;
                    font-size: 16px;
                }
                .promo-code strong {
                    color: #ff6b6b;
                    font-size: 20px;
                    letter-spacing: 2px;
                }
                .copy-code-btn {
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.3s;
                }
                .copy-code-btn:hover {
                    background: #ff5252;
                }
                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid #eee;
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }
                .btn-primary, .btn-secondary {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: bold;
                    transition: all 0.3s;
                    min-width: 120px;
                }
                .btn-primary {
                    background: #ff6b6b;
                    color: white;
                }
                .btn-primary:hover {
                    background: #ff5252;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
                }
                .btn-secondary {
                    background: #f8f9fa;
                    color: #333;
                    border: 2px solid #ddd;
                }
                .btn-secondary:hover {
                    background: #e9ecef;
                    border-color: #ccc;
                }
                @media (max-width: 576px) {
                    .modal-content {
                        margin: 20px;
                        width: calc(100% - 40px);
                    }
                    .modal-header h2 {
                        font-size: 20px;
                    }
                    .promo-details h3 {
                        font-size: 18px;
                    }
                    .modal-footer {
                        flex-direction: column;
                    }
                }
                </style>
            `;
            
            // Add styles to head
            document.head.insertAdjacentHTML('beforeend', modalStyles); // Tambahkan CSS modal ke head
        }
        
        // Get modal elements
        const modal = document.getElementById('promoModal'); // Ambil elemen modal
        const overlay = modal.querySelector('.modal-overlay'); // Ambil overlay modal
        const closeBtn = document.getElementById('closeModal'); // Ambil tombol close (X)
        const closeModalBtn = document.getElementById('closeModalBtn'); // Ambil tombol tutup di footer
        
        // Show modal when promo button is clicked
        promoBtn.addEventListener('click', function() { // Event klik tombol promo
            modal.style.display = 'block'; // Tampilkan modal
            document.body.style.overflow = 'hidden'; // Cegah scroll background
        });
        
        // Close modal functions
        function closeModal() {
            modal.style.display = 'none'; // Sembunyikan modal
            document.body.style.overflow = 'auto'; // Aktifkan scroll background
        }
        
        // Event listeners for closing modal
        closeBtn.addEventListener('click', closeModal); // Tutup modal saat klik tombol X
        closeModalBtn.addEventListener('click', closeModal); // Tutup modal saat klik tombol tutup
        overlay.addEventListener('click', closeModal); // Tutup modal saat klik overlay
        
        // Close modal with ESC key
        document.addEventListener('keydown', function(e) { // Tutup modal dengan tombol ESC
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
    }
    
});

// Function to copy promo code
function copyPromoCode() { // Fungsi untuk menyalin kode promo
    const promoCode = 'PROMO50'; // Kode promo yang akan disalin
    
    // Create temporary input element
    const tempInput = document.createElement('input'); // Buat input sementara
    tempInput.value = promoCode;
    document.body.appendChild(tempInput);
    
    // Select and copy the text
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Untuk perangkat mobile
    
    try {
        document.execCommand('copy'); // Salin ke clipboard
        
        // Change button text temporarily
        const copyBtn = event.target; // Ambil tombol yang diklik
        const originalText = copyBtn.textContent; // Simpan teks asli
        copyBtn.textContent = 'Tersalin!'; // Ubah teks tombol
        copyBtn.style.background = '#4caf50'; // Ubah warna tombol
        
        setTimeout(() => {
            copyBtn.textContent = originalText; // Kembalikan teks tombol
            copyBtn.style.background = '#ff6b6b'; // Kembalikan warna tombol
        }, 2000);
        
        alert('Kode promo berhasil disalin!'); // Tampilkan pesan sukses
    } catch (err) {
        alert('Gagal menyalin kode. Silakan salin manual: ' + promoCode); // Tampilkan pesan error
    }
    
    // Remove temporary input
    document.body.removeChild(tempInput); // Hapus input sementara
}
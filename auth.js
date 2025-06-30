// File: auth.js (Versi Final dengan Redirect saat Batal Login)

document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:3000/api';
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'password123';

    function createModals() {
        if (document.getElementById('loginChoiceModal')) return;
        const modalsHTML = `
            <div id="loginChoiceModal" class="auth-modal" style="display: none;"><div class="modal-overlay"></div><div class="modal-content"><div class="modal-header"><h2>Login</h2><button class="close-btn">&times;</button></div><div class="modal-body"><p style="text-align: center; margin-bottom: 25px;">Login sebagai siapa?</p><div class="form-actions" style="display: flex; flex-direction: column; gap: 15px;"><button type="button" id="choiceUserBtn" class="btn-primary">Login sebagai User</button><button type="button" id="choiceAdminBtn" class="btn-secondary">Login sebagai Admin</button></div></div></div></div>
            <div id="authModal" class="auth-modal" style="display: none;"><div class="modal-overlay"></div><div class="modal-content"><div class="modal-header"><h2 id="modalTitle">Login User</h2><button class="close-btn">&times;</button></div><div class="modal-body"><div id="loginForm"><div class="form-group"><label for="username">Username</label><input type="text" id="username" required></div><div class="form-group"><label for="password">Password</label><input type="password" id="password" required></div><div class="form-actions"><button type="button" id="submitLoginBtn" class="btn-primary">Login</button><p class="auth-links">Belum punya akun? <a href="#" id="showRegisterLink">Daftar</a></p></div></div><div id="registerForm" style="display: none;"><div class="form-group"><label for="newUsername">Username</label><input type="text" id="newUsername" required></div><div class="form-group"><label for="email">Email</label><input type="email" id="email" required></div><div class="form-group"><label for="newPassword">Password</label><input type="password" id="newPassword" required></div><div class="form-group"><label for="confirmPassword">Konfirmasi Password</label><input type="password" id="confirmPassword" required></div><div class="form-actions"><button type="button" id="submitRegisterBtn" class="btn-primary">Daftar</button><p class="auth-links">Sudah punya akun? <a href="#" id="showLoginLink">Login</a></p></div></div></div></div></div>
            <div id="adminLoginModal" class="auth-modal" style="display: none;"><div class="modal-overlay"></div><div class="modal-content" style="max-width: 400px;"><div class="modal-header"><h2 id="adminModalTitle">Login Admin</h2><button class="close-btn">&times;</button></div><div class="modal-body"><form id="adminLoginForm"><div class="form-group"><label for="adminUsername">Username Admin</label><input type="text" id="adminUsername" required></div><div class="form-group"><label for="adminPassword">Password Admin</label><input type="password" id="adminPassword" required></div><div class="form-actions"><button type="submit" id="submitAdminLoginBtn" class="btn-primary">Login</button></div></form></div></div></div>`;
        document.body.insertAdjacentHTML('beforeend', modalsHTML);
    }

    createModals();

    const choiceModal = document.getElementById('loginChoiceModal');
    const authModal = document.getElementById('authModal');
    const adminModal = document.getElementById('adminLoginModal');

    function openModal(modal) { 
        if (modal) modal.style.display = 'block'; 
        document.body.style.overflow = 'hidden'; 
    }

    // --- FUNGSI YANG DIPERBARUI ---
    function closeModal(modal) {
        if (modal) modal.style.display = 'none';

        // Hanya kembalikan scroll jika semua modal sudah tertutup
        if (document.querySelectorAll('.auth-modal[style*="display: block"]').length === 0) {
            document.body.style.overflow = 'auto';
        }

        // --- LOGIKA BARU: REDIRECT JIKA MEMBATALKAN LOGIN WAJIB ---
        const publicPages = ['index.html', ''];
        const currentPage = window.location.pathname.split('/').pop();
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

        // Jika kita menutup modal di halaman yang diproteksi DAN pengguna masih belum login...
        if (!publicPages.includes(currentPage) && !isLoggedIn) {
            // ...maka arahkan kembali ke Beranda.
            window.location.href = 'index.html';
        }
    }

    function updateAuthUI() {
        let authContainer = document.getElementById('authContainer');
        if (!authContainer) {
            const navUl = document.querySelector('.navbar-nav');
            if (navUl) {
                const authLi = document.createElement('li');
                authLi.className = 'nav-item';
                authLi.id = 'authContainer';
                navUl.appendChild(authLi);
                authContainer = authLi; 
            } else { return; }
        }
        const currentUsername = localStorage.getItem('username');
        if (localStorage.getItem('isLoggedIn') === 'true' && currentUsername) {
            authContainer.innerHTML = `<a href="#" id="logoutBtn" class="nav-link">Logout (${currentUsername})</a>`;
            document.getElementById('logoutBtn').addEventListener('click', handleLogoutClick);
        } else {
            authContainer.innerHTML = `<a href="#" id="masterLoginBtn" class="nav-link">Login</a>`;
            document.getElementById('masterLoginBtn').addEventListener('click', () => openModal(choiceModal));
        }
    }

    function handleLogoutClick(e) {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin logout?')) {
            localStorage.removeItem('isLoggedIn'); localStorage.removeItem('username'); localStorage.removeItem('isAdminLoggedIn');
            alert('Anda berhasil logout.');
            updateAuthUI();
            
            const publicPages = ['index.html', ''];
            const currentPage = window.location.pathname.split('/').pop();
            if (!publicPages.includes(currentPage)) {
                window.location.href = 'index.html';
            }
        }
    }

    document.getElementById('choiceUserBtn').addEventListener('click', () => { closeModal(choiceModal); openModal(authModal); });
    document.getElementById('choiceAdminBtn').addEventListener('click', () => { closeModal(choiceModal); openModal(adminModal); });
    
    document.querySelectorAll('.close-btn, .modal-overlay').forEach(el => {
        el.addEventListener('click', (e) => {
            const modal = e.target.closest('.auth-modal');
            if (modal) closeModal(modal);
        });
    });

    const modalTitle = document.getElementById('modalTitle');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    document.getElementById('showRegisterLink').addEventListener('click', (e) => { e.preventDefault(); modalTitle.textContent = 'Daftar User'; loginForm.style.display = 'none'; registerForm.style.display = 'block'; });
    document.getElementById('showLoginLink').addEventListener('click', (e) => { e.preventDefault(); modalTitle.textContent = 'Login User'; loginForm.style.display = 'block'; registerForm.style.display = 'none'; });

    document.getElementById('submitLoginBtn').addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            localStorage.setItem('isLoggedIn', 'true'); localStorage.setItem('username', data.username);
            updateAuthUI();
            closeModal(authModal);
            alert(`Selamat datang kembali, ${data.username}!`);
            location.reload(); 
        } catch (error) {
            alert(`Login Gagal: ${error.message}`);
        }
    });

    document.getElementById('submitRegisterBtn').addEventListener('click', async () => {
        const username = document.getElementById('newUsername').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) return alert('Password dan konfirmasi password tidak cocok!');
        try {
            const response = await fetch(`${API_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            alert('Registrasi berhasil! Silakan login dengan akun baru Anda.');
            modalTitle.textContent = 'Login User'; loginForm.style.display = 'block'; registerForm.style.display = 'none';
        } catch (error) {
            alert(`Registrasi Gagal: ${error.message}`);
        }
    });

    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const enteredUsername = document.getElementById('adminUsername').value;
        const enteredPassword = document.getElementById('adminPassword').value;
        if (enteredUsername === ADMIN_USERNAME && enteredPassword === ADMIN_PASSWORD) {
            alert('Login admin berhasil!');
            localStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = 'admin.html';
        } else {
            alert('Username atau Password Admin Salah!');
        }
    });

    const publicPages = ['index.html', '']; 
    const pathName = window.location.pathname;
    const currentPage = pathName.split('/').pop();
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (!publicPages.includes(currentPage) && !isLoggedIn && !pathName.endsWith('admin.html')) {
        modalTitle.textContent = 'Login User';
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        openModal(authModal);
        setTimeout(() => {
            alert("Anda harus login atau mendaftar terlebih dahulu untuk mengakses halaman ini.");
        }, 150);
    }
    
    if (window.location.pathname.endsWith('admin.html')) {
        if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
            alert('Akses ditolak. Silakan login sebagai admin terlebih dahulu.');
            window.location.href = 'index.html';
        }
    }

    updateAuthUI();
});
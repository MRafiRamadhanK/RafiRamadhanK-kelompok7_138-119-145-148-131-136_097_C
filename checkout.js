document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        alert('Anda harus login untuk checkout.');
        window.location.href = 'index.html';
        return;
    }

    displayCartItems();

    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }

    const deleteForm = document.getElementById('delete-selected-form');
    if (deleteForm) {
        deleteForm.addEventListener('submit', handleDeleteSelected);
    }
});

function getCartFromStorage() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCartToStorage(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function clearCart() {
    if (confirm('Yakin ingin menghapus semua item?')) {
        localStorage.removeItem('cart');
        displayCartItems();
    }
}

function displayCartItems() {
    const cart = getCartFromStorage();
    const container = document.getElementById('cart-items-container');
    const totalElement = document.getElementById('cart-total');
    const checkoutButton = document.querySelector('#checkout-form button[type="submit"]');

    container.innerHTML = '';
    let grandTotal = 0;

    if (cart.length === 0) {
        container.innerHTML = '<p class="text-muted text-center">Keranjang kosong.</p>';
        totalElement.textContent = 'Rp 0';
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Keranjang Kosong';
        document.getElementById('cart-count').textContent = 0;
        return;
    }

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <input type="checkbox" name="selected" value="${index}" style="margin-right:10px;">
            <img src="${item.image}" alt="${item.name}" width="60" class="rounded">
            <div class="cart-item-details">
                <strong>${item.name}</strong>
                <div>
                    <button class="btn btn-sm btn-outline-secondary me-1" onclick="updateQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary ms-1" onclick="updateQuantity(${index}, 1)">+</button>
                </div>
                <div class="text-muted">${item.quantity} x Rp ${item.price.toLocaleString('id-ID')}</div>
            </div>
            <div>
                <strong>Rp ${itemTotal.toLocaleString('id-ID')}</strong>
            </div>
        `;
        container.appendChild(itemElement);
    });

    totalElement.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
    checkoutButton.disabled = false;
    checkoutButton.textContent = 'Buat Pesanan';
    document.getElementById('cart-count').textContent = cart.length;
}

// 🔁 Update jumlah item
function updateQuantity(index, delta) {
    const cart = getCartFromStorage();
    if (!cart[index]) return;

    cart[index].quantity += delta;
    if (cart[index].quantity < 1) cart[index].quantity = 1;

    saveCartToStorage(cart);
    displayCartItems();
}

function handleDeleteSelected(e) {
    e.preventDefault();

    const checked = Array.from(document.querySelectorAll('input[name="selected"]:checked'));
    if (checked.length === 0) {
        alert('Pilih item yang ingin dihapus.');
        return;
    }

    if (!confirm('Yakin ingin menghapus item yang dipilih?')) return;

    const selectedIndexes = checked.map(input => parseInt(input.value));
    let cart = getCartFromStorage();

    // Hapus dari akhir agar index tetap valid
    selectedIndexes.sort((a, b) => b - a).forEach(index => {
        cart.splice(index, 1);
    });

    saveCartToStorage(cart);
    displayCartItems();
}

async function handleCheckout(e) {
    e.preventDefault();
    const submitButton = e.target.querySelector('button');
    submitButton.disabled = true;
    submitButton.textContent = 'Memproses...';

    const customerDetails = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
    };

    const cart = getCartFromStorage();
    const username = localStorage.getItem('username');

    try {
        const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart, customerDetails, username })
        });

        const result = await (response.headers.get('content-type')?.includes('json')
            ? response.json()
            : response.text());

        if (!response.ok) throw new Error(result.error || 'Checkout gagal');

        alert('Pesanan berhasil dibuat!');
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
    } catch (err) {
        alert(`Error: ${err.message}`);
        submitButton.disabled = false;
        submitButton.textContent = 'Buat Pesanan';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initConfirmDelete();
    initSearchForm();
    initCartQuantity();
});

function initConfirmDelete() {
    const deleteButtons = document.querySelectorAll('[data-confirm]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const message = this.getAttribute('data-confirm') || 'Are you sure you want to delete this item?';
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });
}

function initSearchForm() {
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    
    if (searchInput && searchForm) {
        let timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                const searchTerm = searchInput.value.trim();
                const url = new URL(window.location.href);
                url.searchParams.set('search', searchTerm);
                url.searchParams.delete('page');
                window.location.href = url.toString();
            }, 500);
        });
    }
}

function initCartQuantity() {
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const productId = this.getAttribute('data-product-id');
            const quantity = parseInt(this.value);
            
            if (quantity > 0) {
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/cart/update';
                
                const productIdInput = document.createElement('input');
                productIdInput.type = 'hidden';
                productIdInput.name = 'product_id';
                productIdInput.value = productId;
                form.appendChild(productIdInput);
                
                const quantityInput = document.createElement('input');
                quantityInput.type = 'hidden';
                quantityInput.name = 'quantity';
                quantityInput.value = quantity;
                form.appendChild(quantityInput);
                
                document.body.appendChild(form);
                form.submit();
            }
        });
    });
}

function addToCart(productId, quantity = 1) {
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('quantity', quantity);
    
    fetch('/cart/add', {
        method: 'POST',
        body: formData,
        headers: {
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateCartCount(data.cart_count);
            showNotification('Item added to cart!', 'success');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Failed to add item to cart', 'danger');
    });
}

function updateCartCount(count) {
    const cartBadge = document.querySelector('.cart-badge');
    if (cartBadge) {
        cartBadge.textContent = count;
        cartBadge.style.display = count > 0 ? 'inline' : 'none';
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 80px; right: 20px; z-index: 1050; min-width: 250px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function applyFilters() {
    const search = document.getElementById('search')?.value || '';
    const category = document.getElementById('category')?.value || '';
    const minPrice = document.getElementById('min_price')?.value || '';
    const maxPrice = document.getElementById('max_price')?.value || '';
    const inStock = document.getElementById('in_stock')?.checked || false;
    
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (inStock) params.set('in_stock', '1');
    
    window.location.href = '/products?' + params.toString();
}

function clearFilters() {
    window.location.href = '/products';
}

function markServiceComplete(cpId) {
    if (confirm('Are you sure you want to mark this service as completed?')) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `/service-complete/${cpId}`;
        document.body.appendChild(form);
        form.submit();
    }
}

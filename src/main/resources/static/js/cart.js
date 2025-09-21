// Cart functionality
class CartManager {
    constructor() {
        this.userId = this.getUserId();
        this.cart = null;
        this.init();
    }

    getUserId() {
        // For now, using a demo user ID. In real implementation, get from token
        return 1;
    }

    async init() {
        await this.loadCart();
        this.bindEvents();
        this.updateDisplay();
    }

    async loadCart() {
        try {
            this.showLoading(true);
            const response = await fetch(`/api/cart/${this.userId}`);
            if (response.ok) {
                this.cart = await response.json();
            } else {
                // Create empty cart structure if none exists
                this.cart = { items: [], totalAmount: 0, totalItems: 0 };
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            this.showError('Failed to load cart');
        } finally {
            this.showLoading(false);
        }
    }

    bindEvents() {
        // Clear cart button
        document.getElementById('clearCart')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear your cart?')) {
                this.clearCart();
            }
        });

        // Apply promo code
        document.getElementById('applyPromo')?.addEventListener('click', () => {
            this.applyPromoCode();
        });

        // Proceed to checkout
        document.getElementById('proceedToCheckout')?.addEventListener('click', () => {
            if (this.cart.items.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            window.location.href = '/checkout/checkout.html';
        });
    }

    async updateQuantity(productId, quantity) {
        try {
            this.showLoading(true);
            const response = await fetch(`/api/cart/${this.userId}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, quantity })
            });

            if (response.ok) {
                const result = await response.json();
                this.cart = result.data;
                this.updateDisplay();
                this.showSuccess('Cart updated successfully!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to update cart');
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            this.showError('Failed to update cart');
        } finally {
            this.showLoading(false);
        }
    }

    async removeItem(productId) {
        try {
            this.showLoading(true);
            const response = await fetch(`/api/cart/${this.userId}/remove/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                this.cart = result.data;
                this.updateDisplay();
                this.showSuccess('Item removed from cart!');
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to remove item');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            this.showError('Failed to remove item');
        } finally {
            this.showLoading(false);
        }
    }

    async clearCart() {
        try {
            this.showLoading(true);
            const response = await fetch(`/api/cart/${this.userId}/clear`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.cart = { items: [], totalAmount: 0, totalItems: 0 };
                this.updateDisplay();
                this.showSuccess('Cart cleared successfully!');
            } else {
                this.showError('Failed to clear cart');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            this.showError('Failed to clear cart');
        } finally {
            this.showLoading(false);
        }
    }

    async applyPromoCode() {
        const promoCode = document.getElementById('promoCode').value.trim();
        if (!promoCode) {
            this.showPromoMessage('Please enter a promo code', 'error');
            return;
        }

        try {
            const response = await fetch(`/api/cart/${this.userId}/apply-promo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ promoCode })
            });

            if (response.ok) {
                const result = await response.json();
                this.showPromoMessage('Promo code applied successfully!', 'success');
                // Update totals (you'd need to implement discount calculation)
                this.calculateTotals();
            } else {
                const error = await response.json();
                this.showPromoMessage(error.error || 'Invalid promo code', 'error');
            }
        } catch (error) {
            console.error('Error applying promo code:', error);
            this.showPromoMessage('Failed to apply promo code', 'error');
        }
    }

    updateDisplay() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');

        if (!this.cart.items || this.cart.items.length === 0) {
            cartItems.innerHTML = '';
            emptyCart.classList.remove('hidden');
            this.updateTotals(0, 0, 0, 0, 0);
            return;
        }

        emptyCart.classList.add('hidden');

        // Render cart items
        cartItems.innerHTML = this.cart.items.map(item => this.createCartItemHTML(item)).join('');

        // Bind quantity change events
        this.bindCartItemEvents();

        // Calculate and update totals
        this.calculateTotals();
    }

    createCartItemHTML(item) {
        return `
            <div class="cart-item bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div class="flex items-center gap-4">
                    <img src="${item.product.imageUrl || '/images/placeholder.jpg'}" 
                         alt="${item.product.name}" 
                         class="w-20 h-20 object-cover rounded-lg">
                    
                    <div class="flex-1">
                        <h3 class="font-semibold text-gray-800 mb-1">${item.product.name}</h3>
                        <p class="text-gray-600 text-sm mb-2">${item.product.description || ''}</p>
                        <div class="flex items-center justify-between">
                            <p class="text-lg font-bold text-emerald-600">${item.unitPrice.toFixed(2)}</p>
                            <div class="flex items-center gap-3">
                                <div class="flex items-center border border-gray-300 rounded-lg">
                                    <button class="quantity-decrease px-3 py-1 hover:bg-gray-100 rounded-l-lg transition-colors" 
                                            data-product-id="${item.product.id}">
                                        <i class="fas fa-minus text-sm"></i>
                                    </button>
                                    <span class="px-4 py-1 border-l border-r border-gray-300 font-medium">${item.quantity}</span>
                                    <button class="quantity-increase px-3 py-1 hover:bg-gray-100 rounded-r-lg transition-colors" 
                                            data-product-id="${item.product.id}">
                                        <i class="fas fa-plus text-sm"></i>
                                    </button>
                                </div>
                                <button class="remove-item text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors" 
                                        data-product-id="${item.product.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span class="text-gray-600">Subtotal:</span>
                    <span class="text-lg font-bold text-gray-800">${item.subtotal.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    bindCartItemEvents() {
        // Quantity decrease buttons
        document.querySelectorAll('.quantity-decrease').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                const item = this.cart.items.find(item => item.product.id === productId);
                if (item && item.quantity > 1) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });

        // Quantity increase buttons
        document.querySelectorAll('.quantity-increase').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                const item = this.cart.items.find(item => item.product.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });
        });

        // Remove item buttons
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.currentTarget.dataset.productId);
                if (confirm('Remove this item from your cart?')) {
                    this.removeItem(productId);
                }
            });
        });
    }

    calculateTotals() {
        let subtotal = 0;
        let itemCount = 0;

        if (this.cart.items) {
            this.cart.items.forEach(item => {
                subtotal += item.subtotal;
                itemCount += item.quantity;
            });
        }

        const deliveryFee = subtotal >= 50 ? 0 : 5.99;
        const tax = subtotal * 0.08;
        const discount = 0; // Will be calculated based on applied promo codes
        const total = subtotal + deliveryFee + tax - discount;

        this.updateTotals(itemCount, subtotal, deliveryFee, tax, discount, total);
    }

    updateTotals(itemCount, subtotal, deliveryFee, tax, discount, total) {
        // Update all total displays
        const elements = {
            itemCount: document.getElementById('itemCount'),
            subtotal: document.getElementById('subtotal'),
            deliveryFee: document.getElementById('deliveryFee'),
            tax: document.getElementById('tax'),
            discount: document.getElementById('discount'),
            total: document.getElementById('total'),
            discountRow: document.getElementById('discountRow')
        };

        if (elements.itemCount) elements.itemCount.textContent = itemCount;
        if (elements.subtotal) elements.subtotal.textContent = `${subtotal.toFixed(2)}`;
        if (elements.deliveryFee) {
            elements.deliveryFee.textContent = deliveryFee === 0 ? 'FREE' : `${deliveryFee.toFixed(2)}`;
            elements.deliveryFee.parentElement.classList.toggle('text-green-600', deliveryFee === 0);
        }
        if (elements.tax) elements.tax.textContent = `${tax.toFixed(2)}`;
        if (elements.total) elements.total.textContent = `${total.toFixed(2)}`;

        if (discount > 0) {
            if (elements.discount) elements.discount.textContent = `-${discount.toFixed(2)}`;
            if (elements.discountRow) elements.discountRow.classList.remove('hidden');
        } else {
            if (elements.discountRow) elements.discountRow.classList.add('hidden');
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transform translate-x-full transition-transform duration-300 ${
            type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-green-500 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    showPromoMessage(message, type) {
        const promoMessage = document.getElementById('promoMessage');
        if (promoMessage) {
            promoMessage.textContent = message;
            promoMessage.className = `mt-2 text-sm ${
                type === 'error' ? 'text-red-600' : 'text-green-600'
            }`;
        }
    }
}

// Sample product data for demo purposes
const DEMO_PRODUCTS = [
    {
        id: 1,
        name: "Fresh Bananas",
        description: "Organic yellow bananas, sweet and nutritious",
        price: 2.99,
        imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=200",
        stockQuantity: 50,
        category: "Fruits"
    },
    {
        id: 2,
        name: "Whole Milk",
        description: "Fresh whole milk, 1 gallon",
        price: 4.49,
        imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=200",
        stockQuantity: 30,
        category: "Dairy"
    },
    {
        id: 3,
        name: "Sourdough Bread",
        description: "Artisan sourdough bread, freshly baked",
        price: 5.99,
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200",
        stockQuantity: 20,
        category: "Bakery"
    }
];

// Demo function to add items to cart (for testing)
window.addDemoItemToCart = async function(productId) {
    try {
        const response = await fetch(`/api/cart/1/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
                quantity: 1
            })
        });

        if (response.ok) {
            cartManager.loadCart().then(() => {
                cartManager.updateDisplay();
            });
        }
    } catch (error) {
        console.error('Error adding demo item:', error);
    }
};

// Initialize cart manager when page loads
let cartManager;
document.addEventListener('DOMContentLoaded', () => {
    cartManager = new CartManager();

    // Add demo buttons for testing (remove in production)
    if (document.body.dataset.demo !== 'false') {
        addDemoButtons();
    }
});

function addDemoButtons() {
    const demoContainer = document.createElement('div');
    demoContainer.className = 'fixed bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg border z-40';
    demoContainer.innerHTML = `
        <h4 class="font-semibold mb-2">Demo Controls</h4>
        <div class="space-y-2">
            ${DEMO_PRODUCTS.map(product => `
                <button onclick="addDemoItemToCart(${product.id})" 
                        class="block w-full px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors">
                    Add ${product.name}
                </button>
            `).join('')}
        </div>
    `;
    document.body.appendChild(demoContainer);
}
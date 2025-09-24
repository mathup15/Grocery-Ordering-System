class Cart {
    constructor() {
        this.items = this.loadFromStorage();
        this.deliveryFee = 300;
        this.taxRate = 0.12;
    }

    loadFromStorage() {
        const saved = localStorage.getItem('freshmart_cart');
        return saved ? JSON.parse(saved) : [];
    }

    saveToStorage() {
        localStorage.setItem('freshmart_cart', JSON.stringify(this.items));
    }

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: quantity
            });
        }
        
        this.saveToStorage();
        this.updateUI();
        return existingItem ? 'updated' : 'added';
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateUI();
    }

    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = newQuantity;
                this.saveToStorage();
                this.updateUI();
            }
        }
    }

    getSubtotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getTax() {
        return Math.round(this.getSubtotal() * this.taxRate);
    }

    getTotal() {
        return this.getSubtotal() + this.getTax() + this.deliveryFee;
    }

    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateUI();
    }

    updateUI() {
        this.updateCartCount();
        this.updateCartItems();
        this.updateTotals();
    }

    updateCartCount() {
        const cartCount = document.getElementById('cartCount');
        if (cartCount) {
            cartCount.textContent = this.getTotalItems();
        }
    }

    updateCartItems() {
        const cartItems = document.getElementById('cartItems');
        const emptyCart = document.getElementById('emptyCart');
        
        if (!cartItems) return;

        if (this.items.length === 0) {
            cartItems.innerHTML = '';
            if (emptyCart) emptyCart.classList.remove('hidden');
        } else {
            if (emptyCart) emptyCart.classList.add('hidden');
            cartItems.innerHTML = this.items.map(item => `
                <div class="cart-item bg-white rounded-xl p-4 shadow-sm border border-green-100">
                    <div class="flex items-center gap-4">
                        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-800">${item.name}</h4>
                            <p class="text-green-600 font-semibold">LKR ${item.price.toLocaleString()}</p>
                        </div>
                        <div class="flex items-center gap-2">
                            <button class="quantity-btn w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="w-8 text-center font-medium">${item.quantity}</span>
                            <button class="quantity-btn w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="remove-btn text-red-500 hover:text-red-700 transition-colors" onclick="cart.removeItem('${item.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }

    updateTotals() {
        const subtotal = this.getSubtotal();
        const tax = this.getTax();
        const total = this.getTotal();

        const elements = [
            { id: 'subtotal', value: subtotal },
            { id: 'tax', value: tax },
            { id: 'deliveryFee', value: this.deliveryFee },
            { id: 'total', value: total },
            { id: 'sidebarSubtotal', value: subtotal },
            { id: 'sidebarTax', value: tax },
            { id: 'sidebarDeliveryFee', value: this.deliveryFee },
            { id: 'sidebarTotal', value: total }
        ];

        elements.forEach(({ id, value }) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerHTML = `LKR ${value.toLocaleString()}`;
            }
        });
    }
}

window.Cart = Cart;


class GroceryApp {
    constructor() {
        this.cart = new window.Cart();
        this.checkout = new window.Checkout();
        this.currentCategory = '';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.isLoading = false;
        this.filteredProducts = [...window.products];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupCategoryToggle();
        this.renderProducts();
        this.cart.updateUI();
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('viewCartBtn')?.addEventListener('click', () => this.showSection('cart'));
        document.getElementById('continueShopping')?.addEventListener('click', () => this.showSection('products'));
        document.getElementById('emptyCartShopBtn')?.addEventListener('click', () => this.showSection('products'));
        document.getElementById('proceedToCheckout')?.addEventListener('click', () => this.showSection('checkout'));
        document.getElementById('backToShopping')?.addEventListener('click', () => {
            this.showSection('products');
            this.cart.clear();
        });
        
        // Checkout
        document.getElementById('placeOrderBtn')?.addEventListener('click', () => this.placeOrder());
        document.getElementById('downloadInvoice')?.addEventListener('click', () => this.downloadInvoice());
        
        // Search
        document.getElementById('searchInput')?.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => this.filterByCategory(btn.dataset.category));
        });

        // Infinite scroll
        window.addEventListener('scroll', () => this.handleScroll());
    }

    setupCategoryToggle() {
        const toggleBtn = document.getElementById('categoryToggle');
        const sidebar = document.getElementById('categorySidebar');
        const overlay = document.getElementById('categoryOverlay');
        const closeBtn = document.getElementById('closeSidebar');

        if (toggleBtn && sidebar && overlay) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar(true));
            overlay.addEventListener('click', () => this.toggleSidebar(false));
            closeBtn?.addEventListener('click', () => this.toggleSidebar(false));
        }
    }

    toggleSidebar(open) {
        const sidebar = document.getElementById('categorySidebar');
        const overlay = document.getElementById('categoryOverlay');
        
        if (open) {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        } else {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        }
    }

    showSection(section) {
        const sections = ['products', 'cart', 'checkout', 'confirmation'];
        sections.forEach(s => {
            const element = document.getElementById(`${s}Section`);
            if (element) {
                element.classList.toggle('hidden', s !== section);
            }
        });
        
        if (section === 'checkout') {
            this.updateCheckoutSummary();
            // Initialize map when checkout becomes visible
            setTimeout(() => {
                if (!this.checkout.map) {
                    this.checkout.initMap();
                }
            }, 300);
        }
    }

    handleSearch(query) {
        this.filteredProducts = window.products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
        );
        this.currentPage = 1;
        this.renderProducts(true);
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.filteredProducts = category ? 
            window.products.filter(product => product.category === category) : 
            [...window.products];
        
        // Update active category
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        this.currentPage = 1;
        this.renderProducts(true);
        this.toggleSidebar(false);
    }

    renderProducts(reset = false) {
        const container = document.getElementById('productsGrid');
        if (!container) return;

        if (reset) {
            container.innerHTML = '';
            this.currentPage = 1;
        }

        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);

        if (productsToShow.length === 0 && this.currentPage === 1) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="text-6xl mb-4 opacity-60 text-green-500">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                    <p class="text-gray-500">Try adjusting your search or filters</p>
                </div>
            `;
            return;
        }

        const productHTML = productsToShow.map(product => `
            <div class="product-card bg-white rounded-2xl p-4 shadow-md border border-green-100">
                <div class="h-40 overflow-hidden rounded-xl mb-3">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-1">${product.name}</h3>
                <p class="text-gray-600 mb-3 text-sm">${product.description}</p>
                <div class="flex items-center justify-between">
                    <span class="text-xl font-bold text-green-700">LKR ${product.price.toLocaleString()}</span>
                    <button class="add-to-cart-btn bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm" 
                            onclick="app.addToCart('${product.id}')">
                        <i class="fas fa-cart-plus mr-1"></i>Add
                    </button>
                </div>
            </div>
        `).join('');

        container.insertAdjacentHTML('beforeend', productHTML);
        this.hideLoading();
    }

    handleScroll() {
        if (this.isLoading) return;
        
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        
        if (scrollTop + clientHeight >= scrollHeight - 5) {
            this.loadMoreProducts();
        }
    }

    loadMoreProducts() {
        const totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        
        if (this.currentPage >= totalPages) return;
        
        this.isLoading = true;
        this.showLoading();
        
        setTimeout(() => {
            this.currentPage++;
            this.renderProducts();
            this.isLoading = false;
        }, 500);
    }

    showLoading() {
        const container = document.getElementById('productsGrid');
        if (container && !document.getElementById('loadingIndicator')) {
            container.insertAdjacentHTML('afterend', `
                <div id="loadingIndicator" class="loading">
                    <div class="spinner"></div>
                </div>
            `);
        }
    }

    hideLoading() {
        const loading = document.getElementById('loadingIndicator');
        if (loading) {
            loading.remove();
        }
    }

    addToCart(productId) {
        const product = window.products.find(p => p.id === productId);
        if (!product) return;

        const result = this.cart.addItem(product);
        this.showAddToCartFeedback(productId, result);
    }

    showAddToCartFeedback(productId, result) {
        const button = document.querySelector(`button[onclick="app.addToCart('${productId}')"]`);
        if (!button) return;

        const originalHTML = button.innerHTML;
        const message = result === 'updated' ? 'Updated Cart' : 'Added to Cart';
        
        button.innerHTML = `<i class="fas fa-check mr-1"></i>${message}`;
        button.classList.add('bg-green-700');
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('bg-green-700');
            button.disabled = false;
        }, 1500);
    }

    updateCheckoutSummary() {
        const checkoutItems = document.getElementById('checkoutItems');
        if (checkoutItems) {
            checkoutItems.innerHTML = this.cart.items.map(item => `
                <div class="flex items-center gap-3 py-2 border-b border-gray-100">
                    <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded-lg">
                    <div class="flex-1">
                        <h4 class="font-medium text-sm text-gray-800">${item.name}</h4>
                        <p class="text-xs text-gray-500">Qty: ${item.quantity}</p>
                    </div>
                    <span class="text-sm font-semibold text-green-600">LKR ${(item.price * item.quantity).toLocaleString()}</span>
                </div>
            `).join('');
        }

        this.updateCheckoutTotals();
    }
    
    updateCheckoutTotals() {
        const subtotal = this.cart.getSubtotal();
        const tax = this.cart.getTax();
        const deliveryFee = this.cart.deliveryFee;
        const discount = this.checkout.getDiscount();
        const total = subtotal + tax + deliveryFee - discount;

        document.getElementById('checkoutSubtotal').textContent = `LKR ${subtotal.toLocaleString()}`;
        document.getElementById('checkoutTax').textContent = `LKR ${tax.toLocaleString()}`;
        document.getElementById('checkoutTotal').textContent = `LKR ${total.toLocaleString()}`;
        
        // Show/hide discount row
        const existingDiscount = document.getElementById('promoDiscount');
        if (discount > 0) {
            if (!existingDiscount) {
                const discountRow = `
                    <div id="promoDiscount" class="flex justify-between text-green-600">
                        <span>Promo Discount</span>
                        <span>-LKR ${discount.toLocaleString()}</span>
                    </div>
                `;
                document.getElementById('checkoutTax').parentElement.insertAdjacentHTML('afterend', discountRow);
            } else {
                existingDiscount.querySelector('span:last-child').textContent = `-LKR ${discount.toLocaleString()}`;
            }
        } else if (existingDiscount) {
            existingDiscount.remove();
        }
    }



    placeOrder() {
        if (!this.checkout.validateForm()) {
            alert('Please fill in all required fields correctly');
            return;
        }

        const formData = this.checkout.getFormData();
        
        // Generate order number and date
        document.getElementById('orderNumber').textContent = 'FM-' + Math.floor(100000 + Math.random() * 900000);
        document.getElementById('orderDate').textContent = new Date().toLocaleDateString();
        document.getElementById('confirmationTotal').textContent = `LKR ${this.cart.getTotal().toLocaleString()}`;

        this.showSection('confirmation');
    }

    downloadInvoice() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const orderNum = document.getElementById('orderNumber').textContent;
        const date = new Date().toLocaleDateString();
        const total = this.cart.getTotal();
        const subtotal = this.cart.getSubtotal();
        const tax = this.cart.getTax();
        
        // Header with background
        doc.setFillColor(22, 163, 74);
        doc.rect(0, 0, 210, 40, 'F');
        
        // Company logo and name
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
        doc.text('🍃 FreshMart', 20, 25);
        
        doc.setFontSize(12);
        doc.text('Fresh Groceries Delivered to Your Door', 20, 32);
        
        // Invoice title
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('INVOICE', 160, 60);
        
        // Order details box
        doc.setDrawColor(22, 163, 74);
        doc.setLineWidth(0.5);
        doc.rect(20, 70, 170, 30);
        
        doc.setFontSize(12);
        doc.text(`Invoice Number: ${orderNum}`, 25, 80);
        doc.text(`Date: ${date}`, 25, 88);
        doc.text(`Customer Phone: ${document.getElementById('phone')?.value || 'N/A'}`, 25, 96);
        
        // Items table header
        doc.setFillColor(240, 253, 244);
        doc.rect(20, 110, 170, 10, 'F');
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'bold');
        doc.text('Item', 25, 117);
        doc.text('Qty', 120, 117);
        doc.text('Price', 140, 117);
        doc.text('Total', 165, 117);
        
        // Items
        doc.setFont(undefined, 'normal');
        let yPos = 130;
        this.cart.items.forEach(item => {
            doc.text(item.name.substring(0, 30), 25, yPos);
            doc.text(item.quantity.toString(), 125, yPos);
            doc.text(`LKR ${item.price.toLocaleString()}`, 140, yPos);
            doc.text(`LKR ${(item.price * item.quantity).toLocaleString()}`, 165, yPos);
            yPos += 8;
        });
        
        // Totals section
        yPos += 10;
        doc.setDrawColor(200, 200, 200);
        doc.line(120, yPos, 190, yPos);
        
        yPos += 8;
        doc.text('Subtotal:', 140, yPos);
        doc.text(`LKR ${subtotal.toLocaleString()}`, 165, yPos);
        
        yPos += 8;
        doc.text('Tax (12%):', 140, yPos);
        doc.text(`LKR ${tax.toLocaleString()}`, 165, yPos);
        
        yPos += 8;
        doc.text('Delivery:', 140, yPos);
        doc.text('LKR 300', 165, yPos);
        
        yPos += 8;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(14);
        doc.text('TOTAL:', 140, yPos);
        doc.text(`LKR ${total.toLocaleString()}`, 165, yPos);
        
        // Footer
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for choosing FreshMart!', 20, 270);
        doc.text('For support: support@freshmart.lk | +94 11 234 5678', 20, 280);
        
        doc.save(`FreshMart-Invoice-${orderNum}.pdf`);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new window.GroceryApp();
    window.cart = window.app.cart;
});

window.GroceryApp = GroceryApp;
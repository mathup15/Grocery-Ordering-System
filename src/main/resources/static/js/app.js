

class GroceryApp {
    constructor() {
        this.cart = new window.Cart();
        this.checkout = new window.Checkout();
        this.reviews = window.reviewSystem;
        this.wishlist = window.wishlistSystem;
        this.orderTracking = window.orderTrackingSystem;
        this.notifications = window.notificationSystem;
        this.currentCategory = '';
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.isLoading = false;
        this.filteredProducts = [...window.products];
        this.currentProduct = null;
        this.productQuantity = 1;
        this.currentRating = 0;
        this.filters = {
            priceRange: 3000,
            brands: [],
            availability: ['in-stock', 'low-stock'],
            dietary: []
        };
        this.browsingHistory = JSON.parse(localStorage.getItem('browsingHistory') || '[]');
        this.init();
    }

    init() {
        // Ensure products are loaded
        if (!window.products || window.products.length === 0) {
            console.error('Products not loaded');
            return;
        }
        
        this.setupEventListeners();
        this.setupCategoryToggle();
        this.setupAuth();
        this.loadHomepageContent();
        this.renderProducts();
        this.cart.updateUI();
    }

    loadHomepageContent() {
        this.loadDeals();
        this.loadFeaturedProducts();
    }

    loadDeals() {
        const dealsGrid = document.getElementById('dealsGrid');
        if (!dealsGrid) return;
        
        const dealProducts = window.products.slice(0, 4).map(product => ({
            ...product,
            originalPrice: Math.round(product.price * 1.2),
            discount: '20% OFF'
        }));
        
        dealsGrid.innerHTML = dealProducts.map(product => `
            <div class="bg-white border rounded-lg p-4 hover:shadow-md cursor-pointer" onclick="window.app ? window.app.showProductDetail('${product.id}') : openProduct('${product.id}')">
                <img src="${product.image}" alt="${product.name}" class="w-full h-32 object-cover rounded mb-3">
                <div class="text-xs text-green-600 font-semibold mb-1">${product.discount}</div>
                <h3 class="text-sm font-medium mb-2 line-clamp-2">${product.name}</h3>
                <div class="flex items-center gap-2">
                    <span class="text-lg font-bold">LKR ${product.price.toLocaleString()}</span>
                    <span class="text-sm text-gray-500 line-through">LKR ${product.originalPrice.toLocaleString()}</span>
                </div>
            </div>
        `).join('');
    }
    
    loadFeaturedProducts() {
        const featuredGrid = document.getElementById('featuredGrid');
        if (!featuredGrid) return;
        
        const featured = window.products.slice(4, 9);
        
        featuredGrid.innerHTML = featured.map(product => `
            <div class="bg-white border rounded-lg p-4 hover:shadow-md cursor-pointer" onclick="window.app ? window.app.showProductDetail('${product.id}') : openProduct('${product.id}')">
                <img src="${product.image}" alt="${product.name}" class="w-full h-32 object-cover rounded mb-3">
                <h3 class="text-sm font-medium mb-2 line-clamp-2">${product.name}</h3>
                <div class="text-lg font-bold">LKR ${product.price.toLocaleString()}</div>
            </div>
        `).join('');
    }

    setupAuth() {
        const userSection = document.getElementById('userSection');
        const authSection = document.getElementById('authSection');
        const userNameHeader = document.getElementById('userNameHeader');
        const logoutBtn = document.getElementById('logoutBtn');

        if (authManager.isLoggedIn()) {
            const user = authManager.getCurrentUser();
            userSection.classList.remove('hidden');
            authSection.classList.add('hidden');
            userNameHeader.textContent = user.firstName;
        } else {
            userSection.classList.add('hidden');
            authSection.classList.remove('hidden');
        }

        logoutBtn?.addEventListener('click', () => {
            authManager.logout();
        });
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('viewCartBtn')?.addEventListener('click', () => this.showSection('cart'));
        document.getElementById('viewWishlistBtn')?.addEventListener('click', () => this.showSection('wishlist'));
        document.getElementById('trackOrderBtn')?.addEventListener('click', () => this.showSection('orderTracking'));
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
        const searchInput = document.getElementById('searchInput');
        const headerSearch = document.getElementById('headerSearch');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(e.target.value);
                }
            });
        }
        
        if (headerSearch) {
            headerSearch.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
                this.showSection('products');
            });
            headerSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(e.target.value);
                    this.showSection('products');
                }
            });
        }
        
        // Search button in header
        const headerSearchBtn = document.querySelector('.fa-search')?.parentElement;
        if (headerSearchBtn) {
            headerSearchBtn.addEventListener('click', () => {
                const query = headerSearch?.value || '';
                this.handleSearch(query);
                this.showSection('products');
            });
        }
        
        // Category filters
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', () => this.filterByCategory(btn.dataset.category));
        });

        // Rating stars
        document.querySelectorAll('#ratingStars i').forEach(star => {
            star.addEventListener('click', (e) => {
                this.currentRating = parseInt(e.target.dataset.rating);
                this.updateRatingStars();
            });
        });

        // Filter controls
        document.getElementById('priceRange')?.addEventListener('input', (e) => {
            this.filters.priceRange = parseInt(e.target.value);
            document.getElementById('priceValue').textContent = e.target.value;
            this.applyFilters();
        });

        const sortBy = document.getElementById('sortBy');
        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.sortProducts(e.target.value);
            });
        }

        // Filter checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('availability-filter')) {
                this.updateAvailabilityFilter();
            } else if (e.target.classList.contains('dietary-filter')) {
                this.updateDietaryFilter();
            }
        });

        // Infinite scroll
        window.addEventListener('scroll', () => this.handleScroll());
    }

    setupCategoryToggle() {
        // Category toggle functionality removed for Target-style horizontal menu
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
        const sections = ['home', 'products', 'cart', 'checkout', 'confirmation', 'profile', 'productDetail', 'wishlist', 'orderTracking'];
        sections.forEach(s => {
            const element = document.getElementById(`${s}Section`);
            if (element) {
                element.classList.toggle('hidden', s !== section);
            }
        });
        
        if (section === 'checkout') {
            this.updateCheckoutSummary();
            if (authManager.isLoggedIn()) {
                loadCheckoutAddresses();
            }
            setTimeout(() => {
                if (!this.checkout.map) {
                    this.checkout.initMap();
                }
            }, 300);
        } else if (section === 'wishlist') {
            this.wishlist.renderWishlist();
        } else if (section === 'products') {
            this.initializeFilters();
        }
    }

    showProductDetail(productId) {
        const product = window.products.find(p => p.id === productId);
        if (!product) return;

        this.currentProduct = product;
        this.productQuantity = 1;
        this.addToBrowsingHistory(productId);

        // Basic info
        document.getElementById('productDetailName').textContent = product.name;
        document.getElementById('productDetailDescription').textContent = product.description;
        document.getElementById('productDetailPrice').textContent = `LKR ${product.price.toLocaleString()}`;
        document.getElementById('productQuantity').textContent = this.productQuantity;
        document.getElementById('productBrand').textContent = product.brand;

        // Image gallery
        const mainImage = document.getElementById('productDetailImage');
        mainImage.src = product.image;
        mainImage.alt = product.name;
        
        const gallery = document.getElementById('imageGallery');
        if (product.images && product.images.length > 1) {
            gallery.innerHTML = product.images.map((img, index) => `
                <img src="${img}" alt="${product.name} ${index + 1}" 
                     class="w-16 h-16 object-cover rounded cursor-pointer border-2 ${index === 0 ? 'border-green-500' : 'border-gray-200'}" 
                     onclick="app.changeMainImage('${img}', this)">
            `).join('');
        } else {
            gallery.innerHTML = '';
        }

        // Stock info
        const stockCount = document.getElementById('stockCount');
        const stockBar = document.getElementById('stockBar');
        const stockBadge = document.getElementById('stockBadge');
        
        stockCount.textContent = `${product.stock} units available`;
        const stockPercentage = Math.min((product.stock / 50) * 100, 100);
        stockBar.style.width = `${stockPercentage}%`;
        
        const stockColors = {
            'in-stock': 'bg-green-500 text-white',
            'low-stock': 'bg-yellow-500 text-white',
            'out-of-stock': 'bg-red-500 text-white'
        };
        stockBadge.className = `text-sm px-2 py-1 rounded ${stockColors[product.availability]}`;
        stockBadge.textContent = product.availability.replace('-', ' ').toUpperCase();

        // Dietary tags
        const dietaryTags = document.getElementById('dietaryTags');
        dietaryTags.innerHTML = product.dietary.map(tag => 
            `<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">${tag}</span>`
        ).join('');

        // Wishlist button
        const wishlistBtn = document.getElementById('wishlistBtn');
        const isInWishlist = this.wishlist.isInWishlist(productId);
        wishlistBtn.innerHTML = isInWishlist ? '<i class="fas fa-heart text-red-500"></i>' : '<i class="far fa-heart"></i>';
        wishlistBtn.onclick = () => this.toggleWishlist(productId);

        // Add to cart button
        const addBtn = document.getElementById('addToCartDetailBtn');
        if (product.availability === 'out-of-stock') {
            addBtn.innerHTML = '<i class="fas fa-times mr-2"></i>Out of Stock';
            addBtn.className = 'bg-gray-400 cursor-not-allowed text-white px-8 py-3 rounded-lg text-lg font-semibold flex-1';
            addBtn.disabled = true;
        } else {
            addBtn.innerHTML = '<i class="fas fa-cart-plus mr-2"></i>Add to Cart';
            addBtn.className = 'bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold flex-1';
            addBtn.disabled = false;
            addBtn.onclick = () => this.addToCartFromDetail();
        }

        // Load reviews and related products
        this.loadProductReviews(productId);
        this.loadRelatedProducts();

        this.showSection('productDetail');
    }

    changeMainImage(src, thumbnail) {
        document.getElementById('productDetailImage').src = src;
        document.querySelectorAll('#imageGallery img').forEach(img => {
            img.className = img.className.replace('border-green-500', 'border-gray-200');
        });
        thumbnail.className = thumbnail.className.replace('border-gray-200', 'border-green-500');
    }

    loadRelatedProducts() {
        const related = this.getRelatedProducts(this.currentProduct);
        const container = document.getElementById('relatedProducts');
        
        container.innerHTML = related.map(product => `
            <div class="bg-gray-50 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow" onclick="app.showProductDetail('${product.id}')">
                <img src="${product.image}" alt="${product.name}" class="w-full h-24 object-cover rounded mb-2">
                <h4 class="text-sm font-medium mb-1 line-clamp-2">${product.name}</h4>
                <div class="text-green-600 font-semibold text-sm">LKR ${product.price.toLocaleString()}</div>
            </div>
        `).join('');
    }

    increaseQuantity() {
        this.productQuantity++;
        document.getElementById('productQuantity').textContent = this.productQuantity;
    }

    decreaseQuantity() {
        if (this.productQuantity > 1) {
            this.productQuantity--;
            document.getElementById('productQuantity').textContent = this.productQuantity;
        }
    }

    addToCartFromDetail() {
        if (!this.currentProduct) return;

        for (let i = 0; i < this.productQuantity; i++) {
            this.cart.addItem(this.currentProduct);
        }

        const button = document.getElementById('addToCartDetailBtn');
        const originalHTML = button.innerHTML;
        
        button.innerHTML = `<i class="fas fa-check mr-2"></i>Added to Cart`;
        button.classList.add('bg-green-700');
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.classList.remove('bg-green-700');
            button.disabled = false;
        }, 1500);
    }

    goBack() {
        this.showSection('products');
    }

    toggleWishlist(productId) {
        const product = window.products.find(p => p.id === productId);
        if (!product) return;

        if (this.wishlist.isInWishlist(productId)) {
            this.wishlist.removeItem(productId);
        } else {
            this.wishlist.addItem(product);
        }

        // Update button
        const wishlistBtn = document.getElementById('wishlistBtn');
        const isInWishlist = this.wishlist.isInWishlist(productId);
        wishlistBtn.innerHTML = isInWishlist ? '<i class="fas fa-heart text-red-500"></i>' : '<i class="far fa-heart"></i>';
    }

    loadProductReviews(productId) {
        const reviews = this.reviews.getProductReviews(productId);
        const avgRating = this.reviews.getAverageRating(productId);
        
        // Update rating display
        this.reviews.renderStars(Math.round(avgRating), document.getElementById('productRating'));
        document.getElementById('ratingCount').textContent = `(${reviews.length} reviews)`;
        
        // Render reviews list
        const reviewsList = document.getElementById('reviewsList');
        if (reviews.length === 0) {
            reviewsList.innerHTML = '<p class="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>';
        } else {
            reviewsList.innerHTML = reviews.map(review => `
                <div class="border-b pb-4">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="font-medium">${review.author}</span>
                            <div class="flex text-yellow-400 text-sm">
                                ${Array(5).fill().map((_, i) => 
                                    `<i class="fas fa-star ${i < review.rating ? '' : 'text-gray-300'}"></i>`
                                ).join('')}
                            </div>
                        </div>
                        <span class="text-sm text-gray-500">${review.date}</span>
                    </div>
                    <p class="text-gray-700">${review.text}</p>
                </div>
            `).join('');
        }
    }

    showReviewForm() {
        if (!authManager.isLoggedIn()) {
            alert('Please login to write a review');
            return;
        }
        document.getElementById('reviewModal').classList.remove('hidden');
        this.currentRating = 0;
        this.updateRatingStars();
    }

    closeReviewForm() {
        document.getElementById('reviewModal').classList.add('hidden');
        document.getElementById('reviewText').value = '';
    }

    updateRatingStars() {
        document.querySelectorAll('#ratingStars i').forEach((star, index) => {
            star.className = `fas fa-star cursor-pointer ${
                index < this.currentRating ? 'text-yellow-400' : 'text-gray-300'
            }`;
        });
    }

    submitReview() {
        if (!this.currentProduct || this.currentRating === 0) {
            alert('Please select a rating');
            return;
        }

        const reviewText = document.getElementById('reviewText').value.trim();
        if (!reviewText) {
            alert('Please write a review');
            return;
        }

        this.reviews.addReview(this.currentProduct.id, this.currentRating, reviewText);
        this.closeReviewForm();
        this.loadProductReviews(this.currentProduct.id);
        
        this.notifications.sendNotification('Review Submitted', 'Thank you for your review!');
    }

    trackOrder() {
        const orderNumber = document.getElementById('orderTrackingInput').value.trim();
        if (!orderNumber) {
            alert('Please enter an order number');
            return;
        }

        const found = this.orderTracking.renderOrderStatus(orderNumber);
        if (!found) {
            alert('Order not found. Please check your order number.');
        }
    }

    // Filter Methods
    initializeFilters() {
        this.populateBrandFilters();
        this.applyFilters();
    }

    populateBrandFilters() {
        const brands = [...new Set(window.products.map(p => p.brand))];
        const container = document.getElementById('brandFilters');
        if (container) {
            container.innerHTML = brands.map(brand => `
                <label class="flex items-center">
                    <input type="checkbox" class="brand-filter" value="${brand}">
                    <span class="ml-2 text-sm">${brand}</span>
                </label>
            `).join('');
            
            container.addEventListener('change', () => this.updateBrandFilter());
        }
    }

    updateBrandFilter() {
        this.filters.brands = Array.from(document.querySelectorAll('.brand-filter:checked')).map(cb => cb.value);
        this.applyFilters();
    }

    updateAvailabilityFilter() {
        this.filters.availability = Array.from(document.querySelectorAll('.availability-filter:checked')).map(cb => cb.value);
        this.applyFilters();
    }

    updateDietaryFilter() {
        this.filters.dietary = Array.from(document.querySelectorAll('.dietary-filter:checked')).map(cb => cb.value);
        this.applyFilters();
    }

    applyFilters() {
        this.filteredProducts = window.products.filter(product => {
            // Price filter
            if (product.price > this.filters.priceRange) return false;
            
            // Brand filter
            if (this.filters.brands.length > 0 && !this.filters.brands.includes(product.brand)) return false;
            
            // Availability filter
            if (!this.filters.availability.includes(product.availability)) return false;
            
            // Dietary filter
            if (this.filters.dietary.length > 0) {
                const hasMatchingDietary = this.filters.dietary.some(diet => product.dietary.includes(diet));
                if (!hasMatchingDietary) return false;
            }
            
            // Category filter
            if (this.currentCategory && product.category !== this.currentCategory) return false;
            
            return true;
        });
        
        this.updateProductCount();
        this.renderProducts(true);
    }

    updateProductCount() {
        const count = this.filteredProducts.length;
        const total = window.products.length;
        const countElement = document.getElementById('productCount');
        if (countElement) {
            if (count === total) {
                countElement.textContent = `Showing all ${count} products`;
            } else {
                countElement.textContent = `Showing ${count} of ${total} products`;
            }
        }
    }

    sortProducts(sortBy) {
        switch (sortBy) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'stock':
                this.filteredProducts.sort((a, b) => b.stock - a.stock);
                break;
            case 'name':
            default:
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
        this.currentPage = 1;
        this.renderProducts(true);
    }

    clearFilters() {
        this.filters = {
            priceRange: 3000,
            brands: [],
            availability: ['in-stock', 'low-stock'],
            dietary: []
        };
        
        // Reset UI
        document.getElementById('priceRange').value = 3000;
        document.getElementById('priceValue').textContent = '3000';
        document.querySelectorAll('.brand-filter').forEach(cb => cb.checked = false);
        document.querySelectorAll('.dietary-filter').forEach(cb => cb.checked = false);
        document.querySelectorAll('.availability-filter').forEach((cb, i) => cb.checked = i < 2);
        
        this.applyFilters();
    }

    getStockBadge(product) {
        const badges = {
            'in-stock': '<div class="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">In Stock</div>',
            'low-stock': '<div class="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">Low Stock</div>',
            'out-of-stock': '<div class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">Out of Stock</div>'
        };
        return badges[product.availability] || '';
    }

    // Enhanced Product Detail Methods
    addToBrowsingHistory(productId) {
        this.browsingHistory = this.browsingHistory.filter(id => id !== productId);
        this.browsingHistory.unshift(productId);
        this.browsingHistory = this.browsingHistory.slice(0, 10);
        localStorage.setItem('browsingHistory', JSON.stringify(this.browsingHistory));
    }

    getRelatedProducts(currentProduct) {
        // Get products from same category or with similar dietary preferences
        const related = window.products.filter(p => 
            p.id !== currentProduct.id && (
                p.category === currentProduct.category ||
                p.dietary.some(diet => currentProduct.dietary.includes(diet))
            )
        ).slice(0, 4);
        
        return related;
    }

    handleSearch(query) {
        if (!query || query.trim() === '') {
            this.filteredProducts = [...window.products];
        } else {
            const searchTerm = query.toLowerCase().trim();
            this.filteredProducts = window.products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm) ||
                (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
                (product.dietary && product.dietary.some(diet => diet.toLowerCase().includes(searchTerm)))
            );
        }
        
        this.currentPage = 1;
        this.updateProductCount();
        this.renderProducts(true);
        
        // Update search input values to stay in sync
        const searchInput = document.getElementById('searchInput');
        const headerSearch = document.getElementById('headerSearch');
        if (searchInput && searchInput.value !== query) searchInput.value = query;
        if (headerSearch && headerSearch.value !== query) headerSearch.value = query;
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
        
        // Show products section
        this.showSection('products');
    }

    renderProducts(reset = false) {
        const container = document.getElementById('productsGrid');
        if (!container) {
            console.error('Products grid container not found');
            return;
        }

        if (!this.filteredProducts || this.filteredProducts.length === 0) {
            console.error('No filtered products available');
            return;
        }

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

        const productHTML = productsToShow.map(product => {
            const stockBadge = this.getStockBadge(product);
            const dietaryTags = product.dietary.slice(0, 2).map(tag => 
                `<span class="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">${tag}</span>`
            ).join('');
            
            return `
                <div class="product-card bg-white rounded-2xl p-4 shadow-md border border-green-100 cursor-pointer hover:shadow-lg transition-shadow ${product.availability === 'out-of-stock' ? 'opacity-60' : ''}" onclick="app.showProductDetail('${product.id}')">
                    <div class="relative h-40 overflow-hidden rounded-xl mb-3">
                        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                        ${stockBadge}
                    </div>
                    <div class="flex flex-wrap gap-1 mb-2">${dietaryTags}</div>
                    <h3 class="text-lg font-semibold text-gray-800 mb-1">${product.name}</h3>
                    <p class="text-gray-600 mb-3 text-sm line-clamp-2">${product.description}</p>
                    <div class="flex items-center justify-between">
                        <div>
                            <span class="text-xl font-bold text-green-700">LKR ${product.price.toLocaleString()}</span>
                            <div class="text-xs text-gray-500">Stock: ${product.stock}</div>
                        </div>
                        <button class="add-to-cart-btn ${product.availability === 'out-of-stock' ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'} text-white px-3 py-2 rounded-lg text-sm" 
                                onclick="event.stopPropagation(); ${product.availability === 'out-of-stock' ? '' : `app.addToCart('${product.id}')`}" 
                                ${product.availability === 'out-of-stock' ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus mr-1"></i>${product.availability === 'out-of-stock' ? 'Out of Stock' : 'Add'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

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
        const orderNumber = 'FM-' + Math.floor(100000 + Math.random() * 900000);
        const orderDate = new Date().toISOString();
        const total = this.cart.getTotal();
        
        // Save order to user's history if logged in
        if (authManager.isLoggedIn()) {
            const orderData = {
                id: orderNumber,
                items: [...this.cart.items],
                total: total,
                subtotal: this.cart.getSubtotal(),
                tax: this.cart.getTax(),
                deliveryFee: this.cart.deliveryFee,
                address: formData.address,
                paymentMethod: formData.paymentMethod,
                status: 'Confirmed',
                createdAt: orderDate
            };
            
            authManager.addToOrderHistory(orderData);
            this.orderTracking.addOrder(orderData);
            this.notifications.sendOrderNotification(orderNumber, 'confirmed');
        }
        
        // Generate order number and date
        document.getElementById('orderNumber').textContent = orderNumber;
        document.getElementById('orderDate').textContent = new Date().toLocaleDateString();
        document.getElementById('confirmationTotal').textContent = `LKR ${total.toLocaleString()}`;

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

// Initialize app when DOM is loaded and all dependencies are ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure all scripts are loaded
    setTimeout(() => {
        if (window.products && window.reviewSystem && window.wishlistSystem) {
            window.app = new window.GroceryApp();
            window.cart = window.app.cart;
        } else {
            console.error('Dependencies not loaded, retrying...');
            // Retry after a short delay
            setTimeout(() => {
                window.app = new window.GroceryApp();
                window.cart = window.app.cart;
            }, 500);
        }
    }, 100);
});

window.GroceryApp = GroceryApp;
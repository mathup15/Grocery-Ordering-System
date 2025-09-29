// Reviews & Ratings System
class ReviewSystem {
    constructor() {
        this.reviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
        this.currentRating = 0;
    }

    getProductReviews(productId) {
        return this.reviews[productId] || [];
    }

    addReview(productId, rating, text) {
        if (!this.reviews[productId]) {
            this.reviews[productId] = [];
        }
        
        const review = {
            id: Date.now(),
            rating,
            text,
            author: authManager.isLoggedIn() ? authManager.getCurrentUser().firstName : 'Anonymous',
            date: new Date().toLocaleDateString()
        };
        
        this.reviews[productId].push(review);
        this.saveReviews();
        return review;
    }

    getAverageRating(productId) {
        const reviews = this.getProductReviews(productId);
        if (reviews.length === 0) return 0;
        
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (sum / reviews.length).toFixed(1);
    }

    saveReviews() {
        localStorage.setItem('productReviews', JSON.stringify(this.reviews));
    }

    renderStars(rating, container) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(`<i class="fas fa-star ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}"></i>`);
        }
        container.innerHTML = stars.join('');
    }
}

// Wishlist System
class WishlistSystem {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('wishlist') || '[]');
        this.updateUI();
    }

    addItem(product) {
        if (!this.isInWishlist(product.id)) {
            this.items.push(product);
            this.saveWishlist();
            this.updateUI();
            this.showNotification(`${product.name} added to wishlist`, 'success');
            return true;
        }
        return false;
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveWishlist();
        this.updateUI();
        this.showNotification('Item removed from wishlist', 'info');
    }

    isInWishlist(productId) {
        return this.items.some(item => item.id === productId);
    }

    saveWishlist() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    }

    updateUI() {
        const countElement = document.getElementById('wishlistCount');
        if (countElement) {
            countElement.textContent = this.items.length;
            countElement.classList.toggle('hidden', this.items.length === 0);
        }
    }

    showNotification(message, type) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('FreshMart', { body: message, icon: '/favicon.ico' });
        }
    }

    renderWishlist() {
        const container = document.getElementById('wishlistGrid');
        const emptyState = document.getElementById('emptyWishlist');
        
        if (this.items.length === 0) {
            container.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }
        
        container.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        container.innerHTML = this.items.map(item => `
            <div class="bg-white rounded-2xl p-4 shadow-md border border-green-100">
                <div class="h-40 overflow-hidden rounded-xl mb-3">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
                </div>
                <h3 class="text-lg font-semibold text-gray-800 mb-1">${item.name}</h3>
                <div class="text-xl font-bold text-green-700 mb-3">LKR ${item.price.toLocaleString()}</div>
                <div class="flex gap-2">
                    <button onclick="window.app ? window.app.addToCart('${item.id}') : addToCartSimple('${item.id}')" class="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700">
                        <i class="fas fa-cart-plus mr-1"></i>Add to Cart
                    </button>
                    <button onclick="window.app ? (window.app.wishlist.removeItem('${item.id}'), window.app.wishlist.renderWishlist()) : removeFromWishlistSimple('${item.id}')" class="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Order Tracking System
class OrderTrackingSystem {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('orderTracking') || '{}');
    }

    addOrder(orderData) {
        this.orders[orderData.id] = {
            ...orderData,
            status: 'confirmed',
            statusHistory: [
                { status: 'confirmed', timestamp: new Date().toISOString(), message: 'Order confirmed' }
            ]
        };
        this.saveOrders();
        
        // Simulate order progression
        setTimeout(() => this.updateOrderStatus(orderData.id, 'preparing'), 30000);
        setTimeout(() => this.updateOrderStatus(orderData.id, 'shipped'), 120000);
        setTimeout(() => this.updateOrderStatus(orderData.id, 'delivered'), 300000);
    }

    updateOrderStatus(orderId, status) {
        if (this.orders[orderId]) {
            this.orders[orderId].status = status;
            this.orders[orderId].statusHistory.push({
                status,
                timestamp: new Date().toISOString(),
                message: this.getStatusMessage(status)
            });
            this.saveOrders();
            
            // Send notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('Order Update', {
                    body: `Order ${orderId}: ${this.getStatusMessage(status)}`,
                    icon: '/favicon.ico'
                });
            }
        }
    }

    getStatusMessage(status) {
        const messages = {
            confirmed: 'Order confirmed and received',
            preparing: 'Order is being prepared',
            shipped: 'Order is out for delivery',
            delivered: 'Order delivered successfully'
        };
        return messages[status] || 'Status updated';
    }

    getOrder(orderId) {
        return this.orders[orderId];
    }

    saveOrders() {
        localStorage.setItem('orderTracking', JSON.stringify(this.orders));
    }

    renderOrderStatus(orderId) {
        const order = this.getOrder(orderId);
        if (!order) return false;

        document.getElementById('trackedOrderNumber').textContent = orderId;
        document.getElementById('trackedOrderDate').textContent = new Date(order.createdAt).toLocaleDateString();
        document.getElementById('trackedOrderTotal').textContent = `LKR ${order.total.toLocaleString()}`;

        // Update status steps
        const steps = ['confirmed', 'preparing', 'shipped', 'delivered'];
        const currentIndex = steps.indexOf(order.status);

        steps.forEach((step, index) => {
            const stepElement = document.querySelector(`[data-step="${step}"]`);
            const circle = stepElement.querySelector('div');
            const text = stepElement.querySelectorAll('div')[1];

            if (index <= currentIndex) {
                circle.className = 'w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center';
                text.querySelector('div').className = 'font-medium';
                text.querySelector('div:last-child').className = 'text-sm text-gray-500';
            } else {
                circle.className = 'w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center';
                text.querySelector('div').className = 'font-medium text-gray-500';
                text.querySelector('div:last-child').className = 'text-sm text-gray-400';
            }
        });

        document.getElementById('orderTrackingResult').classList.remove('hidden');
        return true;
    }
}

// Push Notifications System
class NotificationSystem {
    constructor() {
        this.requestPermission();
    }

    async requestPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notifications enabled');
            }
        }
    }

    sendNotification(title, body, icon = '/favicon.ico') {
        if ('Notification' in window && Notification.permission === 'granted') {
            return new Notification(title, { body, icon });
        }
    }

    sendOrderNotification(orderId, status) {
        const messages = {
            confirmed: 'Your order has been confirmed!',
            preparing: 'Your order is being prepared',
            shipped: 'Your order is out for delivery',
            delivered: 'Your order has been delivered!'
        };
        
        this.sendNotification('FreshMart Order Update', `${messages[status]} (Order: ${orderId})`);
    }
}

// Initialize systems safely
function initializeFeatures() {
    window.reviewSystem = new ReviewSystem();
    window.wishlistSystem = new WishlistSystem();
    window.orderTrackingSystem = new OrderTrackingSystem();
    window.notificationSystem = new NotificationSystem();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFeatures);
} else {
    initializeFeatures();
}
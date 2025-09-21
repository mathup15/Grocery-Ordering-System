// Checkout functionality
class CheckoutManager {
    constructor() {
        this.currentStep = 1;
        this.userId = this.getUserId();
        this.cart = null;
        this.orderData = {
            deliveryAddress: '',
            deliveryInstructions: '',
            preferredDeliveryTime: null,
            paymentMethod: '',
            promoCode: ''
        };
        this.init();
    }

    getUserId() {
        // For now, using a demo user ID. In real implementation, get from token
        return 1;
    }

    async init() {
        await this.loadCart();
        this.bindEvents();
        this.updateOrderSummary();
        this.setMinDeliveryDate();
    }

    async loadCart() {
        try {
            const response = await fetch(`/api/cart/${this.userId}`);
            if (response.ok) {
                this.cart = await response.json();
                if (!this.cart.items || this.cart.items.length === 0) {
                    alert('Your cart is empty!');
                    window.location.href = '/checkout/cart.html';
                    return;
                }
            } else {
                throw new Error('Failed to load cart');
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            alert('Error loading cart. Please try again.');
            window.location.href = '/checkout/cart.html';
        }
    }

    bindEvents() {
        // Step navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('backBtn').addEventListener('click', () => this.prevStep());
        document.getElementById('placeOrderBtn').addEventListener('click', () => this.placeOrder());

        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', (e) => this.selectPaymentMethod(e.currentTarget));
        });

        // Promo code application
        document.getElementById('sidebarApplyPromo').addEventListener('click', () => this.applyPromoCode());

        // Form validation on input
        this.bindFormValidation();

        // Card number formatting
        this.bindCardFormatting();
    }

    bindFormValidation() {
        const inputs = ['streetAddress', 'city', 'postalCode'];
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.validateStep1());
            }
        });
    }

    bindCardFormatting() {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');

        if (cardNumber) {
            cardNumber.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
                let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
                e.target.value = formattedValue;
            });
        }

        if (expiryDate) {
            expiryDate.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                if (value.length >= 2) {
                    value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
                e.target.value = value;
            });
        }

        if (cvv) {
            cvv.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/gi, '');
            });
        }
    }

    setMinDeliveryDate() {
        const deliveryDate = document.getElementById('deliveryDate');
        if (deliveryDate) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            deliveryDate.min = tomorrow.toISOString().split('T')[0];
        }
    }

    nextStep() {
        if (this.currentStep === 1) {
            if (!this.validateStep1()) {
                this.showError('Please fill in all required delivery information.');
                return;
            }
            this.saveDeliveryInfo();
        } else if (this.currentStep === 2) {
            if (!this.validateStep2()) {
                this.showError('Please select a payment method and fill in required information.');
                return;
            }
            this.savePaymentInfo();
            this.populateReviewStep();
        }

        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Update step indicator
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.remove('active', 'completed', 'inactive');

            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
            } else {
                step.classList.add('inactive');
            }
        });

        // Show/hide step content
        document.querySelectorAll('.checkout-step').forEach((stepContent, index) => {
            stepContent.classList.toggle('hidden', index + 1 !== this.currentStep);
        });

        // Update navigation buttons
        const backBtn = document.getElementById('backBtn');
        const nextBtn = document.getElementById('nextBtn');
        const placeOrderBtn = document.getElementById('placeOrderBtn');

        backBtn.classList.toggle('hidden', this.currentStep === 1);
        nextBtn.classList.toggle('hidden', this.currentStep === 3);
        placeOrderBtn.classList.toggle('hidden', this.currentStep !== 3);
    }

    validateStep1() {
        const required = ['streetAddress', 'city', 'postalCode'];
        return required.every(id => {
            const element = document.getElementById(id);
            return element && element.value.trim() !== '';
        });
    }

    validateStep2() {
        if (!this.orderData.paymentMethod) {
            return false;
        }

        if (this.orderData.paymentMethod === 'card') {
            const required = ['cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
            return required.every(id => {
                const element = document.getElementById(id);
                return element && element.value.trim() !== '';
            });
        }

        return true;
    }

    saveDeliveryInfo() {
        const addressParts = [
            document.getElementById('streetAddress').value,
            document.getElementById('city').value,
            document.getElementById('postalCode').value
        ].filter(part => part.trim());

        this.orderData.deliveryAddress = addressParts.join(', ');
        this.orderData.deliveryInstructions = document.getElementById('deliveryInstructions').value;

        const date = document.getElementById('deliveryDate').value;
        const time = document.getElementById('deliveryTime').value;
        if (date && time) {
            const [startTime] = time.split('-');
            this.orderData.preferredDeliveryTime = `${date}T${startTime}:00`;
        }
    }

    savePaymentInfo() {
        // Payment method is already saved when selected
    }

    selectPaymentMethod(methodElement) {
        // Remove previous selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.classList.remove('selected');
        });

        // Select current method
        methodElement.classList.add('selected');
        this.orderData.paymentMethod = methodElement.dataset.method;

        // Show/hide card form
        const cardForm = document.getElementById('cardForm');
        if (cardForm) {
            cardForm.classList.toggle('hidden', this.orderData.paymentMethod !== 'card');
        }
    }

    populateReviewStep() {
        // Populate order items
        const reviewItems = document.getElementById('reviewItems');
        reviewItems.innerHTML = this.cart.items.map(item => `
            <div class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                <div class="flex items-center gap-3">
                    <img src="${item.product.imageUrl || '/images/placeholder.jpg'}" 
                         alt="${item.product.name}" 
                         class="w-12 h-12 object-cover rounded-lg">
                    <div>
                        <h4 class="font-medium text-gray-800">${item.product.name}</h4>
                        <p class="text-sm text-gray-600">Qty: ${item.quantity}</p>
                    </div>
                </div>
                <span class="font-semibold text-gray-800">$${item.subtotal.toFixed(2)}</span>
            </div>
        `).join('');

        // Populate delivery details
        const reviewDelivery = document.getElementById('reviewDelivery');
        reviewDelivery.innerHTML = `
            <p><strong>Address:</strong> ${this.orderData.deliveryAddress}</p>
            <p><strong>Instructions:</strong> ${this.orderData.deliveryInstructions || 'None'}</p>
            <p><strong>Preferred Time:</strong> ${this.orderData.preferredDeliveryTime ?
            new Date(this.orderData.preferredDeliveryTime).toLocaleDateString() + ' ' +
            new Date(this.orderData.preferredDeliveryTime).toLocaleTimeString() : 'Any time'}</p>
        `;

        // Populate payment details
        const reviewPayment = document.getElementById('reviewPayment');
        const paymentText = {
            'card': 'Credit Card',
            'paypal': 'PayPal',
            'cod': 'Cash on Delivery'
        };
        reviewPayment.innerHTML = `<p><strong>Payment Method:</strong> ${paymentText[this.orderData.paymentMethod]}</p>`;
    }

    async applyPromoCode() {
        const promoCode = document.getElementById('sidebarPromoCode').value.trim();
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
                this.orderData.promoCode = promoCode;
                this.showPromoMessage('Promo code applied successfully!', 'success');
                this.updateOrderSummary();
            } else {
                const error = await response.json();
                this.showPromoMessage(error.error || 'Invalid promo code', 'error');
            }
        } catch (error) {
            console.error('Error applying promo code:', error);
            this.showPromoMessage('Failed to apply promo code', 'error');
        }
    }

    updateOrderSummary() {
        if (!this.cart || !this.cart.items) return;

        // Calculate totals
        let subtotal = 0;
        this.cart.items.forEach(item => {
            subtotal += item.subtotal;
        });

        const deliveryFee = subtotal >= 50 ? 0 : 5.99;
        const tax = subtotal * 0.08;
        const discount = this.calculateDiscount(subtotal);
        const total = subtotal + deliveryFee + tax - discount;

        // Update sidebar items
        const sidebarItems = document.getElementById('sidebarItems');
        sidebarItems.innerHTML = this.cart.items.map(item => `
            <div class="cart-item">
                <img src="${item.product.imageUrl || '/images/placeholder.jpg'}" 
                     alt="${item.product.name}" 
                     class="item-image">
                <div class="item-details">
                    <div class="item-name">${item.product.name}</div>
                    <div class="item-price">$${item.unitPrice.toFixed(2)} each</div>
                </div>
                <div class="item-quantity">×${item.quantity}</div>
            </div>
        `).join('');

        // Update totals
        document.getElementById('sidebarSubtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('sidebarDeliveryFee').textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
        document.getElementById('sidebarTax').textContent = `$${tax.toFixed(2)}`;
        document.getElementById('sidebarTotal').textContent = `$${total.toFixed(2)}`;

        // Handle discount display
        const discountRow = document.getElementById('sidebarDiscountRow');
        if (discount > 0) {
            document.getElementById('sidebarDiscount').textContent = `-$${discount.toFixed(2)}`;
            discountRow.classList.remove('hidden');
        } else {
            discountRow.classList.add('hidden');
        }
    }

    calculateDiscount(subtotal) {
        if (!this.orderData.promoCode) return 0;

        switch (this.orderData.promoCode.toUpperCase()) {
            case 'SAVE10':
                return subtotal * 0.10;
            case 'FIRST20':
                return subtotal * 0.20;
            case 'WELCOME5':
                return Math.min(5.00, subtotal);
            default:
                return 0;
        }
    }

    async placeOrder() {
        try {
            this.showLoading(true);

            // Prepare order data
            const orderRequest = {
                deliveryAddress: this.orderData.deliveryAddress,
                deliveryInstructions: this.orderData.deliveryInstructions,
                preferredDeliveryTime: this.orderData.preferredDeliveryTime,
                paymentMethod: this.orderData.paymentMethod.toUpperCase(),
                promoCode: this.orderData.promoCode
            };

            const response = await fetch(`/api/orders/${this.userId}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderRequest)
            });

            if (response.ok) {
                const result = await response.json();
                const order = result.data;

                // Redirect to confirmation page
                window.location.href = `/checkout/order-confirmation.html?orderNumber=${order.orderNumber}`;
            } else {
                const error = await response.json();
                this.showError(error.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            this.showError('Failed to place order. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');

            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorElement.classList.add('hidden');
            }, 5000);
        }
    }

    showSuccess(message) {
        const successElement = document.getElementById('successMessage');
        if (successElement) {
            successElement.textContent = message;
            successElement.classList.remove('hidden');

            // Auto-hide after 5 seconds
            setTimeout(() => {
                successElement.classList.add('hidden');
            }, 5000);
        }
    }

    showPromoMessage(message, type) {
        const promoMessage = document.getElementById('sidebarPromoMessage');
        if (promoMessage) {
            promoMessage.textContent = message;
            promoMessage.className = `mt-2 text-sm ${
                type === 'error' ? 'text-red-600' : 'text-green-600'
            }`;
        }
    }
}

// Initialize checkout manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new CheckoutManager();
});
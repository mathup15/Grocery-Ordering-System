class Checkout {
    constructor() {
        this.selectedPaymentMethod = 'card';
        this.map = null;
        this.marker = null;
        this.promoCodes = {
            'FRESH10': { discount: 10, type: 'percentage', description: '10% off your order' },
            'SAVE500': { discount: 500, type: 'fixed', description: 'LKR 500 off' },
            'NEWUSER': { discount: 15, type: 'percentage', description: '15% off for new users' }
        };
        this.appliedPromo = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initMap();
    }

    setupEventListeners() {
        // Province change
        document.getElementById('province')?.addEventListener('change', (e) => {
            this.populateDistricts(e.target.value);
        });

        // District change
        document.getElementById('district')?.addEventListener('change', (e) => {
            this.populateCities(e.target.value);
        });

        // Payment method selection
        document.querySelectorAll('.payment-method').forEach(method => {
            method.addEventListener('click', () => {
                this.selectPaymentMethod(method.dataset.method);
            });
        });

        // Promo code
        document.getElementById('applyPromo')?.addEventListener('click', () => {
            this.applyPromoCode();
        });
        
        document.getElementById('removePromo')?.addEventListener('click', () => {
            this.removePromoCode();
        });

        // Card form validation
        this.setupCardValidation();

        // Location features
        document.getElementById('useCurrentLocation')?.addEventListener('click', () => {
            this.getCurrentLocation();
        });
        
        document.getElementById('selectOnMap')?.addEventListener('click', () => {
            this.enableMapSelection();
        });
        
        document.getElementById('addressSearch')?.addEventListener('input', (e) => {
            this.searchAddress(e.target.value);
        });

        // Form validation
        this.setupValidation();
    }

    populateDistricts(province) {
        const districtSelect = document.getElementById('district');
        const citySelect = document.getElementById('city');
        
        // Reset districts and cities
        districtSelect.innerHTML = '<option value="">Select District</option>';
        citySelect.innerHTML = '<option value="">Select City</option>';
        citySelect.disabled = true;
        
        if (province && window.locationData[province]) {
            districtSelect.disabled = false;
            Object.keys(window.locationData[province]).forEach(district => {
                const option = document.createElement('option');
                option.value = district;
                option.textContent = district.charAt(0).toUpperCase() + district.slice(1).replace(/-/g, ' ');
                districtSelect.appendChild(option);
            });
        } else {
            districtSelect.disabled = true;
        }
    }

    populateCities(district) {
        const provinceSelect = document.getElementById('province');
        const citySelect = document.getElementById('city');
        const province = provinceSelect.value;
        
        citySelect.innerHTML = '<option value="">Select City</option>';
        
        if (province && district && window.locationData[province] && window.locationData[province][district]) {
            citySelect.disabled = false;
            window.locationData[province][district].forEach(city => {
                const option = document.createElement('option');
                option.value = city.toLowerCase().replace(/\s+/g, '-');
                option.textContent = city;
                citySelect.appendChild(option);
            });
        } else {
            citySelect.disabled = true;
        }
    }

    selectPaymentMethod(method) {
        this.selectedPaymentMethod = method;
        
        document.querySelectorAll('.payment-method').forEach(m => {
            m.classList.remove('selected', 'border-green-500', 'bg-green-50');
            m.classList.add('border-gray-200');
            m.querySelector('i').classList.remove('text-green-600');
            m.querySelector('i').classList.add('text-gray-600');
        });

        const selectedMethod = document.querySelector(`[data-method="${method}"]`);
        selectedMethod.classList.add('selected', 'border-green-500', 'bg-green-50');
        selectedMethod.classList.remove('border-gray-200');
        selectedMethod.querySelector('i').classList.add('text-green-600');
        selectedMethod.querySelector('i').classList.remove('text-gray-600');
        
        this.showCardForm(method === 'card');
    }

    applyPromoCode() {
        const promoInput = document.getElementById('promoCode');
        const promoMessage = document.getElementById('promoMessage');
        const applyBtn = document.getElementById('applyPromo');
        const removeBtn = document.getElementById('removePromo');
        const code = promoInput.value.toUpperCase();

        if (this.promoCodes[code]) {
            this.appliedPromo = this.promoCodes[code];
            promoMessage.textContent = `✓ ${this.promoCodes[code].description} applied!`;
            promoMessage.className = 'text-sm mt-1 text-green-600';
            promoInput.disabled = true;
            applyBtn.classList.add('hidden');
            removeBtn.classList.remove('hidden');
            
            // Update totals in app
            if (window.app) {
                window.app.updateCheckoutTotals();
            }
        } else {
            promoMessage.textContent = 'Invalid promo code';
            promoMessage.className = 'text-sm mt-1 text-red-500';
        }
        promoMessage.classList.remove('hidden');
    }
    
    removePromoCode() {
        const promoInput = document.getElementById('promoCode');
        const promoMessage = document.getElementById('promoMessage');
        const applyBtn = document.getElementById('applyPromo');
        const removeBtn = document.getElementById('removePromo');
        
        this.appliedPromo = null;
        promoInput.value = '';
        promoInput.disabled = false;
        promoMessage.classList.add('hidden');
        applyBtn.classList.remove('hidden');
        removeBtn.classList.add('hidden');
        
        // Update totals in app
        if (window.app) {
            window.app.updateCheckoutTotals();
        }
    }

    setupCardValidation() {
        const cardNumber = document.getElementById('cardNumber');
        const expiryDate = document.getElementById('expiryDate');
        const cvv = document.getElementById('cvv');
        const cardholderName = document.getElementById('cardholderName');

        cardNumber?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });

        expiryDate?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
            
            // Validate expiry date
            if (value.length === 5) {
                const [month, year] = value.split('/');
                const currentDate = new Date();
                const currentYear = currentDate.getFullYear() % 100;
                const currentMonth = currentDate.getMonth() + 1;
                
                if (parseInt(month) < 1 || parseInt(month) > 12 || 
                    parseInt(year) < currentYear || 
                    (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
                    this.showFieldError(e.target, 'Invalid or expired date');
                } else {
                    this.clearFieldError(e.target);
                }
            }
        });

        cvv?.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
        
        cardholderName?.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
        });
    }
    
    showFieldError(element, message) {
        element.classList.add('error');
        const errorDiv = element.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }
    
    clearFieldError(element) {
        element.classList.remove('error');
        const errorDiv = element.parentNode.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }

    showCardForm(show) {
        const cardForm = document.getElementById('cardForm');
        if (cardForm) {
            cardForm.style.display = show ? 'block' : 'none';
        }
    }

    initMap() {
        if (this.map) return true;
        
        if (typeof L === 'undefined') {
            console.error('Leaflet not loaded');
            return false;
        }
        
        const mapElement = document.getElementById('map');
        if (!mapElement) {
            console.error('Map element not found');
            return false;
        }
        
        try {
            this.map = L.map('map').setView([7.8731, 80.7718], 8);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);
            
            L.control.scale().addTo(this.map);
            
            setTimeout(() => {
                if (this.map) this.map.invalidateSize();
            }, 200);
            
            console.log('Map initialized');
            return true;
        } catch (error) {
            console.error('Map init failed:', error);
            return false;
        }
    }

    getCurrentLocation() {
        if (!this.map && !this.initMap()) {
            alert('Map not available');
            return;
        }
        
        const button = document.getElementById('useCurrentLocation');
        button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Getting Location...';
        button.disabled = true;
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                if (this.map) {
                    this.map.setView([lat, lng], 16);
                    this.setMapMarker(lat, lng);
                    this.reverseGeocode(lat, lng);
                    this.checkDeliveryZone(lat, lng);
                }
                
                button.innerHTML = '<i class="fas fa-check mr-2"></i>Location Found';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-location-arrow mr-2"></i>Use My Location';
                    button.disabled = false;
                }, 2000);
            }, (error) => {
                console.error('Geolocation error:', error);
                let message = 'Unable to get location. ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message += 'Please allow location access.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message += 'Location information unavailable.';
                        break;
                    case error.TIMEOUT:
                        message += 'Location request timed out.';
                        break;
                }
                alert(message);
                button.innerHTML = '<i class="fas fa-location-arrow mr-2"></i>Use My Location';
                button.disabled = false;
            }, {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 300000
            });
        } else {
            alert('Geolocation is not supported by this browser');
            button.innerHTML = '<i class="fas fa-location-arrow mr-2"></i>Use My Location';
            button.disabled = false;
        }
    }
    
    enableMapSelection() {
        if (!this.map && !this.initMap()) {
            alert('Map not available');
            return;
        }
        
        const button = document.getElementById('selectOnMap');
        button.innerHTML = '<i class="fas fa-crosshairs mr-2"></i>Click on Map';
        button.classList.add('bg-orange-600', 'hover:bg-orange-700');
        button.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        
        this.map.getContainer().style.cursor = 'crosshair';
        
        const onMapClick = (e) => {
            this.setMapMarker(e.latlng.lat, e.latlng.lng);
            this.reverseGeocode(e.latlng.lat, e.latlng.lng);
            this.checkDeliveryZone(e.latlng.lat, e.latlng.lng);
            
            // Reset button
            button.innerHTML = '<i class="fas fa-map-marker-alt mr-2"></i>Select on Map';
            button.classList.remove('bg-orange-600', 'hover:bg-orange-700');
            button.classList.add('bg-blue-600', 'hover:bg-blue-700');
            this.map.getContainer().style.cursor = '';
            
            this.map.off('click', onMapClick);
        };
        
        this.map.on('click', onMapClick);
    }
    
    setMapMarker(lat, lng) {
        if (this.marker) this.map.removeLayer(this.marker);
        
        const customIcon = L.divIcon({
            html: '<i class="fas fa-map-marker-alt text-red-500 text-2xl map-marker"></i>',
            iconSize: [30, 30],
            className: 'custom-div-icon'
        });
        
        this.marker = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
        
        // Show coordinates
        document.getElementById('coordinates').textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        document.getElementById('locationInfo').classList.remove('hidden');
    }
    
    reverseGeocode(lat, lng) {
        // Using OpenStreetMap Nominatim for reverse geocoding
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
            .then(response => response.json())
            .then(data => {
                if (data.display_name) {
                    document.getElementById('selectedAddress').textContent = data.display_name;
                    
                    // Auto-fill form fields if possible
                    if (data.address) {
                        const addr = data.address;
                        if (addr.postcode) {
                            document.getElementById('postalCode').value = addr.postcode;
                        }
                    }
                }
            })
            .catch(error => {
                console.error('Reverse geocoding failed:', error);
                document.getElementById('selectedAddress').textContent = `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            });
    }
    
    searchAddress(query) {
        if (query.length < 3) {
            document.getElementById('addressSuggestions').classList.add('hidden');
            return;
        }
        
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.performAddressSearch(query);
        }, 300);
    }
    
    performAddressSearch(query) {
        // Search within Sri Lanka
        const searchQuery = `${query}, Sri Lanka`;
        
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=lk`)
            .then(response => response.json())
            .then(data => {
                this.displayAddressSuggestions(data);
            })
            .catch(error => {
                console.error('Address search failed:', error);
            });
    }
    
    displayAddressSuggestions(suggestions) {
        const container = document.getElementById('addressSuggestions');
        
        if (suggestions.length === 0) {
            container.classList.add('hidden');
            return;
        }
        
        container.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-lat="${suggestion.lat}" data-lng="${suggestion.lon}">
                <div class="font-medium text-gray-900">${suggestion.display_name}</div>
                <div class="text-xs text-gray-500">${suggestion.type}</div>
            </div>
        `).join('');
        
        // Add click handlers
        container.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.dataset.lat);
                const lng = parseFloat(item.dataset.lng);
                
                this.map.setView([lat, lng], 16);
                this.setMapMarker(lat, lng);
                this.checkDeliveryZone(lat, lng);
                
                document.getElementById('addressSearch').value = item.querySelector('.font-medium').textContent;
                document.getElementById('selectedAddress').textContent = item.querySelector('.font-medium').textContent;
                container.classList.add('hidden');
            });
        });
        
        container.classList.remove('hidden');
    }
    
    checkDeliveryZone(lat, lng) {
        // Define delivery zones (example coordinates for major Sri Lankan cities)
        const deliveryZones = [
            { name: 'Colombo Metro', center: [6.9271, 79.8612], radius: 15 },
            { name: 'Kandy', center: [7.2906, 80.6337], radius: 10 },
            { name: 'Galle', center: [6.0535, 80.2210], radius: 8 },
            { name: 'Jaffna', center: [9.6615, 80.0255], radius: 8 }
        ];
        
        const deliveryZoneDiv = document.getElementById('deliveryZone');
        const zoneIcon = document.getElementById('zoneIcon');
        const zoneMessage = document.getElementById('zoneMessage');
        
        let inDeliveryZone = false;
        let zoneName = '';
        
        for (const zone of deliveryZones) {
            const distance = this.calculateDistance(lat, lng, zone.center[0], zone.center[1]);
            if (distance <= zone.radius) {
                inDeliveryZone = true;
                zoneName = zone.name;
                break;
            }
        }
        
        if (inDeliveryZone) {
            deliveryZoneDiv.className = 'mt-3 p-3 rounded-lg delivery-available';
            zoneIcon.className = 'fas fa-check-circle mr-2';
            zoneMessage.textContent = `✓ Delivery available in ${zoneName} area`;
        } else {
            deliveryZoneDiv.className = 'mt-3 p-3 rounded-lg delivery-unavailable';
            zoneIcon.className = 'fas fa-exclamation-triangle mr-2';
            zoneMessage.textContent = '⚠ This location may be outside our delivery zone. Additional charges may apply.';
        }
        
        deliveryZoneDiv.classList.remove('hidden');
    }
    
    calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    setupValidation() {
        const fields = [
            { id: 'streetAddress', pattern: /^[A-Za-z0-9\s,.-]+$/, message: 'Only letters, numbers, spaces, commas, periods, and hyphens allowed' },
            { id: 'postalCode', pattern: /^[0-9]{5}$/, message: 'Please enter a valid 5-digit postal code' },
            { id: 'phone', pattern: /^(\+94|0)[0-9]{9}$/, message: 'Please enter a valid Sri Lankan phone number' }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.addEventListener('input', () => {
                    this.validateField(element, field.pattern, field.message);
                });
            }
        });
    }

    validateField(element, pattern, message) {
        const errorDiv = element.parentNode.querySelector('.error-message');
        
        if (element.value && !pattern.test(element.value)) {
            element.classList.add('error');
            errorDiv.textContent = message;
            errorDiv.classList.remove('hidden');
            return false;
        } else {
            element.classList.remove('error');
            errorDiv.classList.add('hidden');
            return true;
        }
    }

    validateForm() {
        let requiredFields = ['streetAddress', 'province', 'district', 'city', 'postalCode', 'phone'];
        if (this.selectedPaymentMethod === 'card') {
            requiredFields = [...requiredFields, 'cardNumber', 'expiryDate', 'cvv', 'cardholderName'];
        }
        let isValid = true;

        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            const errorDiv = field.parentNode.querySelector('.error-message');
            
            if (!field.value.trim()) {
                field.classList.add('error');
                errorDiv.textContent = 'This field is required';
                errorDiv.classList.remove('hidden');
                isValid = false;
            }
        });

        // Validate patterns
        const streetAddress = document.getElementById('streetAddress');
        if (streetAddress.value && !/^[A-Za-z0-9\s,.-]+$/.test(streetAddress.value)) {
            isValid = false;
        }

        const postalCode = document.getElementById('postalCode');
        if (postalCode.value && !/^[0-9]{5}$/.test(postalCode.value)) {
            isValid = false;
        }

        const phone = document.getElementById('phone');
        if (phone.value && !/^(\+94|0)[0-9]{9}$/.test(phone.value)) {
            isValid = false;
        }

        return isValid;
    }

    getFormData() {
        const data = {
            streetAddress: document.getElementById('streetAddress').value,
            province: document.getElementById('province').value,
            district: document.getElementById('district').value,
            city: document.getElementById('city').value,
            postalCode: document.getElementById('postalCode').value,
            phone: document.getElementById('phone').value,
            paymentMethod: this.selectedPaymentMethod,
            promoCode: this.appliedPromo
        };

        if (this.selectedPaymentMethod === 'card') {
            data.cardDetails = {
                cardNumber: document.getElementById('cardNumber').value,
                expiryDate: document.getElementById('expiryDate').value,
                cvv: document.getElementById('cvv').value,
                cardholderName: document.getElementById('cardholderName').value
            };
        }

        return data;
    }
    
    getDiscount() {
        if (!this.appliedPromo) return 0;
        
        const subtotal = window.app ? window.app.cart.getSubtotal() : 0;
        
        if (this.appliedPromo.type === 'percentage') {
            return Math.round(subtotal * (this.appliedPromo.discount / 100));
        } else {
            return this.appliedPromo.discount;
        }
    }
}

window.Checkout = Checkout;
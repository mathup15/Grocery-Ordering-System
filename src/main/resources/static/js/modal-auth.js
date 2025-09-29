// Modal functions for authentication
function showLoginModal() {
  document.getElementById('loginModal').classList.remove('hidden');
  document.getElementById('registerModal').classList.add('hidden');
}

function showRegisterModal() {
  document.getElementById('registerModal').classList.remove('hidden');
  document.getElementById('loginModal').classList.add('hidden');
}

function closeAuthModal() {
  document.getElementById('loginModal').classList.add('hidden');
  document.getElementById('registerModal').classList.add('hidden');
}

function switchToLogin() {
  showLoginModal();
}

function switchToRegister() {
  showRegisterModal();
}

// Profile functions
function showProfileSection() {
  if (!authManager.isLoggedIn()) {
    showLoginModal();
    return;
  }
  
  if (window.app) {
    window.app.showSection('profile');
    loadProfileData();
  }
}

function showProfileTab(tab) {
  // Update active tab
  document.querySelectorAll('.profile-tab').forEach(btn => {
    btn.classList.remove('text-green-600', 'bg-green-50');
    btn.classList.add('text-gray-600');
  });
  
  event.target.classList.add('text-green-600', 'bg-green-50');
  event.target.classList.remove('text-gray-600');
  
  // Show content
  document.querySelectorAll('.profile-content').forEach(content => {
    content.classList.add('hidden');
  });
  
  if (tab === 'info') {
    document.getElementById('profileInfoTab').classList.remove('hidden');
  } else if (tab === 'addresses') {
    document.getElementById('profileAddressesTab').classList.remove('hidden');
    loadSavedAddresses();
  } else if (tab === 'orders') {
    document.getElementById('profileOrdersTab').classList.remove('hidden');
    loadOrderHistory();
  }
}

function loadProfileData() {
  const user = authManager.getCurrentUser();
  if (!user) return;
  
  document.getElementById('profileUserName').textContent = `${user.firstName} ${user.lastName}`;
  document.getElementById('profileUserEmail').textContent = user.email;
  document.getElementById('profileFirstName').value = user.firstName || '';
  document.getElementById('profileLastName').value = user.lastName || '';
  document.getElementById('profileEmail').value = user.email || '';
  document.getElementById('profilePhone').value = user.phone || '';
}

function loadOrderHistory() {
  const user = authManager.getCurrentUser();
  const orderList = document.getElementById('profileOrderList');
  
  if (!user.orderHistory || user.orderHistory.length === 0) {
    orderList.innerHTML = '<p class="text-gray-500 text-center py-8">No orders yet. <a href="#" onclick="app.showSection(\'products\')" class="text-green-600 hover:text-green-700">Start shopping!</a></p>';
    return;
  }
  
  orderList.innerHTML = user.orderHistory.map(order => `
    <div class="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
      <div class="flex justify-between items-start mb-3">
        <div>
          <h4 class="font-medium text-gray-800">Order ${order.id}</h4>
          <p class="text-sm text-gray-500">${new Date(order.createdAt).toLocaleDateString()} at ${new Date(order.createdAt).toLocaleTimeString()}</p>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          ${order.status || 'Completed'}
        </span>
      </div>
      
      <div class="mb-3">
        <p class="text-sm text-gray-600 mb-2">${order.items?.length || 0} items:</p>
        <div class="text-xs text-gray-500">
          ${order.items?.slice(0, 3).map(item => `${item.name} (${item.quantity})`).join(', ')}${order.items?.length > 3 ? '...' : ''}
        </div>
      </div>
      
      <div class="flex justify-between items-center">
        <div class="text-sm text-gray-600">
          <span>Payment: ${order.paymentMethod === 'card' ? 'Card' : 'Cash on Delivery'}</span>
        </div>
        <div class="text-lg font-semibold text-green-600">
          LKR ${order.total?.toLocaleString() || 0}
        </div>
      </div>
      
      <div class="mt-3 pt-3 border-t border-gray-100">
        <button onclick="reorderItems('${order.id}')" class="text-green-600 hover:text-green-700 text-sm font-medium">
          <i class="fas fa-redo mr-1"></i>Reorder
        </button>
      </div>
    </div>
  `).join('');
}

function reorderItems(orderId) {
  const user = authManager.getCurrentUser();
  const order = user.orderHistory.find(o => o.id === orderId);
  
  if (order && order.items) {
    // Clear current cart
    window.cart.clear();
    
    // Add all items from the order
    order.items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        window.cart.addItem(item);
      }
    });
    
    // Go to cart
    window.app.showSection('cart');
    authManager.showMessage(`${order.items.length} items added to cart!`, 'success');
  }
}

// Address management functions
function showAddAddressForm() {
  document.getElementById('addAddressForm').classList.remove('hidden');
  setTimeout(() => {
    setupAddressDropdowns();
  }, 100);
}

function hideAddAddressForm() {
  document.getElementById('addAddressForm').classList.add('hidden');
  document.getElementById('addressForm').reset();
  document.getElementById('addressMapContainer').classList.add('hidden');
  if (window.addressMap) {
    window.addressMap.remove();
    window.addressMap = null;
  }
}

function useCurrentLocationForAddress() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Reverse geocode to get address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then(response => response.json())
          .then(data => {
            if (data.display_name) {
              document.getElementById('addressStreet').value = data.display_name;
              authManager.showMessage('Location detected successfully!', 'success');
            }
          })
          .catch(() => {
            authManager.showMessage('Could not get address details', 'error');
          });
      },
      () => {
        authManager.showMessage('Location access denied', 'error');
      }
    );
  } else {
    authManager.showMessage('Geolocation not supported', 'error');
  }
}

function selectOnMapForAddress() {
  const mapContainer = document.getElementById('addressMapContainer');
  
  if (!mapContainer) {
    authManager.showMessage('Map not available', 'error');
    return;
  }
  
  mapContainer.classList.remove('hidden');
  
  // Wait for DOM to update
  setTimeout(() => {
    initAddressMap();
  }, 100);
}

function initAddressMap() {
  const mapDiv = document.getElementById('addressMap');
  
  if (!mapDiv) {
    authManager.showMessage('Map container not found', 'error');
    return;
  }
  
  // Clear any existing map
  mapDiv.innerHTML = '';
  
  if (typeof L === 'undefined') {
    authManager.showMessage('Leaflet library not loaded', 'error');
    return;
  }
  
  try {
    // Remove existing map if any
    if (window.profileMap) {
      window.profileMap.remove();
    }
    
    // Create new map
    window.profileMap = L.map('addressMap').setView([6.9271, 79.8612], 13);
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(window.profileMap);
    
    let marker;
    
    // Add click handler
    window.profileMap.on('click', function(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      
      // Remove existing marker
      if (marker) {
        window.profileMap.removeLayer(marker);
      }
      
      // Add new marker
      marker = L.marker([lat, lng]).addTo(window.profileMap);
      
      // Update form
      const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      document.getElementById('addressStreet').value = coords;
      document.getElementById('addressSelectedLocation').textContent = coords;
      document.getElementById('addressLocationInfo').classList.remove('hidden');
      
      authManager.showMessage('Location selected!', 'success');
    });
    
    // Ensure map renders properly
    setTimeout(() => {
      window.profileMap.invalidateSize();
    }, 200);
    
  } catch (error) {
    console.error('Map initialization error:', error);
    authManager.showMessage('Failed to initialize map', 'error');
  }
}

function setupAddressDropdowns() {
  const provinceSelect = document.getElementById('addressProvince');
  const districtSelect = document.getElementById('addressDistrict');
  const citySelect = document.getElementById('addressCity');
  
  if (!provinceSelect) return;
  
  provinceSelect.onchange = function() {
    const province = this.value;
    districtSelect.disabled = !province;
    citySelect.disabled = true;
    districtSelect.innerHTML = '<option value="">Select District</option>';
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    if (province && window.locationData) {
      const provinceData = window.locationData[province];
      if (provinceData) {
        Object.keys(provinceData).forEach(district => {
          districtSelect.innerHTML += `<option value="${district}">${district}</option>`;
        });
        districtSelect.disabled = false;
      }
    }
  };
  
  districtSelect.onchange = function() {
    const province = provinceSelect.value;
    const district = this.value;
    citySelect.disabled = !district;
    citySelect.innerHTML = '<option value="">Select City</option>';
    
    if (district && window.locationData && window.locationData[province]) {
      const cities = window.locationData[province][district];
      if (cities && Array.isArray(cities)) {
        cities.forEach(city => {
          citySelect.innerHTML += `<option value="${city}">${city}</option>`;
        });
        citySelect.disabled = false;
      }
    }
  };
}

function loadSavedAddresses() {
  const user = authManager.getCurrentUser();
  const addressList = document.getElementById('profileAddressList');
  
  if (!user.addresses || user.addresses.length === 0) {
    addressList.innerHTML = '<p class="text-gray-500 text-center py-8">No addresses saved yet.</p>';
    return;
  }
  
  addressList.innerHTML = user.addresses.map(address => `
    <div class="border border-gray-200 rounded-lg p-4">
      <div class="flex justify-between items-start">
        <div>
          <h4 class="font-medium text-gray-800">${address.label || 'Address'}</h4>
          <p class="text-gray-600 mt-1">${address.street}</p>
          <p class="text-gray-600">${address.city}, ${address.district}</p>
          <p class="text-gray-600">${address.province}</p>
        </div>
        <button onclick="deleteAddress(${address.id})" class="text-red-500 hover:text-red-700">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function deleteAddress(addressId) {
  const user = authManager.getCurrentUser();
  const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
  authManager.updateUser({ addresses: updatedAddresses });
  loadSavedAddresses();
  authManager.showMessage('Address deleted successfully!', 'success');
}

function loadCheckoutAddresses() {
  const user = authManager.getCurrentUser();
  const savedAddressesSection = document.getElementById('savedAddressesSection');
  const savedAddressList = document.getElementById('savedAddressList');
  
  if (!user || !user.addresses || user.addresses.length === 0) {
    savedAddressesSection.classList.add('hidden');
    return;
  }
  
  savedAddressesSection.classList.remove('hidden');
  savedAddressList.innerHTML = user.addresses.map(address => `
    <div class="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-green-500" onclick="selectSavedAddress(${address.id})">
      <div class="flex items-center">
        <input type="radio" name="savedAddress" value="${address.id}" class="mr-3">
        <div>
          <h5 class="font-medium">${address.label || 'Address'}</h5>
          <p class="text-sm text-gray-600">${address.street}, ${address.city}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function selectSavedAddress(addressId) {
  const user = authManager.getCurrentUser();
  const address = user.addresses.find(addr => addr.id === addressId);
  
  if (address) {
    document.getElementById('streetAddress').value = address.street;
    document.getElementById('province').value = address.province;
    
    // Trigger province change to load districts
    const provinceEvent = new Event('change');
    document.getElementById('province').dispatchEvent(provinceEvent);
    
    setTimeout(() => {
      document.getElementById('district').value = address.district;
      const districtEvent = new Event('change');
      document.getElementById('district').dispatchEvent(districtEvent);
      
      setTimeout(() => {
        document.getElementById('city').value = address.city;
      }, 100);
    }, 100);
    
    document.getElementById('manualAddressSection').classList.add('hidden');
  }
}

function toggleAddressInput() {
  const manualSection = document.getElementById('manualAddressSection');
  manualSection.classList.toggle('hidden');
  
  // Clear saved address selection
  document.querySelectorAll('input[name="savedAddress"]').forEach(radio => {
    radio.checked = false;
  });
}

// Profile form handler
document.addEventListener('DOMContentLoaded', () => {
  const profileForm = document.getElementById('profileUpdateForm');
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = {
        firstName: document.getElementById('profileFirstName').value,
        lastName: document.getElementById('profileLastName').value,
        email: document.getElementById('profileEmail').value,
        phone: document.getElementById('profilePhone').value
      };
      
      authManager.updateUser(formData);
      authManager.showMessage('Profile updated successfully!', 'success');
      loadProfileData();
      
      if (window.app) {
        window.app.setupAuth();
      }
    });
  }
  
  // Address form handler
  const addressForm = document.getElementById('addressForm');
  if (addressForm) {
    addressForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const addressData = {
        label: document.getElementById('addressLabel').value || 'Address',
        street: document.getElementById('addressStreet').value,
        province: document.getElementById('addressProvince').value,
        district: document.getElementById('addressDistrict').value,
        city: document.getElementById('addressCity').value
      };
      
      authManager.addAddress(addressData);
      authManager.showMessage('Address saved successfully!', 'success');
      hideAddAddressForm();
      loadSavedAddresses();
    });
  }
});

// Close modal when clicking outside
document.addEventListener('click', (e) => {
  if (e.target.id === 'loginModal' || e.target.id === 'registerModal') {
    closeAuthModal();
  }
});
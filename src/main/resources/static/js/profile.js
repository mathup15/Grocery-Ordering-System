class ProfileManager {
  constructor() {
    this.init();
  }

  init() {
    // Check authentication
    if (!authManager.requireAuth()) return;

    this.loadUserData();
    this.setupEventListeners();
    this.setupNavigation();
  }

  loadUserData() {
    const user = authManager.getCurrentUser();
    if (!user) return;

    // Update sidebar info
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('userEmail').textContent = user.email;

    // Fill profile form
    document.getElementById('firstName').value = user.firstName || '';
    document.getElementById('lastName').value = user.lastName || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('phone').value = user.phone || '';

    this.loadAddresses();
    this.loadOrderHistory();
    this.loadWishlist();
  }

  setupEventListeners() {
    // Profile form
    document.getElementById('profileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.updateProfile();
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
      authManager.logout();
    });

    // Add address button
    document.getElementById('addAddressBtn').addEventListener('click', () => {
      this.showAddAddressForm();
    });
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href').substring(1);

        // Update active nav
        navLinks.forEach(l => l.classList.remove('active', 'text-green-600', 'bg-green-50'));
        navLinks.forEach(l => l.classList.add('text-gray-600'));
        link.classList.add('active', 'text-green-600', 'bg-green-50');
        link.classList.remove('text-gray-600');

        // Show target section
        contentSections.forEach(section => section.classList.add('hidden'));
        document.getElementById(target).classList.remove('hidden');
      });
    });
  }

  updateProfile() {
    const formData = {
      firstName: document.getElementById('firstName').value,
      lastName: document.getElementById('lastName').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone').value
    };

    authManager.updateUser(formData);
    this.showMessage('Profile updated successfully!', 'success');
    this.loadUserData();
  }

  loadAddresses() {
    const user = authManager.getCurrentUser();
    const addressList = document.getElementById('addressList');
    
    if (!user.addresses || user.addresses.length === 0) {
      addressList.innerHTML = '<p class="text-gray-500 text-center py-8">No addresses added yet.</p>';
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
          <button onclick="profileManager.deleteAddress(${address.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  loadOrderHistory() {
    const user = authManager.getCurrentUser();
    const orderList = document.getElementById('orderList');
    
    if (!user.orderHistory || user.orderHistory.length === 0) {
      orderList.innerHTML = '<p class="text-gray-500 text-center py-8">No orders yet.</p>';
      return;
    }

    orderList.innerHTML = user.orderHistory.map(order => `
      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex justify-between items-start">
          <div>
            <h4 class="font-medium text-gray-800">Order #${order.id}</h4>
            <p class="text-gray-600">LKR ${order.total}</p>
            <p class="text-sm text-gray-500">${new Date(order.createdAt).toLocaleDateString()}</p>
          </div>
          <span class="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ${order.status || 'Completed'}
          </span>
        </div>
        <div class="mt-3">
          <p class="text-sm text-gray-600">${order.items?.length || 0} items</p>
        </div>
      </div>
    `).join('');
  }

  loadWishlist() {
    const user = authManager.getCurrentUser();
    const wishlistItems = document.getElementById('wishlistItems');
    
    if (!user.wishlist || user.wishlist.length === 0) {
      wishlistItems.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-full">No items in wishlist.</p>';
      return;
    }

    wishlistItems.innerHTML = user.wishlist.map(item => `
      <div class="border border-gray-200 rounded-lg p-4">
        <img src="${item.image}" alt="${item.name}" class="w-full h-32 object-cover rounded-lg mb-3">
        <h4 class="font-medium text-gray-800">${item.name}</h4>
        <p class="text-green-600 font-semibold">LKR ${item.price}</p>
        <div class="mt-3 flex gap-2">
          <button onclick="profileManager.addToCart(${item.id})" class="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700">
            Add to Cart
          </button>
          <button onclick="profileManager.removeFromWishlist(${item.id})" class="text-red-500 hover:text-red-700">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  showAddAddressForm() {
    // Simple prompt for demo - in real app, use modal
    const street = prompt('Enter street address:');
    const city = prompt('Enter city:');
    const district = prompt('Enter district:');
    const province = prompt('Enter province:');
    const label = prompt('Enter address label (e.g., Home, Office):');

    if (street && city && district && province) {
      authManager.addAddress({ street, city, district, province, label });
      this.loadAddresses();
      this.showMessage('Address added successfully!', 'success');
    }
  }

  deleteAddress(addressId) {
    const user = authManager.getCurrentUser();
    const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
    authManager.updateUser({ addresses: updatedAddresses });
    this.loadAddresses();
    this.showMessage('Address deleted successfully!', 'success');
  }

  addToCart(itemId) {
    // Integration with existing cart system
    if (window.cart) {
      const user = authManager.getCurrentUser();
      const item = user.wishlist.find(item => item.id === itemId);
      if (item) {
        window.cart.addItem(item);
        this.showMessage('Item added to cart!', 'success');
      }
    }
  }

  removeFromWishlist(itemId) {
    const user = authManager.getCurrentUser();
    const updatedWishlist = user.wishlist.filter(item => item.id !== itemId);
    authManager.updateUser({ wishlist: updatedWishlist });
    this.loadWishlist();
    this.showMessage('Item removed from wishlist!', 'success');
  }

  showMessage(message, type) {
    const existingMessage = document.querySelector('.profile-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `profile-message fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }
}

// Initialize profile manager
const profileManager = new ProfileManager();
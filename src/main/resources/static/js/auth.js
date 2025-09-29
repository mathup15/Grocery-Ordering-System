class AuthManager {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    this.init();
  }

  init() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }
  }

  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (user) {
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      this.showMessage('Login successful!', 'success');
      closeAuthModal();
      if (window.app) {
        window.app.setupAuth();
      }
    } else {
      this.showMessage('Invalid email or password', 'error');
    }
  }

  handleRegister(e) {
    e.preventDefault();
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
      this.showMessage('Passwords do not match', 'error');
      return;
    }

    if (this.users.find(u => u.email === email)) {
      this.showMessage('Email already exists', 'error');
      return;
    }

    const newUser = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      phone,
      password,
      createdAt: new Date().toISOString(),
      addresses: [],
      orderHistory: [],
      wishlist: []
    };

    this.users.push(newUser);
    localStorage.setItem('users', JSON.stringify(this.users));

    this.showMessage('Account created successfully!', 'success');
    switchToLogin();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rememberUser');
    if (window.app) {
      window.app.setupAuth();
    }
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  updateUser(userData) {
    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...userData };
      this.currentUser = this.users[userIndex];
      localStorage.setItem('users', JSON.stringify(this.users));
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
  }

  addAddress(address) {
    if (this.currentUser) {
      this.currentUser.addresses.push({
        id: Date.now(),
        ...address,
        createdAt: new Date().toISOString()
      });
      this.updateUser({ addresses: this.currentUser.addresses });
    }
  }

  addToOrderHistory(order) {
    if (this.currentUser) {
      this.currentUser.orderHistory.push({
        id: Date.now(),
        ...order,
        createdAt: new Date().toISOString()
      });
      this.updateUser({ orderHistory: this.currentUser.orderHistory });
    }
  }

  togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('#togglePassword i');
    
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggleIcon.className = 'fas fa-eye-slash';
    } else {
      passwordInput.type = 'password';
      toggleIcon.className = 'fas fa-eye';
    }
  }

  showMessage(message, type) {
    const existingMessage = document.querySelector('.auth-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `auth-message fixed top-4 right-4 px-6 py-3 rounded-lg text-white font-medium z-50 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  // Auth guard for protected pages
  requireAuth() {
    if (!this.isLoggedIn()) {
      showLoginModal();
      return false;
    }
    return true;
  }
}

// Initialize auth manager
const authManager = new AuthManager();

// Make it globally available
window.authManager = authManager;
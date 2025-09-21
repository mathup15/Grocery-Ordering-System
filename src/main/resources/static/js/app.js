// Enhanced /js/app.js with Auth utilities
const USE_DEMO = false;
const API_LOGIN = "/api/auth/login";
const API_REGISTER = "/api/auth/register";

const siErr = document.getElementById("si-error");
const suErr = document.getElementById("su-error");

// Auth utility object
window.Auth = {
    getToken() {
        return localStorage.getItem("auth.token");
    },

    getRole() {
        return localStorage.getItem("auth.role");
    },

    getUserId() {
        // In a real implementation, decode this from the JWT token
        // For demo purposes, returning a fixed user ID
        return 1;
    },

    isLoggedIn() {
        return !!this.getToken();
    },

    logout() {
        localStorage.removeItem("auth.token");
        localStorage.removeItem("auth.role");
        window.location.href = "/index.html";
    },

    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = "/index.html";
            return false;
        }
        return true;
    },

    requireRole(allowedRoles) {
        if (!this.requireAuth()) return false;

        const userRole = this.getRole();
        if (!allowedRoles.includes(userRole)) {
            alert("Access denied. You don't have permission to view this page.");
            this.logout();
            return false;
        }
        return true;
    },

    async makeAuthenticatedRequest(url, options = {}) {
        const token = this.getToken();
        if (!token) {
            throw new Error("No authentication token found");
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers
        };

        return fetch(url, {
            ...options,
            headers
        });
    }
};

// Toggle password visibility
document.getElementById("togglePwd")?.addEventListener("click", (e) => {
    const pwd = document.getElementById("si-password");
    pwd.type = pwd.type === "password" ? "text" : "password";
    e.target.textContent = pwd.type === "password" ? "Show" : "Hide";
});

// Sign in form handler
document.getElementById("formSignIn")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = document.getElementById("si-username").value.trim();
    const password = document.getElementById("si-password").value;

    if (identifier.length < 3 || password.length < 3) {
        showErr(siErr, "Please enter valid credentials.");
        return;
    }
    hide(siErr);

    try {
        let token, role;
        if (USE_DEMO) {
            role = inferRoleFromId(identifier);
            token = "demo-token";
        } else {
            const res = await fetch(API_LOGIN, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({ identifier, password })
            });
            if (!res.ok) throw new Error((await res.json())?.error || "Invalid credentials");
            const data = await res.json();
            token = data.token;
            role = data.role;
        }

        localStorage.setItem("auth.token", token);
        localStorage.setItem("auth.role", role);

        const dashboardMap = {
            CUSTOMER: "/dashboard/customer.html",
            DELIVERY: "/dashboard/delivery.html",
            STAFF: "/dashboard/staff.html",
            ADMIN: "/dashboard/admin.html",
            MANAGER: "/dashboard/manager.html"
        };

        window.location.href = dashboardMap[role] || dashboardMap.CUSTOMER;
    } catch (err) {
        showErr(siErr, err.message || "Login failed.");
    }
});

// Sign up form handler
document.getElementById("formSignUp")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("su-fullname").value.trim();
    const phone = document.getElementById("su-phone").value.trim();
    const username = document.getElementById("su-username").value.trim();
    const password = document.getElementById("su-password").value;
    const confirm = document.getElementById("su-confirm").value;

    if (!fullName || !username || password.length < 6 || password !== confirm) {
        showErr(suErr, "Fill all fields. Password ≥ 6 and must match.");
        return;
    }
    hide(suErr);

    try {
        if (USE_DEMO) {
            alert("Customer account created! Please sign in.");
            return;
        }

        const res = await fetch(API_REGISTER, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ username, password, fullName, phone })
        });

        if (!res.ok) throw new Error((await res.json())?.error || "Signup failed");
        alert("Customer account created! Please sign in.");

        // Clear the form
        document.getElementById("formSignUp").reset();
    } catch (err) {
        showErr(suErr, err.message || "Signup failed.");
    }
});

// Utility functions
function showErr(el, msg) {
    if(el) {
        el.textContent = msg;
        el.classList.remove("hidden");
    }
}

function hide(el) {
    if(el) {
        el.classList.add("hidden");
    }
}

// Demo helper function
function inferRoleFromId(id) {
    if (/^ADM-/i.test(id)) return "ADMIN";
    if (/^STF-/i.test(id)) return "STAFF";
    if (/^DLV-/i.test(id)) return "DELIVERY";
    if (/^MGR-/i.test(id)) return "MANAGER";
    return "CUSTOMER";
}

// API utility functions for cart and orders
window.API = {
    async addToCart(productId, quantity = 1) {
        try {
            const response = await fetch(`/api/cart/${Auth.getUserId()}/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, quantity })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to add item to cart');
            }

            return await response.json();
        } catch (error) {
            console.error('Error adding to cart:', error);
            throw error;
        }
    },

    async getCart() {
        try {
            const response = await fetch(`/api/cart/${Auth.getUserId()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch cart');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching cart:', error);
            throw error;
        }
    },

    async updateCartItem(productId, quantity) {
        try {
            const response = await fetch(`/api/cart/${Auth.getUserId()}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, quantity })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update cart');
            }

            return await response.json();
        } catch (error) {
            console.error('Error updating cart:', error);
            throw error;
        }
    },

    async removeFromCart(productId) {
        try {
            const response = await fetch(`/api/cart/${Auth.getUserId()}/remove/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to remove item from cart');
            }

            return await response.json();
        } catch (error) {
            console.error('Error removing from cart:', error);
            throw error;
        }
    },

    async createOrder(orderData) {
        try {
            const response = await fetch(`/api/orders/${Auth.getUserId()}/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create order');
            }

            return await response.json();
        } catch (error) {
            console.error('Error creating order:', error);
            throw error;
        }
    },

    async getOrder(orderNumber) {
        try {
            const response = await fetch(`/api/orders/order/${orderNumber}`);
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to fetch order');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching order:', error);
            throw error;
        }
    },

    async getUserOrders() {
        try {
            const response = await fetch(`/api/orders/${Auth.getUserId()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching orders:', error);
            throw error;
        }
    }
};

// Notification utility
window.Notification = {
    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 max-w-sm p-4 rounded-lg shadow-lg transform translate-x-full transition-all duration-300 ${this.getTypeClasses(type)}`;

        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas ${this.getTypeIcon(type)}"></i>
                <span>${message}</span>
                <button class="ml-auto text-current opacity-70 hover:opacity-100" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.parentElement.removeChild(notification);
                    }
                }, 300);
            }
        }, duration);
    },

    getTypeClasses(type) {
        const classes = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-white',
            info: 'bg-blue-500 text-white'
        };
        return classes[type] || classes.info;
    },

    getTypeIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }
};

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', () => {
    // Add any page-specific initialization here
    console.log('PioMart application initialized');
});
// Authentication and role management
const Auth = {
    // Check if user has required role
    requireRole: function(roles) {
        const userRole = localStorage.getItem("auth.role");
        if (!userRole || !roles.includes(userRole)) {
            // Redirect to login if not authorized
            window.location.href = "/";
            return false;
        }
        return true;
    },

    // Logout function
    logout: function() {
        localStorage.removeItem("auth.token");
        localStorage.removeItem("auth.role");
        window.location.href = "/";
    }
};

// Format date and time for display
function formatDateTime(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `Today, ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

    return date.toLocaleDateString([], {month: 'short', day: 'numeric'}) + ', ' +
        date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Update inventory last update time
function updateInventoryLastUpdate() {
    const now = new Date();
    const formattedTime = formatDateTime(now);

    // Update the inventory card
    document.getElementById('inventory-last-update').textContent = formattedTime;
    document.getElementById('inventory-last-update').classList.remove('pulse-animation');

    // Update the recent activity
    document.getElementById('inventory-activity-time').textContent = formattedTime;

    // In a real application, you would save this to your backend
    localStorage.setItem('inventoryLastUpdate', now.toISOString());

    // Show a confirmation message
    showNotification('Inventory last update time refreshed!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has required role
    if (!Auth.requireRole(["STAFF", "ADMIN"])) {
        return;
    }

    // Set current date
    const now = new Date();
    document.getElementById('current-date').textContent = now.toLocaleDateString([], {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Load saved inventory update time if available
    const savedUpdate = localStorage.getItem('inventoryLastUpdate');
    if (savedUpdate) {
        const updateTime = new Date(savedUpdate);
        document.getElementById('inventory-last-update').textContent = formatDateTime(updateTime);
        document.getElementById('inventory-last-update').classList.remove('pulse-animation');
        document.getElementById('inventory-activity-time').textContent = formatDateTime(updateTime);
    } else {
        // If no saved time, set to current time
        updateInventoryLastUpdate();
    }

    // Add event listener to refresh button
    document.getElementById('refresh-btn').addEventListener('click', updateInventoryLastUpdate);

    // Simulate inventory updates every 10 minutes for demo purposes
    setInterval(() => {
        // In a real application, this would check with the server
        console.log("Checking for inventory updates...");
    }, 600000);
});
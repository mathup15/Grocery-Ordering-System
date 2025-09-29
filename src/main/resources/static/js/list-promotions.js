// Advanced Promotion Dashboard JavaScript
document.addEventListener("DOMContentLoaded", function () {
    const promotionsGrid = document.getElementById("promotionsGrid");
    const loading = document.getElementById("loading");
    const noPromotions = document.getElementById("noPromotions");
    const searchInput = document.getElementById("searchInput");
    const statusFilter = document.getElementById("statusFilter");
    const typeFilter = document.getElementById("typeFilter");
    const pagination = document.getElementById("pagination");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const pageInfo = document.getElementById("pageInfo");

    let allPromotions = [];
    let filteredPromotions = [];
    let currentPage = 1;
    const itemsPerPage = 6;

    // Initialize the dashboard
    initializeDashboard();

    function initializeDashboard() {
        loadPromotions();
        setupEventListeners();
    }

    function loadPromotions() {
        showLoading(true);
        
        fetch("/promotions/all")
            .then(res => res.json())
            .then(promotions => {
                allPromotions = promotions || [];
                filteredPromotions = [...allPromotions];
                updateStats();
                renderPromotions();
                showLoading(false);
            })
            .catch(err => {
                console.error("Error loading promotions:", err);
                showError("Failed to load promotions. Please refresh the page.");
                showLoading(false);
            });
    }

    function setupEventListeners() {
        // Search functionality
        searchInput.addEventListener("input", debounce(handleSearch, 300));
        
        // Filter functionality
        statusFilter.addEventListener("change", handleFilter);
        typeFilter.addEventListener("change", handleFilter);
        
        // Pagination
        prevBtn.addEventListener("click", () => changePage(currentPage - 1));
        nextBtn.addEventListener("click", () => changePage(currentPage + 1));
    }

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        filteredPromotions = allPromotions.filter(promo => {
            return promo.title.toLowerCase().includes(searchTerm) ||
                   promo.productName.toLowerCase().includes(searchTerm) ||
                   promo.type.toLowerCase().includes(searchTerm);
        });
        
        currentPage = 1;
        renderPromotions();
    }

    function handleFilter() {
        const statusValue = statusFilter.value;
        const typeValue = typeFilter.value;
        
        filteredPromotions = allPromotions.filter(promo => {
            const statusMatch = !statusValue || getPromotionStatus(promo) === statusValue;
            const typeMatch = !typeValue || promo.type === typeValue;
            return statusMatch && typeMatch;
        });
        
        currentPage = 1;
        renderPromotions();
    }

    function getPromotionStatus(promo) {
        const now = new Date();
        const startDate = promo.startDate ? new Date(promo.startDate) : null;
        const endDate = promo.endDate ? new Date(promo.endDate) : null;
        
        if (startDate && now < startDate) {
            return 'upcoming';
        } else if (endDate && now > endDate) {
            return 'expired';
        } else {
            return 'active';
        }
    }

    function updateStats() {
        const total = allPromotions.length;
        const active = allPromotions.filter(p => getPromotionStatus(p) === 'active').length;
        const upcoming = allPromotions.filter(p => getPromotionStatus(p) === 'upcoming').length;
        const expired = allPromotions.filter(p => getPromotionStatus(p) === 'expired').length;
        
        document.getElementById("totalPromotions").textContent = total;
        document.getElementById("activePromotions").textContent = active;
        document.getElementById("upcomingPromotions").textContent = upcoming;
        document.getElementById("expiredPromotions").textContent = expired;
    }

    function renderPromotions() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pagePromotions = filteredPromotions.slice(startIndex, endIndex);
        
        if (pagePromotions.length === 0) {
            showNoPromotions();
            return;
        }
        
        hideNoPromotions();
        
        promotionsGrid.innerHTML = '';
        pagePromotions.forEach(promo => {
            const card = createPromotionCard(promo);
            promotionsGrid.appendChild(card);
        });
        
        updatePagination();
    }

    function createPromotionCard(promo) {
        const card = document.createElement("div");
        card.className = "promotion-card";
        
        const status = getPromotionStatus(promo);
        const statusClass = `status-${status}`;
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        
        const discountText = promo.type === 'PERCENTAGE' ? 
            `${promo.value}% OFF` : 
            `$${promo.value} OFF`;
        
        const imgUrl = promo.productImageUrl || '/img/no-image.png';
        
        card.innerHTML = `
            <div class="status-badge ${statusClass}">${statusText}</div>
            <div class="discount-badge">${discountText}</div>
            
            <div class="promotion-header">
                <div class="promotion-title">${promo.title}</div>
                <div class="promotion-type">${promo.type === 'PERCENTAGE' ? 'Percentage Discount' : 'Fixed Amount Discount'}</div>
            </div>
            
            <div class="promotion-body">
                <div class="product-info">
                    <img src="${imgUrl}" alt="${promo.productName}" class="product-img" 
                         onerror="this.src='/img/no-image.png'">
                    <div class="product-details">
                        <h4>${promo.productName}</h4>
                        <p>Product ID: ${promo.productId}</p>
                    </div>
                </div>
                
                <div class="price-info">
                    <div class="price-item original">
                        <h5>Original Price</h5>
                        <div class="price">$${promo.productPrice.toFixed(2)}</div>
                    </div>
                    <div class="price-item final">
                        <h5>Final Price</h5>
                        <div class="price">$${promo.finalAmount.toFixed(2)}</div>
                    </div>
                </div>
                
                <div class="date-info">
                    <div class="date-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>${promo.startDate || 'No start date'}</span>
                    </div>
                    <div class="date-item">
                        <i class="fas fa-calendar-check"></i>
                        <span>${promo.endDate || 'No end date'}</span>
                    </div>
                </div>
                
                <div class="promotion-actions">
                    <a href="/promotion/edit-promotion.html?id=${promo.id}" class="action-btn edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </a>
                    <button onclick="deletePromotion(${promo.id})" class="action-btn delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    function updatePagination() {
        const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;
        
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }

    function changePage(page) {
        const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
        
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            renderPromotions();
        }
    }

    function showNoPromotions() {
        noPromotions.style.display = 'block';
        promotionsGrid.style.display = 'none';
        pagination.style.display = 'none';
    }

    function hideNoPromotions() {
        noPromotions.style.display = 'none';
        promotionsGrid.style.display = 'grid';
    }

    function showLoading(show) {
        loading.style.display = show ? 'block' : 'none';
    }

    function showError(message) {
        // Create error notification
        const errorDiv = document.createElement("div");
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    function showSuccess(message) {
        // Create success notification
        const successDiv = document.createElement("div");
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    // Debounce function for search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});

// Global function for deleting promotions
function deletePromotion(id) {
    if (!confirm("Are you sure you want to delete this promotion? This action cannot be undone.")) {
        return;
    }

    // Show loading state
    const deleteBtn = event.target.closest('.delete-btn');
    const originalText = deleteBtn.innerHTML;
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
    deleteBtn.disabled = true;

    fetch(`/promotions/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${id}`
    })
    .then(res => {
        if (res.ok) {
            showSuccess("Promotion deleted successfully!");
            // Reload the page to refresh the data
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            throw new Error("Failed to delete promotion");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showError("Failed to delete promotion. Please try again.");
        // Restore button state
        deleteBtn.innerHTML = originalText;
        deleteBtn.disabled = false;
    });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    .promotion-card {
        animation: fadeIn 0.5s ease;
    }
`;
document.head.appendChild(style);

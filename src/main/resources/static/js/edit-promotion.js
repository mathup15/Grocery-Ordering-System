// // Advanced Promotion Editor JavaScript
// document.addEventListener("DOMContentLoaded", function () {
//     const params = new URLSearchParams(window.location.search);
//     const promoId = params.get("id");
//
//     const form = document.getElementById("editPromotionForm");
//     const loading = document.getElementById("loading");
//     const productSelect = document.getElementById("productId");
//
//     let products = [];
//     let selectedProduct = null;
//     let originalPromotion = null;
//
//     // Initialize the editor
//     initializeEditor();
//
//     function initializeEditor() {
//         if (!promoId) {
//             showError("No promotion ID provided");
//             return;
//         }
//
//         loadProducts();
//         loadPromotionData();
//         setupEventListeners();
//         setupFormValidation();
//     }
//
//     function loadProducts() {
//         fetch("/api/inventory/products")
//             .then(res => res.json())
//             .then(data => {
//                 products = data.items || [];
//                 populateProductSelect();
//             })
//             .catch(err => {
//                 console.error("Error loading products:", err);
//                 showError("Failed to load products");
//             });
//     }
//
//     function populateProductSelect() {
//         productSelect.innerHTML = '<option value="">-- Select Product --</option>';
//
//         if (products.length > 0) {
//             products.forEach(product => {
//                 const option = document.createElement("option");
//                 option.value = product.id;
//                 option.textContent = `${product.name} - $${product.price.toFixed(2)}`;
//                 option.dataset.price = product.price;
//                 option.dataset.name = product.name;
//                 productSelect.appendChild(option);
//             });
//         }
//     }
//
//     function loadPromotionData() {
//         showLoading(true);
//
//         // Try the direct get endpoint first, then fallback to all promotions
//         fetch(`/promotions/get/${promoId}`)
//             .then(res => {
//                 if (res.ok) {
//                     return res.json();
//                 } else {
//                     // Fallback to fetching all promotions
//                     return fetch("/promotions/all")
//                         .then(res => res.json())
//                         .then(promotions => {
//                             const promo = promotions.find(p => p.id == promoId);
//                             if (!promo) {
//                                 throw new Error("Promotion not found");
//                             }
//                             return promo;
//                         });
//                 }
//             })
//             .then(promo => {
//                 if (promo) {
//                     originalPromotion = promo;
//                     populateForm(promo);
//                     updatePromotionInfo(promo);
//                     updatePreview();
//                 } else {
//                     showError("Promotion not found");
//                 }
//                 showLoading(false);
//             })
//             .catch(err => {
//                 console.error("Error loading promotion:", err);
//                 showError("Failed to load promotion data. Please check if the promotion ID is valid.");
//                 showLoading(false);
//             });
//     }
//
//     function populateForm(promo) {
//         document.getElementById("promoId").value = promo.id;
//         document.getElementById("title").value = promo.title;
//         document.getElementById("type").value = promo.type;
//         document.getElementById("value").value = promo.value;
//         document.getElementById("startDate").value = promo.startDate || "";
//         document.getElementById("endDate").value = promo.endDate || "";
//
//         if (promo.productId) {
//             productSelect.value = promo.productId;
//             handleProductChange();
//         }
//     }
//
//     function updatePromotionInfo(promo) {
//         document.getElementById("promoIdDisplay").textContent = promo.id;
//         document.getElementById("createdDate").textContent = promo.startDate || "Not set";
//
//         const status = getPromotionStatus(promo);
//         const statusElement = document.getElementById("promoStatus");
//         statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
//         statusElement.className = `status-${status}`;
//     }
//
//     function getPromotionStatus(promo) {
//         const now = new Date();
//         const startDate = promo.startDate ? new Date(promo.startDate) : null;
//         const endDate = promo.endDate ? new Date(promo.endDate) : null;
//
//         if (startDate && now < startDate) {
//             return 'upcoming';
//         } else if (endDate && now > endDate) {
//             return 'expired';
//         } else {
//             return 'active';
//         }
//     }
//
//     function setupEventListeners() {
//         // Product selection change
//         productSelect.addEventListener("change", handleProductChange);
//
//         // Form inputs change for real-time preview
//         document.getElementById("type").addEventListener("change", updatePreview);
//         document.getElementById("value").addEventListener("input", updatePreview);
//         document.getElementById("productId").addEventListener("change", updatePreview);
//
//         // Form submission
//         form.addEventListener("submit", handleFormSubmit);
//
//         // Delete button
//         document.getElementById("deleteBtn").addEventListener("click", handleDelete);
//
//         // Real-time validation
//         document.getElementById("title").addEventListener("blur", validateTitle);
//         document.getElementById("value").addEventListener("blur", validateValue);
//         document.getElementById("endDate").addEventListener("change", validateDates);
//     }
//
//     function handleProductChange() {
//         const selectedOption = productSelect.options[productSelect.selectedIndex];
//         if (selectedOption.value) {
//             selectedProduct = {
//                 id: selectedOption.value,
//                 name: selectedOption.dataset.name,
//                 price: parseFloat(selectedOption.dataset.price)
//             };
//             updatePreview();
//         } else {
//             selectedProduct = null;
//         }
//     }
//
//     function updatePreview() {
//         if (!selectedProduct) {
//             return;
//         }
//
//         const type = document.getElementById("type").value;
//         const value = parseFloat(document.getElementById("value").value) || 0;
//
//         if (!type || value <= 0) {
//             return;
//         }
//
//         let discountAmount = 0;
//         let finalPrice = selectedProduct.price;
//         let discountText = "";
//
//         if (type === "PERCENTAGE") {
//             discountAmount = (selectedProduct.price * value) / 100;
//             finalPrice = selectedProduct.price - discountAmount;
//             discountText = `${value}% OFF`;
//         } else if (type === "FLAT") {
//             discountAmount = Math.min(value, selectedProduct.price);
//             finalPrice = selectedProduct.price - discountAmount;
//             discountText = `$${value.toFixed(2)} OFF`;
//         }
//
//         // Update preview elements
//         document.getElementById("previewProduct").textContent = selectedProduct.name;
//         document.getElementById("previewOriginalPrice").textContent = `$${selectedProduct.price.toFixed(2)}`;
//         document.getElementById("previewDiscount").textContent = discountText;
//         document.getElementById("previewFinalPrice").textContent = `$${finalPrice.toFixed(2)}`;
//     }
//
//     function setupFormValidation() {
//         const inputs = form.querySelectorAll('input[required], select[required]');
//         inputs.forEach(input => {
//             input.addEventListener('blur', () => validateField(input));
//             input.addEventListener('input', () => clearError(input));
//         });
//     }
//
//     function validateField(field) {
//         const fieldName = field.name || field.id;
//         clearError(field);
//
//         switch (fieldName) {
//             case 'title':
//                 return validateTitle();
//             case 'type':
//                 return validateType();
//             case 'value':
//                 return validateValue();
//             case 'productId':
//                 return validateProduct();
//             default:
//                 return true;
//         }
//     }
//
//     function validateTitle() {
//         const title = document.getElementById("title");
//         const titleValue = title.value.trim();
//
//         if (!titleValue) {
//             showFieldError(title, "Title is required");
//             return false;
//         }
//
//         if (titleValue.length < 3) {
//             showFieldError(title, "Title must be at least 3 characters");
//             return false;
//         }
//
//         return true;
//     }
//
//     function validateType() {
//         const type = document.getElementById("type");
//
//         if (!type.value) {
//             showFieldError(type, "Please select a discount type");
//             return false;
//         }
//
//         return true;
//     }
//
//     function validateValue() {
//         const value = document.getElementById("value");
//         const valueNum = parseFloat(value.value);
//
//         if (!value.value || isNaN(valueNum)) {
//             showFieldError(value, "Please enter a valid discount value");
//             return false;
//         }
//
//         if (valueNum <= 0) {
//             showFieldError(value, "Discount value must be greater than 0");
//             return false;
//         }
//
//         const type = document.getElementById("type").value;
//         if (type === "PERCENTAGE" && valueNum > 100) {
//             showFieldError(value, "Percentage discount cannot exceed 100%");
//             return false;
//         }
//
//         if (selectedProduct && type === "FLAT" && valueNum > selectedProduct.price) {
//             showFieldError(value, "Flat discount cannot exceed product price");
//             return false;
//         }
//
//         return true;
//     }
//
//     function validateProduct() {
//         const product = document.getElementById("productId");
//
//         if (!product.value) {
//             showFieldError(product, "Please select a product");
//             return false;
//         }
//
//         return true;
//     }
//
//     function validateDates() {
//         const startDate = document.getElementById("startDate");
//         const endDate = document.getElementById("endDate");
//
//         clearError(startDate);
//         clearError(endDate);
//
//         if (startDate.value && endDate.value) {
//             const start = new Date(startDate.value);
//             const end = new Date(endDate.value);
//
//             if (end <= start) {
//                 showFieldError(endDate, "End date must be after start date");
//                 return false;
//             }
//         }
//
//         return true;
//     }
//
//     function showFieldError(field, message) {
//         const errorElement = document.getElementById(field.id + "Error");
//         if (errorElement) {
//             errorElement.textContent = message;
//             errorElement.style.display = "block";
//         }
//         field.style.borderColor = "#e74c3c";
//     }
//
//     function clearError(field) {
//         const errorElement = document.getElementById(field.id + "Error");
//         if (errorElement) {
//             errorElement.style.display = "none";
//         }
//         field.style.borderColor = "#e1e8ed";
//     }
//
//     function handleFormSubmit(e) {
//         e.preventDefault();
//
//         // Validate all fields
//         const isValid = validateTitle() && validateType() && validateValue() &&
//                        validateProduct() && validateDates();
//
//         if (!isValid) {
//             showError("Please fix the errors before submitting");
//             return;
//         }
//
//         showLoading(true);
//
//         const formData = new URLSearchParams();
//         formData.append("id", promoId);
//         formData.append("title", document.getElementById("title").value);
//         formData.append("type", document.getElementById("type").value);
//         formData.append("value", document.getElementById("value").value);
//         formData.append("productId", document.getElementById("productId").value);
//         formData.append("startDate", document.getElementById("startDate").value);
//         formData.append("endDate", document.getElementById("endDate").value);
//
//         fetch("/promotions/update", { method: "POST", body: formData })
//             .then(res => res.json())
//             .then(res => {
//                 if (res.status === "success") {
//                     showSuccess("Promotion updated successfully!");
//                     setTimeout(() => {
//                         window.location.href = "/promotions/list";
//                     }, 1500);
//                 } else {
//                     throw new Error(res.message || "Failed to update promotion");
//                 }
//             })
//             .catch(error => {
//                 console.error("Error:", error);
//                 showError("Failed to update promotion. Please try again.");
//             })
//             .finally(() => {
//                 showLoading(false);
//             });
//     }
//
//     function handleDelete() {
//         if (!confirm("Are you sure you want to delete this promotion? This action cannot be undone.")) {
//             return;
//         }
//
//         const deleteBtn = document.getElementById("deleteBtn");
//         const originalText = deleteBtn.innerHTML;
//         deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
//         deleteBtn.disabled = true;
//
//         fetch(`/promotions/delete?id=${promoId}`, { method: "POST" })
//             .then(res => res.json())
//             .then(res => {
//                 if (res.status === "success") {
//                     showSuccess("Promotion deleted successfully!");
//                     setTimeout(() => {
//                         window.location.href = "/promotions/list";
//                     }, 1500);
//                 } else {
//                     throw new Error("Failed to delete promotion");
//                 }
//             })
//             .catch(error => {
//                 console.error("Error:", error);
//                 showError("Failed to delete promotion. Please try again.");
//                 deleteBtn.innerHTML = originalText;
//                 deleteBtn.disabled = false;
//             });
//     }
//
//     function showLoading(show) {
//         loading.style.display = show ? "block" : "none";
//     }
//
//     function showError(message) {
//         const errorDiv = document.createElement("div");
//         errorDiv.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             background: #e74c3c;
//             color: white;
//             padding: 15px 20px;
//             border-radius: 8px;
//             box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
//             z-index: 1000;
//             animation: slideIn 0.3s ease;
//         `;
//         errorDiv.textContent = message;
//         document.body.appendChild(errorDiv);
//
//         setTimeout(() => {
//             errorDiv.remove();
//         }, 5000);
//     }
//
//     function showSuccess(message) {
//         const successDiv = document.createElement("div");
//         successDiv.style.cssText = `
//             position: fixed;
//             top: 20px;
//             right: 20px;
//             background: #27ae60;
//             color: white;
//             padding: 15px 20px;
//             border-radius: 8px;
//             box-shadow: 0 5px 15px rgba(39, 174, 96, 0.3);
//             z-index: 1000;
//             animation: slideIn 0.3s ease;
//         `;
//         successDiv.textContent = message;
//         document.body.appendChild(successDiv);
//
//         setTimeout(() => {
//             successDiv.remove();
//         }, 3000);
//     }
// });
//
// // Add CSS animations
// const style = document.createElement('style');
// style.textContent = `
//     @keyframes slideIn {
//         from { transform: translateX(100%); opacity: 0; }
//         to { transform: translateX(0); opacity: 1; }
//     }
//
//     .status-active { color: #27ae60; font-weight: 600; }
//     .status-expired { color: #e74c3c; font-weight: 600; }
//     .status-upcoming { color: #f39c12; font-weight: 600; }
// `;
// document.head.appendChild(style);













// Advanced Promotion Editor JavaScript
document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const promoId = params.get("id");

    const form = document.getElementById("editPromotionForm");
    const loading = document.getElementById("loading");
    const productSelect = document.getElementById("productId");

    let products = [];
    let selectedProduct = null;
    let originalPromotion = null;

    // Initialize the editor
    initializeEditor();

    function initializeEditor() {
        if (!promoId) {
            showError("No promotion ID provided");
            return;
        }

        loadProducts();
        loadPromotionData();
        setupEventListeners();
        setupFormValidation();
        setupDateValidation(); // Add date validation setup
    }

    function loadProducts() {
        fetch("/api/inventory/products")
            .then(res => res.json())
            .then(data => {
                products = data.items || [];
                populateProductSelect();
            })
            .catch(err => {
                console.error("Error loading products:", err);
                showError("Failed to load products");
            });
    }

    function populateProductSelect() {
        productSelect.innerHTML = '<option value="">-- Select Product --</option>';

        if (products.length > 0) {
            products.forEach(product => {
                const option = document.createElement("option");
                option.value = product.id;
                option.textContent = `${product.name} - $${product.price.toFixed(2)}`;
                option.dataset.price = product.price;
                option.dataset.name = product.name;
                productSelect.appendChild(option);
            });
        }
    }

    function loadPromotionData() {
        showLoading(true);

        // Try the direct get endpoint first, then fallback to all promotions
        fetch(`/promotions/get/${promoId}`)
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    // Fallback to fetching all promotions
                    return fetch("/promotions/all")
                        .then(res => res.json())
                        .then(promotions => {
                            const promo = promotions.find(p => p.id == promoId);
                            if (!promo) {
                                throw new Error("Promotion not found");
                            }
                            return promo;
                        });
                }
            })
            .then(promo => {
                if (promo) {
                    originalPromotion = promo;
                    populateForm(promo);
                    updatePromotionInfo(promo);
                    updatePreview();
                    setMinimumDates(); // Set minimum dates after form is populated
                } else {
                    showError("Promotion not found");
                }
                showLoading(false);
            })
            .catch(err => {
                console.error("Error loading promotion:", err);
                showError("Failed to load promotion data. Please check if the promotion ID is valid.");
                showLoading(false);
            });
    }

    function populateForm(promo) {
        document.getElementById("promoId").value = promo.id;
        document.getElementById("title").value = promo.title;
        document.getElementById("type").value = promo.type;
        document.getElementById("value").value = promo.value;
        document.getElementById("startDate").value = promo.startDate || "";
        document.getElementById("endDate").value = promo.endDate || "";

        if (promo.productId) {
            productSelect.value = promo.productId;
            handleProductChange();
        }
    }

    function updatePromotionInfo(promo) {
        document.getElementById("promoIdDisplay").textContent = promo.id;
        document.getElementById("createdDate").textContent = promo.startDate || "Not set";

        const status = getPromotionStatus(promo);
        const statusElement = document.getElementById("promoStatus");
        statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusElement.className = `status-${status}`;
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

    function setMinimumDates() {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        const startDate = document.getElementById("startDate");
        const endDate = document.getElementById("endDate");

        // Set minimum date to today for new dates
        if (startDate) {
            startDate.min = todayString;
        }

        if (endDate) {
            endDate.min = todayString;
        }
    }

    function setupDateValidation() {
        const startDate = document.getElementById("startDate");
        const endDate = document.getElementById("endDate");

        if (startDate) {
            startDate.addEventListener("change", function() {
                validateDates();
                // Update end date minimum when start date changes
                if (endDate && this.value) {
                    endDate.min = this.value;
                }
            });
        }

        if (endDate) {
            endDate.addEventListener("change", validateDates);
        }
    }

    function setupEventListeners() {
        // Product selection change
        productSelect.addEventListener("change", handleProductChange);

        // Form inputs change for real-time preview
        document.getElementById("type").addEventListener("change", updatePreview);
        document.getElementById("value").addEventListener("input", updatePreview);
        document.getElementById("productId").addEventListener("change", updatePreview);

        // Form submission
        form.addEventListener("submit", handleFormSubmit);

        // Delete button
        document.getElementById("deleteBtn").addEventListener("click", handleDelete);

        // Real-time validation
        document.getElementById("title").addEventListener("blur", validateTitle);
        document.getElementById("value").addEventListener("blur", validateValue);
        document.getElementById("endDate").addEventListener("change", validateDates);
    }

    function handleProductChange() {
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        if (selectedOption.value) {
            selectedProduct = {
                id: selectedOption.value,
                name: selectedOption.dataset.name,
                price: parseFloat(selectedOption.dataset.price)
            };
            updatePreview();
        } else {
            selectedProduct = null;
        }
    }

    function updatePreview() {
        if (!selectedProduct) {
            return;
        }

        const type = document.getElementById("type").value;
        const value = parseFloat(document.getElementById("value").value) || 0;

        if (!type || value <= 0) {
            return;
        }

        let discountAmount = 0;
        let finalPrice = selectedProduct.price;
        let discountText = "";

        if (type === "PERCENTAGE") {
            discountAmount = (selectedProduct.price * value) / 100;
            finalPrice = selectedProduct.price - discountAmount;
            discountText = `${value}% OFF`;
        } else if (type === "FLAT") {
            discountAmount = Math.min(value, selectedProduct.price);
            finalPrice = selectedProduct.price - discountAmount;
            discountText = `$${value.toFixed(2)} OFF`;
        }

        // Update preview elements
        document.getElementById("previewProduct").textContent = selectedProduct.name;
        document.getElementById("previewOriginalPrice").textContent = `$${selectedProduct.price.toFixed(2)}`;
        document.getElementById("previewDiscount").textContent = discountText;
        document.getElementById("previewFinalPrice").textContent = `$${finalPrice.toFixed(2)}`;
    }

    function setupFormValidation() {
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearError(input));
        });
    }

    function validateField(field) {
        const fieldName = field.name || field.id;
        clearError(field);

        switch (fieldName) {
            case 'title':
                return validateTitle();
            case 'type':
                return validateType();
            case 'value':
                return validateValue();
            case 'productId':
                return validateProduct();
            default:
                return true;
        }
    }

    function validateTitle() {
        const title = document.getElementById("title");
        const titleValue = title.value.trim();

        if (!titleValue) {
            showFieldError(title, "Title is required");
            return false;
        }

        if (titleValue.length < 3) {
            showFieldError(title, "Title must be at least 3 characters");
            return false;
        }

        return true;
    }

    function validateType() {
        const type = document.getElementById("type");

        if (!type.value) {
            showFieldError(type, "Please select a discount type");
            return false;
        }

        return true;
    }

    function validateValue() {
        const value = document.getElementById("value");
        const valueNum = parseFloat(value.value);

        if (!value.value || isNaN(valueNum)) {
            showFieldError(value, "Please enter a valid discount value");
            return false;
        }

        if (valueNum <= 0) {
            showFieldError(value, "Discount value must be greater than 0");
            return false;
        }

        const type = document.getElementById("type").value;
        if (type === "PERCENTAGE" && valueNum > 100) {
            showFieldError(value, "Percentage discount cannot exceed 100%");
            return false;
        }

        if (selectedProduct && type === "FLAT" && valueNum > selectedProduct.price) {
            showFieldError(value, "Flat discount cannot exceed product price");
            return false;
        }

        return true;
    }

    function validateProduct() {
        const product = document.getElementById("productId");

        if (!product.value) {
            showFieldError(product, "Please select a product");
            return false;
        }

        return true;
    }

    function validateDates() {
        const startDate = document.getElementById("startDate");
        const endDate = document.getElementById("endDate");
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        clearError(startDate);
        clearError(endDate);

        // Only validate against today for new dates (allow existing past dates for active promotions)
        if (startDate && startDate.value) {
            const start = new Date(startDate.value);
            start.setHours(0, 0, 0, 0);

            // Allow existing dates but warn about new past dates
            if (originalPromotion && originalPromotion.startDate !== startDate.value && start < today) {
                showFieldError(startDate, "Start date cannot be set to a past date");
                return false;
            }
        }

        if (endDate && endDate.value) {
            const end = new Date(endDate.value);
            end.setHours(0, 0, 0, 0);

            // Always prevent past end dates for consistency
            if (end < today) {
                showFieldError(endDate, "End date cannot be in the past");
                return false;
            }
        }

        // Validate date range
        if (startDate && startDate.value && endDate && endDate.value) {
            const start = new Date(startDate.value);
            const end = new Date(endDate.value);

            if (end <= start) {
                showFieldError(endDate, "End date must be after start date");
                return false;
            }
        }

        return true;
    }

    function showFieldError(field, message) {
        const errorElement = document.getElementById(field.id + "Error");
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
        }
        field.style.borderColor = "#e74c3c";
    }

    function clearError(field) {
        const errorElement = document.getElementById(field.id + "Error");
        if (errorElement) {
            errorElement.style.display = "none";
        }
        field.style.borderColor = "#e1e8ed";
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        // Validate all fields
        const isValid = validateTitle() && validateType() && validateValue() &&
            validateProduct() && validateDates();

        if (!isValid) {
            showError("Please fix the errors before submitting");
            return;
        }

        showLoading(true);

        const formData = new URLSearchParams();
        formData.append("id", promoId);
        formData.append("title", document.getElementById("title").value);
        formData.append("type", document.getElementById("type").value);
        formData.append("value", document.getElementById("value").value);
        formData.append("productId", document.getElementById("productId").value);
        formData.append("startDate", document.getElementById("startDate").value);
        formData.append("endDate", document.getElementById("endDate").value);

        fetch("/promotions/update", { method: "POST", body: formData })
            .then(res => res.json())
            .then(res => {
                if (res.status === "success") {
                    showSuccess("Promotion updated successfully!");
                    setTimeout(() => {
                        window.location.href = "/promotions/list";
                    }, 1500);
                } else {
                    throw new Error(res.message || "Failed to update promotion");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showError("Failed to update promotion. Please try again.");
            })
            .finally(() => {
                showLoading(false);
            });
    }

    function handleDelete() {
        if (!confirm("Are you sure you want to delete this promotion? This action cannot be undone.")) {
            return;
        }

        const deleteBtn = document.getElementById("deleteBtn");
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        deleteBtn.disabled = true;

        fetch(`/promotions/delete?id=${promoId}`, { method: "POST" })
            .then(res => res.json())
            .then(res => {
                if (res.status === "success") {
                    showSuccess("Promotion deleted successfully!");
                    setTimeout(() => {
                        window.location.href = "/promotions/list";
                    }, 1500);
                } else {
                    throw new Error("Failed to delete promotion");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showError("Failed to delete promotion. Please try again.");
                deleteBtn.innerHTML = originalText;
                deleteBtn.disabled = false;
            });
    }

    function showLoading(show) {
        loading.style.display = show ? "block" : "none";
    }

    function showError(message) {
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
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .status-active { color: #27ae60; font-weight: 600; }
    .status-expired { color: #e74c3c; font-weight: 600; }
    .status-upcoming { color: #f39c12; font-weight: 600; }
`;
document.head.appendChild(style);

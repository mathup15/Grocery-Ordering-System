// // Advanced Promotion Manager JavaScript
// document.addEventListener("DOMContentLoaded", function () {
//     const productSelect = document.getElementById("productId");
//     const form = document.getElementById("promotionForm");
//     const preview = document.getElementById("promotionPreview");
//     const loading = document.getElementById("loading");
//
//     let products = [];
//     let selectedProduct = null;
//
//     // Initialize the application
//     initializeApp();
//
//     function initializeApp() {
//         loadProducts();
//         setupEventListeners();
//         setupFormValidation();
//         setupDateValidation();
//     }
//
//     function loadProducts() {
//         showLoading(true);
//
//     fetch("/api/inventory/products")
//         .then(res => res.json())
//         .then(data => {
//                 products = data.items || [];
//                 populateProductSelect();
//                 showLoading(false);
//             })
//             .catch(err => {
//                 console.error("Error loading products:", err);
//                 showError("Failed to load products. Please refresh the page.");
//                 showLoading(false);
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
//         } else {
//             const option = document.createElement("option");
//             option.textContent = "No products available";
//             option.disabled = true;
//             productSelect.appendChild(option);
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
//             hidePreview();
//         }
//     }
//
//     function updatePreview() {
//         if (!selectedProduct) {
//             hidePreview();
//             return;
//         }
//
//         const type = document.getElementById("type").value;
//         const value = parseFloat(document.getElementById("value").value) || 0;
//
//         if (!type || value <= 0) {
//             hidePreview();
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
//
//         showPreview();
//     }
//
//     function showPreview() {
//         preview.style.display = "block";
//         preview.style.animation = "fadeIn 0.5s ease-in";
//     }
//
//     function hidePreview() {
//         preview.style.display = "none";
//     }
//
//     function setupFormValidation() {
//         // Real-time validation for all inputs
//         const inputs = form.querySelectorAll('input[required], select[required]');
//         inputs.forEach(input => {
//             input.addEventListener('blur', () => validateField(input));
//             input.addEventListener('input', () => clearError(input));
//         });
//     }
//
//     function validateField(field) {
//         const value = field.value.trim();
//         const fieldName = field.name;
//
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
//         if (titleValue.length > 100) {
//             showFieldError(title, "Title must be less than 100 characters");
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
//     function setupDateValidation() {
//         const startDate = document.getElementById("startDate");
//         const endDate = document.getElementById("endDate");
//
//         startDate.addEventListener("change", validateDates);
//         endDate.addEventListener("change", validateDates);
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
//         const errorElement = document.getElementById(field.name + "Error");
//         if (errorElement) {
//             errorElement.textContent = message;
//             errorElement.style.display = "block";
//         }
//         field.style.borderColor = "#e74c3c";
//     }
//
//     function clearError(field) {
//         const errorElement = document.getElementById(field.name + "Error");
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
//         // Show loading
//         showLoading(true);
//
//         // Submit form
//         const formData = new FormData(form);
//
//         fetch("/promotions/add", {
//             method: "POST",
//             body: formData
//         })
//         .then(response => {
//             if (response.ok) {
//                 showSuccess("Promotion created successfully!");
//                 setTimeout(() => {
//                     window.location.href = "/promotions/list";
//                 }, 1500);
//             } else {
//                 throw new Error("Failed to create promotion");
//             }
//         })
//         .catch(error => {
//             console.error("Error:", error);
//             showError("Failed to create promotion. Please try again.");
//         })
//         .finally(() => {
//             showLoading(false);
//         });
//     }
//
//     function showLoading(show) {
//         loading.style.display = show ? "block" : "none";
//     }
//
//     function showError(message) {
//         // Create or update error message
//         let errorDiv = document.getElementById("errorMessage");
//         if (!errorDiv) {
//             errorDiv = document.createElement("div");
//             errorDiv.id = "errorMessage";
//             errorDiv.style.cssText = `
//                 background: #e74c3c;
//                 color: white;
//                 padding: 15px;
//                 border-radius: 8px;
//                 margin: 20px 0;
//                 text-align: center;
//                 display: none;
//             `;
//             form.insertBefore(errorDiv, form.firstChild);
//         }
//
//         errorDiv.textContent = message;
//         errorDiv.style.display = "block";
//
//         setTimeout(() => {
//             errorDiv.style.display = "none";
//         }, 5000);
//     }
//
//     function showSuccess(message) {
//         // Create or update success message
//         let successDiv = document.getElementById("successMessage");
//         if (!successDiv) {
//             successDiv = document.createElement("div");
//             successDiv.id = "successMessage";
//             successDiv.style.cssText = `
//                 background: #27ae60;
//                 color: white;
//                 padding: 15px;
//                 border-radius: 8px;
//                 margin: 20px 0;
//                 text-align: center;
//                 display: none;
//             `;
//             form.insertBefore(successDiv, form.firstChild);
//         }
//
//         successDiv.textContent = message;
//         successDiv.style.display = "block";
//     }
// });
//
// // Advanced options toggle
// function toggleAdvanced() {
//     const content = document.getElementById("advancedContent");
//     const button = document.querySelector(".toggle-advanced");
//
//     if (content.style.display === "none") {
//         content.style.display = "block";
//         button.innerHTML = '<i class="fas fa-cog"></i> Hide Advanced Options';
//     } else {
//         content.style.display = "none";
//         button.innerHTML = '<i class="fas fa-cog"></i> Advanced Options';
//     }
// }
//
// // Add CSS animation for preview
// const style = document.createElement('style');
// style.textContent = `
//     @keyframes fadeIn {
//         from { opacity: 0; transform: translateY(20px); }
//         to { opacity: 1; transform: translateY(0); }
//     }
// `;
// document.head.appendChild(style);
//
//
//


// Advanced Promotion Manager JavaScript
document.addEventListener("DOMContentLoaded", function () {
    const productSelect = document.getElementById("productId");
    const form = document.getElementById("promotionForm");
    const preview = document.getElementById("promotionPreview");
    const loading = document.getElementById("loading");

    let products = [];
    let selectedProduct = null;

    // Initialize the application
    initializeApp();

    function initializeApp() {
        loadProducts();
        setupEventListeners();
        setupFormValidation();
        setupDateValidation();
        setMinimumDates(); // Set minimum dates to today
    }

    function loadProducts() {
        showLoading(true);

        fetch("/api/inventory/products")
            .then(res => res.json())
            .then(data => {
                products = data.items || [];
                populateProductSelect();
                showLoading(false);
            })
            .catch(err => {
                console.error("Error loading products:", err);
                showError("Failed to load products. Please refresh the page.");
                showLoading(false);
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
        } else {
            const option = document.createElement("option");
            option.textContent = "No products available";
            option.disabled = true;
            productSelect.appendChild(option);
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
            hidePreview();
        }
    }

    function updatePreview() {
        if (!selectedProduct) {
            hidePreview();
            return;
        }

        const type = document.getElementById("type").value;
        const value = parseFloat(document.getElementById("value").value) || 0;

        if (!type || value <= 0) {
            hidePreview();
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

        showPreview();
    }

    function showPreview() {
        preview.style.display = "block";
        preview.style.animation = "fadeIn 0.5s ease-in";
    }

    function hidePreview() {
        preview.style.display = "none";
    }

    function setupFormValidation() {
        // Real-time validation for all inputs
        const inputs = form.querySelectorAll('input[required], select[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearError(input));
        });
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;

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

        if (titleValue.length > 100) {
            showFieldError(title, "Title must be less than 100 characters");
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

    function setMinimumDates() {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        const startDate = document.getElementById("startDate");
        const endDate = document.getElementById("endDate");

        // Set minimum date to today
        if (startDate) {
            startDate.min = todayString;
            // Set default start date to today if not set
            if (!startDate.value) {
                startDate.value = todayString;
            }
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

    function validateDates() {
        const startDate = document.getElementById("startDate");
        const endDate = document.getElementById("endDate");
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day

        clearError(startDate);
        clearError(endDate);

        // Validate start date
        if (startDate && startDate.value) {
            const start = new Date(startDate.value);
            start.setHours(0, 0, 0, 0);

            if (start < today) {
                showFieldError(startDate, "Start date cannot be in the past");
                return false;
            }
        }

        // Validate end date
        if (endDate && endDate.value) {
            const end = new Date(endDate.value);
            end.setHours(0, 0, 0, 0);

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
        const errorElement = document.getElementById(field.name + "Error");
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = "block";
        }
        field.style.borderColor = "#e74c3c";
    }

    function clearError(field) {
        const errorElement = document.getElementById(field.name + "Error");
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

        // Show loading
        showLoading(true);

        // Submit form
        const formData = new FormData(form);

        fetch("/promotions/add", {
            method: "POST",
            body: formData
        })
            .then(response => {
                if (response.ok) {
                    showSuccess("Promotion created successfully!");
                    setTimeout(() => {
                        window.location.href = "/promotions/list";
                    }, 1500);
                } else {
                    throw new Error("Failed to create promotion");
                }
            })
            .catch(error => {
                console.error("Error:", error);
                showError("Failed to create promotion. Please try again.");
            })
            .finally(() => {
                showLoading(false);
            });
    }

    function showLoading(show) {
        loading.style.display = show ? "block" : "none";
    }

    function showError(message) {
        // Create or update error message
        let errorDiv = document.getElementById("errorMessage");
        if (!errorDiv) {
            errorDiv = document.createElement("div");
            errorDiv.id = "errorMessage";
            errorDiv.style.cssText = `
                background: #e74c3c;
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
                display: none;
            `;
            form.insertBefore(errorDiv, form.firstChild);
        }

        errorDiv.textContent = message;
        errorDiv.style.display = "block";

        setTimeout(() => {
            errorDiv.style.display = "none";
        }, 5000);
    }

    function showSuccess(message) {
        // Create or update success message
        let successDiv = document.getElementById("successMessage");
        if (!successDiv) {
            successDiv = document.createElement("div");
            successDiv.id = "successMessage";
            successDiv.style.cssText = `
                background: #27ae60;
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
                display: none;
            `;
            form.insertBefore(successDiv, form.firstChild);
        }

        successDiv.textContent = message;
        successDiv.style.display = "block";
    }
});

// Advanced options toggle
function toggleAdvanced() {
    const content = document.getElementById("advancedContent");
    const button = document.querySelector(".toggle-advanced");

    if (content.style.display === "none") {
        content.style.display = "block";
        button.innerHTML = '<i class="fas fa-cog"></i> Hide Advanced Options';
    } else {
        content.style.display = "none";
        button.innerHTML = '<i class="fas fa-cog"></i> Advanced Options';
    }
}

// Add CSS animation for preview
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);
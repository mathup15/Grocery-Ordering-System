(() => {
    const API = {
        list: "/api/inventory/products",
        create: "/api/inventory/products",
        update: id => "/api/inventory/products/${id}",
        export: "/api/inventory/reports/low-stock",
        importCsv: "/api/inventory/csv/import",
        stock: {
            update: id => `/api/inventory/stock/${id}`,
            adjust: id => `/api/inventory/stock/${id}/adjust`,
            history: id => `/api/inventory/stock/${id}/history`
        }
    };

    const $ = s => document.querySelector(s);
    const grid = $("#grid"), empty = $("#empty"), count=$("#count"), prev=$("#prev"), next=$("#next");

    let page=0, size=12, q="", cat="", sort="name", lowOnly=false, editingId=null, currentProduct=null;

    // Authentication helpers - FIXED
    function getAuthToken() {
        return localStorage.getItem('auth.token');
    }

    function getAuthRole() {
        return localStorage.getItem('auth.role');
    }

    function isLoggedIn() {
        return !!getAuthToken() && !!getAuthRole();
    }

    function redirectToLogin() {
        localStorage.removeItem('auth.token');
        localStorage.removeItem('auth.role');
        window.location.href = '/index.html';
    }

    function authHeaders() {
        const token = getAuthToken();
        return token ? {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        } : {};
    }

    // Event listeners
    $("#q").addEventListener("input", debounce(()=>{
        q=$("#q").value.trim(); page=0; load();
    },300));
    $("#cat").addEventListener("change", ()=>{ cat=$("#cat").value; page=0; load(); });
    $("#sort").addEventListener("change", ()=>{ sort=$("#sort").value; page=0; load(); });
    $("#lowOnly").addEventListener("change", ()=>{ lowOnly=$("#lowOnly").checked; page=0; load(); });

    prev.addEventListener("click", ()=>{ page=Math.max(0,page-1); load(); });
    next.addEventListener("click", ()=>{ page=page+1; load(); });

    $("#btnAdd").addEventListener("click", ()=> openDlg());
    $("#btnExport").addEventListener("click", exportCsv);
    $("#btnImport").addEventListener("click", ()=>$("#csv").click());
    $("#csv").addEventListener("change", importCsv);
    $("#form").addEventListener("submit", onSave);
    $("#stockForm").addEventListener("submit", onStockUpdate);
    $("#image").addEventListener("change", previewImage);
    $("#clearImg").addEventListener("click", clearImage);

    // Initialize
    load(); seedCategories();

    async function load(){
        if (!isLoggedIn()) {
            redirectToLogin();
            return;
        }

        skeleton();
        try{
            const url = new URL(API.list, location.origin);
            url.searchParams.set("page", page); url.searchParams.set("size", size);
            if(q) url.searchParams.set("q", q); if(cat) url.searchParams.set("category", cat);
            if(sort) url.searchParams.set("sort", sort); if(lowOnly) url.searchParams.set("lowOnly", true);

            const res = await fetch(url, {
                headers: authHeaders()
            });

            if(res.status === 401) {
                redirectToLogin();
                return;
            }

            if(!res.ok) throw new Error(`Failed to load (HTTP ${res.status})`);
            const data = await res.json();
            render(data.items || data.content || [], data.total || data.totalElements || 0);
        }catch(e){
            grid.innerHTML = `<div class="empty"> ${e.message} </div>`;
        }
    }

    function skeleton(){
        grid.innerHTML = Array.from({length:size}).map(()=>`
            <div class="card"><div class="thumb" style="background:#0e3b2d"></div><div class="meta">
            <div class="muted">Loading…</div></div></div>`).join("");
        empty.classList.add("hidden");
    }

    function render(items,total){
        if(!items.length){ grid.innerHTML=""; empty.classList.remove("hidden"); count.textContent="0 items"; prev.disabled=next.disabled=true; return; }
        empty.classList.add("hidden");
        const tpl = document.getElementById("tpl"); grid.innerHTML="";
        const placeholder = "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop";

        items.forEach(p=>{
            const node = tpl.content.cloneNode(true);
            const img = node.querySelector("img");
            img.src = p.imageUrl || placeholder;
            img.alt = p.name || "product";
            img.referrerPolicy = "no-referrer";

            node.querySelector("h3").textContent = p.name;
            node.querySelector(".sku").textContent = p.sku;
            node.querySelector(".cat").textContent = p.category || "General";
            node.querySelector(".price").textContent = `LKR ${Number(p.price||0).toLocaleString()}`;

            const avail = (p.availableQty ?? (p.stockOnHand - (p.reservedQty||0))) || 0;
            const stockEl = node.querySelector(".stock");
            stockEl.textContent = Math.max(0, avail);

            // Add stock status styling
            if (avail <= 0) {
                stockEl.classList.add("low-stock");
                stockEl.textContent = "Out of stock";
            } else if (avail <= (p.reorderPoint || 5)) {
                stockEl.classList.add("low-stock");
                stockEl.textContent = `${avail} (Low stock)`;
            }

            node.querySelector(".btn-edit").addEventListener("click", ()=> openDlg(p));
            node.querySelector(".btn-stock").addEventListener("click", ()=> openStockDlg(p));

            grid.appendChild(node);
        });

        count.textContent = `${total} items`;
        prev.disabled = page<=0;
        next.disabled = (page+1)*size >= total;
    }

    function seedCategories(){
        const c = $("#cat");
        ["Grocery","Fruits","Vegetables","Dairy","Bakery","Frozen","Beverages"].forEach(x=>{
            const o = document.createElement("option"); o.value=o.textContent=x; c.appendChild(o);
        });
    }

    function openDlg(p){
        editingId = p?.id ?? null;
        $("#dlgTitle").textContent = editingId ? "Edit Product" : "New Product";
        const f = $("#form"); f.reset();
        clearImage();
        if(p){
            f.name.value = p.name||"";
            f.sku.value = p.sku||"";
            f.category.value = p.category||"";
            f.unit.value = p.unit||"";
            f.price.value = p.price||0;
            f.reorderPoint.value = p.reorderPoint ?? 10;
        }
        $("#dlg").showModal();
    }

    function openStockDlg(product){
        currentProduct = product;
        const dlg = $("#stockDlg");

        // Populate product info
        $("#stockProductImage").src = product.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop";
        $("#stockProductName").textContent = product.name;
        $("#stockProductSku").textContent = `SKU: ${product.sku}`;
        $("#stockProductCategory").textContent = `Category: ${product.category || 'General'}`;

        // Populate stock info
        $("#currentStock").textContent = product.stockOnHand || 0;
        $("#reservedQty").textContent = product.reservedQty || 0;
        $("#availableQty").textContent = product.availableQty || 0;
        $("#reorderPoint").textContent = product.reorderPoint || 0;

        // Style available quantity
        const availableEl = $("#availableQty");
        const available = product.availableQty || 0;
        const reorderPoint = product.reorderPoint || 5;

        if (available <= 0) {
            availableEl.classList.add("low-stock");
        } else if (available <= reorderPoint) {
            availableEl.classList.add("low-stock");
        } else {
            availableEl.classList.remove("low-stock");
        }

        dlg.showModal();
    }

    async function onSave(ev){
        ev.preventDefault();
        const f = ev.target;
        try{
            if (!isLoggedIn()) {
                redirectToLogin();
                return;
            }

            const fd = new FormData();
            fd.append("name", f.name.value.trim());
            fd.append("sku", f.sku.value.trim());
            fd.append("category", f.category.value.trim());
            fd.append("unit", f.unit.value.trim());
            fd.append("price", f.price.value);
            fd.append("reorderPoint", f.reorderPoint.value);
            const file = $("#image").files?.[0];
            if(file) fd.append("image", file);

            const url = editingId ? API.update(editingId) : API.create;
            const method = editingId ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                body: fd,
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if(res.status === 401) {
                redirectToLogin();
                return;
            }

            const text = await res.text();
            if(!res.ok){
                let msg="Save failed";
                try{ msg = JSON.parse(text)?.error || msg; }catch{}
                throw new Error(msg);
            }
            $("#dlg").close();
            load();
        }catch(e){ alert(e.message || "Save failed"); }
    }

    async function onStockUpdate(ev){
        ev.preventDefault();
        try{
            if (!isLoggedIn()) {
                redirectToLogin();
                return;
            }

            const type = $("#adjustmentType").value;
            const quantity = parseInt($("#adjustmentQty").value);
            const reason = $("#adjustmentReason").value.trim();

            if (!currentProduct || !currentProduct.id) {
                throw new Error("No product selected");
            }

            const payload = {
                adjustmentType: type,
                quantity: quantity,
                reason: reason
            };

            const res = await fetch(API.stock.adjust(currentProduct.id), {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify(payload)
            });

            if(res.status === 401) {
                redirectToLogin();
                return;
            }

            if(!res.ok) {
                const error = await res.text();
                throw new Error(error || "Stock update failed");
            }

            $("#stockDlg").close();
            alert("Stock updated successfully!");
            load(); // Refresh the list

        }catch(e){
            alert(e.message || "Failed to update stock");
        }
    }

    function previewImage(){
        const file = $("#image").files?.[0];
        const box = $("#preview"); const img = box.querySelector("img");
        if(file){
            img.src = URL.createObjectURL(file);
            box.classList.remove("hidden");
        }else{
            clearImage();
        }
    }

    function clearImage(){
        const box = $("#preview"); const img = box.querySelector("img");
        img.src = ""; box.classList.add("hidden");
        $("#image").value = "";
    }

    async function exportCsv(){
        try{
            if (!isLoggedIn()) {
                redirectToLogin();
                return;
            }

            const res = await fetch(API.export, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if(res.status === 401) {
                redirectToLogin();
                return;
            }

            if(!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `low-stock-${new Date().toISOString().slice(0,10)}.csv`;
            a.click();
        }catch(e){ alert(e.message); }
    }

    async function importCsv(ev){
        const file = ev.target.files?.[0]; if(!file) return;
        try{
            if (!isLoggedIn()) {
                redirectToLogin();
                return;
            }

            const fd = new FormData(); fd.append("file", file);
            const res = await fetch(API.importCsv, {
                method:"POST",
                body:fd,
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`
                }
            });

            if(res.status === 401) {
                redirectToLogin();
                return;
            }

            if(!res.ok) throw new Error("Import failed");
            alert("Import complete");
            load();
        }catch(e){ alert(e.message); } finally { ev.target.value=""; }
    }

    function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }
})();
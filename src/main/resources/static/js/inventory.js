(() => {
    const API = {
        list: "/api/inventory/products",
        create: "/api/inventory/products",
        update: id => `/api/inventory/products/${id}`,
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

    let page=0, size=8, q="", cat="", sort="name", lowOnly=false, editingId=null, currentProduct=null;

    function getAuthToken(){ return localStorage.getItem('auth.token'); }
    function getAuthRole(){ return localStorage.getItem('auth.role'); }
    function isLoggedIn(){ return !!getAuthToken() && !!getAuthRole(); }
    function redirectToLogin(){
        localStorage.removeItem('auth.token');
        localStorage.removeItem('auth.role');
        window.location.href = '/index.html';
    }
    function authHeaders(){
        const token = getAuthToken();
        return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type':'application/json' } : {};
    }
    const nz = v => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    // events
    $("#q").addEventListener("input", debounce(()=>{ q=$("#q").value.trim(); page=0; load(); },300));
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

    // init
    load(); seedCategories();

    // data load
    async function load(){
        if (!isLoggedIn()) { redirectToLogin(); return; }
        skeleton();
        try{
            const url = new URL(API.list, location.origin);
            url.searchParams.set("page", page);
            url.searchParams.set("size", size);
            if(q) url.searchParams.set("q", q);
            if(cat) url.searchParams.set("category", cat);
            if(sort) url.searchParams.set("sort", sort);
            if(lowOnly) url.searchParams.set("lowOnly", true);

            const res = await fetch(url, { headers: authHeaders() });
            if(res.status === 401){ redirectToLogin(); return; }
            if(!res.ok) throw new Error(`Failed to load (HTTP ${res.status})`);
            const data = await res.json();

            const raw = data.items || data.content || [];
            const items = raw.map(p => {
                const soh   = nz(p.stockOnHand);
                const resv  = nz(p.reservedQty);
                const avail = 'availableQty' in p ? nz(p.availableQty) : nz(soh - resv);
                return { ...p, stockOnHand: soh, reservedQty: resv, availableQty: Math.max(0, avail) };
            });

            render(items, data.total ?? data.totalElements ?? items.length);
        }catch(e){
            grid.innerHTML = `<div class="empty">${e.message}</div>`;
        }
    }

    function skeleton(){
        grid.innerHTML = Array.from({length:size}).map(()=>`
      <div class="card">
        <div class="thumb" style="background:#0e3b2d"></div>
        <div class="meta"><div class="muted">Loading…</div></div>
      </div>`).join("");
        empty.classList.add("hidden");
    }

    // grid render
    function render(items,total){
        if(!items.length){
            grid.innerHTML=""; empty.classList.remove("hidden");
            count.textContent="0 items"; prev.disabled=next.disabled=true; return;
        }
        empty.classList.add("hidden");
        const tpl = document.getElementById("tpl"); grid.innerHTML="";
        const placeholder = "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop";

        items.forEach(p=>{
            const node = tpl.content.cloneNode(true);
            const card = node.querySelector(".card");
            if (card) card.dataset.id = p.id;

            const img = node.querySelector("img");
            if (img) {
                img.src = p.imageUrl || placeholder;
                img.alt = p.name || "product";
                img.referrerPolicy = "no-referrer";
            }

            node.querySelector("h3").textContent = p.name;
            node.querySelector(".sku").textContent = p.sku;
            node.querySelector(".cat").textContent = p.category || "General";
            node.querySelector(".price").textContent = `LKR ${Number(p.price||0).toLocaleString()}`;

            const avail = Math.max(0, nz(p.availableQty));
            const rp = nz(p.reorderPoint) || 5;

            const stockEl = node.querySelector(".stock");
            if (stockEl) {
                stockEl.classList.remove("low-stock");
                if (avail <= 0) {
                    stockEl.classList.add("low-stock");
                    stockEl.textContent = "Out of stock";
                } else if (avail <= rp) {
                    stockEl.classList.add("low-stock");
                    stockEl.textContent = `${avail} in stock (Low)`;
                } else {
                    stockEl.textContent = `${avail} in stock`;
                }
            }

            node.querySelector(".btn-edit").addEventListener("click", ()=> openDlg(p));
            node.querySelector(".btn-stock").addEventListener("click", ()=> openStockDlg(p.id));
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

    // edit product dialog
    function openDlg(p){
        editingId = p?.id ?? null;
        $("#dlgTitle").textContent = editingId ? "Edit Product" : "New Product";
        const f = $("#form"); f.reset();
        clearImage();

        // basic fields
        if(p){
            f.name.value          = p.name || "";
            f.sku.value           = p.sku || "";
            f.category.value      = p.category || "";
            f.unit.value          = p.unit || "";
            f.price.value         = p.price || 0;
            f.reorderPoint.value  = p.reorderPoint ?? 10;

            // extra/mapped fields (populate only if inputs exist)
            if (f.brand)            f.brand.value            = p.brand || "";
            if (f.description)      f.description.value      = p.description || "";
            if (f.reorderQuantity)  f.reorderQuantity.value  = p.reorderQuantity ?? 0;

            // inventory fields (read-only on form)
            if (f.stockQuantity)    f.stockQuantity.value    = p.stockOnHand ?? 0;
            if (f.inventoryId)      f.inventoryId.value      = p.inventoryId ?? "";

            if (f.expiryDate) {
                // expecting yyyy-MM-dd
                const d = p.expiryDate ? String(p.expiryDate).split("T")[0] : "";
                f.expiryDate.value = d;
            }
        }
        $("#dlg").showModal();
    }

    // stock dialog (fresh fetch)
    async function openStockDlg(productId){
        if (!isLoggedIn()) { redirectToLogin(); return; }
        const res = await fetch(`${API.list}/${productId}`, { headers: authHeaders() });
        if(res.status === 401){ redirectToLogin(); return; }
        const p = await res.json();
        currentProduct = p;

        const dlg = $("#stockDlg");
        $("#stockProductImage").src = p.imageUrl || "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=800&auto=format&fit=crop";
        $("#stockProductName").textContent = p.name;
        $("#stockProductSku").textContent = `SKU: ${p.sku}`;
        $("#stockProductCategory").textContent = `Category: ${p.category || 'General'}`;

        const soh = nz(p.stockOnHand);
        const resv = nz(p.reservedQty);
        const avail = Math.max(0, nz(p.availableQty ?? (soh - resv)));

        $("#currentStock").textContent = soh;
        $("#reservedQty").textContent = resv;
        $("#availableQty").textContent = avail;
        $("#reorderPoint").textContent = nz(p.reorderPoint);

        const rp = nz(p.reorderPoint) || 5;
        $("#availableQty").classList.toggle("low-stock", avail <= 0 || avail <= rp);

        dlg.showModal();
    }

    // save (create/update)
    async function onSave(ev){
        ev.preventDefault();
        const f = ev.target;
        try{
            if (!isLoggedIn()) { redirectToLogin(); return; }
            const fd = new FormData();
            fd.append("name", (f.name.value || "").trim());
            fd.append("sku", (f.sku.value || "").trim());
            fd.append("category", (f.category.value || "").trim());
            fd.append("unit", (f.unit.value || "").trim());
            fd.append("price", f.price.value);
            fd.append("reorderPoint", f.reorderPoint.value);

            // include optional fields if present
            if (f.brand)           fd.append("brand", (f.brand.value || "").trim());
            if (f.description)     fd.append("description", (f.description.value || "").trim());
            if (f.reorderQuantity) fd.append("reorderQuantity", f.reorderQuantity.value);
            if (f.expiryDate && f.expiryDate.value) fd.append("expiryDate", f.expiryDate.value);

            const file = $("#image").files?.[0];
            if(file) fd.append("image", file);

            const url = editingId ? API.update(editingId) : API.create;
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(url, { method, body: fd, headers: { 'Authorization': `Bearer ${getAuthToken()}` } });

            if(res.status === 401) { redirectToLogin(); return; }
            const text = await res.text();
            if(!res.ok){
                let msg="Save failed"; try{ msg = JSON.parse(text)?.error || msg; }catch{}
                throw new Error(msg);
            }
            $("#dlg").close();
            load();
        }catch(e){ alert(e.message || "Save failed"); }
    }

    // stock adjust
    async function onStockUpdate(ev){
        ev.preventDefault();
        try{
            if (!isLoggedIn()) { redirectToLogin(); return; }
            if (!currentProduct || !currentProduct.id) throw new Error("No product selected");
            const type = $("#adjustmentType").value;
            const quantity = nz($("#adjustmentQty").value);
            const reason = ($("#adjustmentReason").value || "").trim();
            const payload = { adjustmentType: type, quantity, reason };

            const res = await fetch(API.stock.adjust(currentProduct.id), {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
                body: JSON.stringify(payload)
            });
            if(res.status === 401) { redirectToLogin(); return; }
            if(!res.ok) { const error = await res.text(); throw new Error(error || "Stock update failed"); }
            const updated = await res.json(); // { stockOnHand, reservedQty, availableQty }

            $("#currentStock").textContent = nz(updated.stockOnHand);
            $("#reservedQty").textContent = nz(updated.reservedQty);
            $("#availableQty").textContent = nz(updated.availableQty);

            // refresh just this card
            const fresh = await (await fetch(`${API.list}/${currentProduct.id}`, { headers: authHeaders() })).json();
            updateProductCardInGrid({
                ...fresh,
                stockOnHand: nz(fresh.stockOnHand),
                reservedQty: nz(fresh.reservedQty),
                availableQty: Math.max(0, nz(fresh.availableQty))
            });

            $("#stockDlg").close();
        }catch(e){ alert(e.message || "Failed to update stock"); }
    }

    // update one card
    function updateProductCardInGrid(p){
        const card = grid.querySelector(`.card[data-id="${p.id}"]`);
        if (!card) { load(); return; }

        const avail = Math.max(0, nz(p.availableQty));
        const rp = nz(p.reorderPoint) || 5;

        card.querySelector("h3").textContent = p.name;
        card.querySelector(".sku").textContent = p.sku;
        card.querySelector(".cat").textContent = p.category || "General";
        card.querySelector(".price").textContent = `LKR ${Number(p.price||0).toLocaleString()}`;

        const stockEl = card.querySelector(".stock");
        if (stockEl) {
            stockEl.classList.remove("low-stock");
            if (avail <= 0) {
                stockEl.classList.add("low-stock");
                stockEl.textContent = "Out of stock";
            } else if (avail <= rp) {
                stockEl.classList.add("low-stock");
                stockEl.textContent = `${avail} in stock (Low)`;
            } else {
                stockEl.textContent = `${avail} in stock`;
            }
        }
    }

    // image preview
    function previewImage(){
        const file = $("#image").files?.[0];
        const box = $("#preview"); const img = box.querySelector("img");
        if(file){ img.src = URL.createObjectURL(file); box.classList.remove("hidden"); }
        else{ clearImage(); }
    }
    function clearImage(){
        const box=$("#preview"), img=box.querySelector("img");
        img.src=""; box.classList.add("hidden"); $("#image").value="";
    }

    // CSV
    async function exportCsv(){
        try{
            if (!isLoggedIn()) { redirectToLogin(); return; }
            const res = await fetch(API.export, { headers: { 'Authorization': `Bearer ${getAuthToken()}` } });
            if(res.status === 401) { redirectToLogin(); return; }
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
            if (!isLoggedIn()) { redirectToLogin(); return; }
            const fd = new FormData(); fd.append("file", file);
            const res = await fetch(API.importCsv, { method:"POST", body:fd, headers: { 'Authorization': `Bearer ${getAuthToken()}` } });
            if(res.status === 401) { redirectToLogin(); return; }
            if(!res.ok) throw new Error("Import failed");
            alert("Import complete"); load();
        }catch(e){ alert(e.message); } finally { ev.target.value=""; }
    }

    function debounce(fn,ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms); }; }
})();

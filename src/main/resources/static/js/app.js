// /js/app.js
// ------------------ CONFIG ------------------
const USE_DEMO = false;
const API_LOGIN = "/api/auth/login";
const API_REGISTER = "/api/auth/register";

// Role → landing page map (used by login + guards)
const ROLE_HOME = {
    CUSTOMER: "/dashboard/customer.html",
    DELIVERY: "/dashboard/delivery.html",
    STAFF: "/dashboard/staff.html",
    ADMIN: "/dashboard/admin.html",
    MANAGER: "/dashboard/manager.html"
};

// ------------------ DOM HOOKS ------------------
const siErr = document.getElementById("si-error");
const suErr = document.getElementById("su-error");

// ------------------ VALIDATION HELPERS ------------------
const PASS_POLICY  = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/; // ≥8, 1 uppercase, 1 symbol
const PHONE_POLICY = /^\d{10}$/;                             // exactly 10 digits
function isValidPassword(pwd) { return PASS_POLICY.test(pwd); }
function isValidPhone(phone) { return PHONE_POLICY.test(phone); }

// ------------------ PASSWORD TOGGLE ------------------
document.getElementById("togglePwd")?.addEventListener("click", (e) => {
    const pwd = document.getElementById("si-password");
    pwd.type = pwd.type === "password" ? "text" : "password";
    e.target.textContent = pwd.type === "password" ? "Show" : "Hide";
});

// =====================================================
// ================  AUTH UTILITIES  ===================
// =====================================================
(function initAuth(){
    const TOKEN_KEY = "auth.token";
    const ROLE_KEY  = "auth.role";

    function getToken(){ return localStorage.getItem(TOKEN_KEY) || ""; }
    function getRole(){  return localStorage.getItem(ROLE_KEY)  || ""; }
    function isLoggedIn(){ return !!getToken(); }

    function parseJwtExp(token){
        try{
            const base64 = token.split(".")[1];
            if(!base64) return null;
            const payload = JSON.parse(atob(base64.replace(/-/g, "+").replace(/_/g, "/")));
            return typeof payload.exp === "number" ? payload.exp : null;
        }catch{ return null; }
    }

    function isExpired(token){
        const exp = parseJwtExp(token);
        if(!exp) return false; // if no exp claim, don't block
        const nowSec = Math.floor(Date.now()/1000);
        return nowSec >= exp;
    }

    function redirectToRoleHome(role){
        const url = ROLE_HOME[role] || ROLE_HOME.CUSTOMER;
        if (location.pathname + location.hash !== url) {
            location.href = url;
        }
    }

    async function logout(){
        // Optional: call backend revoke if exists
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(ROLE_KEY);
        location.href = "/login.html";
    }

    /**
     * Guard: ensure the user has one of the allowed roles.
     * - If no token → go to login
     * - If token expired → clear + login
     * - If role mismatch → push them to their own home
     */
    function requireRole(allowedRoles = []){
        const token = getToken();
        if(!token){ location.href = "/login.html"; return; }
        if(isExpired(token)){ localStorage.removeItem(TOKEN_KEY); location.href = "/login.html"; return; }

        if(Array.isArray(allowedRoles) && allowedRoles.length){
            const role = getRole();
            if(!allowedRoles.includes(role)){
                // Not allowed on this page → send to their home
                redirectToRoleHome(role || "CUSTOMER");
            }
        }
    }

    /**
     * Convenience: fetch wrapper that attaches Authorization header.
     * Usage: Auth.fetch("/api/whatever", { method:"POST", body: JSON.stringify({...}) })
     */
    async function authFetch(input, init = {}){
        const token = getToken();
        const headers = new Headers(init.headers || {});
        if(!headers.has("Content-Type") && init.body) headers.set("Content-Type","application/json");
        if(token) headers.set("Authorization", "Bearer " + token);
        const res = await fetch(input, { ...init, headers });
        return res;
    }

    // Expose globally
    window.Auth = { getToken, getRole, isLoggedIn, requireRole, logout, fetch: authFetch };
})();

// =====================================================
// ================  SIGN-IN HANDLER  ==================
// =====================================================
document.getElementById("formSignIn")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = document.getElementById("si-username").value.trim(); // uniqueId or email
    const password   = document.getElementById("si-password").value;

    if (identifier.length < 3 || password.length < 3) {
        showErr(siErr, "Please enter valid credentials.");
        return;
    }
    hide(siErr);

    try {
        let token, role;
        if (USE_DEMO) {
            role  = inferRoleFromId(identifier); // optional demo helper
            token = "demo-token";
        } else {
            const res = await fetch(API_LOGIN, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({ identifier, password })
            });
            if (!res.ok) {
                let msg = "Invalid credentials";
                try { msg = (await res.json())?.error || msg; } catch {}
                throw new Error(msg);
            }
            const data = await res.json();
            token = data.token;
            role  = data.role;
        }

        localStorage.setItem("auth.token", token);
        localStorage.setItem("auth.role", role);

        // send to proper dashboard
        location.href = ROLE_HOME[role] || ROLE_HOME.CUSTOMER;

    } catch (err) {
        showErr(siErr, err.message || "Login failed.");
    }
});

// =====================================================
// ================  SIGN-UP HANDLER  ==================
// =====================================================
document.getElementById("formSignUp")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("su-fullname").value.trim();
    const phone    = document.getElementById("su-phone").value.trim();
    const username = document.getElementById("su-username").value.trim(); // email/username
    const password = document.getElementById("su-password").value;
    const confirm  = document.getElementById("su-confirm").value;

    if (!fullName) { showErr(suErr, "Please enter your full name."); return; }
    if (!isValidPhone(phone)) { showErr(suErr, "Phone must be exactly 10 digits."); return; }
    if (!username) { showErr(suErr, "Please enter an email or username."); return; }
    if (!isValidPassword(password)) {
        showErr(suErr, "Password must be at least 8 characters with at least one UPPERCASE letter and one symbol.");
        return;
    }
    if (password !== confirm) { showErr(suErr, "Passwords do not match."); return; }
    hide(suErr);

    try {
        if (USE_DEMO) { alert("Customer account created! Please sign in."); return; }
        const res = await fetch(API_REGISTER, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ username, password, fullName, phone })
        });
        if (!res.ok) {
            let msg = "Signup failed";
            try { msg = (await res.json())?.error || msg; } catch {}
            throw new Error(msg);
        }
        alert("Customer account created! Please sign in.");
    } catch (err) {
        showErr(suErr, err.message || "Signup failed.");
    }
});

// ------------------ UI helpers ------------------
function showErr(el, msg){ if(el){ el.textContent = msg; el.classList.remove("hidden"); } }
function hide(el){ if(el){ el.classList.add("hidden"); } }

// Optional helper for demo mode only
function inferRoleFromId(id){
    if (/^ADM-/i.test(id)) return "ADMIN";
    if (/^STF-/i.test(id)) return "STAFF";
    if (/^DLV-/i.test(id)) return "DELIVERY";
    if (/^MGR-/i.test(id)) return "MANAGER";
    return "CUSTOMER";
}

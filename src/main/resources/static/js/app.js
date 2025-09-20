// /js/app.js
const USE_DEMO = false;
const API_LOGIN = "/api/auth/login";
const API_REGISTER = "/api/auth/register";

const siErr = document.getElementById("si-error");
const suErr = document.getElementById("su-error");

document.getElementById("togglePwd")?.addEventListener("click", (e) => {
    const pwd = document.getElementById("si-password");
    pwd.type = pwd.type === "password" ? "text" : "password";
    e.target.textContent = pwd.type === "password" ? "Show" : "Hide";
});

document.getElementById("formSignIn")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const identifier = document.getElementById("si-username").value.trim(); // uniqueId or email
    const password = document.getElementById("si-password").value;

    if (identifier.length < 3 || password.length < 3) {
        showErr(siErr, "Please enter valid credentials.");
        return;
    }
    hide(siErr);

    try {
        let token, role;
        if (USE_DEMO) {
            role = inferRoleFromId(identifier); // optional demo helper
            token = "demo-token";
        } else {
            const res = await fetch(API_LOGIN, {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({ identifier, password })
            });
            if (!res.ok) throw new Error((await res.json())?.error || "Invalid credentials");
            const data = await res.json();
            token = data.token; role = data.role;
        }
        localStorage.setItem("auth.token", token);
        localStorage.setItem("auth.role", role);

        const map = {
            CUSTOMER: "/dashboard/customer.html",
            DELIVERY: "/dashboard/delivery.html",
            STAFF: "/dashboard/staff.html",
            ADMIN: "/dashboard/admin.html",
            MANAGER: "/dashboard/manager.html"
        };
        location.href = map[role] || map.CUSTOMER;
    } catch (err) {
        showErr(siErr, err.message || "Login failed.");
    }
});

document.getElementById("formSignUp")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fullName = document.getElementById("su-fullname").value.trim();
    const phone    = document.getElementById("su-phone").value.trim();
    const username = document.getElementById("su-username").value.trim(); // email/username
    const password = document.getElementById("su-password").value;
    const confirm  = document.getElementById("su-confirm").value;

    if (!fullName || !username || password.length < 6 || password !== confirm) {
        showErr(suErr, "Fill all fields. Password ≥ 6 and must match.");
        return;
    }
    hide(suErr);

    try {
        if (USE_DEMO) { alert("Customer account created! Please sign in."); return; }
        const res = await fetch(API_REGISTER, {
            method: "POST",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ username, password, fullName, phone })
        });
        if (!res.ok) throw new Error((await res.json())?.error || "Signup failed");
        alert("Customer account created! Please sign in.");
    } catch (err) {
        showErr(suErr, err.message || "Signup failed.");
    }
});

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
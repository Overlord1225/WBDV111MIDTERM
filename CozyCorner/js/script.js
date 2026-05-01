/************************************************************
 *  CozyCorner – Complete Refactored Front‑End Logic
 ************************************************************/
const STORAGE_KEYS = {
    registeredUsers: "cozycorner_registered_users",
    session: "cozycorner-session",
    contact: "cozycorner-contact-messages",
    reservations: "cozycorner-reservations",
    pendingRoom: "cozycorner-pending-room"
};

const ROOM_DATA = {
    "room-1": { name: "Room 1", title: "Forest Hearth Suite", price: 2800, guests: 2, type: "suite", description: "Warm lighting, a private lounge setup, and a quiet indoor atmosphere for couples.", features: ["2 guests", "Suite", "Lounge area"] },
    "room-2": { name: "Room 2", title: "Calm Studio Retreat", price: 3000, guests: 2, type: "studio", description: "Soft neutral finishes and open floor space designed for solo guests or a pair.", features: ["2 guests", "Studio", "Quiet interior"] },
    "room-3": { name: "Room 3", title: "Sunlit Wood Suite", price: 3200, guests: 2, type: "suite", description: "Airy bedroom styling with a dedicated work corner and a brighter daytime feel.", features: ["2 guests", "Suite", "Work desk"] },
    "room-4": { name: "Room 4", title: "Relaxed Family Room", price: 3400, guests: 3, type: "family", description: "Designed with a little more room to move, suitable for small groups or families.", features: ["3 guests", "Family", "Open layout"] },
    "room-5": { name: "Room 5", title: "Spacious Weekend Stay", price: 3600, guests: 4, type: "family", description: "A roomier setup with balanced natural tones for extended weekend bookings.", features: ["4 guests", "Family", "Extended stay"] },
    "room-6": { name: "Room 6", title: "Premium Cozy Suite", price: 3800, guests: 4, type: "suite", description: "Our highest-capacity suite with a more polished finish and broader guest flexibility.", features: ["4 guests", "Suite", "Premium finish"] }
};

const ROOM_IMAGES = {
    "room-1": ["img/room1/077f6d83-971c-4e34-aafc-018d2899368d.jpeg", "img/room1/116bbd49-a22c-4f9f-ac40-400f4cd88a7c.jpeg", "img/room1/8e567aa9-5876-47f9-a166-ae5160579898.jpeg", "img/room1/bb258352-46d0-4863-9c80-e365dc1ac150.jpeg"],
    "room-2": ["img/room2/04d8d164-3ef9-4d6a-a9fb-f84fe0f4ef2a.jpeg", "img/room2/43b0a2a7-8a82-44c0-9af0-6a0bafed9df3.jpeg", "img/room2/18ca8bd8-c5d8-4d68-8ebe-186da680da43.jpeg", "img/room2/90830dde-da26-4073-bffc-8d79a7a0bfe0.jpeg"],
    "room-3": ["img/room3/151b01e3-2301-467d-8d1f-a798e8b5b6ac.jpeg", "img/room3/b5e6a979-1510-4b42-b6e7-4f3a01d34034.jpeg", "img/room3/7272dc02-be0f-48c5-8402-658d67a48449.jpeg", "img/room3/e6c9a497-cf50-4127-b8fd-478962c9ee02.jpeg"],
    "room-4": ["img/room4/1487bc2a-edef-4cc6-8938-6a3bfdec31ce.jpeg", "img/room4/5a31e05e-4295-4938-b02c-bb7b4097159c.jpeg", "img/room4/5f516e68-0be0-42a7-a3f4-d7e264046018.jpeg", "img/room4/ffd19a9d-eb68-42c9-8098-f636fa1ba4ea.jpeg"],
    "room-5": ["img/room5/9340069e-24d2-4c0f-9558-364744bdfe78.jpeg", "img/room5/bbffdf0b-6926-4800-ac7a-021e97a662de.jpeg", "img/room5/ea2b8597-0abb-44d9-9ee6-3f3a4396a8f7.jpeg", "img/room5/e2ab49e2-aeb9-4308-969e-8329e514bdf4.jpeg"],
    "room-6": ["img/room6/9535844c-f80b-46dc-bf47-8c62001e2175.jpeg", "img/room6/e8b4e5c7-3f13-4d7f-8a83-7a75ed3888ec.jpeg", "img/room6/c47f2b9a-e2b7-4368-b112-39b9ea3cec7d.jpeg", "img/room6/9af22104-09aa-4dbc-a7f4-d844c9fce34d.jpeg"]
};

const USER_ROLES = { USER: "user", ADMIN: "admin", SUPER_ADMIN: "super_admin" };

// ---------- User persistence ----------
function getDefaultUsers() {
    return {
        admin: { username: "admin", email: "admin@example.com", password: "admin123", role: USER_ROLES.ADMIN },
        super: { username: "super", email: "super@example.com", password: "super123", role: USER_ROLES.SUPER_ADMIN },
        user: { username: "user", email: "user@example.com", password: "user123", role: USER_ROLES.USER }
    };
}
function getAllUsers() {
    const defaultUsers = getDefaultUsers();
    const registered = readStorage(STORAGE_KEYS.registeredUsers, {});
    return { ...defaultUsers, ...registered };
}
function saveUser(user) {
    const registered = readStorage(STORAGE_KEYS.registeredUsers, {});
    registered[user.username] = user;
    writeStorage(STORAGE_KEYS.registeredUsers, registered);
}

// ---------- Global cache ----------
let cachedViews = {};

document.addEventListener("DOMContentLoaded", () => {
    initializePageState();
    initializeNavigation();
    initializeButtons();
    initializeAuthPage();
    initializeCarousels();
    initializeDashboardView();
    updateNavigationForSession();
    initializeStaticLogout();

    const currentPage = getCurrentPageName();
    if (currentPage === "reservation.html") {
        initializeReservationPage();
    } else if (currentPage === "contactus.html") {
        initializeContactForm();
    } else if (currentPage === "admin.html") {
        initAdminDashboard();
    } else if (currentPage === "manageReservations.html") {
        initManageReservations();
    } else if (currentPage === "manageRooms.html") {
        initManageRooms();
    } else if (currentPage === "support.html") {
        initSupport();
    } else if (currentPage === "superadmin.html") {
        initSuperAdminDashboard();
    } else if (currentPage === "manageAdmins.html") {
        initManageAdmins();
    }
});

// ---------- Notification system ----------
function showNotification(type, message, duration = 4000) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : (type === 'error' ? '⚠' : 'ℹ')}</div>
        <div class="toast-message">${message}</div>
        <button class="toast-close" aria-label="Close">&times;</button>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    if (duration > 0) {
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    }
}

// ---------- Core ----------
function initializePageState() {
    requestAnimationFrame(() => document.body.classList.add("is-loaded"));
}
function initializeNavigation() {
    const currentPath = getCurrentPageName();
    const links = document.querySelectorAll(".site-links a");
    const navToggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".site-links");
    links.forEach(link => {
        const href = link.getAttribute("href");
        const isCurrent = href === currentPath;
        link.classList.toggle("is-active", isCurrent);
        if (isCurrent) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
    });
    if (navToggle && menu) {
        navToggle.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }
    const navigableLinks = document.querySelectorAll(".site-links a, .site-logo, a.button:not([data-no-transition])");
    navigableLinks.forEach(link => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");
            if (!shouldHandleNavigation(event, href)) return;
            event.preventDefault();
            document.body.classList.add("is-leaving");
            setTimeout(() => { window.location.href = href; }, 160);
        });
    });
}
function initializeButtons() {
    document.querySelectorAll(".button").forEach(button => {
        button.addEventListener("pointerdown", () => button.classList.add("is-pressed"));
        ["pointerup", "pointerleave", "pointercancel", "blur"].forEach(ev => {
            button.addEventListener(ev, () => button.classList.remove("is-pressed"));
        });
    });
}

// ---------- Auth (with PANEL TOGGLE) ----------
function initializeAuthPage() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    if (!loginForm || !registerForm) return;

    // ---- NEW: Toggle between Login and Register panels ----
    const loginPanel = document.getElementById("login-panel");
    const registerPanel = document.getElementById("register-panel");
    const showRegisterLink = document.getElementById("show-register-link");
    const showLoginLink = document.getElementById("show-login-link");

    if (loginPanel && registerPanel && showRegisterLink && showLoginLink) {
        showRegisterLink.addEventListener("click", (e) => {
            e.preventDefault();
            loginPanel.style.display = "none";
            registerPanel.classList.add("is-visible");
        });
        showLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            registerPanel.classList.remove("is-visible");
            loginPanel.style.display = "";
        });
    }
    // ---- End of toggle code ----

    bindFieldValidation(loginForm);
    bindFieldValidation(registerForm);
    loginForm.addEventListener("submit", (e) => { e.preventDefault(); handleLogin(loginForm); });
    registerForm.addEventListener("submit", (e) => { e.preventDefault(); handleRegistration(registerForm, loginForm); });
}
function handleLogin(form) {
    const username = getFieldValue(form, "username");
    const password = getFieldValue(form, "password");
    const feedback = document.getElementById("login-feedback");
    if (!validateRequired(form, "username", username, "Enter your username.") ||
        !validateRequired(form, "password", password, "Enter your password.")) {
        setFeedback(feedback, "error", "Please complete the login form.");
        showNotification("error", "Please complete all fields.");
        return;
    }
    const allUsers = getAllUsers();
    const matchedUser = allUsers[username];
    if (!matchedUser || matchedUser.password !== password) {
        setFeedback(feedback, "error", "Invalid username or password.");
        showNotification("error", "Invalid credentials.");
        return;
    }
    writeSession(STORAGE_KEYS.session, {
        username: matchedUser.username,
        email: matchedUser.email,
        role: matchedUser.role
    });
    const redirectTo = (matchedUser.role === USER_ROLES.SUPER_ADMIN) ? 'superadmin.html' :
                      (matchedUser.role === USER_ROLES.ADMIN) ? 'admin.html' : 'user.html';
    setFeedback(feedback, "success", `Welcome back, ${matchedUser.username}. Redirecting...`);
    showNotification("success", `Welcome back, ${matchedUser.username}!`);
    setTimeout(() => { window.location.href = redirectTo; }, 600);
}
function handleRegistration(registerForm, loginForm) {
    const username = getFieldValue(registerForm, "username");
    const email = getFieldValue(registerForm, "email");
    const password = getFieldValue(registerForm, "password");
    const confirmPassword = getFieldValue(registerForm, "confirm-password");
    const feedback = document.getElementById("register-feedback");
    let isValid = true;
    isValid = validateRequired(registerForm, "username", username, "Choose a username.") && isValid;
    isValid = validateEmailField(registerForm, "email", email) && isValid;
    isValid = validatePassword(registerForm, "password", password) && isValid;
    isValid = validateConfirmPassword(registerForm, password, confirmPassword) && isValid;
    const allUsers = getAllUsers();
    if (allUsers[username]) {
        setFieldState(registerForm, "username", "error", "That username is already registered.");
        isValid = false;
    }
    if (Object.values(allUsers).some(u => u.email === email)) {
        setFieldState(registerForm, "email", "error", "That email is already registered.");
        isValid = false;
    }
    if (!isValid) {
        setFeedback(feedback, "error", "Please review the registration fields.");
        showNotification("error", "Registration failed. Check your inputs.");
        return;
    }
    const newUser = { username, email, password, role: USER_ROLES.USER };
    saveUser(newUser);
    writeSession(STORAGE_KEYS.session, { username, email, role: USER_ROLES.USER });
    registerForm.reset();
    clearFormState(registerForm);
    setFeedback(feedback, "success", `Welcome, ${username}! Redirecting to your dashboard...`);
    const loginUsername = loginForm.elements.namedItem("username");
    if (loginUsername) loginUsername.value = username;
    showNotification("success", `Account created! Welcome ${username}.`);
    setTimeout(() => { window.location.href = "user.html"; }, 800);
}

// ---------- Dashboard view (user) ----------
function initializeDashboardView() {
    if (!window.location.pathname.includes("user.html")) return;
    const navBtns = document.querySelectorAll('.dashboard-nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (!view) return;
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadView(view);
        });
    });
    loadView('dashboard');
}
async function loadView(viewName) {
    const container = document.getElementById('dynamic-view');
    if (!container) return;
    if (viewName === 'dashboard') {
        renderDashboardView();
        return;
    }
    if (viewName === 'myreservations') {
        renderMyReservations();
        return;
    }
    container.innerHTML = '<div style="text-align: center; padding: 40px;">Loading...</div>';
    let htmlContent = cachedViews[viewName];
    if (!htmlContent) {
        const page = viewName === 'reservations' ? 'reservation.html' : 'contactus.html';
        try {
            const response = await fetch(page);
            htmlContent = await response.text();
            cachedViews[viewName] = htmlContent;
        } catch (error) {
            container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--error);">Failed to load ${viewName}. Please try again.</div>`;
            return;
        }
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const mainContent = doc.querySelector('main.site-main');
    if (!mainContent) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--error);">Invalid page structure.</div>';
        return;
    }

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'reservation-wrapper';
    while (mainContent.firstChild) {
        wrapper.appendChild(mainContent.firstChild);
    }
    container.appendChild(wrapper);

    if (viewName === 'reservations') {
        initializeReservationPage();
    } else if (viewName === 'contact') {
        initializeContactForm();
    }
    initializeCarousels();
}

function refreshDashboardTrip() {
    const dashMain = document.getElementById('dashboard-main');
    if (!dashMain) return;

    const session = readSession(STORAGE_KEYS.session);
    const reservations = readStorage(STORAGE_KEYS.reservations, []);
    const userReservations = reservations.filter(r => r.email === (session.email || ""));
    const activeReservation = userReservations.find(r => new Date(r.checkout) >= new Date()) || userReservations[userReservations.length - 1];

    const tripContent = document.getElementById('current-trip-content');
    if (!tripContent) return;

    if (activeReservation) {
        let pricePerNight = activeReservation.price;
        if (!pricePerNight && activeReservation.total && activeReservation.nights) {
            pricePerNight = activeReservation.total / activeReservation.nights;
        }
        const priceDisplay = pricePerNight ? formatCurrency(pricePerNight) : 'PHP 0';
        tripContent.innerHTML = `
            <div style="display: grid; gap: 12px;">
                <div><h4 style="font-size: 1.1rem; margin:0;">${activeReservation.roomName} - ${activeReservation.title}</h4><p style="margin:4px 0 0; font-size:0.85rem;">${priceDisplay}/night</p></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; background:rgba(147,99,63,0.06); padding:10px; border-radius:var(--radius-md);">
                    <div><span style="font-size:0.75rem;">Check-in</span><div style="font-weight:600;">${formatDate(activeReservation.checkin)}</div></div>
                    <div><span style="font-size:0.75rem;">Check-out</span><div style="font-weight:600;">${formatDate(activeReservation.checkout)}</div></div>
                    <div><span style="font-size:0.75rem;">Guests</span><div style="font-weight:600;">${activeReservation.guests}</div></div>
                    <div><span style="font-size:0.75rem;">Nights</span><div style="font-weight:600;">${activeReservation.nights}</div></div>
                </div>
                <div class="form-action-group"><button id="viewPropertyBtn" class="button button--secondary" style="flex:1;">View Property</button><button id="cancelDashboardBookingBtn" class="button button--danger" style="flex:1;">Cancel Booking</button></div>
            </div>
        `;
        setupPropertyDropdown(activeReservation);
        const cancelBtn = document.getElementById('cancelDashboardBookingBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm(`Cancel your booking for ${activeReservation.roomName}? This action cannot be undone.`)) {
                    const updated = reservations.filter(r => !(r.roomId === activeReservation.roomId && r.checkin === activeReservation.checkin && r.email === activeReservation.email));
                    writeStorage(STORAGE_KEYS.reservations, updated);
                    showNotification("success", "Booking cancelled successfully.");
                    refreshDashboardTrip();
                }
            });
        }
    } else {
        tripContent.innerHTML = `<p style="color: var(--text-soft); text-align: center; padding: 30px 20px;">No active reservation. Your next getaway starts here.</p>`;
    }
}
function renderDashboardView() {
    const container = document.getElementById('dynamic-view');
    if (!container) return;
    const session = readSession(STORAGE_KEYS.session);
    if (!session) {
        window.location.href = "login.html";
        return;
    }
    container.innerHTML = `
        <div class="user-dashboard">
            <section class="panel" style="text-align: center;">
                <div class="profile-avatar">${session.username.charAt(0).toUpperCase()}</div>
                <p class="eyebrow" style="margin-bottom: 4px;">Welcome back,</p>
                <h2 style="font-size: 1.5rem;">${session.username}</h2>
            </section>
            <section class="panel">
                <div class="panel-heading"><div><p class="eyebrow">Current Trip</p><h3>Your Stay</h3></div></div>
                <div id="current-trip-content" style="padding: 6px 0;"><p style="color: var(--text-soft); text-align: center; padding: 30px 20px;">No active reservation.</p></div>
            </section>
            <section class="panel">
                <div class="panel-heading"><div><p class="eyebrow">Account</p><h3>Quick Links</h3></div></div>
                <nav style="display: grid; gap: 8px;">
                    <a href="#" class="account-link" data-section="personal" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-md);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span style="font-weight: 500;">Personal info</span>
                    </a>
                    <a href="#" class="account-link" data-section="payments" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-md);">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        <span style="font-weight: 500;">Payments</span>
                    </a>
                </nav>
                <div id="account-detail" style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.05); min-height: 50px;">
                    <p style="font-size: 0.85rem; color: var(--text-soft); text-align: center;">Select an option</p>
                </div>
            </section>
        </div>
    `;
    document.querySelectorAll('.account-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showAccountDetail(link.dataset.section, session, document.getElementById('account-detail'));
        });
    });

    const reservations = readStorage(STORAGE_KEYS.reservations, []);
    const userReservations = reservations.filter(r => r.email === (session.email || ""));
    const activeReservation = userReservations.find(r => new Date(r.checkout) >= new Date()) || userReservations[userReservations.length - 1];
    const tripContent = document.getElementById('current-trip-content');
    if (activeReservation && tripContent) {
        let pricePerNight = activeReservation.price;
        if (!pricePerNight && activeReservation.total && activeReservation.nights) {
            pricePerNight = activeReservation.total / activeReservation.nights;
        }
        const priceDisplay = pricePerNight ? formatCurrency(pricePerNight) : 'PHP 0';
        tripContent.innerHTML = `
            <div style="display: grid; gap: 12px;">
                <div><h4 style="font-size: 1.1rem; margin:0;">${activeReservation.roomName} - ${activeReservation.title}</h4><p style="margin:4px 0 0; font-size:0.85rem;">${priceDisplay}/night</p></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; background:rgba(147,99,63,0.06); padding:10px; border-radius:var(--radius-md);">
                    <div><span style="font-size:0.75rem;">Check-in</span><div style="font-weight:600;">${formatDate(activeReservation.checkin)}</div></div>
                    <div><span style="font-size:0.75rem;">Check-out</span><div style="font-weight:600;">${formatDate(activeReservation.checkout)}</div></div>
                    <div><span style="font-size:0.75rem;">Guests</span><div style="font-weight:600;">${activeReservation.guests}</div></div>
                    <div><span style="font-size:0.75rem;">Nights</span><div style="font-weight:600;">${activeReservation.nights}</div></div>
                </div>
                <div class="form-action-group"><button id="viewPropertyBtn" class="button button--secondary" style="flex:1;">View Property</button><button id="cancelDashboardBookingBtn" class="button button--danger" style="flex:1;">Cancel Booking</button></div>
            </div>
        `;
        setupPropertyDropdown(activeReservation);
        const cancelBtn = document.getElementById('cancelDashboardBookingBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm(`Cancel your booking for ${activeReservation.roomName}? This action cannot be undone.`)) {
                    const reservations = readStorage(STORAGE_KEYS.reservations, []);
                    const updated = reservations.filter(r => !(r.roomId === activeReservation.roomId && r.checkin === activeReservation.checkin && r.email === activeReservation.email));
                    writeStorage(STORAGE_KEYS.reservations, updated);
                    showNotification("success", "Booking cancelled successfully.");
                    refreshDashboardTrip();
                }
            });
        }
    } else {
        tripContent.innerHTML = `<p style="color: var(--text-soft); text-align: center; padding: 30px 20px;">No active reservation. Your next getaway starts here.</p>`;
    }
}
function setupPropertyDropdown(reservation) {
    let dropdown = document.getElementById("propertyDropdownContainer");
    if (!dropdown) {
        dropdown = document.createElement("div");
        dropdown.id = "propertyDropdownContainer";
        dropdown.style.cssText = `margin-top:16px; overflow:hidden; transition:max-height 0.4s ease-out, opacity 0.3s ease; max-height:0; opacity:0; border-radius:var(--radius-lg);`;
        const tripDiv = document.getElementById('current-trip-content');
        if (tripDiv) tripDiv.parentNode.insertBefore(dropdown, tripDiv.nextSibling);
    }
    const btn = document.getElementById("viewPropertyBtn");
    if (!btn) return;
    let isOpen = false;
    btn.onclick = () => {
        if (!isOpen) {
            const room = ROOM_DATA[reservation.roomId];
            const images = ROOM_IMAGES[reservation.roomId] || [];
            let carouselHtml = '';
            if (images.length) {
                carouselHtml = `
                    <div class="carousel" data-carousel>
                        <div class="carousel-track">
                            ${images.map((img, idx) => `<div class="carousel-slide ${idx===0?'is-active':''}"><img src="${img}" alt="${room.name}"></div>`).join('')}
                        </div>
                        <button class="carousel-btn carousel-btn--prev">‹</button>
                        <button class="carousel-btn carousel-btn--next">›</button>
                        <div class="carousel-dots"></div>
                    </div>
                `;
            } else carouselHtml = '<div class="no-image">No images</div>';
            dropdown.innerHTML = `
                <div class="panel property-detail-panel" style="padding:0; overflow:hidden;">
                    <div class="property-detail-stacked">
                        <div class="property-info">
                            <h3>${room.name} – ${room.title}</h3>
                            <div class="price-badges">
                                <span class="price-tag">${formatCurrency(room.price)}/night</span>
                                <span class="price-tag">👥 Up to ${room.guests}</span>
                                <span class="price-tag">🏷️ ${room.type}</span>
                            </div>
                            <p>${room.description}</p>
                            <ul class="feature-list">${room.features.map(f=>`<li>${f}</li>`).join('')}</ul>
                            <a href="reservation.html?room=${reservation.roomId}" class="button button--primary" style="width:100%;">Book again</a>
                        </div>
                        <div class="property-carousel">
                            ${carouselHtml}
                        </div>
                    </div>
                </div>
            `;
            initializeCarousels();
            dropdown.style.maxHeight = "800px";
            dropdown.style.opacity = "1";
            isOpen = true;
            btn.textContent = "Hide Property";
        } else {
            dropdown.style.maxHeight = "0";
            dropdown.style.opacity = "0";
            isOpen = false;
            btn.textContent = "View Property";
            setTimeout(() => { if (!isOpen) dropdown.innerHTML = ""; }, 400);
        }
    };
}
function showAccountDetail(section, session, container) {
    if (!container) return;
    if (section === "personal") {
        container.innerHTML = `<div><label>Username</label><div>${session.username}</div></div><div><label>Email</label><div>${session.email}</div></div>`;
    } else {
        container.innerHTML = `<p style="text-align:center;">No payment methods on file.</p>`;
    }
}

// ========== DOUBLE BOOKING PREVENTION ==========
function isRoomAvailable(roomId, checkin, checkout, excludeIndex = null) {
    const reservations = readStorage(STORAGE_KEYS.reservations, []);
    const newStart = new Date(checkin);
    const newEnd = new Date(checkout);

    for (let i = 0; i < reservations.length; i++) {
        const r = reservations[i];
        if (excludeIndex !== null && i == excludeIndex) continue;
        if (r.roomId !== roomId) continue;

        const existingStart = new Date(r.checkin);
        const existingEnd = new Date(r.checkout);

        if (newStart < existingEnd && newEnd > existingStart) {
            return false;
        }
    }
    return true;
}
// =============================================

// ---------- Reservation page ----------
function initializeReservationPage() {
    const filterForm = document.getElementById("filter-form");
    const bookingForm = document.getElementById("booking-form");
    const roomCards = Array.from(document.querySelectorAll(".room-listing"));
    const clearFilters = document.getElementById("clear-filters");
    if (!filterForm || !bookingForm || roomCards.length === 0) return;
    setDateMinimums();
    bindFieldValidation(bookingForm);
    filterForm.addEventListener("submit", (e) => { e.preventDefault(); applyRoomFilters(filterForm, roomCards); });
    clearFilters?.addEventListener("click", () => { filterForm.reset(); applyRoomFilters(filterForm, roomCards); showNotification("info", "Filters cleared."); });
    roomCards.forEach(card => card.addEventListener("click", (e) => {
        if (e.target.closest(".reserve-trigger")) return;
        selectRoom(card.dataset.roomId, roomCards, bookingForm);
    }));
    document.querySelectorAll(".reserve-trigger").forEach(btn => btn.addEventListener("click", () => {
        const roomId = btn.dataset.roomSelect;
        selectRoom(roomId, roomCards, bookingForm);
        bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
    }));
    ["checkin","checkout","guests"].forEach(name => {
        const field = bookingForm.elements.namedItem(name);
        field?.addEventListener("input", () => updateBookingTotal(bookingForm));
    });
    bookingForm.addEventListener("submit", (e) => { e.preventDefault(); handleBookingSubmit(bookingForm, roomCards); });
    
    const existingCancel = bookingForm.querySelector(".cancel-booking-btn");
    if (!existingCancel) {
        const cancelBtn = document.createElement("button");
        cancelBtn.type = "button";
        cancelBtn.className = "button button--danger cancel-booking-btn";
        cancelBtn.textContent = "Cancel selection";
        const submitBtn = bookingForm.querySelector('button[type="submit"]');
        if (submitBtn) {
            const group = document.createElement("div");
            group.className = "form-action-group";
            submitBtn.parentNode.insertBefore(group, submitBtn);
            group.appendChild(submitBtn);
            group.appendChild(cancelBtn);
        } else {
            bookingForm.appendChild(cancelBtn);
        }
        cancelBtn.addEventListener("click", () => {
            if (confirm("Clear selected room and reset booking form?")) {
                const roomIdField = bookingForm.elements.namedItem("roomId");
                if (roomIdField) roomIdField.value = "";
                const summary = document.getElementById("selected-room-summary");
                if (summary) summary.innerHTML = `<strong>No room selected</strong><span>Choose a room to start your booking.</span>`;
                roomCards.forEach(card => card.classList.remove("is-selected"));
                writeStorage(STORAGE_KEYS.pendingRoom, "");
                const totalField = document.getElementById("booking-total");
                if (totalField) totalField.textContent = "Total: Select dates and room";
                ["checkin", "checkout", "guests"].forEach(fname => {
                    const f = bookingForm.elements.namedItem(fname);
                    if (f) f.value = "";
                    clearFieldState(bookingForm, fname);
                });
                const fb = document.getElementById("booking-feedback");
                setFeedback(fb, "success", "Booking selection cleared.");
                showNotification("info", "Booking selection cleared.");
            }
        });
    }
    applyRoomFilters(filterForm, roomCards);
    preloadSelectedRoom(roomCards, bookingForm);
    prefillBookingFromSession();
}
function handleBookingSubmit(form, roomCards) {
    const roomId = getFieldValue(form, "roomId");
    const name = getFieldValue(form, "name");
    const email = getFieldValue(form, "email");
    const checkin = getFieldValue(form, "checkin");
    const checkout = getFieldValue(form, "checkout");
    const guests = getFieldValue(form, "guests");
    const room = ROOM_DATA[roomId];
    const feedback = document.getElementById("booking-feedback");
    let isValid = true;
    if (!room) {
        setFeedback(feedback, "error", "Select a room before submitting your reservation.");
        showNotification("error", "Please select a room.");
        return;
    }
    isValid = validateRequired(form, "name", name, "Please enter your full name.") && isValid;
    isValid = validateEmailField(form, "email", email) && isValid;
    isValid = validateRequired(form, "checkin", checkin, "Select a check-in date.") && isValid;
    isValid = validateRequired(form, "checkout", checkout, "Select a check-out date.") && isValid;
    isValid = validateRequired(form, "guests", guests, "Select the number of guests.") && isValid;
    if (checkin && checkout) {
        const nights = calculateNights(checkin, checkout);
        if (nights <= 0) {
            setFieldState(form, "checkout", "error", "Check-out must be after check-in.");
            isValid = false;
        } else {
            clearFieldState(form, "checkout");
        }
    }
    if (guests && room && Number(guests) > room.guests) {
        setFieldState(form, "guests", "error", `${room.name} allows up to ${room.guests} guests.`);
        isValid = false;
    }
    if (!isValid) {
        setFeedback(feedback, "error", "Please review the booking details.");
        showNotification("error", "Please fix the highlighted errors.");
        return;
    }

    if (!isRoomAvailable(roomId, checkin, checkout)) {
        setFeedback(feedback, "error", "This room is already booked for the selected dates. Please choose different dates or another room.");
        showNotification("error", "Sorry, those dates are not available.");
        return;
    }

    const nights = calculateNights(checkin, checkout);
    const total = nights * room.price;
    const reservations = readStorage(STORAGE_KEYS.reservations, []);
    reservations.push({
        roomId, roomName: room.name, title: room.title, price: room.price,
        name, email, checkin, checkout, guests: Number(guests), nights, total, createdAt: new Date().toISOString()
    });
    writeStorage(STORAGE_KEYS.reservations, reservations);
    writeStorage(STORAGE_KEYS.pendingRoom, roomId);
    setFeedback(feedback, "success", `Reservation saved for ${room.name}. Total: ${formatCurrency(total)}.`);
    showNotification("success", `Reservation confirmed! Total: ${formatCurrency(total)}.`);
    ["checkin", "checkout", "guests"].forEach(fname => {
        const field = form.elements.namedItem(fname);
        if (field) field.value = "";
        clearFieldState(form, fname);
    });
    highlightSelectedRoom(roomId, roomCards);
    updateBookingTotal(form);
    if (document.getElementById('dashboard-main')) {
        refreshDashboardTrip();
    }
}
function applyRoomFilters(form, roomCards) {
    const guestValue = getFieldValue(form, "guests");
    const typeValue = getFieldValue(form, "type");
    const priceValue = getFieldValue(form, "price");
    let visibleCount = 0;
    roomCards.forEach(card => {
        const matchesGuests = !guestValue || Number(card.dataset.guests) >= Number(guestValue);
        const matchesType = !typeValue || card.dataset.type === typeValue;
        const matchesPrice = !priceValue || Number(card.dataset.price) <= Number(priceValue);
        const isVisible = matchesGuests && matchesType && matchesPrice;
        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) visibleCount++;
    });
    const feedback = document.getElementById("filter-feedback");
    const message = visibleCount === 0 ? "No rooms match the selected filters." : `Showing ${visibleCount} room${visibleCount > 1 ? "s" : ""}.`;
    setFeedback(feedback, visibleCount === 0 ? "error" : "success", message);
}
function preloadSelectedRoom(roomCards, form) {
    const params = new URLSearchParams(window.location.search);
    const roomFromQuery = params.get("room");
    const roomFromStorage = readStorage(STORAGE_KEYS.pendingRoom, "");
    const initialRoomId = roomFromQuery || roomFromStorage || roomCards[0]?.dataset.roomId;
    if (initialRoomId) {
        selectRoom(initialRoomId, roomCards, form);
        if (roomFromQuery) scrollToRoomCard(initialRoomId);
    }
}
function scrollToRoomCard(roomId) {
    const targetCard = document.querySelector(`.room-listing[data-room-id="${roomId}"]`);
    if (targetCard) {
        setTimeout(() => {
            targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
            targetCard.style.boxShadow = "0 0 0 3px var(--primary), 0 20px 40px rgba(0,0,0,0.15)";
            setTimeout(() => { targetCard.style.boxShadow = ""; }, 1500);
        }, 300);
    }
}
function selectRoom(roomId, roomCards, form) {
    const room = ROOM_DATA[roomId];
    if (!room) return;
    highlightSelectedRoom(roomId, roomCards);
    form.elements.namedItem("roomId").value = roomId;
    const guestField = form.elements.namedItem("guests");
    if (guestField && guestField.type === 'number') {
        guestField.max = room.guests;
        guestField.placeholder = `Up to ${room.guests} guests`;
    }
    const summary = document.getElementById("selected-room-summary");
    if (summary) summary.innerHTML = `<strong>${room.name} - ${room.title}</strong><span>${formatCurrency(room.price)} per night, up to ${room.guests} guests.</span>`;
    writeStorage(STORAGE_KEYS.pendingRoom, roomId);
    updateBookingTotal(form);
    showNotification("info", `${room.name} selected. Fill in your dates.`);
}
function highlightSelectedRoom(roomId, roomCards) {
    roomCards.forEach(card => card.classList.toggle("is-selected", card.dataset.roomId === roomId));
}
function updateBookingTotal(form) {
    const room = ROOM_DATA[getFieldValue(form, "roomId")];
    const checkin = getFieldValue(form, "checkin");
    const checkout = getFieldValue(form, "checkout");
    const totalField = document.getElementById("booking-total");
    if (!totalField || !room || !checkin || !checkout) {
        if (totalField) totalField.textContent = "Total: Select dates to calculate";
        return;
    }
    const nights = calculateNights(checkin, checkout);
    if (nights <= 0) {
        totalField.textContent = "Total: Check the selected dates";
        return;
    }
    totalField.textContent = `Total: ${formatCurrency(nights * room.price)} for ${nights} night${nights > 1 ? "s" : ""}`;
}
function setDateMinimums() {
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
    const checkin = document.getElementById("booking-checkin");
    const checkout = document.getElementById("booking-checkout");
    if (checkin) {
        checkin.min = today;
        checkin.addEventListener("change", () => {
            if (checkout) checkout.min = checkin.value || today;
        });
    }
    if (checkout) checkout.min = today;
}

// ---------- Contact form ----------
function initializeContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    bindFieldValidation(form);
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const values = { name: getFieldValue(form,"name"), email: getFieldValue(form,"email"), message: getFieldValue(form,"message") };
        const isValid = validateRequired(form,"name",values.name,"Enter name") && validateEmailField(form,"email",values.email) && validateRequired(form,"message",values.message,"Enter message");
        const feedback = document.getElementById("contact-feedback");
        if (!isValid) { setFeedback(feedback,"error","Complete the form."); showNotification("error","Please fill all fields correctly."); return; }
        const msgs = readStorage(STORAGE_KEYS.contact, []);
        msgs.push({...values, submittedAt: new Date().toISOString()});
        writeStorage(STORAGE_KEYS.contact, msgs);
        form.reset(); clearFormState(form); setFeedback(feedback,"success","Message saved.");
        showNotification("success","Thank you! Your message has been sent.");
    });
}

// ---------- Validation helpers ----------
function bindFieldValidation(form) {
    form.querySelectorAll("input, select, textarea").forEach((field) => {
        field.addEventListener("focus", () => field.classList.add("is-focused"));
        field.addEventListener("blur", () => {
            field.classList.remove("is-focused");
            validateFieldOnBlur(form, field);
        });
        field.addEventListener("input", () => {
            if (field.classList.contains("is-error")) validateFieldOnBlur(form, field);
        });
    });
}
function validateFieldOnBlur(form, field) {
    const value = field.value.trim();
    const fieldName = field.name;
    if (fieldName === "email") {
        if (!value) { setFieldState(form, fieldName, "error", "Required."); return false; }
        if (!isValidEmail(value)) { setFieldState(form, fieldName, "error", "Valid email required."); return false; }
    }
    if (fieldName === "password" && form.id === "register-form") return validatePassword(form, fieldName, value);
    if (fieldName === "confirm-password" && form.id === "register-form") {
        const password = getFieldValue(form, "password");
        return validateConfirmPassword(form, password, value);
    }
    if (fieldName === "checkout" && form.id === "booking-form") {
        const checkin = getFieldValue(form, "checkin");
        if (!value) { setFieldState(form, fieldName, "error", "Required."); return false; }
        if (checkin && calculateNights(checkin, value) <= 0) {
            setFieldState(form, fieldName, "error", "Check-out must be after check-in.");
            return false;
        }
    }
    if (!value) { setFieldState(form, fieldName, "error", "Required."); return false; }
    clearFieldState(form, fieldName);
    return true;
}
function validateRequired(form, fieldName, value, message) {
    if (!value) { setFieldState(form, fieldName, "error", message); return false; }
    clearFieldState(form, fieldName);
    return true;
}
function validateEmailField(form, fieldName, value) {
    if (!validateRequired(form, fieldName, value, "Email required.")) return false;
    if (!isValidEmail(value)) { setFieldState(form, fieldName, "error", "Valid email required."); return false; }
    clearFieldState(form, fieldName);
    return true;
}
function validatePassword(form, fieldName, value) {
    if (!validateRequired(form, fieldName, value, "Password required.")) return false;
    if (value.length < 6) { setFieldState(form, fieldName, "error", "Minimum 6 characters."); return false; }
    clearFieldState(form, fieldName);
    return true;
}
function validateConfirmPassword(form, password, confirmPassword) {
    if (!validateRequired(form, "confirm-password", confirmPassword, "Confirm password.")) return false;
    if (password !== confirmPassword) { setFieldState(form, "confirm-password", "error", "Passwords do not match."); return false; }
    clearFieldState(form, "confirm-password");
    return true;
}
function clearNonRoomBookingFields(form) {
    ["name", "email", "checkin", "checkout", "guests"].forEach(fieldName => {
        const field = form.elements.namedItem(fieldName);
        if (field) field.value = "";
        clearFieldState(form, fieldName);
    });
}
function clearFormState(form) {
    form.querySelectorAll(".field-message").forEach(msg => {
        msg.textContent = "";
        msg.classList.remove("is-visible", "is-error", "is-success");
    });
    form.querySelectorAll("input, select, textarea").forEach(field => {
        field.classList.remove("is-error", "is-focused");
    });
}
function setFieldState(form, fieldName, state, message) {
    const field = form.elements.namedItem(fieldName);
    const container = field?.closest(".field");
    const fieldMessage = container?.querySelector(".field-message");
    if (!field || !fieldMessage) return;
    field.classList.toggle("is-error", state === "error");
    fieldMessage.textContent = message;
    fieldMessage.classList.add("is-visible");
    fieldMessage.classList.toggle("is-error", state === "error");
    fieldMessage.classList.toggle("is-success", state === "success");
}
function clearFieldState(form, fieldName) {
    const field = form.elements.namedItem(fieldName);
    const container = field?.closest(".field");
    const fieldMessage = container?.querySelector(".field-message");
    field?.classList.remove("is-error");
    if (fieldMessage) {
        fieldMessage.textContent = "";
        fieldMessage.classList.remove("is-visible", "is-error", "is-success");
    }
}
function setFeedback(element, state, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add("is-visible");
    element.classList.toggle("is-error", state === "error");
    element.classList.toggle("is-success", state === "success");
}
function getFieldValue(form, fieldName) {
    const field = form.elements.namedItem(fieldName);
    return typeof field?.value === "string" ? field.value.trim() : "";
}
function calculateNights(checkin, checkout) {
    const start = new Date(checkin);
    const end = new Date(checkout);
    return Math.round((end.getTime() - start.getTime()) / 86400000);
}
function formatCurrency(value) {
    if (value === undefined || value === null || isNaN(value)) return 'PHP 0';
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
}
function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
function formatDate(str) {
    const date = new Date(str);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function initializeCarousels() {
    const carousels = document.querySelectorAll("[data-carousel]");
    if (!carousels.length) return;
    carousels.forEach(c => {
        const slides = Array.from(c.querySelectorAll(".carousel-slide"));
        const prev = c.querySelector(".carousel-btn--prev");
        const next = c.querySelector(".carousel-btn--next");
        const dots = c.querySelector(".carousel-dots");
        let idx = slides.findIndex(s => s.classList.contains("is-active"));
        if (idx === -1) idx = 0;
        let auto;
        const update = () => {
            slides.forEach((s,i)=>s.classList.toggle("is-active", i===idx));
            if (dots) {
                const btns = dots.querySelectorAll(".carousel-dot");
                btns.forEach((d,i)=>d.classList.toggle("is-active", i===idx));
            }
        };
        const go = (i) => { idx = (i+slides.length)%slides.length; update(); };
        const nextSlide = () => go(idx+1);
        const prevSlide = () => go(idx-1);
        const start = () => { if (auto) clearInterval(auto); auto = setInterval(nextSlide, 5000); };
        const stop = () => { if (auto) clearInterval(auto); auto = null; };
        if (prev) prev.onclick = (e) => { e.stopPropagation(); stop(); prevSlide(); start(); };
        if (next) next.onclick = (e) => { e.stopPropagation(); stop(); nextSlide(); start(); };
        if (dots) {
            dots.innerHTML = '';
            slides.forEach((_,i)=>{
                let dot = document.createElement("button");
                dot.className = "carousel-dot"+(i===idx?" is-active":"");
                dot.onclick = () => { stop(); go(i); start(); };
                dots.appendChild(dot);
            });
        }
        start();
        c.onmouseenter = stop;
        c.onmouseleave = start;
    });
}
function readStorage(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function writeStorage(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function readSession(key, fallback) { try { const v = sessionStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
function writeSession(key, val) { sessionStorage.setItem(key, JSON.stringify(val)); }
function getCurrentPageName() { const p = window.location.pathname; return p.substring(p.lastIndexOf('/')+1) || "index.html"; }
function shouldHandleNavigation(event, href) { if (!href || href.startsWith("#") || href.startsWith("javascript:")) return false; if (event.ctrlKey || event.metaKey || event.shiftKey) return false; return !event.defaultPrevented; }

function updateNavigationForSession() {
    const adminPages = ['admin.html', 'manageReservations.html', 'manageRooms.html', 'support.html', 'superadmin.html', 'manageAdmins.html'];
    if (adminPages.includes(getCurrentPageName())) return;
    const session = readSession(STORAGE_KEYS.session);
    const navList = document.querySelector('.site-links');
    if (!navList) return;
    let loginRegisterItem = null, dashboardItem = null, logoutItem = null;
    for (const li of navList.querySelectorAll('li')) {
        const link = li.querySelector('a');
        if (link && link.getAttribute('href') === 'login.html') loginRegisterItem = li;
        if (link && link.getAttribute('href') === 'user.html') dashboardItem = li;
        if (link && link.id === 'logout-link') logoutItem = li;
    }
    if (session && session.username) {
        if (!dashboardItem) {
            const newLi = document.createElement('li');
            const newLink = document.createElement('a');
            newLink.href = 'user.html';
            newLink.textContent = 'Dashboard';
            newLi.appendChild(newLink);
            if (logoutItem) navList.insertBefore(newLi, logoutItem);
            else navList.appendChild(newLi);
        }
        if (loginRegisterItem) loginRegisterItem.remove();
    } else {
        if (!loginRegisterItem) {
            const newLi = document.createElement('li');
            const newLink = document.createElement('a');
            newLink.href = 'login.html';
            newLink.textContent = 'Login/Register';
            newLi.appendChild(newLink);
            if (logoutItem) navList.insertBefore(newLi, logoutItem);
            else navList.appendChild(newLi);
        }
        if (dashboardItem) dashboardItem.remove();
    }
}
function prefillBookingFromSession() {
    const session = readSession(STORAGE_KEYS.session);
    if (!session) return;
    const nameField = document.getElementById('booking-name');
    const emailField = document.getElementById('booking-email');
    if (nameField && !nameField.value) nameField.value = session.username;
    if (emailField && !emailField.value) emailField.value = session.email;
}
function initializeStaticLogout() {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

function renderMyReservations() {
    const container = document.getElementById('dynamic-view');
    if (!container) return;
    const session = readSession(STORAGE_KEYS.session);
    if (!session) {
        window.location.href = "login.html";
        return;
    }

    const reservations = readStorage(STORAGE_KEYS.reservations, []);
    const userReservations = reservations.filter(r => r.email === (session.email || ""));

    if (userReservations.length === 0) {
        container.innerHTML = `
            <div class="panel" style="text-align:center;">
                <h2>My Reservations</h2>
                <p style="color: var(--text-soft); padding: 40px 0;">You have no reservations yet.</p>
                <button class="button button--primary" onclick="document.querySelector('.dashboard-nav-btn[data-view=\'reservations\']').click()">Book a room</button>
            </div>`;
        return;
    }

    let html = `
        <section class="panel">
            <div class="panel-heading">
                <h2>My Reservations</h2>
            </div>
            <div class="reservation-list" style="display:grid; gap:var(--space-md);">
    `;

    userReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach((r, idx) => {
        const nights = calculateNights(r.checkin, r.checkout);
        const total = r.total || (nights * (r.price || 0));
        const isActive = new Date(r.checkout) >= new Date();
        html += `
            <div class="message-card" style="flex-direction:column; align-items:stretch;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="font-size:1.2rem; margin:0;">${r.roomName} – ${r.title}</h3>
                    <span class="price-tag">${formatCurrency(total)} total</span>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-xs); margin-top:var(--space-sm); font-size:0.9rem;">
                    <div><strong>Check-in:</strong> ${formatDate(r.checkin)}</div>
                    <div><strong>Check-out:</strong> ${formatDate(r.checkout)}</div>
                    <div><strong>Guests:</strong> ${r.guests}</div>
                    <div><strong>Nights:</strong> ${nights}</div>
                </div>
                <div style="margin-top:var(--space-sm); display:flex; gap:var(--space-xs); justify-content:flex-end;">
                    ${isActive ? `<button class="button button--danger btn-cancel-booking" data-room="${r.roomId}" data-checkin="${r.checkin}" data-email="${r.email}">Cancel</button>` : '<span style="font-size:0.8rem; color:var(--text-soft);">Past booking</span>'}
                </div>
            </div>
        `;
    });

    html += `</div></section>`;
    container.innerHTML = html;

    container.querySelectorAll('.btn-cancel-booking').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const roomId = btn.dataset.room;
            const checkin = btn.dataset.checkin;
            const email = btn.dataset.email;
            if (confirm(`Cancel this booking for ${roomId}?`)) {
                const allReservations = readStorage(STORAGE_KEYS.reservations, []);
                const updated = allReservations.filter(r => !(r.roomId === roomId && r.checkin === checkin && r.email === email));
                writeStorage(STORAGE_KEYS.reservations, updated);
                showNotification("success", "Booking cancelled.");
                renderMyReservations();
                if (document.getElementById('current-trip-content')) {
                    refreshDashboardTrip();
                }
            }
        });
    });
}
// ============================================================
// ADMIN & SUPER ADMIN FUNCTIONALITY
// ============================================================
function enforceAdminAccess() {
    const session = readSession(STORAGE_KEYS.session);
    if (!session || (session.role !== USER_ROLES.ADMIN && session.role !== USER_ROLES.SUPER_ADMIN)) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
function enforceSuperAdminAccess() {
    const session = readSession(STORAGE_KEYS.session);
    if (!session || session.role !== USER_ROLES.SUPER_ADMIN) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
function addActivity(action) {
    const activityLog = readStorage('cozycorner-activity-log', []);
    const entry = {
        action,
        timestamp: new Date().toISOString(),
        user: readSession(STORAGE_KEYS.session)?.username || 'system'
    };
    activityLog.unshift(entry);
    if (activityLog.length > 20) activityLog.pop();
    writeStorage('cozycorner-activity-log', activityLog);
}

function clearRecentActivities() {
    const activities = readStorage('cozycorner-activity-log', []);
    if (activities.length === 0) {
        showNotification('info', 'No activities to clear.');
        return;
    }
    if (!confirm(`Delete all ${activities.length} activity entries?`)) return;

    writeStorage('cozycorner-activity-log', []);
    addActivity('Cleared the activity log');
    showNotification('success', 'Activity log cleared.');
    const container = document.getElementById('activity-log');
    if (container) {
        container.innerHTML = '<li class="activity-item" style="text-align:center;color:var(--text-soft);">No recent activity.</li>';
    }
}

function initAdminDashboard() {
    if (!enforceAdminAccess()) return;
    const reservations = readStorage(STORAGE_KEYS.reservations, []);
    const today = new Date().toISOString().split('T')[0];
    const active = reservations.filter(r => r.checkin <= today && r.checkout >= today);
    document.getElementById('stat-reservations').textContent = active.length;
    const guests = active.reduce((sum, r) => sum + (r.guests || 0), 0);
    document.getElementById('stat-guests').textContent = guests;
    const revenue = reservations.reduce((sum, r) => sum + (r.total || 0), 0);
    document.getElementById('stat-revenue').textContent = formatCurrency(revenue);
    const activities = readStorage('cozycorner-activity-log', []);
    const container = document.getElementById('activity-log');
    if (activities.length === 0) {
        container.innerHTML = '<li class="activity-item" style="text-align:center;color:var(--text-soft);">No recent activity.</li>';
    } else {
        container.innerHTML = activities.slice(0, 10).map(a => `
            <li class="activity-item">
                <span>${a.action}</span>
                <time datetime="${a.timestamp}">${new Date(a.timestamp).toLocaleString()}</time>
            </li>
        `).join('');
    }
    const clearActBtn = document.getElementById('btn-clear-activities');
    if (clearActBtn) {
        clearActBtn.addEventListener('click', clearRecentActivities);
    }
}

function initManageReservations() {
    if (!enforceAdminAccess()) return;

    const roomSelect = document.getElementById('modal-room');
    const modalTitle = document.getElementById('modal-title');
    const form = document.getElementById('reservation-form-modal');
    const modal = document.getElementById('reservation-modal');
    const closeBtn = document.getElementById('btn-close-modal');

    let selectedIndices = [];

    function populateRoomDropdown() {
        const allRooms = { ...ROOM_DATA, ...readStorage('cozycorner-custom-rooms', {}) };
        roomSelect.innerHTML = '<option value="">Select room</option>';
        Object.entries(allRooms).forEach(([key, room]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${room.name} – ${room.title} (${formatCurrency(room.price)})`;
            roomSelect.appendChild(option);
        });
    }

    function updateSelectionDependentButtons() {
        const updateBtn = document.getElementById('btn-update-reservation');
        const deleteBtn = document.getElementById('btn-delete-reservation');
        if (updateBtn) {
            updateBtn.disabled = selectedIndices.length !== 1;
            updateBtn.style.opacity = selectedIndices.length === 1 ? '1' : '0.5';
        }
        if (deleteBtn) {
            deleteBtn.disabled = selectedIndices.length === 0;
            deleteBtn.style.opacity = selectedIndices.length > 0 ? '1' : '0.5';
        }
    }

    function renderReservations() {
        const reservations = readStorage(STORAGE_KEYS.reservations, []);
        const container = document.getElementById('reservations-container');
        if (reservations.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-soft); padding:40px;">No reservations found.</p>';
            updateSelectionDependentButtons();
            return;
        }

        let html = `<table class="reservations-table">
            <thead>
                <tr>
                    <th><input type="checkbox" id="select-all-reservations" title="Select all"></th>
                    <th>Room</th><th>Guest</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th>
                </tr>
            </thead>
            <tbody>`;

        reservations.forEach((r, idx) => {
            const isSelected = selectedIndices.includes(idx);
            html += `<tr class="${isSelected ? 'selected' : ''}" data-index="${idx}">
                <td><input type="checkbox" class="reservation-checkbox" data-index="${idx}" ${isSelected ? 'checked' : ''}></td>
                <td>${r.roomName}</td>
                <td>${r.name} (${r.email})</td>
                <td>${formatDate(r.checkin)}</td>
                <td>${formatDate(r.checkout)}</td>
                <td>${r.guests}</td>
                <td>${formatCurrency(r.total)}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;

        const checkboxes = container.querySelectorAll('.reservation-checkbox');
        const selectAll = container.querySelector('#select-all-reservations');

        checkboxes.forEach(cb => {
            cb.addEventListener('change', () => {
                const idx = parseInt(cb.dataset.index, 10);
                if (cb.checked) {
                    if (!selectedIndices.includes(idx)) selectedIndices.push(idx);
                } else {
                    selectedIndices = selectedIndices.filter(i => i !== idx);
                }
                cb.closest('tr').classList.toggle('selected', cb.checked);
                updateSelectionDependentButtons();
            });
        });

        container.querySelectorAll('tbody tr').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.tagName === 'INPUT') return;
                const checkbox = row.querySelector('.reservation-checkbox');
                if (checkbox) {
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change'));
                }
            });
        });

        if (selectAll) {
            selectAll.addEventListener('change', () => {
                const isChecked = selectAll.checked;
                checkboxes.forEach(cb => {
                    cb.checked = isChecked;
                    const idx = parseInt(cb.dataset.index, 10);
                    if (isChecked) {
                        if (!selectedIndices.includes(idx)) selectedIndices.push(idx);
                    } else {
                        selectedIndices = [];
                    }
                    cb.closest('tr').classList.toggle('selected', isChecked);
                });
                if (!isChecked) selectedIndices = [];
                updateSelectionDependentButtons();
            });
        }
    }

    function showModal(edit = false) {
        populateRoomDropdown();
        const reservations = readStorage(STORAGE_KEYS.reservations, []);
        if (edit) {
            const editIdx = selectedIndices[0];
            if (editIdx !== undefined && editIdx >= 0 && editIdx < reservations.length) {
                const r = reservations[editIdx];
                form.elements['editIndex'].value = editIdx;
                form.elements['roomId'].value = r.roomId;
                form.elements['name'].value = r.name;
                form.elements['email'].value = r.email;
                form.elements['checkin'].value = r.checkin;
                form.elements['checkout'].value = r.checkout;
                form.elements['guests'].value = r.guests;
            }
        } else {
            form.reset();
            form.elements['editIndex'].value = '';
        }
        modalTitle.textContent = edit ? 'Update Reservation' : 'Add Reservation';
        modal.style.display = 'flex';
    }

    function hideModal() {
        modal.style.display = 'none';
    }

    closeBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    document.getElementById('btn-add-reservation').addEventListener('click', () => {
        selectedIndices = [];
        renderReservations();
        showModal(false);
    });

    document.getElementById('btn-update-reservation').addEventListener('click', () => {
        if (selectedIndices.length !== 1) {
            showNotification('error', 'Please select exactly one reservation to update.');
            return;
        }
        showModal(true);
    });

    document.getElementById('btn-delete-reservation').addEventListener('click', () => {
        if (selectedIndices.length === 0) {
            showNotification('error', 'Please select at least one reservation to delete.');
            return;
        }
        if (!confirm(`Delete ${selectedIndices.length} reservation(s) permanently?`)) return;

        let reservations = readStorage(STORAGE_KEYS.reservations, []);
        selectedIndices.sort((a, b) => b - a).forEach(idx => reservations.splice(idx, 1));
        writeStorage(STORAGE_KEYS.reservations, reservations);

        addActivity(`Deleted ${selectedIndices.length} reservation(s)`);
        showNotification('success', `${selectedIndices.length} reservation(s) deleted.`);

        selectedIndices = [];
        renderReservations();
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const roomId = form.elements['roomId'].value;
        const name = form.elements['name'].value;
        const email = form.elements['email'].value;
        const checkin = form.elements['checkin'].value;
        const checkout = form.elements['checkout'].value;
        const guests = parseInt(form.elements['guests'].value);
        const editIndex = form.elements['editIndex'].value;

        if (new Date(checkin) >= new Date(checkout)) {
            showNotification('error', 'Check-out must be after check-in.');
            return;
        }

        const allRooms = { ...ROOM_DATA, ...readStorage('cozycorner-custom-rooms', {}) };
        const room = allRooms[roomId];
        if (!room) {
            showNotification('error', 'Invalid room selected.');
            return;
        }
        if (guests > room.guests) {
            showNotification('error', `Room allows max ${room.guests} guests.`);
            return;
        }

        const excludeIdx = (editIndex !== '') ? parseInt(editIndex, 10) : null;
        if (!isRoomAvailable(roomId, checkin, checkout, excludeIdx)) {
            showNotification('error', 'This room is already booked for the selected date range.');
            return;
        }

        let reservations = readStorage(STORAGE_KEYS.reservations, []);
        const nights = Math.round((new Date(checkout) - new Date(checkin)) / 86400000);
        const total = nights * room.price;
        const reservation = {
            roomId, roomName: room.name, title: room.title, price: room.price,
            name, email, checkin, checkout, guests, nights, total,
            createdAt: new Date().toISOString()
        };

        if (editIndex !== '') {
            reservations[editIndex] = reservation;
            addActivity('Updated a reservation');
            showNotification('success', 'Reservation updated.');
        } else {
            reservations.push(reservation);
            addActivity('Added a new reservation');
            showNotification('success', 'Reservation added.');
        }

        writeStorage(STORAGE_KEYS.reservations, reservations);
        hideModal();
        selectedIndices = [];
        renderReservations();
    });

    renderReservations();
}

function initManageRooms() {
    if (!enforceAdminAccess()) return;
    const modal = document.getElementById('room-modal');
    const form = document.getElementById('room-form-modal');
    const modalTitle = document.getElementById('room-modal-title');
    const closeBtn = document.getElementById('btn-close-room-modal');
    let selectedRoomKey = null;

    function renderRooms() {
        const customRooms = readStorage('cozycorner-custom-rooms', {});
        const allRooms = { ...ROOM_DATA, ...customRooms };
        const container = document.getElementById('rooms-container');
        container.innerHTML = Object.entries(allRooms).map(([key, room]) => `
            <article class="room-listing room-card ${key === selectedRoomKey ? 'is-selected' : ''}" data-room-id="${key}">
                <div class="room-listing__body">
                    <div class="room-listing__header">
                        <div>
                            <h3>${room.name}</h3>
                            <p class="listing-subtitle">${room.title}</p>
                        </div>
                        <span class="price-tag">${formatCurrency(room.price)}</span>
                    </div>
                    <p>${room.description}</p>
                    <ul class="feature-list">
                        <li>${room.guests} guests</li>
                        <li>${room.type}</li>
                    </ul>
                    <div class="room-actions">
                        <button class="button button--secondary btn-select-room" data-room-key="${key}">Select</button>
                        ${customRooms[key] ? '<button class="button button--danger btn-delete-room" data-room-key="'+key+'">Delete</button>' : ''}
                    </div>
                </div>
            </article>
        `).join('');

        container.querySelectorAll('.btn-select-room').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedRoomKey = btn.dataset.roomKey;
                renderRooms();
            });
        });
        container.querySelectorAll('.btn-delete-room').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Delete this custom room? Default rooms cannot be deleted.')) {
                    const customRooms = readStorage('cozycorner-custom-rooms', {});
                    delete customRooms[btn.dataset.roomKey];
                    writeStorage('cozycorner-custom-rooms', customRooms);
                    selectedRoomKey = null;
                    renderRooms();
                    addActivity('Deleted a room');
                    showNotification('success', 'Room deleted.');
                }
            });
        });
    }

    function showModal(edit = false) {
        if (edit && selectedRoomKey) {
            const customRooms = readStorage('cozycorner-custom-rooms', {});
            const room = customRooms[selectedRoomKey] || ROOM_DATA[selectedRoomKey];
            if (!room) return;
            form.elements['roomKey'].value = selectedRoomKey;
            form.elements['roomId'].value = selectedRoomKey;
            form.elements['title'].value = room.title;
            form.elements['price'].value = room.price;
            form.elements['guests'].value = room.guests;
            form.elements['type'].value = room.type;
            form.elements['description'].value = room.description;
            modalTitle.textContent = 'Update Room';
        } else {
            form.reset();
            form.elements['roomKey'].value = '';
            modalTitle.textContent = 'Add Room';
        }
        modal.style.display = 'flex';
    }

    function hideModal() { modal.style.display = 'none'; }

    closeBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    document.getElementById('btn-add-room').addEventListener('click', () => {
        selectedRoomKey = null;
        showModal(false);
    });
    document.getElementById('btn-update-room').addEventListener('click', () => {
        if (!selectedRoomKey) { showNotification('error','Select a room first.'); return; }
        const customRooms = readStorage('cozycorner-custom-rooms', {});
        if (!customRooms[selectedRoomKey] && ROOM_DATA[selectedRoomKey]) {
            showNotification('error', 'Default rooms cannot be updated. Add a custom room instead.');
            return;
        }
        showModal(true);
    });
    document.getElementById('btn-delete-room').addEventListener('click', () => {
        if (!selectedRoomKey) { showNotification('error','Select a room first.'); return; }
        const customRooms = readStorage('cozycorner-custom-rooms', {});
        if (!customRooms[selectedRoomKey]) { showNotification('error','Only custom rooms can be deleted.'); return; }
        if (confirm('Delete this room?')) {
            delete customRooms[selectedRoomKey];
            writeStorage('cozycorner-custom-rooms', customRooms);
            selectedRoomKey = null;
            renderRooms();
            addActivity('Deleted a room');
            showNotification('success','Room deleted.');
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const roomId = form.elements['roomId'].value.trim();
        const title = form.elements['title'].value.trim();
        const price = parseInt(form.elements['price'].value);
        const guests = parseInt(form.elements['guests'].value);
        const type = form.elements['type'].value;
        const description = form.elements['description'].value.trim();
        if (!roomId || !title || isNaN(price) || isNaN(guests) || !type || !description) {
            showNotification('error','All fields are required.');
            return;
        }
        const customRooms = readStorage('cozycorner-custom-rooms', {});
        if (ROOM_DATA[roomId] && form.elements['roomKey'].value !== roomId) {
            showNotification('error','That room ID is already used by a default room.');
            return;
        }
        customRooms[roomId] = { name: roomId, title, price, guests, type, description, features: [`${guests} guests`, type.charAt(0).toUpperCase()+type.slice(1)] };
        writeStorage('cozycorner-custom-rooms', customRooms);
        hideModal();
        renderRooms();
        addActivity('Room saved');
        showNotification('success','Room saved!');
    });

    renderRooms();
}

function initSupport() {
    if (!enforceAdminAccess()) return;
    const messages = readStorage(STORAGE_KEYS.contact, []);
    messages.forEach(m => { if (!m.status) m.status = 'new'; });
    writeStorage(STORAGE_KEYS.contact, messages);

    function renderStats() {
        const open = messages.filter(m => m.status==='new'||m.status==='in-progress').length;
        document.getElementById('stat-messages').textContent = messages.length;
        document.getElementById('stat-issues').textContent = open;
        document.getElementById('stat-resolved').textContent = messages.filter(m => m.status==='resolved').length;
    }
    function renderMessages() {
        const container = document.getElementById('messages-container');
        if (!messages.length) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-soft);padding:30px;">No messages yet.</p>';
            return;
        }
        container.innerHTML = messages.map((m, idx) => `
            <div class="message-card">
                <div class="message-body">
                    <h4>${m.name} <span style="font-size:0.75rem;color:var(--text-soft);">(${m.email})</span></h4>
                    <p style="margin:4px 0;font-size:0.9rem;">${m.message}</p>
                    <small style="color:var(--text-soft);">${new Date(m.submittedAt).toLocaleString()}</small>
                </div>
                <div class="message-actions">
                    <select class="status-select" data-index="${idx}">
                        <option value="new" ${m.status==='new'?'selected':''}>New</option>
                        <option value="in-progress" ${m.status==='in-progress'?'selected':''}>In Progress</option>
                        <option value="resolved" ${m.status==='resolved'?'selected':''}>Resolved</option>
                    </select>
                </div>
            </div>
        `).join('');
        container.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', () => {
                messages[sel.dataset.index].status = sel.value;
                writeStorage(STORAGE_KEYS.contact, messages);
                addActivity(`Changed message status to ${sel.value}`);
                showNotification('info','Status updated.');
                renderStats();
            });
        });
    }
    renderStats();
    renderMessages();

    const clearMsgBtn = document.getElementById('btn-clear-messages');
    if (clearMsgBtn && !clearMsgBtn.dataset.listenerAttached) {
        clearMsgBtn.dataset.listenerAttached = 'true';
        clearMsgBtn.addEventListener('click', clearSupportMessages);
    }
}

function clearSupportMessages() {
    const messages = readStorage(STORAGE_KEYS.contact, []);
    if (messages.length === 0) {
        showNotification('info', 'No messages to clear.');
        return;
    }
    if (!confirm(`Delete all ${messages.length} messages? This cannot be undone.`)) return;

    writeStorage(STORAGE_KEYS.contact, []);
    addActivity('Cleared all support messages');
    showNotification('success', 'All messages cleared.');
    initSupport();
}

function initSuperAdminDashboard() {
    if (!enforceSuperAdminAccess()) return;
    const reservations = readStorage(STORAGE_KEYS.reservations, []);
    const customRooms = readStorage('cozycorner-custom-rooms', {});
    const allRooms = { ...ROOM_DATA, ...customRooms };

    document.getElementById('stat-total-reservations').textContent = reservations.length;
    document.getElementById('stat-total-properties').textContent = Object.keys(allRooms).length;
    document.getElementById('stat-total-guests').textContent = reservations.reduce((sum,r) => sum + (r.guests||0), 0);

    const activities = readStorage('cozycorner-activity-log', []);
    const logContainer = document.getElementById('activity-log');
    if (activities.length === 0) {
        logContainer.innerHTML = '<li class="activity-item" style="text-align:center;color:var(--text-soft);">No recent activity.</li>';
    } else {
        logContainer.innerHTML = activities.slice(0,10).map(a => `
            <li class="activity-item"><span>${a.action}</span><time datetime="${a.timestamp}">${new Date(a.timestamp).toLocaleString()}</time></li>
        `).join('');
    }

    const revenueContainer = document.getElementById('revenue-chart');
    if (revenueContainer) {
        const monthly = {};
        const now = new Date();
        for (let i=5; i>=0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
            monthly[d.toLocaleString('en-US',{month:'short',year:'numeric'})] = 0;
        }
        reservations.forEach(r => {
            const d = new Date(r.createdAt);
            const key = d.toLocaleString('en-US',{month:'short',year:'numeric'});
            if (monthly.hasOwnProperty(key)) monthly[key] += r.total;
        });
        let html = '<div class="chart-bars">';
        for (const [month,total] of Object.entries(monthly)) {
            const height = total>0 ? Math.max(20, Math.min(200, total/200)) : 5;
            html += `<div class="chart-bar" style="height:${height}px;" title="${month}: ${formatCurrency(total)}"><span>${month}</span></div>`;
        }
        html += '</div>';
        revenueContainer.innerHTML = html;
    }

    const clearActBtn = document.getElementById('btn-clear-activities');
    if (clearActBtn) {
        clearActBtn.addEventListener('click', clearRecentActivities);
    }
}

function initManageAdmins() {
    if (!enforceSuperAdminAccess()) return;

    const modal = document.getElementById('admin-modal');
    const form = document.getElementById('admin-form-modal');
    const modalTitle = document.getElementById('admin-modal-title');
    const closeBtn = document.getElementById('btn-close-admin-modal');
    let selectedUsername = null;

    function renderAdmins() {
        const allUsers = getAllUsers();
        const adminUsers = Object.entries(allUsers).filter(
            ([_, u]) => u.role === USER_ROLES.ADMIN
        );

        let changed = false;
        adminUsers.forEach(([uname, user]) => {
            if (user.active === undefined) {
                user.active = true;
                changed = true;
            }
        });
        if (changed) {
            const registered = readStorage(STORAGE_KEYS.registeredUsers, {});
            adminUsers.forEach(([uname, user]) => {
                if (registered[uname] === undefined) {
                    registered[uname] = { ...user };
                } else {
                    registered[uname].active = user.active;
                }
            });
            writeStorage(STORAGE_KEYS.registeredUsers, registered);
        }

        const container = document.getElementById('admins-container');
        if (!container) return;

        if (!adminUsers.length) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-soft);padding:40px;">No admin accounts found.</p>';
            return;
        }

        let html = '<table class="reservations-table"><thead><tr><th>Select</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        adminUsers.forEach(([uname, user]) => {
            const isSel = uname === selectedUsername;
            html += `<tr class="${isSel ? 'selected' : ''}" data-username="${uname}">
                <td><input type="radio" name="selectAdmin" ${isSel ? 'checked' : ''}></td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role === USER_ROLES.SUPER_ADMIN ? 'Super Admin' : 'Admin'}</td>
                <td><span class="status-badge ${user.active === false ? 'status-disabled' : 'status-active'}">${user.active === false ? 'Disabled' : 'Active'}</span></td>
                <td>
                    <button class="button button--secondary btn-toggle-status" data-username="${uname}">${user.active === false ? 'Enable' : 'Disable'}</button>
                    <button class="button button--danger btn-remove-admin" data-username="${uname}">Remove</button>
                </td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        container.querySelectorAll('tbody tr').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
                const radio = row.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
                selectedUsername = row.dataset.username;
                container.querySelectorAll('tr').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
            });
        });

        container.querySelectorAll('.btn-toggle-status').forEach(btn => {
            btn.addEventListener('click', () => {
                const uname = btn.dataset.username;
                const users = getAllUsers();
                if (users[uname]) {
                    users[uname].active = !(users[uname].active === false);
                    const registered = readStorage(STORAGE_KEYS.registeredUsers, {});
                    registered[uname] = {
                        ...(registered[uname] || {}),
                        active: users[uname].active,
                    };
                    writeStorage(STORAGE_KEYS.registeredUsers, registered);
                    addActivity(`${users[uname].active ? 'Enabled' : 'Disabled'} admin: ${uname}`);
                    showNotification('success', `Admin '${uname}' ${users[uname].active ? 'enabled' : 'disabled'}.`);
                    renderAdmins();
                }
            });
        });

        container.querySelectorAll('.btn-remove-admin').forEach(btn => {
            btn.addEventListener('click', () => {
                const uname = btn.dataset.username;
                if (confirm(`Remove admin '${uname}'?`)) {
                    const registered = readStorage(STORAGE_KEYS.registeredUsers, {});
                    delete registered[uname];
                    writeStorage(STORAGE_KEYS.registeredUsers, registered);
                    selectedUsername = null;
                    addActivity('Removed admin: ' + uname);
                    showNotification('success', 'Admin removed.');
                    renderAdmins();
                }
            });
        });
    }

    function showModal(edit = false) {
        if (edit && selectedUsername) {
            const users = getAllUsers();
            const user = users[selectedUsername];
            if (user) {
                form.elements['username'].value = user.username;
                form.elements['email'].value = user.email;
                form.elements['role'].value = user.role;
                form.elements['password'].value = '';
                form.elements['username'].readOnly = true;
            }
            modalTitle.textContent = 'Update Admin Account';
        } else {
            form.reset();
            form.elements['username'].readOnly = false;
            modalTitle.textContent = 'Add Admin Account';
        }
        modal.style.display = 'flex';
    }

    function hideModal() { modal.style.display = 'none'; }

    closeBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) hideModal(); });

    document.getElementById('btn-add-admin').addEventListener('click', () => {
        selectedUsername = null;
        showModal(false);
    });
    document.getElementById('btn-update-admin').addEventListener('click', () => {
        if (!selectedUsername) {
            showNotification('error', 'Select an admin first.');
            return;
        }
        showModal(true);
    });
    document.getElementById('btn-disable-admin').addEventListener('click', () => {
        if (!selectedUsername) {
            showNotification('error', 'Select an admin first.');
            return;
        }
        const users = getAllUsers();
        if (users[selectedUsername]) {
            users[selectedUsername].active = false;
            const registered = readStorage(STORAGE_KEYS.registeredUsers, {});
            registered[selectedUsername] = {
                ...(registered[selectedUsername] || {}),
                active: false,
            };
            writeStorage(STORAGE_KEYS.registeredUsers, registered);
            addActivity('Disabled admin: ' + selectedUsername);
            showNotification('success', 'Admin disabled.');
            renderAdmins();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = form.elements['username'].value.trim();
        const email = form.elements['email'].value.trim();
        const password = form.elements['password'].value;
        const role = form.elements['role'].value;
        if (!username || !email || (!selectedUsername && !password)) {
            showNotification('error', 'Fill all required fields.');
            return;
        }
        const allUsers = getAllUsers();
        const isEdit = !!selectedUsername;
        if (!isEdit && allUsers[username]) {
            showNotification('error', 'Username already exists.');
            return;
        }
        const userObj = {
            username,
            email,
            password: isEdit ? (password || allUsers[selectedUsername]?.password) : password,
            role,
            active: true,
        };
        const registered = readStorage(STORAGE_KEYS.registeredUsers, {});
        registered[username] = userObj;
        if (isEdit && username !== selectedUsername) {
            delete registered[selectedUsername];
        }
        writeStorage(STORAGE_KEYS.registeredUsers, registered);
        addActivity(isEdit ? 'Updated admin: ' + username : 'Added new admin: ' + username);
        showNotification('success', isEdit ? 'Admin updated.' : 'Admin added.');
        hideModal();
        selectedUsername = null;
        renderAdmins();
    });

    renderAdmins();
}
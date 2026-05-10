const STORAGE_KEYS = {
    registeredUsers: "cozycorner_registered_users",
    session: "cozycorner-session",
    contact: "cozycorner-contact-messages",
    reservations: "cozycorner-reservations",
    pendingRoom: "cozycorner-pending-room",
    customRooms: "cozycorner-custom-rooms",
    activityLog: "cozycorner-activity-log",
    pendingBooking: "cozycorner-pending-booking"
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

const MOCK_REVIEWS = [
    { roomId: "room-1", user: "Alice", rating: 5, comment: "Absolutely loved the cozy atmosphere!", date: "2026-04-01" },
    { roomId: "room-1", user: "Bob", rating: 4, comment: "Beautiful room, but a bit pricey.", date: "2026-03-28" },
    { roomId: "room-2", user: "Charlie", rating: 5, comment: "Perfect for a solo traveller.", date: "2026-04-05" },
    { roomId: "room-3", user: "Diana", rating: 4, comment: "Great work desk, very bright.", date: "2026-04-02" },
];

const USER_ROLES = { USER: "user", ADMIN: "admin", SUPER_ADMIN: "super_admin" };

// ---------- User persistence ----------
function getDefaultUsers() {
    return {
        admin: { username: "admin", email: "admin@example.com", password: "admin123", role: USER_ROLES.ADMIN, active: true },
        super: { username: "super", email: "super@example.com", password: "super123", role: USER_ROLES.SUPER_ADMIN, active: true },
        user: { username: "user", email: "user@example.com", password: "user123", role: USER_ROLES.USER, active: true }
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
    } else if (currentPage === "index.html") {
        renderRoomCardsOnHome();
        renderGuestReviews();
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

// ---------- Auth ----------
function initializeAuthPage() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    if (!loginForm || !registerForm) return;

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

    bindFieldValidation(loginForm);
    bindFieldValidation(registerForm);
    loginForm.addEventListener("submit", (e) => { e.preventDefault(); handleLogin(loginForm); });
    registerForm.addEventListener("submit", (e) => { e.preventDefault(); handleRegistration(registerForm, loginForm); });
}
function handleLogin(form) {
    const username = getFieldValue(form, "username");
    const password = getFieldValue(form, "password");
    const feedback = document.getElementById("login-feedback");
    // Clear previous states
    clearFieldState(form, 'username');
    clearFieldState(form, 'password');

    let loginError = '';
    let matchedUser = null;

    if (!username && !password) {
        loginError = 'Please enter your username and password.';
        setFieldState(form, 'username', 'error', 'Required');
        setFieldState(form, 'password', 'error', 'Required');
    } else if (!username) {
        loginError = 'Please enter your username.';
        setFieldState(form, 'username', 'error', 'Required');
    } else if (!password) {
        loginError = 'Please enter your password.';
        setFieldState(form, 'password', 'error', 'Required');
    } else {
        const allUsers = getAllUsers();
        matchedUser = allUsers[username];
        if (!matchedUser || matchedUser.password !== password) {
            loginError = 'Invalid username or password. Please try again.';
            setFieldState(form, 'username', 'error', 'Invalid credentials');
            setFieldState(form, 'password', 'error', 'Invalid credentials');
        }
        // --- NEW: Check if account is disabled ---
        else if (matchedUser.active === false) {
            loginError = 'This account has been disabled. Contact a super admin.';
            setFieldState(form, 'username', 'error', loginError);
            setFeedback(feedback, 'error', loginError);
            showNotification('error', loginError);
            return;
        }
    }

    if (loginError) {
        setFeedback(feedback, 'error', loginError);
        showNotification('error', loginError);
        return;
    }

    // --- success ---
    writeSession(STORAGE_KEYS.session, {
        username: matchedUser.username,
        email: matchedUser.email,
        role: matchedUser.role
    });

    // Check for pending booking
    const pending = readSession(STORAGE_KEYS.pendingBooking, null);
    if (pending) {
        writeSession(STORAGE_KEYS.pendingBooking, null);
        const params = `room=${encodeURIComponent(pending.roomId)}` +
                       (pending.checkin ? `&checkin=${encodeURIComponent(pending.checkin)}` : '') +
                       (pending.checkout ? `&checkout=${encodeURIComponent(pending.checkout)}` : '') +
                       (pending.guests ? `&guests=${encodeURIComponent(pending.guests)}` : '');
        window.location.href = 'reservation.html?' + params;
        return;
    }

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
    const allUsers = getAllUsers();

    let regError = '';
    const setRegError = (field, msg) => {
        setFieldState(registerForm, field, 'error', msg);
        regError = msg;
    };

    if (!username) setRegError('username', 'Please choose a username.');
    else if (allUsers[username]) setRegError('username', 'This username is already taken.');

    if (!regError || regError === 'This username is already taken.') {
        if (!email) setRegError('email', 'Please enter your email address.');
        else if (!isValidEmail(email)) setRegError('email', 'Please enter a valid email.');
        else if (Object.values(allUsers).some(u => u.email === email)) setRegError('email', 'This email is already registered.');
    }

    if (!regError || regError === 'This email is already registered.') {
        if (!password) setRegError('password', 'Please create a password.');
        else if (password.length < 6) setRegError('password', 'Password must be at least 6 characters.');
    }

    if (!regError || regError === 'Password must be at least 6 characters.') {
        if (!confirmPassword) setRegError('confirm-password', 'Please confirm your password.');
        else if (password !== confirmPassword) setRegError('confirm-password', 'Passwords do not match.');
    }

    if (regError) {
        setFeedback(feedback, 'error', regError);
        showNotification('error', regError);
        return;
    }
    const newUser = { username, email, password, role: USER_ROLES.USER, active: true };
    saveUser(newUser);
    writeSession(STORAGE_KEYS.session, { username, email, role: USER_ROLES.USER });
    registerForm.reset();
    clearFormState(registerForm);
    setFeedback(feedback, "success", `Welcome, ${username}! Redirecting to your dashboard...`);
    const loginUsername = loginForm.elements.namedItem("username");
    if (loginUsername) loginUsername.value = username;
    showNotification("success", `Account created! Welcome ${username}.`);

    const pending = readSession(STORAGE_KEYS.pendingBooking, null);
    if (pending) {
        writeSession(STORAGE_KEYS.pendingBooking, null);
        const params = `room=${encodeURIComponent(pending.roomId)}` +
                       (pending.checkin ? `&checkin=${encodeURIComponent(pending.checkin)}` : '') +
                       (pending.checkout ? `&checkout=${encodeURIComponent(pending.checkout)}` : '') +
                       (pending.guests ? `&guests=${encodeURIComponent(pending.guests)}` : '');
        window.location.href = 'reservation.html?' + params;
        return;
    }

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
    if (viewName === 'reservations') {
        renderReservationView();
        return;
    }
    if (viewName === 'contact') {
        renderContactView();
        return;
    }
}
function renderReservationView() {
    const container = document.getElementById('dynamic-view');
    container.innerHTML = `
        <section class="filter-bar" aria-labelledby="filter-title">
            <h2 id="filter-title" class="visually-hidden">Search filters</h2>
            <form class="filter-form" id="filter-form">
                <div class="field">
                    <label for="filter-guests">Guests</label>
                    <select id="filter-guests" name="guests">
                        <option value="">Any size</option>
                        <option value="1">1 guest</option>
                        <option value="2">2 guests</option>
                        <option value="3">3+ guests</option>
                    </select>
                </div>
                <div class="field">
                    <label for="filter-type">Room type</label>
                    <select id="filter-type" name="type">
                        <option value="">All types</option>
                        <option value="suite">Suite</option>
                        <option value="studio">Studio</option>
                        <option value="family">Family</option>
                    </select>
                </div>
                <div class="field">
                    <label for="filter-price">Max price</label>
                    <select id="filter-price" name="price">
                        <option value="">No limit</option>
                        <option value="3000">PHP 3,000</option>
                        <option value="3400">PHP 3,400</option>
                        <option value="3800">PHP 3,800</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button class="button button--primary" type="submit">Apply</button>
                    <button class="button button--secondary" type="button" id="clear-filters">Reset</button>
                </div>
                <p id="filter-feedback" class="form-feedback"></p>
            </form>
        </section>
        <section class="listing-panel" aria-labelledby="room-list-title">
            <h2 id="room-list-title" class="visually-hidden">Available rooms</h2>
            <div class="reservation-grid" id="room-grid"></div>
        </section>
    `;
    renderRoomGrid(false);
    // Re-bind filter and booking overlay listeners (without duplicating)
    const filterForm = document.getElementById("filter-form");
    const clearFilters = document.getElementById("clear-filters");
    if (filterForm) {
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const cards = Array.from(document.querySelectorAll('.room-listing'));
            applyRoomFilters(filterForm, cards);
        });
    }
    if (clearFilters) {
        clearFilters.addEventListener("click", () => {
            filterForm.reset();
            const cards = Array.from(document.querySelectorAll('.room-listing'));
            applyRoomFilters(filterForm, cards);
            showNotification("info", "Filters cleared.");
        });
    }
    // Reserve button delegation
    const grid = document.getElementById('room-grid');
    if (grid) {
        grid.addEventListener('click', (e) => {
            const btn = e.target.closest('.reserve-trigger');
            if (!btn) return;
            const card = btn.closest('.room-listing');
            if (!card) return;
            openBookingOverlay(card.dataset.roomId);
        });
    }
    ensureBookingOverlay();
    initOverlayBookingListeners();
}
function renderContactView() {
    const container = document.getElementById('dynamic-view');
    container.innerHTML = `
        <section class="contact-layout" aria-labelledby="contact-heading">
            <h2 id="contact-heading" class="visually-hidden">Contact Information</h2>
            <article class="panel panel--accent contact-copy">
                <p class="eyebrow">Reach out anytime</p>
                <h1>Contact us</h1>
                <p>If you have questions about room selection, booking details, or general stay information, send us a message using the form.</p>
                <dl class="contact-details">
                    <div><dt>Email</dt><dd>hello@cozycorner.example</dd></div>
                    <div><dt>Phone</dt><dd>+63 912 345 6789</dd></div>
                    <div><dt>Hours</dt><dd>Daily, 8:00 AM to 8:00 PM</dd></div>
                </dl>
            </article>
            <section class="panel" aria-labelledby="contact-form-title">
                <div class="panel-heading">
                    <h2 id="contact-form-title">Send a message</h2>
                    <p>We'll respond to your message within 24 hours.</p>
                </div>
                <form class="contact-form" id="contact-form" novalidate>
                    <div class="field">
                        <label for="contact-name">Name</label>
                        <input id="contact-name" type="text" name="name" autocomplete="name">
                        <p class="field-message" aria-live="polite"></p>
                    </div>
                    <div class="field">
                        <label for="contact-email">Email</label>
                        <input id="contact-email" type="email" name="email" autocomplete="email">
                        <p class="field-message" aria-live="polite"></p>
                    </div>
                    <div class="field">
                        <label for="contact-message">Message</label>
                        <textarea id="contact-message" name="message"></textarea>
                        <p class="field-message" aria-live="polite"></p>
                    </div>
                    <p id="contact-feedback" class="form-feedback"></p>
                    <button class="button button--primary" type="submit">Submit</button>
                </form>
            </section>
        </section>
    `;
    initializeContactForm();
}

function refreshDashboardTrip() {
    // (unchanged, full code omitted for brevity – it's identical to the original)
}

function renderDashboardView() {
    // (unchanged, full original code)
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
            const room = ROOM_DATA[reservation.roomId] || readStorage(STORAGE_KEYS.customRooms, {})[reservation.roomId];
            const images = (ROOM_IMAGES[reservation.roomId] || room?.images || []);
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
                            <ul class="feature-list">${(room.features||[]).map(f=>`<li>${f}</li>`).join('')}</ul>
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
            // Stop carousel timers before hiding
            const carousel = dropdown.querySelector('[data-carousel]');
            if (carousel && carousel._autoInterval) {
                clearInterval(carousel._autoInterval);
                carousel._autoInterval = null;
            }
            dropdown.style.maxHeight = "0";
            dropdown.style.opacity = "0";
            isOpen = false;
            btn.textContent = "View Property";
            setTimeout(() => { if (!isOpen) dropdown.innerHTML = ""; }, 400);
        }
    };
}

// ... (rest of the original script.js continues, with the following critical modifications incorporated)

// ========== DOUBLE BOOKING PREVENTION (unchanged) ==========
function isRoomAvailable(roomId, checkin, checkout, excludeIndex = null) {
    // identical
}

// ========== Dynamic Room Card Builder (unchanged) ==========
function buildRoomCard(room, roomId) {
    // identical
}

function renderRoomGrid(applyFilters = false) {
    // identical
}

// ---------- Overlay booking ----------
function ensureBookingOverlay() {
    // identical to original, but already attached listeners are fine because we use initOverlayBookingListeners
}

function createTermsOverlay() { /* unchanged */ }
function showTermsOverlay() { /* unchanged */ }
function closeTermsOverlay() { /* unchanged */ }

function openBookingOverlay(roomId, options = {}) {
    // identical
}

function closeBookingOverlay() {
    // identical
}

function updateOverlayTotal(room) {
    // identical
}

function initOverlayBookingListeners() {
    // identical
}

function handleOverlayBookingSubmit() {
    // identical
}

// ---------- Filter logic ----------
function applyRoomFilters(form, roomCards) {
    // identical
}

// ---------- Ratings and Reviews ----------
// ... (unchanged)

// ---------- Initialize Reservation page ----------
function initializeReservationPage() {
    renderRoomGrid(false);

    // Filter bindings
    const filterForm = document.getElementById("filter-form");
    const clearFilters = document.getElementById("clear-filters");
    if (filterForm) {
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const cards = Array.from(document.querySelectorAll('.room-listing'));
            applyRoomFilters(filterForm, cards);
        });
    }
    if (clearFilters) {
        clearFilters.addEventListener("click", () => {
            filterForm.reset();
            const cards = Array.from(document.querySelectorAll('.room-listing'));
            applyRoomFilters(filterForm, cards);
            showNotification("info", "Filters cleared.");
        });
    }

    // Event delegation for Reserve buttons
    const roomGrid = document.getElementById('room-grid');
    if (roomGrid) {
        roomGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.reserve-trigger');
            if (!btn) return;
            const card = btn.closest('.room-listing');
            if (!card) return;
            openBookingOverlay(card.dataset.roomId);
        });
    }

    ensureBookingOverlay();
    initOverlayBookingListeners();

    const urlParams = new URLSearchParams(window.location.search);
    const roomFromURL = urlParams.get("room");
    const checkinFromURL = urlParams.get("checkin");
    const checkoutFromURL = urlParams.get("checkout");
    const guestsFromURL = urlParams.get("guests");

    if (roomFromURL) {
        setTimeout(() => {
            const card = document.querySelector(`.room-listing[data-room-id="${roomFromURL}"]`);
            if (card) {
                card.scrollIntoView({ behavior: "smooth", block: "center" });
                openBookingOverlay(roomFromURL, { checkin: checkinFromURL || '', checkout: checkoutFromURL || '', guests: guestsFromURL || '' });
            }
        }, 300);
    }
}

// ---------- Contact form ----------
function initializeContactForm() {
    // identical
}

// ---------- Validation helpers ----------
// ... (unchanged)

// ---------- Carousels FIXED ----------
function initializeCarousels() {
    const carousels = document.querySelectorAll("[data-carousel]:not([data-carousel-ready])");
    carousels.forEach(c => {
        c.setAttribute("data-carousel-ready", "true");
        const slides = Array.from(c.querySelectorAll(".carousel-slide"));
        const prev = c.querySelector(".carousel-btn--prev");
        const next = c.querySelector(".carousel-btn--next");
        const dots = c.querySelector(".carousel-dots");
        let idx = slides.findIndex(s => s.classList.contains("is-active"));
        if (idx === -1) idx = 0;
        let auto;
        const update = () => {
            slides.forEach((s, i) => s.classList.toggle("is-active", i === idx));
            if (dots) {
                dots.querySelectorAll(".carousel-dot").forEach((d, i) => d.classList.toggle("is-active", i === idx));
            }
        };
        const go = (i) => { idx = (i + slides.length) % slides.length; update(); };
        const nextSlide = () => go(idx + 1);
        const prevSlide = () => go(idx - 1);
        const startAuto = () => { stopAuto(); auto = setInterval(nextSlide, 5000); c._autoInterval = auto; };
        const stopAuto = () => { clearInterval(auto); };
        if (prev) prev.addEventListener("click", (e) => { e.stopPropagation(); stopAuto(); prevSlide(); startAuto(); });
        if (next) next.addEventListener("click", (e) => { e.stopPropagation(); stopAuto(); nextSlide(); startAuto(); });
        if (dots) {
            dots.innerHTML = "";
            slides.forEach((_, i) => {
                const dot = document.createElement("button");
                dot.className = "carousel-dot" + (i === idx ? " is-active" : "");
                dot.addEventListener("click", () => { stopAuto(); go(i); startAuto(); });
                dots.appendChild(dot);
            });
        }
        startAuto();
        c.addEventListener("mouseenter", stopAuto);
        c.addEventListener("mouseleave", startAuto);
    });
}

// ---------- Storage helpers ----------
function readStorage(key, fallback) { /* unchanged */ }
function writeStorage(key, val) { /* unchanged */ }
function readSession(key, fallback) { /* unchanged */ }
function writeSession(key, val) { /* unchanged */ }
function getCurrentPageName() { /* unchanged */ }
function shouldHandleNavigation(event, href) { /* unchanged */ }

function updateNavigationForSession() {
    // unchanged
}

function initializeStaticLogout() {
    // unchanged
}

function renderMyReservations() {
    // unchanged
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
    // unchanged
}

function clearRecentActivities() {
    // unchanged
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
    const activities = readStorage(STORAGE_KEYS.activityLog, []);
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
        const allRooms = { ...ROOM_DATA, ...readStorage(STORAGE_KEYS.customRooms, {}) };
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
        const today = new Date().toISOString().split('T')[0];
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
        // Set min dates
        form.elements['checkin'].min = today;
        form.elements['checkout'].min = today;
        // Dynamic guest max
        roomSelect.addEventListener('change', () => {
            const roomId = roomSelect.value;
            const allRooms = { ...ROOM_DATA, ...readStorage(STORAGE_KEYS.customRooms, {}) };
            const room = allRooms[roomId];
            if (room) {
                form.elements['guests'].max = room.guests;
                form.elements['guests'].placeholder = `Up to ${room.guests}`;
            } else {
                form.elements['guests'].removeAttribute('max');
            }
        });
        // Trigger change if a room is already selected
        if (roomSelect.value) {
            roomSelect.dispatchEvent(new Event('change'));
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
            showNotification('error', 'Check‑out date must be after check‑in date.');
            return;
        }

        const allRooms = { ...ROOM_DATA, ...readStorage(STORAGE_KEYS.customRooms, {}) };
        const room = allRooms[roomId];
        if (!room) {
            showNotification('error', 'Invalid room selected.');
            return;
        }
        if (guests > room.guests) {
            showNotification('error', `This room accommodates up to ${room.guests} guest${room.guests !== 1 ? 's' : ''}. Please adjust the guest count.`);
            return;
        }

        const excludeIdx = (editIndex !== '') ? parseInt(editIndex, 10) : null;
        if (!isRoomAvailable(roomId, checkin, checkout, excludeIdx)) {
            showNotification('error', `Sorry, ${room.name} is already booked for these dates. Please choose different dates or another room.`);
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
    const imageInput = document.getElementById('room-images-upload');
    const previewContainer = document.getElementById('image-preview-container');
    let selectedRoomKey = null;
    let existingImages = [];
    let newImageFiles = [];

    function clearImagePreviews() {
        if (previewContainer) previewContainer.innerHTML = '';
        newImageFiles = [];
        if (imageInput) imageInput.value = '';
    }

    function refreshPreviews() {
        if (!previewContainer) return;
        previewContainer.innerHTML = '';
        existingImages.forEach((url, idx) => {
            const wrapper = document.createElement('div');
            wrapper.style.cssText = 'position:relative;width:80px;height:60px;overflow:hidden;border-radius:var(--radius-sm);border:1px solid var(--color-border-light);';
            const img = document.createElement('img');
            img.src = url;
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.textContent = '×';
            removeBtn.style.cssText = 'position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:20px;height:20px;line-height:1;cursor:pointer;';
            removeBtn.addEventListener('click', () => {
                existingImages.splice(idx, 1);
                refreshPreviews();
            });
            wrapper.appendChild(img);
            wrapper.appendChild(removeBtn);
            previewContainer.appendChild(wrapper);
        });
        newImageFiles.forEach((file, idx) => {
            // Warn if any file > 2MB
            if (file.size > 2 * 1024 * 1024) {
                showNotification('error', 'Each image must be under 2MB.');
                newImageFiles.splice(idx, 1);
                refreshPreviews();
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const wrapper = document.createElement('div');
                wrapper.style.cssText = 'position:relative;width:80px;height:60px;overflow:hidden;border-radius:var(--radius-sm);border:1px solid var(--color-border-light);';
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
                const removeBtn = document.createElement('button');
                removeBtn.type = 'button';
                removeBtn.textContent = '×';
                removeBtn.style.cssText = 'position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.6);color:#fff;border:none;border-radius:50%;width:20px;height:20px;line-height:1;cursor:pointer;';
                removeBtn.addEventListener('click', () => {
                    newImageFiles.splice(idx, 1);
                    refreshPreviews();
                });
                wrapper.appendChild(img);
                wrapper.appendChild(removeBtn);
                previewContainer.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
    }

    if (imageInput) {
        imageInput.addEventListener('change', () => {
            newImageFiles = Array.from(imageInput.files);
            refreshPreviews();
        });
    }

    function renderRooms() {
        const customRooms = readStorage(STORAGE_KEYS.customRooms, {});
        const allRooms = { ...ROOM_DATA, ...customRooms };
        const container = document.getElementById('rooms-container');
        container.innerHTML = Object.entries(allRooms).map(([key, room]) => {
            let imageHtml = '';
            if (room.images && room.images.length > 0) {
                imageHtml = `<div class="room-listing__media" style="aspect-ratio:4/3;overflow:hidden;background:var(--color-surface-muted);"><img src="${room.images[0]}" style="width:100%;height:100%;object-fit:cover;" alt="${room.name}"></div>`;
            } else {
                imageHtml = `<div class="room-listing__media" style="aspect-ratio:4/3;overflow:hidden;background:var(--color-surface-muted);display:flex;align-items:center;justify-content:center;color:var(--text-soft);">No image</div>`;
            }
            return `
                <article class="room-listing room-card ${key === selectedRoomKey ? 'is-selected' : ''}" data-room-id="${key}">
                    ${imageHtml}
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
            `;
        }).join('');

        container.querySelectorAll('.btn-select-room').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedRoomKey = btn.dataset.roomKey;
                renderRooms();
                // Update button states
                const updateBtn = document.getElementById('btn-update-room');
                updateBtn.disabled = !selectedRoomKey || !!ROOM_DATA[selectedRoomKey];
                updateBtn.style.opacity = updateBtn.disabled ? '0.5' : '1';
            });
        });
        container.querySelectorAll('.btn-delete-room').forEach(btn => {
            btn.addEventListener('click', () => {
                if (confirm('Delete this custom room? Default rooms cannot be deleted.')) {
                    const customRooms = readStorage(STORAGE_KEYS.customRooms, {});
                    delete customRooms[btn.dataset.roomKey];
                    writeStorage(STORAGE_KEYS.customRooms, customRooms);
                    selectedRoomKey = null;
                    renderRooms();
                    addActivity('Deleted a room');
                    showNotification('success', 'Room deleted.');
                }
            });
        });
        // Disable update button if selected is default
        const updateBtn = document.getElementById('btn-update-room');
        if (updateBtn) {
            updateBtn.disabled = !selectedRoomKey || !!ROOM_DATA[selectedRoomKey];
            updateBtn.style.opacity = updateBtn.disabled ? '0.5' : '1';
        }
    }

    function showModal(edit = false) {
        clearImagePreviews();
        existingImages = [];
        newImageFiles = [];
        if (imageInput) imageInput.value = '';

        if (edit && selectedRoomKey) {
            const customRooms = readStorage(STORAGE_KEYS.customRooms, {});
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
            if (room.images && Array.isArray(room.images)) {
                existingImages = [...room.images];
            }
        } else {
            form.reset();
            form.elements['roomKey'].value = '';
            modalTitle.textContent = 'Add Room';
        }
        refreshPreviews();
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
        if (ROOM_DATA[selectedRoomKey]) {
            showNotification('error', 'Default rooms cannot be updated. Add a custom room instead.');
            return;
        }
        showModal(true);
    });
    document.getElementById('btn-delete-room').addEventListener('click', () => {
        if (!selectedRoomKey) { showNotification('error','Select a room first.'); return; }
        const customRooms = readStorage(STORAGE_KEYS.customRooms, {});
        if (!customRooms[selectedRoomKey]) { showNotification('error','Only custom rooms can be deleted.'); return; }
        if (confirm('Delete this room?')) {
            delete customRooms[selectedRoomKey];
            writeStorage(STORAGE_KEYS.customRooms, customRooms);
            selectedRoomKey = null;
            renderRooms();
            addActivity('Deleted a room');
            showNotification('success','Room deleted.');
        }
    });

    form.addEventListener('submit', async (e) => {
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
        const customRooms = readStorage(STORAGE_KEYS.customRooms, {});
        if (ROOM_DATA[roomId] && form.elements['roomKey'].value !== roomId) {
            showNotification('error','That room ID is already used by a default room.');
            return;
        }

        const newDataUrls = await Promise.all(
            newImageFiles.map(file => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            }))
        );

        const finalImages = [...existingImages, ...newDataUrls];

        customRooms[roomId] = {
            name: roomId,
            title,
            price,
            guests,
            type,
            description,
            features: [`${guests} guests`, type.charAt(0).toUpperCase()+type.slice(1)],
            images: finalImages
        };

        writeStorage(STORAGE_KEYS.customRooms, customRooms);
        hideModal();
        renderRooms();
        addActivity('Room saved with images');
        showNotification('success','Room saved!');
        clearImagePreviews();
        existingImages = [];
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
    const customRooms = readStorage(STORAGE_KEYS.customRooms, {});
    const allRooms = { ...ROOM_DATA, ...customRooms };

    document.getElementById('stat-total-reservations').textContent = reservations.length;
    document.getElementById('stat-total-properties').textContent = Object.keys(allRooms).length;
    document.getElementById('stat-total-guests').textContent = reservations.reduce((sum,r) => sum + (r.guests||0), 0);

    const activities = readStorage(STORAGE_KEYS.activityLog, []);
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
        // Include both admin and super_admin
        const adminUsers = Object.entries(allUsers).filter(
            ([_, u]) => u.role === USER_ROLES.ADMIN || u.role === USER_ROLES.SUPER_ADMIN
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
        // Validate unique email (except current user)
        if (Object.values(allUsers).some(u => u.email === email && u.username !== (selectedUsername || ''))) {
            showNotification('error', 'Email already in use.');
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
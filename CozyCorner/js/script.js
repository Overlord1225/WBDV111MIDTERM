const SUPABASE_URL = 'https://egqsirtjkvlwqzzgerrx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DbgwOujzu7KJBXlhRngPjw_gLzV1rht';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ------------------------------------------------------------
   DATA CONSTANTS (fallback / references)  – PRICES UPDATED
   ------------------------------------------------------------ */
const ROOM_DATA = {
    "room-1": { name: "Room 1", title: "Forest Hearth Suite", price: 1800, guests: 2, type: "suite", description: "Warm lighting, a private lounge setup, and a quiet indoor atmosphere for couples.", features: ["2 guests", "Suite", "Lounge area"] },
    "room-2": { name: "Room 2", title: "Calm Studio Retreat", price: 2500, guests: 2, type: "studio", description: "Soft neutral finishes and open floor space designed for solo guests or a pair.", features: ["2 guests", "Studio", "Quiet interior"] },
    "room-3": { name: "Room 3", title: "Sunlit Wood Suite", price: 1800, guests: 2, type: "suite", description: "Airy bedroom styling with a dedicated work corner and a brighter daytime feel.", features: ["2 guests", "Suite", "Work desk"] },
    "room-4": { name: "Room 4", title: "Relaxed Family Room", price: 3300, guests: 3, type: "family", description: "Designed with a little more room to move, suitable for small groups or families.", features: ["3 guests", "Family", "Open layout"] },
    "room-5": { name: "Room 5", title: "Spacious Weekend Stay", price: 3300, guests: 4, type: "family", description: "A roomier setup with balanced natural tones for extended weekend bookings.", features: ["4 guests", "Family", "Extended stay"] },
    "room-6": { name: "Room 6", title: "Premium Cozy Suite", price: 1800, guests: 4, type: "suite", description: "Our highest-capacity suite with a more polished finish and broader guest flexibility.", features: ["4 guests", "Suite", "Premium finish"] }
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

let allRoomsCache = {};
let currentUserSession = null;

/* ------------------------------------------------------------
   UTILITY FUNCTIONS
   ------------------------------------------------------------ */
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

function calculateNights(checkin, checkout) {
    const start = new Date(checkin);
    const end = new Date(checkout);
    return Math.round((end.getTime() - start.getTime()) / 86400000);
}

/** Simple XSS prevention – use for any text that originated from the database or user input */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Returns room entries sorted naturally by the numeric part of the room ID.
 * Example: 'room-2' before 'room-10'.
 */
function getSortedRoomEntries(roomsCache) {
    return Object.entries(roomsCache).sort((a, b) => {
        const numA = parseInt(a[0].split('-').pop()) || 0;
        const numB = parseInt(b[0].split('-').pop()) || 0;
        return numA - numB;
    });
}

/* ------------------------------------------------------------
   NOTIFICATIONS
   ------------------------------------------------------------ */
function showNotification(type, message, duration = 4000) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
        <div class="toast-icon">${type === 'success' ? '✓' : (type === 'error' ? '⚠' : 'ℹ')}</div>
        <div class="toast-message">${escapeHtml(message)}</div>
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

/* ------------------------------------------------------------
   FORM HELPERS
   ------------------------------------------------------------ */
function getFieldValue(form, fieldName) {
    const field = form.elements.namedItem(fieldName);
    return typeof field?.value === "string" ? field.value.trim() : "";
}

function setFeedback(element, state, message) {
    if (!element) return;
    element.textContent = message;
    element.classList.add("is-visible");
    element.classList.toggle("is-error", state === "error");
    element.classList.toggle("is-success", state === "success");
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

function clearFormState(form) {
    form.querySelectorAll(".field-message").forEach(msg => {
        msg.textContent = "";
        msg.classList.remove("is-visible", "is-error", "is-success");
    });
    form.querySelectorAll("input, select, textarea").forEach(field => {
        field.classList.remove("is-error", "is-focused");
    });
}

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
    if (!value) { setFieldState(form, fieldName, "error", "Required."); return false; }
    clearFieldState(form, fieldName);
    return true;
}

function validatePassword(form, fieldName, value) {
    if (!value) { setFieldState(form, fieldName, "error", "Password required."); return false; }
    if (value.length < 6) { setFieldState(form, fieldName, "error", "Minimum 6 characters."); return false; }
    clearFieldState(form, fieldName);
    return true;
}

function validateConfirmPassword(form, password, confirmPassword) {
    if (!confirmPassword) { setFieldState(form, "confirm-password", "error", "Confirm password."); return false; }
    if (password !== confirmPassword) { setFieldState(form, "confirm-password", "error", "Passwords do not match."); return false; }
    clearFieldState(form, "confirm-password");
    return true;
}

/* ------------------------------------------------------------
   AUTH FUNCTIONS (Supabase)
   ------------------------------------------------------------ */
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

async function handleLogin(form) {
    const username = getFieldValue(form, "username");
    const password = getFieldValue(form, "password");
    const feedback = document.getElementById("login-feedback");
    clearFieldState(form, 'username');
    clearFieldState(form, 'password');

    if (!username && !password) {
        setFieldState(form, 'username', 'error', 'Required');
        setFieldState(form, 'password', 'error', 'Required');
        return setFeedback(feedback, 'error', 'Please enter your username and password.');
    } else if (!username) {
        setFieldState(form, 'username', 'error', 'Required');
        return setFeedback(feedback, 'error', 'Please enter your username.');
    } else if (!password) {
        setFieldState(form, 'password', 'error', 'Required');
        return setFeedback(feedback, 'error', 'Please enter your password.');
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: username,
        password: password
    });

    if (error) {
        setFieldState(form, 'username', 'error', 'Invalid credentials');
        setFieldState(form, 'password', 'error', 'Invalid credentials');
        return setFeedback(feedback, 'error', 'Invalid email or password.');
    }

    const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('role, active')
        .eq('id', data.user.id)
        .eq('deleted', false)   // added soft-delete filter
        .single();

    if (profileError || !profile) {
        await supabaseClient.auth.signOut();
        return setFeedback(feedback, 'error', 'Profile not found.');
    }

    if (!profile.active) {
        await supabaseClient.auth.signOut();
        setFieldState(form, 'username', 'error', 'Account disabled');
        return setFeedback(feedback, 'error', 'This account has been disabled. Contact a super admin.');
    }

    setFeedback(feedback, "success", "Welcome back! Redirecting...");
    showNotification("success", "Login successful!");
    const redirectTo = (profile.role === USER_ROLES.SUPER_ADMIN) ? 'superadmin.html' :
                      (profile.role === USER_ROLES.ADMIN) ? 'admin.html' : 'user.html';
    setTimeout(() => { window.location.href = redirectTo; }, 600);
}

async function handleRegistration(registerForm, loginForm) {
    const username = getFieldValue(registerForm, "username");
    const email = getFieldValue(registerForm, "email");
    const password = getFieldValue(registerForm, "password");
    const confirmPassword = getFieldValue(registerForm, "confirm-password");
    const feedback = document.getElementById("register-feedback");

    if (!username) {
        setFieldState(registerForm, 'username', 'error', 'Required');
        return setFeedback(feedback, 'error', 'Please choose a username.');
    }
    if (!email) {
        setFieldState(registerForm, 'email', 'error', 'Required');
        return setFeedback(feedback, 'error', 'Please enter your email.');
    } else if (!isValidEmail(email)) {
        setFieldState(registerForm, 'email', 'error', 'Invalid email');
        return setFeedback(feedback, 'error', 'Please enter a valid email.');
    }
    if (!password) {
        setFieldState(registerForm, 'password', 'error', 'Required');
        return setFeedback(feedback, 'error', 'Please create a password.');
    } else if (password.length < 6) {
        setFieldState(registerForm, 'password', 'error', 'Minimum 6 characters');
        return setFeedback(feedback, 'error', 'Password must be at least 6 characters.');
    }
    if (password !== confirmPassword) {
        setFieldState(registerForm, 'confirm-password', 'error', 'Passwords do not match');
        return setFeedback(feedback, 'error', 'Passwords do not match.');
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { username: username }
        }
    });

    if (error) {
        return setFeedback(feedback, 'error', error.message);
    }

    // Ensure a profile row exists – MUST be before the session check
    if (data.user) {
        await createProfileIfMissing(data.user.id, username, email, 'user');
    }

    // Check if email confirmation is required
    if (!data.session) {
        setFeedback(feedback, "success", "Account created! Please check your email to confirm your address before logging in.");
        showNotification("success", "Account created – check your email to confirm.");
        return;
    }

    setFeedback(feedback, "success", "Account created! Redirecting...");
    showNotification("success", "Welcome to CozyCorner!");
    setTimeout(() => { window.location.href = "user.html"; }, 800);
}

async function createProfileIfMissing(userId, username, email, role = 'user') {
    // Check if profile already exists
    const { data: existingProfile } = await supabaseClient
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

    if (!existingProfile) {
        const { error } = await supabaseClient.from('profiles').upsert({
            id: userId,
            username: username,
            email: email,
            role: role,
            active: true,
            deleted: false
        }, { onConflict: 'id' });
        if (error) console.error('Failed to create profile:', error);
    }
}

function initializeStaticLogout() {
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', async (e) => {
            e.preventDefault();
            await supabaseClient.auth.signOut();
            window.location.href = 'login.html';
        });
    }
}

async function enforceAdminAccess() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return false; }
    const { data: profile } = await supabaseClient.from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .eq('deleted', false)
        .single();
    if (!profile || (profile.role !== USER_ROLES.ADMIN && profile.role !== USER_ROLES.SUPER_ADMIN)) {
        window.location.href = 'login.html'; return false;
    }
    return true;
}

async function enforceSuperAdminAccess() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { window.location.href = 'login.html'; return false; }
    const { data: profile } = await supabaseClient.from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .eq('deleted', false)
        .single();
    if (!profile || profile.role !== USER_ROLES.SUPER_ADMIN) {
        window.location.href = 'login.html'; return false;
    }
    return true;
}

/* ------------------------------------------------------------
   DATA FETCHING (Supabase) – now filters out deleted records
   ------------------------------------------------------------ */
async function fetchAllRooms() {
    const { data, error } = await supabaseClient
        .from('rooms')
        .select('*')
        .eq('deleted', false)
        .order('id', { ascending: true });
    if (error) throw error;
    const rooms = {};
    data.forEach(room => {
        rooms[room.id] = {
            name: room.name,
            title: room.title,
            price: room.price,
            guests: room.max_guests,
            type: room.type,
            description: room.description,
            features: room.features || [],
            images: room.images && room.images.length ? room.images : ROOM_IMAGES[room.id] || []
        };
    });
    return rooms;
}

async function fetchReservations(filters = {}) {
    let query = supabaseClient.from('reservations').select('*').eq('deleted', false);
    if (filters.email) query = query.eq('guest_email', filters.email);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

async function insertReservation(reservation) {
    const { error } = await supabaseClient.from('reservations').insert(reservation);
    if (error) throw error;
}

// Soft delete: sets deleted = true
async function deleteReservation(id) {
    const { error } = await supabaseClient.from('reservations').update({ deleted: true }).eq('id', id);
    if (error) throw error;
}

async function updateReservation(id, updates) {
    const { error } = await supabaseClient.from('reservations').update(updates).eq('id', id);
    if (error) throw error;
}

async function isRoomAvailable(roomId, checkin, checkout, excludeReservationId = null) {
    let query = supabaseClient.from('reservations')
        .select('id')
        .eq('room_id', roomId)
        .gte('checkout', checkin)
        .lte('checkin', checkout)
        .eq('deleted', false);
    if (excludeReservationId) query = query.neq('id', excludeReservationId);
    const { data } = await query;
    return data.length === 0;
}

/* ------------------------------------------------------------
   CONTACT MESSAGES – soft delete aware
   ------------------------------------------------------------ */
async function fetchMessages() {
    const { data, error } = await supabaseClient
        .from('contact_messages')
        .select('*')
        .eq('deleted', false)
        .order('submitted_at', { ascending: false });
    if (error) throw error;
    return data;
}

async function insertMessage(msg) {
    const { error } = await supabaseClient.from('contact_messages').insert(msg);
    if (error) throw error;
}

async function updateMessageStatus(id, status) {
    const { error } = await supabaseClient.from('contact_messages').update({ status }).eq('id', id);
    if (error) throw error;
}

// Soft delete all messages
async function deleteAllMessages() {
    const { error } = await supabaseClient.from('contact_messages').update({ deleted: true }).neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
}

/* ------------------------------------------------------------
   ACTIVITY LOG – soft delete aware
   ------------------------------------------------------------ */
async function fetchActivityLog() {
    const { data, error } = await supabaseClient
        .from('activity_log')
        .select('*')
        .eq('deleted', false)
        .order('created_at', { ascending: false })
        .limit(20);
    if (error) throw error;
    return data;
}

async function addActivityEntry(action) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const userName = session?.user?.email || 'system';
    const { error } = await supabaseClient.from('activity_log').insert({
        action: action,
        user_name: userName
    });
    if (error) console.error('Activity log error:', error);
}

// Soft delete all activities
async function clearActivityLog() {
    const { error } = await supabaseClient.from('activity_log').update({ deleted: true }).neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) throw error;
}

/* ------------------------------------------------------------
   CAROUSEL
   ------------------------------------------------------------ */
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
            if (dots) dots.querySelectorAll(".carousel-dot").forEach((d, i) => d.classList.toggle("is-active", i === idx));
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

/* ------------------------------------------------------------
   ROOM CARD RENDERING
   ------------------------------------------------------------ */
function buildRoomCard(room, roomId) {
    const images = room.images && room.images.length ? room.images : ROOM_IMAGES[roomId] || [];
    const firstImage = images.length ? images[0] : 'img/placeholder.jpg';

    const carouselHtml = images.length > 1 ? `
        <div class="carousel" data-carousel>
            <div class="carousel-track">
                ${images.map((img, i) => `<div class="carousel-slide ${i===0?'is-active':''}"><img src="${img}" alt="${escapeHtml(room.name)}"></div>`).join('')}
            </div>
            <button class="carousel-btn carousel-btn--prev"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button class="carousel-btn carousel-btn--next"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
            <div class="carousel-dots"></div>
        </div>
    ` : `<img src="${firstImage}" alt="${escapeHtml(room.name)}" style="width:100%; height:100%; object-fit:cover;">`;

    const featuresHtml = (room.features || []).map(f => `<li>${escapeHtml(f)}</li>`).join('');

    return `
    <article class="room-listing" data-room-id="${roomId}" data-price="${room.price}" data-guests="${room.guests}" data-type="${room.type}">
        <figure class="room-listing__media">
            ${carouselHtml}
        </figure>
        <div class="room-listing__body">
            <div class="room-listing__header">
                <div>
                    <h3>${escapeHtml(room.name)}</h3>
                    <p class="listing-subtitle">${escapeHtml(room.title)}</p>
                </div>
                <span class="price-tag">PHP ${room.price.toLocaleString()}</span>
            </div>
            <p>${escapeHtml(room.description)}</p>
            <ul class="feature-list">
                <li>${room.guests} guest${room.guests!==1?'s':''}</li>
                <li>${escapeHtml(room.type.charAt(0).toUpperCase()+room.type.slice(1))}</li>
                ${featuresHtml}
            </ul>
            <div class="room-rating" data-room-id="${roomId}"></div>
            <button class="button button--primary reserve-trigger" type="button">Reserve</button>
        </div>
    </article>`;
}

function renderRoomGrid(applyFilters = false) {
    const grid = document.getElementById('room-grid');
    if (!grid) return;
    let html = '';
    for (const [roomId, room] of getSortedRoomEntries(allRoomsCache)) {
        html += buildRoomCard(room, roomId);
    }
    grid.innerHTML = html;
    initializeCarousels();
    renderRatingOnCards();
    if (applyFilters) {
        const filterForm = document.getElementById('filter-form');
        if (filterForm) applyRoomFilters(filterForm, Array.from(grid.querySelectorAll('.room-listing')));
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
    if (feedback) {
        const message = visibleCount === 0 ? "No rooms match the selected filters." : `Showing ${visibleCount} room${visibleCount > 1 ? "s" : ""}.`;
        setFeedback(feedback, visibleCount === 0 ? "error" : "success", message);
    }
}

/* ------------------------------------------------------------
   BOOKING OVERLAY
   ------------------------------------------------------------ */
function ensureBookingOverlay() {
    if (document.getElementById('booking-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'booking-overlay';
    overlay.className = 'modal';
    overlay.style.display = 'none';
    overlay.innerHTML = `
        <div class="modal-content panel">
            <div class="panel-heading">
                <h2 id="overlay-room-title">Reserve a Room</h2>
                <button class="modal-close" id="btn-close-overlay">&times;</button>
            </div>
            <form class="booking-form" id="overlay-booking-form" novalidate>
                <input type="hidden" name="roomId" value="">
                <div class="booking-summary" id="overlay-room-summary"></div>
                <div class="field">
                    <label for="overlay-name">Full name</label>
                    <input id="overlay-name" type="text" name="name" autocomplete="name" required>
                    <p class="field-message"></p>
                </div>
                <div class="field">
                    <label for="overlay-email">Email</label>
                    <input id="overlay-email" type="email" name="email" autocomplete="email" required>
                    <p class="field-message"></p>
                </div>
                <div class="field">
                    <label for="overlay-checkin">Check-in</label>
                    <input id="overlay-checkin" type="date" name="checkin" required>
                    <p class="field-message"></p>
                </div>
                <div class="field">
                    <label for="overlay-checkout">Check-out</label>
                    <input id="overlay-checkout" type="date" name="checkout" required>
                    <p class="field-message"></p>
                </div>
                <div class="field">
                    <label for="overlay-guests">Guests</label>
                    <div class="guest-stepper" id="guest-stepper-container">
                        <button type="button" id="guest-minus" class="stepper-btn" aria-label="Decrease guests">–</button>
                        <span id="guest-count-display">1</span>
                        <input type="hidden" name="guests" id="overlay-guests" value="1" min="1">
                        <button type="button" id="guest-plus" class="stepper-btn" aria-label="Increase guests">+</button>
                    </div>
                    <span id="guest-max-info" style="font-size:0.8rem; color:var(--text-soft);"></span>
                    <p class="field-message"></p>
                </div>
                <div class="field terms-field">
                    <label>
                        <input type="checkbox" name="terms" required>
                        I agree to the <a href="#" onclick="event.preventDefault(); showTermsOverlay();" data-no-transition>Terms & Conditions</a>
                    </label>
                    <p class="field-message"></p>
                </div>
                <div class="booking-overlay-total" id="overlay-total">Total: select dates</div>
                <div class="form-actions">
                    <button class="button button--primary" type="submit">Book now</button>
                    <button class="button button--secondary" type="button" id="btn-cancel-overlay">Cancel</button>
                </div>
                <p class="form-feedback" id="overlay-feedback"></p>
            </form>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('input', (e) => {
        const field = e.target;
        if (field.name === 'checkin' || field.name === 'checkout' || field.name === 'guests') {
            const form = document.getElementById('overlay-booking-form');
            const roomId = form.elements['roomId'].value;
            const room = allRoomsCache[roomId];
            if (room) updateOverlayTotal(room);
        }
    });
    initOverlayBookingListeners();
}

function openBookingOverlay(roomId, options = {}) {
    ensureBookingOverlay();
    const room = allRoomsCache[roomId];
    if (!room) return;
    document.getElementById('overlay-room-title').textContent = `Reserve ${room.name} – ${room.title}`;
    document.getElementById('overlay-room-summary').innerHTML = `
        <strong>${escapeHtml(room.name)} – ${escapeHtml(room.title)}</strong><br>
        <span>${formatCurrency(room.price)} per night &nbsp;|&nbsp; Up to ${room.guests} guests</span>
    `;
    const form = document.getElementById('overlay-booking-form');
    form.elements['roomId'].value = roomId;
    form.reset();
    clearFormState(form);
    if (options.checkin) form.elements['checkin'].value = options.checkin;
    if (options.checkout) form.elements['checkout'].value = options.checkout;
    if (options.guests) form.elements['guests'].value = options.guests;
    if (currentUserSession) {
        form.elements['name'].value = currentUserSession.user?.user_metadata?.username || '';
        form.elements['email'].value = currentUserSession.user?.email || '';
        // Lock the email field so it cannot be changed – every booking stays linked to this account
        form.elements['email'].readOnly = true;
    } else {
        form.elements['email'].readOnly = false;
    }
    document.getElementById('overlay-total').textContent = 'Total: select dates';
    document.getElementById('overlay-feedback').textContent = '';
    const today = new Date().toISOString().split('T')[0];
    form.elements['checkin'].min = today;
    form.elements['checkout'].min = today;
    form.elements['guests'].max = room.guests;
    form.elements['guests'].value = 1;          // reset
    setupGuestStepper(room.guests);              // <-- add this line
    document.getElementById('booking-overlay').style.display = 'flex';
}

function closeBookingOverlay() {
    document.getElementById('booking-overlay').style.display = 'none';
}

function updateOverlayTotal(room) {
    const form = document.getElementById('overlay-booking-form');
    const checkin = getFieldValue(form, 'checkin');
    const checkout = getFieldValue(form, 'checkout');
    const totalField = document.getElementById('overlay-total');
    if (!checkin || !checkout) { totalField.textContent = 'Total: select dates'; return; }
    const nights = calculateNights(checkin, checkout);
    if (nights <= 0) { totalField.textContent = 'Total: invalid dates'; return; }
    totalField.textContent = `Total: ${formatCurrency(nights * room.price)} (${nights} night${nights>1?'s':''})`;
}

function setupGuestStepper(maxGuests) {
    const container = document.getElementById('guest-stepper-container');
    if (!container) return;

    // Prevent duplicate bindings
    if (container.dataset.initialized === 'true') {
        // Just update the counter and max info
        const hiddenInput = document.getElementById('overlay-guests');
        let count = parseInt(hiddenInput.value) || 1;
        count = Math.max(1, Math.min(count, maxGuests));
        hiddenInput.value = count;
        document.getElementById('guest-count-display').textContent = count;
        document.getElementById('guest-minus').disabled = count <= 1;
        document.getElementById('guest-plus').disabled = count >= maxGuests;
        document.getElementById('guest-max-info').textContent = `Up to ${maxGuests} guest${maxGuests!==1?'s':''}`;
        return;
    }
    container.dataset.initialized = 'true';

    const minusBtn = document.getElementById('guest-minus');
    const plusBtn = document.getElementById('guest-plus');
    const display = document.getElementById('guest-count-display');
    const hiddenInput = document.getElementById('overlay-guests');
    const maxInfo = document.getElementById('guest-max-info');

    let count = parseInt(hiddenInput.value) || 1;
    maxInfo.textContent = `Up to ${maxGuests} guest${maxGuests!==1?'s':''}`;

    function update() {
        count = Math.max(1, Math.min(count, maxGuests));
        display.textContent = count;
        hiddenInput.value = count;
        minusBtn.disabled = count <= 1;
        plusBtn.disabled = count >= maxGuests;
    }

    minusBtn.addEventListener('click', () => {
        count--;
        update();
        const roomId = document.getElementById('overlay-booking-form').elements['roomId'].value;
        const room = allRoomsCache[roomId];
        if (room) updateOverlayTotal(room);
    });

    plusBtn.addEventListener('click', () => {
        if (count < maxGuests) {
            count++;
            update();
            const roomId = document.getElementById('overlay-booking-form').elements['roomId'].value;
            const room = allRoomsCache[roomId];
            if (room) updateOverlayTotal(room);
        }
    });

    update();
}

function initOverlayBookingListeners() {
    const closeBtn = document.getElementById('btn-close-overlay');
    const cancelBtn = document.getElementById('btn-cancel-overlay');
    const overlay = document.getElementById('booking-overlay');
    if (closeBtn) closeBtn.addEventListener('click', closeBookingOverlay);
    if (cancelBtn) cancelBtn.addEventListener('click', closeBookingOverlay);
    if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBookingOverlay(); });
    const form = document.getElementById('overlay-booking-form');
    if (form && !form.hasAttribute('data-bound')) {
        form.setAttribute('data-bound', 'true');
        bindFieldValidation(form);
        form.addEventListener('submit', (e) => { e.preventDefault(); handleOverlayBookingSubmit(); });
    }
}

async function handleOverlayBookingSubmit() {
    const form = document.getElementById('overlay-booking-form');
    const roomId = getFieldValue(form, 'roomId');
    const name = getFieldValue(form, 'name');
    const email = getFieldValue(form, 'email');
    const checkin = getFieldValue(form, 'checkin');
    const checkout = getFieldValue(form, 'checkout');
    const guests = parseInt(getFieldValue(form, 'guests'));
    const termsChecked = form.elements['terms'].checked;
    const feedback = document.getElementById('overlay-feedback');

    if (!name || !email || !checkin || !checkout || !guests || !termsChecked) {
        return setFeedback(feedback, 'error', 'All fields are required.');
    }
    if (isNaN(guests) || guests < 1) return setFeedback(feedback, 'error', 'Invalid number of guests.');
    if (calculateNights(checkin, checkout) <= 0) {
        return setFeedback(feedback, 'error', 'Check-out must be after check-in.');
    }

    const room = allRoomsCache[roomId];
    if (!room) return setFeedback(feedback, 'error', 'Room not found.');
    if (guests > room.guests) return setFeedback(feedback, 'error', `Maximum ${room.guests} guests allowed.`);

    const available = await isRoomAvailable(roomId, checkin, checkout);
    if (!available) {
        return setFeedback(feedback, 'error', 'Sorry, these dates are not available. Please choose different dates.');
    }

    const nights = calculateNights(checkin, checkout);
    const total = nights * room.price;
    const { data: { session } } = await supabaseClient.auth.getSession();

    const reservation = {
        room_id: roomId,
        user_id: session?.user?.id || null,
        guest_name: name,
        guest_email: email,
        checkin,
        checkout,
        guests,
        nights,
        total
    };

    try {
        await insertReservation(reservation);
        if (currentUserSession) {
            await addActivityEntry(`New reservation: ${room.name} by ${email}`);
        }
        showNotification('success', `Reserved ${room.name} for ${formatCurrency(total)}`);
        closeBookingOverlay();
        if (document.getElementById('dashboard-main')) refreshDashboardTrip();
    } catch (err) {
        console.error('Overlay booking error:', err);
        // If the error message is from our trigger, display it directly
        const msg = err?.message || 'Failed to reserve room. Please try again.';
        setFeedback(feedback, 'error', msg);
    }
}

/* ------------------------------------------------------------
   TERMS OVERLAY
   ------------------------------------------------------------ */
function createTermsOverlay() {
    if (document.getElementById('terms-overlay')) return;
    const overlay = document.createElement('div');
    overlay.id = 'terms-overlay';
    overlay.className = 'modal';
    overlay.style.display = 'none';
    overlay.innerHTML = `
        <div class="modal-content panel" style="max-width:700px;">
            <div class="panel-heading">
                <h2>Terms & Conditions</h2>
                <button class="modal-close" onclick="closeTermsOverlay()">&times;</button>
            </div>
            <div style="max-height:65vh; overflow-y:auto; padding-right:5px;">
                <h3>1. General</h3>
                <p>These Terms and Conditions govern your use of the CozyCorner website and services. By making a reservation, you agree to these Terms.</p>
                <h3>2. Reservations & Booking</h3>
                <p>All reservations are subject to availability. A booking is confirmed only after you receive a confirmation notification. You must provide accurate information (name, email, dates, and number of guests).</p>
                <h3>3. Payment & Cancellation</h3>
                <p>Payment details will be collected at the time of booking. Cancellations may be subject to fees. If you cancel at least 48 hours before check-in, you may receive a full refund. Late cancellations may result in partial or no refund. CozyCorner reserves the right to cancel bookings due to unforeseen circumstances – in such cases you will receive a full refund.</p>
                <h3>4. Guest Responsibilities</h3>
                <p>Guests must respect the property. Any damage caused may result in additional charges. The number of guests must not exceed the room's stated capacity. Quiet hours are from 10:00 PM to 7:00 AM. Parties are not allowed without prior consent.</p>
                <h3>5. Privacy & Data Protection</h3>
                <p>Personal data is collected solely for processing reservations and improving services. Your information is stored securely and will not be shared without your consent, except as required by law.</p>
                <h3>6. Limitation of Liability</h3>
                <p>CozyCorner is not liable for direct or indirect losses arising from your stay, including personal injury or travel disruptions. Total liability is limited to the amount paid for the reservation.</p>
                <h3>7. Governing Law</h3>
                <p>These Terms are governed by the laws of the Republic of the Philippines.</p>
                <h3>8. Contact</h3>
                <p>Questions about these Terms can be directed to <strong>hello@cozycorner.example</strong>.</p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeTermsOverlay(); });
}

function showTermsOverlay() {
    createTermsOverlay();
    document.getElementById('terms-overlay').style.display = 'flex';
}

function closeTermsOverlay() {
    const overlay = document.getElementById('terms-overlay');
    if (overlay) overlay.style.display = 'none';
}

/* ------------------------------------------------------------
   REVIEW MODAL (used from user dashboard)
   ------------------------------------------------------------ */
function ensureReviewModal() {
    if (document.getElementById('review-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'review-modal';
    modal.className = 'modal';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="modal-content panel" style="max-width:480px;">
            <div class="panel-heading">
                <h2>Leave a Review</h2>
                <button class="modal-close" id="btn-close-review-modal">&times;</button>
            </div>
            <form id="review-modal-form" novalidate>
                <input type="hidden" name="roomId" value="">
                <div class="field">
                    <label>Room</label>
                    <input type="text" id="review-room-display" readonly>
                </div>
                <div class="field">
                    <label for="review-modal-rating">Rating</label>
                    <select id="review-modal-rating" name="rating" required>
                        <option value="">Choose</option>
                        <option value="5">★★★★★</option>
                        <option value="4">★★★★☆</option>
                        <option value="3">★★★☆☆</option>
                        <option value="2">★★☆☆☆</option>
                        <option value="1">★☆☆☆☆</option>
                    </select>
                </div>
                <div class="field">
                    <label for="review-modal-comment">Your review</label>
                    <textarea id="review-modal-comment" name="comment" required></textarea>
                </div>
                <button class="button button--primary" type="submit" style="margin-top:var(--space-xs);">Submit Review</button>
                <p class="form-feedback" id="review-modal-feedback" style="margin-top:var(--space-lg);"></p>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('btn-close-review-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    const form = document.getElementById('review-modal-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const roomId = form.elements['roomId'].value;
        const rating = parseInt(form.elements['rating'].value);
        const comment = form.elements['comment'].value.trim();
        const feedback = document.getElementById('review-modal-feedback');

        if (!rating || !comment) {
            return setFeedback(feedback, 'error', 'Rating and comment are required.');
        }
        try {
            await submitReview({ roomId, rating, comment });
            form.reset();
            modal.style.display = 'none';
            showNotification('success', 'Review submitted! Thank you.');
            refreshDashboardTrip();
            await renderRatingOnCards();
        } catch (err) {
            setFeedback(feedback, 'error', err.message);
        }
    });
}

/* ------------------------------------------------------------
   RATINGS & REVIEWS (dynamic from Supabase)
   ------------------------------------------------------------ */
async function fetchReviews(roomId = null) {
    let query = supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
    if (roomId) {
        query = query.eq('room_id', roomId);
    } else {
        query = query.limit(10);   // limit homepage reviews to 10 most recent
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
}

async function calculateAverageRating(roomId) {
    const reviews = await fetchReviews(roomId);
    if (!reviews.length) return { avg: 0, count: 0 };
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return { avg: avg.toFixed(1), count: reviews.length };
}

async function renderRatingOnCards() {
    const els = document.querySelectorAll('.room-rating[data-room-id]');
    for (const el of els) {
        try {
            const roomId = el.dataset.roomId;
            const { avg, count } = await calculateAverageRating(roomId);
            if (count > 0) {
                const full = Math.round(avg);
                el.innerHTML = `<span class="stars">${'★'.repeat(full)}${'☆'.repeat(5-full)}</span>
                                 <span class="rating-text">${avg} (${count} reviews)</span>`;
            } else {
                el.innerHTML = `<span class="stars">☆☆☆☆☆</span>
                                 <span class="rating-text">No reviews yet</span>`;
            }
        } catch (err) {
            console.error(`Failed to load rating for room ${el.dataset.roomId}:`, err);
            el.innerHTML = `<span class="stars">☆☆☆☆☆</span><span class="rating-text">Unavailable</span>`;
        }
    }
}

async function renderGuestReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;
    grid.innerHTML = '<p>Loading reviews…</p>';
    try {
        const reviews = await fetchReviews();
        if (!reviews.length) {
            grid.innerHTML = '<p style="color:var(--text-soft); text-align:center;">No reviews yet. Be the first to share your experience!</p>';
            return;
        }
        grid.innerHTML = reviews.map(r => {
            const room = allRoomsCache[r.room_id] || {};
            return `
                <article class="panel">
                    <div class="review-stars" style="color:#F5A623;">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</div>
                    <p>“${escapeHtml(r.comment)}”</p>
                    <small style="color:var(--text-soft);">
                        – ${escapeHtml(r.guest_name || 'Anonymous')} on ${escapeHtml(room.name || r.room_id)} · ${new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </small>
                </article>
            `;
        }).join('');
    } catch (err) {
        console.error('Failed to load reviews:', err);
        grid.innerHTML = '<p style="color:var(--text-soft); text-align:center;">Could not load reviews.</p>';
    }
}

async function submitReview({ roomId, rating, comment }) {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) throw new Error('You must be logged in to leave a review.');

    const { error } = await supabaseClient.from('reviews').insert({
        room_id: roomId,
        user_id: session.user.id,
        guest_name: session.user.user_metadata?.username || session.user.email,
        rating: rating,
        comment: comment
    });
    if (error) throw error;
}

function initReviewForm() {
    const formSection = document.getElementById('review-form-section');
    if (!formSection) return;
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (!session) return;
        formSection.style.display = 'block';

        const select = document.getElementById('review-room');
        for (const [id, room] of getSortedRoomEntries(allRoomsCache)) {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = `${room.name} – ${room.title}`;
            select.appendChild(option);
        }

        const form = document.getElementById('review-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const roomId = form.elements['roomId'].value;
            const rating = parseInt(form.elements['rating'].value);
            const comment = form.elements['comment'].value.trim();
            const feedback = document.getElementById('review-feedback');

            if (!roomId || !rating || !comment) {
                return setFeedback(feedback, 'error', 'All fields are required.');
            }
            try {
                await submitReview({ roomId, rating, comment });
                form.reset();
                clearFormState(form);
                setFeedback(feedback, 'success', 'Thank you for your review!');
                showNotification('success', 'Review submitted!');
                await renderGuestReviews();
                await renderRatingOnCards();
            } catch (err) {
                setFeedback(feedback, 'error', err.message);
            }
        });
    });
}

/* ------------------------------------------------------------
   USER DASHBOARD
   ------------------------------------------------------------ */
function initializeDashboardView() {
    if (!window.location.pathname.includes("user.html")) return;
    const navBtns = document.querySelectorAll('.dashboard-nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
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
        await renderDashboardView();
    } else if (viewName === 'reservations') {
        await renderReservationView();
    } else if (viewName === 'contact') {
        renderContactView();
    }
}

async function renderDashboardView() {
    const container = document.getElementById('dynamic-view');
    if (!container) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) { window.location.href = "login.html"; return; }
    currentUserSession = session;

    let username = session.user.email;
    try {
        const { data: profile, error } = await supabaseClient.from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .eq('deleted', false)
            .single();
        if (error) throw error;
        username = profile?.username || session.user.email;
    } catch (err) {
        console.error('Could not load profile, using email:', err);
        showNotification('error', 'Could not load profile. Some features may be limited.');
    }

    container.innerHTML = `
        <div class="user-dashboard">
            <section class="panel" style="text-align: center;">
                <div class="profile-avatar">${escapeHtml(username.charAt(0).toUpperCase())}</div>
                <p class="eyebrow">Welcome back,</p>
                <h2 style="font-size: 1.5rem;">${escapeHtml(username)}</h2>
            </section>
            <section class="panel">
                <div class="panel-heading"><div><h3>My Trips</h3></div></div>
                <div id="current-trip-content"><p style="color: var(--text-soft); text-align: center; padding: 30px 20px;">Loading…</p></div>
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
    refreshDashboardTrip();
}

async function refreshDashboardTrip() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session) return;

    let reservations = [];
    try {
        reservations = await fetchReservations({ email: session.user.email });
    } catch (err) {
        console.error('Failed to load reservations:', err);
        showNotification('error', 'Could not load your booking data.');
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    // Show ALL bookings that haven't ended yet (active or future)
    const upcomingReservations = reservations.filter(r => r.checkout >= today);
    // Past stays (checkout before today, within last 90 days) for reviews
    const pastReservations = reservations.filter(r => r.checkout < today && new Date(r.checkout) >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));

    const tripContent = document.getElementById('current-trip-content');
    if (!tripContent) return;

    let html = '';

    if (upcomingReservations.length) {
        upcomingReservations.forEach(res => {
            const room = allRoomsCache[res.room_id] || {};
            const pricePerNight = room.price || (res.total / res.nights);
            const total = pricePerNight * res.nights;
            const isActive = res.checkin <= today && res.checkout >= today;
            const label = isActive ? 'Active' : 'Upcoming';

            html += `
                <div style="display: grid; gap: 12px; margin-bottom: 20px;">
                    <div><h4 style="font-size: 1.1rem; margin:0;">${label}: ${escapeHtml(room.name || res.room_id)} – ${escapeHtml(room.title || '')}</h4><p style="margin:4px 0 0; font-size:0.85rem;">${formatCurrency(pricePerNight)}/night</p></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; background:rgba(147,99,63,0.06); padding:10px; border-radius:var(--radius-md);">
                        <div><span style="font-size:0.75rem;">Check-in</span><div style="font-weight:600;">${formatDate(res.checkin)}</div></div>
                        <div><span style="font-size:0.75rem;">Check-out</span><div style="font-weight:600;">${formatDate(res.checkout)}</div></div>
                        <div><span style="font-size:0.75rem;">Guests</span><div style="font-weight:600;">${res.guests}</div></div>
                        <div><span style="font-size:0.75rem;">Nights</span><div style="font-weight:600;">${res.nights}</div></div>
                    </div>
                    <div style="text-align:right; padding-right:10px; font-weight:600; font-size:1.1rem; color:var(--color-primary);">
                        Total: ${formatCurrency(total)}
                    </div>
                    <div class="form-action-group">
                        <button id="viewPropertyBtn-${res.id}" class="button button--secondary" style="flex:1;">View Property</button>
                        <button id="cancelBookingBtn-${res.id}" class="button button--danger" style="flex:1;">Cancel Booking</button>
                        <button id="reviewBookingBtn-${res.id}" class="button button--primary reviewUpcomingBtn" data-room-id="${res.room_id}" data-room-name="${escapeHtml(room.name || res.room_id)} – ${escapeHtml(room.title || '')}" style="flex:1;">Leave a Review</button>
                    </div>
                </div>
            `;
        });
    } else {
        html += '<p style="color: var(--text-soft); text-align: center; padding: 30px 20px;">No upcoming or active reservation.</p>';
    }

    if (pastReservations.length) {
        html += `<div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed var(--color-border-light);"><h4 style="margin-bottom: 8px;">Past stays</h4>`;
        pastReservations.forEach(pastReservation => {
            const room = allRoomsCache[pastReservation.room_id] || {};
            html += `
                <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                    <p style="font-size:0.9rem; color:var(--text-soft); margin:0;">${escapeHtml(room.name || pastReservation.room_id)} – ${escapeHtml(room.title || '')} (${formatDate(pastReservation.checkout)})</p>
                    <button class="button button--secondary reviewPastBtn" data-room-id="${pastReservation.room_id}" data-room-name="${escapeHtml(room.name || pastReservation.room_id)} – ${escapeHtml(room.title || '')}" style="margin-left:12px;">Leave a Review</button>
                </div>
            `;
        });
        html += `</div>`;
    }

    tripContent.innerHTML = html;

    // Attach event listeners for cancel buttons (only for upcoming ones)
    upcomingReservations.forEach(res => {
        setupPropertyDropdown(res);
        document.getElementById(`cancelBookingBtn-${res.id}`)?.addEventListener('click', async () => {
            if (confirm('Cancel this booking?')) {
                try {
                    await deleteReservation(res.id);
                    await addActivityEntry(`User cancelled reservation ${res.id}`);
                    showNotification('success', 'Booking cancelled.');
                    refreshDashboardTrip();
                } catch (err) {
                    console.error('Cancellation failed:', err);
                    showNotification('error', 'Failed to cancel. Check console for details.');
                }
            }
        });
    });

    // Review button delegation (unchanged)
    tripContent.addEventListener('click', (e) => {
        const btn = e.target.closest('.reviewPastBtn');
        if (!btn) return;
        const roomId = btn.dataset.roomId;
        const roomName = btn.dataset.roomName;
        ensureReviewModal();
        const modal = document.getElementById('review-modal');
        document.getElementById('review-room-display').value = roomName;
        document.getElementById('review-modal-form').elements['roomId'].value = roomId;
        document.getElementById('review-modal-rating').value = '';
        document.getElementById('review-modal-comment').value = '';
        document.getElementById('review-modal-feedback').textContent = '';
        modal.style.display = 'flex';
    });

        tripContent.addEventListener('click', (e) => {
        const btn = e.target.closest('.reviewUpcomingBtn');
        if (!btn) return;
        const roomId = btn.dataset.roomId;
        const roomName = btn.dataset.roomName;
        ensureReviewModal();
        const modal = document.getElementById('review-modal');
        document.getElementById('review-room-display').value = roomName;
        document.getElementById('review-modal-form').elements['roomId'].value = roomId;
        document.getElementById('review-modal-rating').value = '';
        document.getElementById('review-modal-comment').value = '';
        document.getElementById('review-modal-feedback').textContent = '';
        modal.style.display = 'flex';
    });
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
    const btn = document.getElementById(`viewPropertyBtn-${reservation.id}`);
    if (!btn) return;
    let isOpen = false;
    btn.onclick = () => {
        if (!isOpen) {
            const room = allRoomsCache[reservation.room_id] || {};
            const images = room.images || ROOM_IMAGES[reservation.room_id] || [];
            let carouselHtml = '';
            if (images.length) {
                carouselHtml = `
                    <div class="carousel" data-carousel>
                        <div class="carousel-track">
                            ${images.map((img, idx) => `<div class="carousel-slide ${idx===0?'is-active':''}"><img src="${img}" alt="${escapeHtml(room.name)}"></div>`).join('')}
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
                            <h3>${escapeHtml(room.name || reservation.room_id)} – ${escapeHtml(room.title || '')}</h3>
                            <div class="price-badges">
                                <span class="price-tag">${formatCurrency(room.price || (reservation.total/reservation.nights))}/night</span>
                                <span class="price-tag">👥 Up to ${room.guests || '?'}</span>
                                <span class="price-tag">🏷️ ${escapeHtml(room.type || '')}</span>
                            </div>
                            <p>${escapeHtml(room.description || '')}</p>
                            <ul class="feature-list">${(room.features||[]).map(f=>`<li>${escapeHtml(f)}</li>`).join('')}</ul>
                        </div>
                        <div class="property-carousel">${carouselHtml}</div>
                    </div>
                </div>
            `;
            initializeCarousels();
            dropdown.style.maxHeight = "800px";
            dropdown.style.opacity = "1";
            isOpen = true;
            btn.textContent = "Hide Property";
        } else {
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

function showAccountDetail(section, session, container) {
    if (!container) return;
    if (section === "personal") {
        container.innerHTML = `<div><label>Username</label><div>${escapeHtml(session.user?.user_metadata?.username || session.user.email)}</div></div><div><label>Email</label><div>${escapeHtml(session.user.email)}</div></div>`;
    } else {
        container.innerHTML = '<p style="text-align:center;">No payment methods on file.</p>';
    }
}

async function renderReservationView() {
    const container = document.getElementById('dynamic-view');
    container.innerHTML = `
        <section class="filter-bar" aria-labelledby="filter-title">
            <h2 id="filter-title" class="visually-hidden">Search filters</h2>
            <form class="filter-form" id="filter-form">
                <div class="field">
                    <label for="filter-guests">Guests</label>
                    <select id="filter-guests" name="guests">
                        <option value="">Any size</option>
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
                        <option value="">Default</option>
                        <option value="2000">PHP 2,000</option>
                        <option value="3000">PHP 3,000</option>
                        <option value="4000">PHP 4,000</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button class="button button--primary" type="submit">Apply</button>
                    <button class="button button--secondary" type="button" id="clear-filters">Reset</button>
                </div>
                
            </form>
        </section>
        <section class="listing-panel" aria-labelledby="room-list-title">
            <h2 id="room-list-title" class="visually-hidden">Available rooms</h2>
            <div class="reservation-grid" id="room-grid"></div>
        </section>
    `;
    renderRoomGrid(false);
    const filterForm = document.getElementById("filter-form");
    const clearFilters = document.getElementById("clear-filters");
    if (filterForm) {
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            applyRoomFilters(filterForm, Array.from(document.querySelectorAll('.room-listing')));
        });
    }
    if (clearFilters) {
        clearFilters.addEventListener("click", () => {
            filterForm.reset();
            applyRoomFilters(filterForm, Array.from(document.querySelectorAll('.room-listing')));
            showNotification("info", "Filters cleared.");
        });
    }
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

/* ------------------------------------------------------------
   CONTACT FORM
   ------------------------------------------------------------ */
function initializeContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;
    bindFieldValidation(form);
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const name = getFieldValue(form, "name");
        const email = getFieldValue(form, "email");
        const message = getFieldValue(form, "message");
        const feedback = document.getElementById("contact-feedback");

        if (!name || !email || !message) {
            setFeedback(feedback, 'error', 'All fields are required.');
            return;
        }
        if (!isValidEmail(email)) {
            setFeedback(feedback, 'error', 'Please enter a valid email.');
            return;
        }
        try {
            await insertMessage({ name, email, message });
            form.reset();
            clearFormState(form);
            setFeedback(feedback, "success", "Message sent. We'll be in touch.");
            showNotification("success", "Thank you! Your message has been sent.");
        } catch (err) {
            console.error('Message insert error:', err);
            setFeedback(feedback, "error", "Failed to send message. Please try again.");
        }
    });
}

/* ------------------------------------------------------------
   ADMIN DASHBOARD
   ------------------------------------------------------------ */
async function initAdminDashboard() {
    if (!(await enforceAdminAccess())) return;
    const reservations = await fetchReservations();
    // Show total reservations (all non‑deleted)
    document.getElementById('stat-reservations').textContent = reservations.length;

    // Total guests – sum all
    const guests = reservations.reduce((sum, r) => sum + r.guests, 0);
    document.getElementById('stat-guests').textContent = guests;

    const revenue = reservations.reduce((sum, r) => sum + r.total, 0);
    document.getElementById('stat-revenue').textContent = formatCurrency(revenue);

    const activities = await fetchActivityLog();
    const container = document.getElementById('activity-log');
    container.innerHTML = activities.length ? activities.map(a => `
        <li class="activity-item"><span>${escapeHtml(a.action)}</span><time datetime="${a.created_at}">${new Date(a.created_at).toLocaleString()}</time></li>
    `).join('') : '<li class="activity-item" style="text-align:center;color:var(--text-soft);">No recent activity.</li>';

    const clearActBtn = document.getElementById('btn-clear-activities');
    if (clearActBtn) {
        clearActBtn.addEventListener('click', async () => {
            if (confirm('Clear all activities?')) {
                await clearActivityLog();
                await addActivityEntry('Cleared all activities');
                initAdminDashboard();
            }
        });
    }
}

/* ------------------------------------------------------------
   MANAGE RESERVATIONS (admin)
   ------------------------------------------------------------ */
async function initManageReservations() {
    if (!(await enforceAdminAccess())) return;
    const modal = document.getElementById('reservation-modal');
    const form = document.getElementById('reservation-form-modal');
    const roomSelect = document.getElementById('modal-room');
    const modalTitle = document.getElementById('modal-title');
    const closeBtn = document.getElementById('btn-close-modal');
    let selectedIndices = [];
    let reservationList = [];

    function populateRoomDropdown() {
        roomSelect.innerHTML = '<option value="">Select room</option>';
        for (const [key, room] of getSortedRoomEntries(allRoomsCache)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${room.name} – ${room.title} (${formatCurrency(room.price)})`;
            roomSelect.appendChild(option);
        }
    }

    async function renderReservations() {
        reservationList = await fetchReservations();
        const container = document.getElementById('reservations-container');
        if (reservationList.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:var(--text-soft); padding:40px;">No reservations found.</p>';
            updateButtons();
            return;
        }
        let html = `<table class="reservations-table">
            <thead><tr><th><input type="checkbox" id="select-all-reservations"></th><th>Room</th><th>Guest</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th></tr></thead>
            <tbody>`;
        reservationList.forEach((r) => {
            const isSelected = selectedIndices.includes(r.id);
            html += `<tr class="${isSelected ? 'selected' : ''}" data-id="${r.id}">
                <td><input type="checkbox" class="reservation-checkbox" data-id="${r.id}" ${isSelected ? 'checked' : ''}></td>
                <td>${escapeHtml(r.room_id)}</td>
                <td>${escapeHtml(r.guest_name)} (${escapeHtml(r.guest_email)})</td>
                <td>${formatDate(r.checkin)}</td>
                <td>${formatDate(r.checkout)}</td>
                <td>${r.guests}</td>
                <td>${formatCurrency(r.total)}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        container.innerHTML = html;

        container.querySelectorAll('.reservation-checkbox').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.dataset.id;
                if (cb.checked) {
                    if (!selectedIndices.includes(id)) selectedIndices.push(id);
                } else {
                    selectedIndices = selectedIndices.filter(i => i !== id);
                }
                cb.closest('tr').classList.toggle('selected', cb.checked);
                updateButtons();
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
        document.getElementById('select-all-reservations').addEventListener('change', (e) => {
            const checked = e.target.checked;
            container.querySelectorAll('.reservation-checkbox').forEach(cb => {
                cb.checked = checked;
                const id = cb.dataset.id;
                if (checked) {
                    if (!selectedIndices.includes(id)) selectedIndices.push(id);
                } else {
                    selectedIndices = selectedIndices.filter(i => i !== id);
                }
                cb.closest('tr').classList.toggle('selected', checked);
            });
            if (!checked) selectedIndices = [];
            updateButtons();
        });
    }

    function updateButtons() {
        const updateBtn = document.getElementById('btn-update-reservation');
        const deleteBtn = document.getElementById('btn-delete-reservation');
        updateBtn.disabled = selectedIndices.length !== 1;
        updateBtn.style.opacity = selectedIndices.length === 1 ? '1' : '0.5';
        deleteBtn.disabled = selectedIndices.length === 0;
        deleteBtn.style.opacity = selectedIndices.length > 0 ? '1' : '0.5';
    }

    function showModal(edit = false) {
        populateRoomDropdown();
        const today = new Date().toISOString().split('T')[0];
        form.elements['checkin'].min = today;
        form.elements['checkout'].min = today;
        if (edit && selectedIndices.length === 1) {
            const r = reservationList.find(r => r.id === selectedIndices[0]);
            if (r) {
                form.elements['editIndex'].value = r.id;
                form.elements['roomId'].value = r.room_id;
                form.elements['name'].value = r.guest_name;
                form.elements['email'].value = r.guest_email;
                form.elements['checkin'].value = r.checkin;
                form.elements['checkout'].value = r.checkout;
                form.elements['guests'].value = r.guests;
                modalTitle.textContent = 'Update Reservation';
            }
        } else {
            form.reset();
            form.elements['editIndex'].value = '';
            modalTitle.textContent = 'Add Reservation';
        }
        if (roomSelect._guestMaxHandler) roomSelect.removeEventListener('change', roomSelect._guestMaxHandler);
        roomSelect._guestMaxHandler = () => {
            const room = allRoomsCache[roomSelect.value];
            if (room) {
                form.elements['guests'].max = room.guests;
                form.elements['guests'].placeholder = `Up to ${room.guests}`;
            }
        };
        roomSelect.addEventListener('change', roomSelect._guestMaxHandler);
        if (roomSelect.value) roomSelect.dispatchEvent(new Event('change'));
        modal.style.display = 'flex';
    }

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('btn-add-reservation').addEventListener('click', () => {
        selectedIndices = [];
        renderReservations();
        showModal(false);
    });
    document.getElementById('btn-update-reservation').addEventListener('click', () => {
        if (selectedIndices.length !== 1) return showNotification('error', 'Select exactly one reservation to update.');
        showModal(true);
    });
    document.getElementById('btn-delete-reservation').addEventListener('click', async () => {
        if (selectedIndices.length === 0) return showNotification('error', 'Select at least one reservation to delete.');
        if (confirm(`Delete ${selectedIndices.length} reservation(s)?`)) {
            for (const id of selectedIndices) {
                await deleteReservation(id);
            }
            await addActivityEntry(`Deleted ${selectedIndices.length} reservation(s)`);
            showNotification('success', 'Reservations deleted.');
            selectedIndices = [];
            renderReservations();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const roomId = form.elements['roomId'].value;
        const name = form.elements['name'].value;
        const email = form.elements['email'].value;
        const checkin = form.elements['checkin'].value;
        const checkout = form.elements['checkout'].value;
        const guests = parseInt(form.elements['guests'].value);
        const editId = form.elements['editIndex'].value;

        if (!roomId || !name || !email || !checkin || !checkout || isNaN(guests) || guests < 1) {
            return showNotification('error', 'All fields are required.');
        }
        if (new Date(checkin) >= new Date(checkout)) {
            return showNotification('error', 'Check‑out must be after check‑in.');
        }
        const room = allRoomsCache[roomId];
        if (!room) return showNotification('error', 'Invalid room.');
        if (guests > room.guests) return showNotification('error', `Maximum ${room.guests} guests.`);

        const available = await isRoomAvailable(roomId, checkin, checkout, editId || null);
        if (!available) return showNotification('error', 'These dates are not available.');

        const nights = calculateNights(checkin, checkout);
        const total = nights * room.price;
        const reservation = {
            room_id: roomId,
            user_id: null,
            guest_name: name,
            guest_email: email,
            checkin,
            checkout,
            guests,
            nights,
            total
        };
                try {
            if (editId) {
                await updateReservation(editId, reservation);
                await addActivityEntry(`Updated reservation ${editId}`);
                showNotification('success', 'Reservation updated.');
            } else {
                await insertReservation(reservation);
                await addActivityEntry(`Added new reservation for ${room.name}`);
                showNotification('success', 'Reservation added.');
            }
        } catch (err) {
            console.error('Reservation save error:', err);
            const msg = err?.message || 'Failed to save reservation.';
            showNotification('error', msg);   // show the real error to the admin
            return;                            // keep modal open
        }
        modal.style.display = 'none';
        selectedIndices = [];
        renderReservations();
    });

    renderReservations();
}

/* ------------------------------------------------------------
   MANAGE ROOMS (admin) – soft delete for custom rooms
   ------------------------------------------------------------ */
async function initManageRooms() {
    if (!(await enforceAdminAccess())) return;
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
        const container = document.getElementById('rooms-container');
        container.innerHTML = getSortedRoomEntries(allRoomsCache).map(([key, room]) => {
            const isCustom = !ROOM_DATA[key];
            let imageHtml = '';
            if (room.images && room.images.length) {
                imageHtml = `<div class="room-listing__media" style="aspect-ratio:4/3;overflow:hidden;background:var(--color-surface-muted);"><img src="${room.images[0]}" style="width:100%;height:100%;object-fit:cover;" alt="${escapeHtml(room.name)}"></div>`;
            } else {
                imageHtml = `<div class="room-listing__media" style="aspect-ratio:4/3;overflow:hidden;background:var(--color-surface-muted);display:flex;align-items:center;justify-content:center;color:var(--text-soft);">No image</div>`;
            }
            return `
                <article class="room-listing room-card ${key === selectedRoomKey ? 'is-selected' : ''}" data-room-id="${key}">
                    ${imageHtml}
                    <div class="room-listing__body">
                        <div class="room-listing__header">
                            <div>
                                <h3>${escapeHtml(room.name)}</h3>
                                <p class="listing-subtitle">${escapeHtml(room.title)}</p>
                            </div>
                            <span class="price-tag">${formatCurrency(room.price)}</span>
                        </div>
                        <p>${escapeHtml(room.description)}</p>
                        <ul class="feature-list">
                            <li>${room.guests} guests</li>
                            <li>${escapeHtml(room.type)}</li>
                        </ul>
                        <div class="room-actions">
                            <button class="button button--secondary btn-select-room" data-room-key="${key}">Select</button>
                            ${isCustom ? '<button class="button button--danger btn-delete-room" data-room-key="'+key+'">Delete</button>' : ''}
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        container.querySelectorAll('.btn-select-room').forEach(btn => {
            btn.addEventListener('click', () => {
                selectedRoomKey = btn.dataset.roomKey;
                renderRooms();
                const updateBtn = document.getElementById('btn-update-room');
                updateBtn.disabled = !selectedRoomKey || !!ROOM_DATA[selectedRoomKey];
                updateBtn.style.opacity = updateBtn.disabled ? '0.5' : '1';
            });
        });
        container.querySelectorAll('.btn-delete-room').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this custom room?')) {
                    try {
                        await supabaseClient.from('rooms').update({ deleted: true }).eq('id', btn.dataset.roomKey);  // soft delete
                        delete allRoomsCache[btn.dataset.roomKey];
                        selectedRoomKey = null;
                        renderRooms();
                        await addActivityEntry('Deleted room ' + btn.dataset.roomKey);
                        showNotification('success', 'Room deleted.');
                    } catch (err) {
                        showNotification('error', 'Failed to delete room.');
                    }
                }
            });
        });
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
            const room = allRoomsCache[selectedRoomKey];
            if (room) {
                form.elements['roomKey'].value = selectedRoomKey;
                form.elements['roomId'].value = selectedRoomKey;
                form.elements['title'].value = room.title;
                form.elements['price'].value = room.price;
                form.elements['guests'].value = room.guests;
                form.elements['type'].value = room.type;
                form.elements['description'].value = room.description;
                modalTitle.textContent = 'Update Room';
                existingImages = [...(room.images || [])];
            }
        } else {
            form.reset();
            form.elements['roomKey'].value = '';
            modalTitle.textContent = 'Add Room';
        }
        refreshPreviews();
        modal.style.display = 'flex';
    }

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('btn-add-room').addEventListener('click', () => {
        selectedRoomKey = null;
        showModal(false);
    });
    document.getElementById('btn-update-room').addEventListener('click', () => {
        if (!selectedRoomKey) return showNotification('error', 'Select a room first.');
        if (ROOM_DATA[selectedRoomKey]) {
            showNotification('error', 'Default rooms cannot be updated. Please add a custom room instead.');
            return;
        }
        showModal(true);
    });
    document.getElementById('btn-delete-room').addEventListener('click', async () => {
        if (!selectedRoomKey) return showNotification('error', 'Select a room first.');
        if (ROOM_DATA[selectedRoomKey]) {
            showNotification('error', 'Only custom rooms can be deleted.');
            return;
        }
        if (!allRoomsCache[selectedRoomKey]) return showNotification('error', 'Room not found.');
        const keyToDelete = selectedRoomKey;
        try {
            await supabaseClient.from('rooms').update({ deleted: true }).eq('id', keyToDelete);  // soft delete
            delete allRoomsCache[keyToDelete];
            selectedRoomKey = null;
            renderRooms();
            await addActivityEntry('Deleted room ' + keyToDelete);
            showNotification('success', 'Room deleted.');
        } catch (err) {
            showNotification('error', 'Failed to delete room.');
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
            return showNotification('error', 'All fields are required.');
        }
        if (ROOM_DATA[roomId] && form.elements['roomKey'].value !== roomId) {
            return showNotification('error', 'That room ID is already used by a default room.');
        }

        const uploadedUrls = [];
        for (const file of newImageFiles) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const { data, error } = await supabaseClient.storage
                .from('room-images')
                .upload(`public/${fileName}`, file);
            if (error) {
                return showNotification('error', `Image upload failed: ${error.message}`);
            }
            const publicURL = supabaseClient.storage.from('room-images').getPublicUrl(`public/${fileName}`).data.publicUrl;
            uploadedUrls.push(publicURL);
        }

        const finalImages = [...existingImages, ...uploadedUrls];
        const roomData = {
            name: roomId,
            title,
            price,
            max_guests: guests,
            type,
            description,
            features: [`${guests} guests`, type.charAt(0).toUpperCase()+type.slice(1)],
            images: finalImages
        };

        try {
            const { error } = await supabaseClient.from('rooms').upsert({ id: roomId, ...roomData }, { onConflict: 'id' });
            if (error) throw error;
            allRoomsCache[roomId] = { ...roomData, guests: roomData.max_guests };
            modal.style.display = 'none';
            renderRooms();
            await addActivityEntry('Room saved: ' + roomId);
            showNotification('success', 'Room saved!');
            clearImagePreviews();
        } catch (err) {
            console.error('Room save error:', err);
            showNotification('error', 'Failed to save room.');
        }
    });

    renderRooms();
}

/* ------------------------------------------------------------
   SUPPORT (admin)
   ------------------------------------------------------------ */
async function initSupport() {
    if (!(await enforceAdminAccess())) return;
    const messages = await fetchMessages();
    function renderStats() {
        const open = messages.filter(m => m.status === 'new' || m.status === 'in-progress').length;
        document.getElementById('stat-messages').textContent = messages.length;
        document.getElementById('stat-issues').textContent = open;
        document.getElementById('stat-resolved').textContent = messages.filter(m => m.status === 'resolved').length;
    }
    function renderMessages() {
        const container = document.getElementById('messages-container');
        if (!messages.length) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-soft);padding:30px;">No messages yet.</p>';
            return;
        }
        container.innerHTML = messages.map((m) => `
            <div class="message-card">
                <div class="message-body">
                    <h4>${escapeHtml(m.name)} <span style="font-size:0.75rem;color:var(--text-soft);">(${escapeHtml(m.email)})</span></h4>
                    <p style="margin:4px 0;font-size:0.9rem;">${escapeHtml(m.message)}</p>
                    <small style="color:var(--text-soft);">${new Date(m.submitted_at).toLocaleString()}</small>
                </div>
                <div class="message-actions">
                    <select class="status-select" data-id="${m.id}">
                        <option value="new" ${m.status==='new'?'selected':''}>New</option>
                        <option value="in-progress" ${m.status==='in-progress'?'selected':''}>In Progress</option>
                        <option value="resolved" ${m.status==='resolved'?'selected':''}>Resolved</option>
                    </select>
                </div>
            </div>
        `).join('');
        container.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', async () => {
                const id = sel.dataset.id;
                const status = sel.value;
                await updateMessageStatus(id, status);
                const msg = messages.find(m => m.id === id);
                if (msg) msg.status = status;
                await addActivityEntry(`Changed message ${id} status to ${status}`);
                renderStats();
            });
        });
    }
    renderStats();
    renderMessages();

    const clearMsgBtn = document.getElementById('btn-clear-messages');
    if (clearMsgBtn && !clearMsgBtn.dataset.listenerAttached) {
        clearMsgBtn.dataset.listenerAttached = 'true';
        clearMsgBtn.addEventListener('click', async () => {
            if (confirm('Delete all messages?')) {
                await deleteAllMessages();
                await addActivityEntry('Cleared all support messages');
                showNotification('success', 'All messages cleared.');
                initSupport();
            }
        });
    }
}

/* ------------------------------------------------------------
   SUPER ADMIN DASHBOARD
   ------------------------------------------------------------ */
async function initSuperAdminDashboard() {
    if (!(await enforceSuperAdminAccess())) return;
    const reservations = await fetchReservations();
    const roomsData = await fetchAllRooms();
    allRoomsCache = roomsData;
    document.getElementById('stat-total-reservations').textContent = reservations.length;
    document.getElementById('stat-total-properties').textContent = Object.keys(allRoomsCache).length;
    document.getElementById('stat-total-guests').textContent = reservations.reduce((sum, r) => sum + r.guests, 0);

    const activities = await fetchActivityLog();
    const logContainer = document.getElementById('activity-log');
    logContainer.innerHTML = activities.length ? activities.map(a => `
        <li class="activity-item"><span>${escapeHtml(a.action)}</span><time>${new Date(a.created_at).toLocaleString()}</time></li>
    `).join('') : '<li class="activity-item" style="text-align:center;color:var(--text-soft);">No recent activity.</li>';

    const revenueContainer = document.getElementById('revenue-chart');
if (revenueContainer) {
    const monthly = {};
    reservations.forEach(r => {
        const d = new Date(r.checkin);
        const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        monthly[key] = (monthly[key] || 0) + r.total;
    });
    const monthlyEntries = Object.entries(monthly).slice(-12);
    const totalRevenue = reservations.reduce((sum, r) => sum + r.total, 0);   // ← total from all reservations

    let html = '';
    // Show total revenue above the chart
    html += `
        <div style="text-align:center; margin-bottom:var(--space-md); font-weight:600; font-size:1.1rem; color:var(--color-primary);">
            Total Revenue: ${formatCurrency(totalRevenue)}
        </div>
    `;
    if (monthlyEntries.length === 0) {
        html += '<p style="text-align:center;color:var(--text-soft);">No reservation data yet.</p>';
    } else {
        const totals = monthlyEntries.map(([, total]) => total);
        const maxTotal = Math.max(...totals, 1);

        html += '<div class="chart-bars">';
        monthlyEntries.forEach(([month, total]) => {
            const heightPercent = (total / maxTotal) * 100;
            html += `
                <div class="chart-bar-col">
                    <div class="chart-value">${formatCurrency(total)}</div>
                    <div class="chart-bar" style="height:${heightPercent}%;"></div>
                    <div class="chart-label">${month}</div>
                </div>
            `;
        });
        html += '</div>';
    }
    revenueContainer.innerHTML = html;
}

    const clearActBtn = document.getElementById('btn-clear-activities');
    if (clearActBtn) {
        clearActBtn.addEventListener('click', async () => {
            if (confirm('Clear all activities?')) {
                await clearActivityLog();
                await addActivityEntry('Super admin cleared activities');
                initSuperAdminDashboard();
            }
        });
    }
}

/* ------------------------------------------------------------
   MANAGE ADMINS (super admin) – soft delete for admin removal
   ------------------------------------------------------------ */
async function initManageAdmins() {
    if (!(await enforceSuperAdminAccess())) return;
    const modal = document.getElementById('admin-modal');
    const form = document.getElementById('admin-form-modal');
    const modalTitle = document.getElementById('admin-modal-title');
    const closeBtn = document.getElementById('btn-close-admin-modal');
    let selectedUsername = null;

    async function renderAdmins() {
        const { data: profiles, error } = await supabaseClient.from('profiles')
            .select('*')
            .eq('role', 'admin')
            .eq('deleted', false);
        if (error) return;
        const container = document.getElementById('admins-container');
        if (!profiles.length) {
            container.innerHTML = '<p style="text-align:center;color:var(--text-soft);padding:40px;">No admin accounts found.</p>';
            return;
        }
        let html = '<table class="reservations-table"><thead><tr><th>Select</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>';
        profiles.forEach(user => {
            const isSel = user.username === selectedUsername;
            html += `<tr class="${isSel ? 'selected' : ''}" data-username="${user.username}">
                <td><input type="radio" name="selectAdmin" ${isSel ? 'checked' : ''}></td>
                <td>${escapeHtml(user.username)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.role)}</td>
                <td><span class="status-badge ${user.active ? 'status-active' : 'status-disabled'}">${user.active ? 'Active' : 'Disabled'}</span></td>
                <td style="display: flex; gap: 8px;">
                    <button class="button button--secondary btn-toggle-status" data-username="${user.username}">${user.active ? 'Disable' : 'Enable'}</button>
                    <button class="button button--danger btn-remove-admin" data-username="${user.username}">Remove</button>
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
            btn.addEventListener('click', async () => {
                const uname = btn.dataset.username;
                const { data: profile } = await supabaseClient.from('profiles')
                    .select('active')
                    .eq('username', uname)
                    .eq('deleted', false)
                    .single();
                if (profile) {
                    const newActive = !profile.active;
                    await supabaseClient.from('profiles').update({ active: newActive }).eq('username', uname);
                    await addActivityEntry(`${newActive ? 'Enabled' : 'Disabled'} admin: ${uname}`);
                    showNotification('success', `Admin '${uname}' ${newActive ? 'enabled' : 'disabled'}.`);
                    renderAdmins();
                }
            });
        });

        container.querySelectorAll('.btn-remove-admin').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm(`Remove admin '${btn.dataset.username}'?`)) {
                    await supabaseClient.from('profiles').update({ deleted: true }).eq('username', btn.dataset.username);  // soft delete
                    selectedUsername = null;
                    await addActivityEntry('Removed admin: ' + btn.dataset.username);
                    showNotification('success', 'Admin removed.');
                    renderAdmins();
                }
            });
        });
    }

    function showModal(edit = false) {
        document.getElementById('admin-role').innerHTML = '<option value="admin">Admin</option>';

        if (edit && selectedUsername) {
            supabaseClient.from('profiles')
                .select('*')
                .eq('username', selectedUsername)
                .eq('deleted', false)
                .single()
                .then(({ data: user }) => {
                    if (user) {
                        form.elements['username'].value = user.username;
                        form.elements['email'].value = user.email;
                        form.elements['role'].value = user.role;
                        form.elements['password'].value = '';
                        form.elements['username'].readOnly = true;
                        modalTitle.textContent = 'Update Admin Account';
                        modal.style.display = 'flex';
                    }
                });
        } else {
            form.reset();
            form.elements['username'].readOnly = false;
            modalTitle.textContent = 'Add Admin Account';
            modal.style.display = 'flex';
        }
    }

    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('btn-add-admin').addEventListener('click', () => {
        selectedUsername = null;
        showModal(false);
    });
    document.getElementById('btn-update-admin').addEventListener('click', () => {
        if (!selectedUsername) return showNotification('error', 'Select an admin first.');
        showModal(true);
    });
    document.getElementById('btn-disable-admin').addEventListener('click', async () => {
        if (!selectedUsername) return showNotification('error', 'Select an admin first.');
        await supabaseClient.from('profiles').update({ active: false }).eq('username', selectedUsername);
        await addActivityEntry('Disabled admin: ' + selectedUsername);
        showNotification('success', 'Admin disabled.');
        renderAdmins();
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = form.elements['username'].value.trim();
        const email = form.elements['email'].value.trim();
        const password = form.elements['password'].value;
        const role = form.elements['role'].value;
        if (!username || !email || (!selectedUsername && !password)) {
            return showNotification('error', 'Fill all required fields.');
        }

        const isEdit = !!selectedUsername;
        if (!isEdit) {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password,
                options: { data: { username } }
            });
            if (error) return showNotification('error', error.message);
            await supabaseClient.from('profiles').upsert({ id: data.user.id, username, email, role }, { onConflict: 'id' });
            showNotification('success', 'Admin account created.');
        } else {
            const updates = { email, role };
            if (password) {
                showNotification('info', 'Password update not available here. Use the password reset flow.');
            }
            await supabaseClient.from('profiles').update(updates).eq('username', selectedUsername);
            showNotification('success', 'Admin updated.');
        }
        modal.style.display = 'none';
        selectedUsername = null;
        renderAdmins();
    });

    renderAdmins();
}

/* ------------------------------------------------------------
   INITIALIZATION (page load)
   ------------------------------------------------------------ */
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

function getCurrentPageName() {
    const p = window.location.pathname;
    return p.substring(p.lastIndexOf('/') + 1) || "index.html";
}

function shouldHandleNavigation(event, href) {
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return false;
    if (event.ctrlKey || event.metaKey || event.shiftKey) return false;
    return !event.defaultPrevented;
}

function updateNavigationForSession(session) {
    const adminPages = ['admin.html', 'manageReservations.html', 'manageRooms.html', 'support.html', 'superadmin.html', 'manageAdmins.html'];
    if (adminPages.includes(getCurrentPageName())) return;
    const navList = document.querySelector('.site-links');
    if (!navList) return;
    let loginRegisterItem = null, dashboardItem = null, logoutItem = null;
    for (const li of navList.querySelectorAll('li')) {
        const link = li.querySelector('a');
        if (link && link.getAttribute('href') === 'login.html') loginRegisterItem = li;
        if (link && link.getAttribute('href') === 'user.html') dashboardItem = li;
        if (link && link.id === 'logout-link') logoutItem = li;
    }
    if (session && session.user) {
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

document.addEventListener("DOMContentLoaded", async () => {
    initializePageState();
    initializeNavigation();
    initializeButtons();
    initializeCarousels();
    initializeAuthPage();
    initializeStaticLogout();

    try {
        allRoomsCache = await fetchAllRooms();
    } catch (err) {
        console.warn('Could not load rooms from Supabase, using defaults', err);
        allRoomsCache = { ...ROOM_DATA };
    }

    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUserSession = session;
    updateNavigationForSession(session);

    const currentPage = getCurrentPageName();
    if (currentPage === "reservation.html") {
        initializeReservationPage();
    } else if (currentPage === "index.html") {
        await renderFeaturedRooms();
        renderGuestReviews();
        initReviewForm();
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
    if (currentPage === "user.html") {
        initializeDashboardView();
    }
});

function getRandomRooms(count = 3) {
    const entries = Object.entries(allRoomsCache);
    for (let i = entries.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [entries[i], entries[j]] = [entries[j], entries[i]];
    }
    return entries.slice(0, count);
}

async function renderFeaturedRooms() {
    const grid = document.getElementById('featured-rooms-grid');
    if (!grid) return;
    
    ensureBookingOverlay();
    initOverlayBookingListeners();

    const randomRooms = getRandomRooms(3);
    let html = '';
    for (const [roomId, room] of randomRooms) {
        html += buildRoomCard(room, roomId);
    }
    grid.innerHTML = html;
    
    initializeCarousels();
    await renderRatingOnCards();
    
    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.reserve-trigger');
        if (!btn) return;
        const card = btn.closest('.room-listing');
        if (!card) return;
        openBookingOverlay(card.dataset.roomId);
    });
}

function initializeReservationPage() {
    renderRoomGrid(false);

    const filterForm = document.getElementById("filter-form");
    const clearFilters = document.getElementById("clear-filters");
    if (filterForm) {
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            applyRoomFilters(filterForm, Array.from(document.querySelectorAll('.room-listing')));
        });
    }
    if (clearFilters) {
        clearFilters.addEventListener("click", () => {
            filterForm.reset();
            applyRoomFilters(filterForm, Array.from(document.querySelectorAll('.room-listing')));
            showNotification("info", "Filters cleared.");
        });
    }
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
    if (roomFromURL) {
        setTimeout(() => {
            const card = document.querySelector(`.room-listing[data-room-id="${roomFromURL}"]`);
            if (card) {
                card.scrollIntoView({ behavior: "smooth", block: "center" });
                openBookingOverlay(roomFromURL);
            }
        }, 300);
    }
}
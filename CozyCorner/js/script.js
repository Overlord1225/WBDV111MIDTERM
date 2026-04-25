const STORAGE_KEYS = {
    users: "cozycorner-users",
    session: "cozycorner-session",
    contact: "cozycorner-contact-messages",
    reservations: "cozycorner-reservations",
    pendingRoom: "cozycorner-pending-room"
};

const ROOM_DATA = {
    "room-1": { name: "Room 1", title: "Forest Hearth Suite", price: 2800, guests: 2 },
    "room-2": { name: "Room 2", title: "Calm Studio Retreat", price: 3000, guests: 2 },
    "room-3": { name: "Room 3", title: "Sunlit Wood Suite", price: 3200, guests: 2 },
    "room-4": { name: "Room 4", title: "Relaxed Family Room", price: 3400, guests: 3 },
    "room-5": { name: "Room 5", title: "Spacious Weekend Stay", price: 3600, guests: 4 },
    "room-6": { name: "Room 6", title: "Premium Cozy Suite", price: 3800, guests: 4 }
};

document.addEventListener("DOMContentLoaded", () => {
    initializePageState();
    initializeNavigation();
    initializeButtons();
    initializeReservationPage();
    initializeContactForm();
    initializeAuthPage();
    initializeCarousels();
});

function initializePageState() {
    requestAnimationFrame(() => {
        document.body.classList.add("is-loaded");
    });
}

function initializeNavigation() {
    const currentPath = getCurrentPageName();
    const links = document.querySelectorAll(".site-links a");
    const navToggle = document.querySelector(".nav-toggle");
    const menu = document.querySelector(".site-links");
    const navigableLinks = document.querySelectorAll(".site-links a, .site-logo, a.button");

    links.forEach((link) => {
        const href = link.getAttribute("href");
        const isCurrent = href === currentPath;
        link.classList.toggle("is-active", isCurrent);
        if (isCurrent) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    if (navToggle && menu) {
        navToggle.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    navigableLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!shouldHandleNavigation(event, href)) {
                return;
            }

            event.preventDefault();
            document.body.classList.add("is-leaving");
            window.setTimeout(() => {
                window.location.href = href;
            }, 160);
        });
    });
}

function initializeButtons() {
    document.querySelectorAll(".button").forEach((button) => {
        button.addEventListener("pointerdown", () => {
            button.classList.add("is-pressed");
        });

        ["pointerup", "pointerleave", "pointercancel", "blur"].forEach((eventName) => {
            button.addEventListener(eventName, () => {
                button.classList.remove("is-pressed");
            });
        });
    });
}

function initializeReservationPage() {
    const filterForm = document.getElementById("filter-form");
    const bookingForm = document.getElementById("booking-form");
    const roomCards = Array.from(document.querySelectorAll(".room-listing"));
    const clearFiltersButton = document.getElementById("clear-filters");

    if (!filterForm || !bookingForm || roomCards.length === 0) {
        return;
    }

    setDateMinimums();
    bindFieldValidation(bookingForm);

    filterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        applyRoomFilters(filterForm, roomCards);
    });

    clearFiltersButton?.addEventListener("click", () => {
        filterForm.reset();
        applyRoomFilters(filterForm, roomCards);
    });

    roomCards.forEach((card) => {
        card.addEventListener("click", (event) => {
            if (event.target.closest(".reserve-trigger")) {
                return;
            }
            selectRoom(card.dataset.roomId, roomCards, bookingForm);
        });
    });

    initializeCarousels();


    document.querySelectorAll(".reserve-trigger").forEach((button) => {
        button.addEventListener("click", () => {
            const roomId = button.dataset.roomSelect;
            selectRoom(roomId, roomCards, bookingForm);
            bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });

    ["checkin", "checkout", "guests"].forEach((name) => {
        const field = bookingForm.elements.namedItem(name);
        field?.addEventListener("input", () => updateBookingTotal(bookingForm));
    });

    bookingForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleBookingSubmit(bookingForm, roomCards);
    });

    applyRoomFilters(filterForm, roomCards);
    preloadSelectedRoom(roomCards, bookingForm);
}

function initializeContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) {
        return;
    }

    bindFieldValidation(form);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const values = {
            name: getFieldValue(form, "name"),
            email: getFieldValue(form, "email"),
            message: getFieldValue(form, "message")
        };

        const isValid =
            validateRequired(form, "name", values.name, "Please enter your name.") &&
            validateEmailField(form, "email", values.email) &&
            validateRequired(form, "message", values.message, "Please enter your message.");

        const feedback = document.getElementById("contact-feedback");

        if (!isValid) {
            setFeedback(feedback, "error", "Please complete the contact form.");
            return;
        }

        const messages = readStorage(STORAGE_KEYS.contact, []);
        messages.push({ ...values, submittedAt: new Date().toISOString() });
        writeStorage(STORAGE_KEYS.contact, messages);

        form.reset();
        clearFormState(form);
        setFeedback(feedback, "success", "Message saved successfully.");
    });
}

function initializeAuthPage() {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (!loginForm || !registerForm) {
        return;
    }

    bindFieldValidation(loginForm);
    bindFieldValidation(registerForm);

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleLogin(loginForm);
    });

    registerForm.addEventListener("submit", (event) => {
        event.preventDefault();
        handleRegistration(registerForm, loginForm);
    });
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
        return;
    }

    const nights = calculateNights(checkin, checkout);
    const total = nights * room.price;
    const reservations = readStorage(STORAGE_KEYS.reservations, []);

    reservations.push({
        roomId,
        roomName: room.name,
        title: room.title,
        name,
        email,
        checkin,
        checkout,
        guests: Number(guests),
        nights,
        total,
        createdAt: new Date().toISOString()
    });

    writeStorage(STORAGE_KEYS.reservations, reservations);
    writeStorage(STORAGE_KEYS.pendingRoom, roomId);

    setFeedback(feedback, "success", `Reservation request saved for ${room.name}. Estimated total: ${formatCurrency(total)}.`);
    clearNonRoomBookingFields(form);
    highlightSelectedRoom(roomId, roomCards);
    updateBookingTotal(form);
}

function handleLogin(form) {
    const username = getFieldValue(form, "username");
    const password = getFieldValue(form, "password");
    const feedback = document.getElementById("login-feedback");

    const isValid =
        validateRequired(form, "username", username, "Enter your username.") &&
        validateRequired(form, "password", password, "Enter your password.");

    if (!isValid) {
        setFeedback(feedback, "error", "Please complete the login form.");
        return;
    }

    const users = readStorage(STORAGE_KEYS.users, []);
    const matchedUser = users.find((user) => user.username === username && user.password === password);

    if (!matchedUser) {
        setFeedback(feedback, "error", "No matching account was found for this device.");
        return;
    }

    writeStorage(STORAGE_KEYS.session, { username: matchedUser.username, email: matchedUser.email });
    clearFormState(form);
    form.reset();
    setFeedback(feedback, "success", `Welcome back, ${matchedUser.username}.`);
}

function handleRegistration(registerForm, loginForm) {
    const username = getFieldValue(registerForm, "username");
    const email = getFieldValue(registerForm, "email");
    const password = getFieldValue(registerForm, "password");
    const confirmPassword = getFieldValue(registerForm, "confirm-password");
    const feedback = document.getElementById("register-feedback");
    const users = readStorage(STORAGE_KEYS.users, []);

    let isValid = true;
    isValid = validateRequired(registerForm, "username", username, "Choose a username.") && isValid;
    isValid = validateEmailField(registerForm, "email", email) && isValid;
    isValid = validatePassword(registerForm, "password", password) && isValid;
    isValid = validateConfirmPassword(registerForm, password, confirmPassword) && isValid;

    if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
        setFieldState(registerForm, "username", "error", "That username is already registered.");
        isValid = false;
    }

    if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
        setFieldState(registerForm, "email", "error", "That email is already registered.");
        isValid = false;
    }

    if (!isValid) {
        setFeedback(feedback, "error", "Please review the registration fields.");
        return;
    }

    users.push({ username, email, password, createdAt: new Date().toISOString() });
    writeStorage(STORAGE_KEYS.users, users);
    writeStorage(STORAGE_KEYS.session, { username, email });

    registerForm.reset();
    clearFormState(registerForm);
    setFeedback(feedback, "success", "Registration successful. You can now log in.");

    const loginUsername = loginForm.elements.namedItem("username");
    if (loginUsername) {
        loginUsername.value = username;
    }
}

function bindFieldValidation(form) {
    form.querySelectorAll("input, select, textarea").forEach((field) => {
        field.addEventListener("focus", () => {
            field.classList.add("is-focused");
        });

        field.addEventListener("blur", () => {
            field.classList.remove("is-focused");
            validateFieldOnBlur(form, field);
        });

        field.addEventListener("input", () => {
            if (field.classList.contains("is-error")) {
                validateFieldOnBlur(form, field);
            }
        });
    });
}

function validateFieldOnBlur(form, field) {
    const value = field.value.trim();
    const fieldName = field.name;

    if (fieldName === "email") {
        if (!value) {
            setFieldState(form, fieldName, "error", "This field is required.");
            return false;
        }
        if (!isValidEmail(value)) {
            setFieldState(form, fieldName, "error", "Enter a valid email address.");
            return false;
        }
    }

    if (fieldName === "password" && form.id === "register-form") {
        return validatePassword(form, fieldName, value);
    }

    if (fieldName === "confirm-password" && form.id === "register-form") {
        const password = getFieldValue(form, "password");
        return validateConfirmPassword(form, password, value);
    }

    if (fieldName === "checkout" && form.id === "booking-form") {
        const checkin = getFieldValue(form, "checkin");
        if (!value) {
            setFieldState(form, fieldName, "error", "This field is required.");
            return false;
        }
        if (checkin && calculateNights(checkin, value) <= 0) {
            setFieldState(form, fieldName, "error", "Check-out must be after check-in.");
            return false;
        }
    }

    if (!value) {
        setFieldState(form, fieldName, "error", "This field is required.");
        return false;
    }

    clearFieldState(form, fieldName);
    return true;
}

function applyRoomFilters(form, roomCards) {
    const guestValue = getFieldValue(form, "guests");
    const typeValue = getFieldValue(form, "type");
    const priceValue = getFieldValue(form, "price");
    let visibleCount = 0;

    roomCards.forEach((card) => {
        const matchesGuests = !guestValue || Number(card.dataset.guests) >= Number(guestValue);
        const matchesType = !typeValue || card.dataset.type === typeValue;
        const matchesPrice = !priceValue || Number(card.dataset.price) <= Number(priceValue);
        const isVisible = matchesGuests && matchesType && matchesPrice;

        card.classList.toggle("is-hidden", !isVisible);
        if (isVisible) {
            visibleCount += 1;
        }
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
    }
}

function selectRoom(roomId, roomCards, form) {
    const room = ROOM_DATA[roomId];
    if (!room) {
        return;
    }

    highlightSelectedRoom(roomId, roomCards);
    form.elements.namedItem("roomId").value = roomId;
    const summary = document.getElementById("selected-room-summary");

    if (summary) {
        summary.innerHTML = `<strong>${room.name} - ${room.title}</strong><span>${formatCurrency(room.price)} per night, up to ${room.guests} guests.</span>`;
    }

    writeStorage(STORAGE_KEYS.pendingRoom, roomId);
    updateBookingTotal(form);
}

function highlightSelectedRoom(roomId, roomCards) {
    roomCards.forEach((card) => {
        card.classList.toggle("is-selected", card.dataset.roomId === roomId);
    });
}

function updateBookingTotal(form) {
    const room = ROOM_DATA[getFieldValue(form, "roomId")];
    const checkin = getFieldValue(form, "checkin");
    const checkout = getFieldValue(form, "checkout");
    const totalField = document.getElementById("booking-total");

    if (!totalField || !room || !checkin || !checkout) {
        if (totalField) {
            totalField.textContent = "Total: Select dates to calculate";
        }
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
    const today = new Date();
    const formatted = today.toISOString().split("T")[0];
    const checkin = document.getElementById("booking-checkin");
    const checkout = document.getElementById("booking-checkout");

    if (checkin) {
        checkin.min = formatted;
        checkin.addEventListener("change", () => {
            if (checkout) {
                checkout.min = checkin.value || formatted;
            }
        });
    }

    if (checkout) {
        checkout.min = formatted;
    }
}

function validateRequired(form, fieldName, value, message) {
    if (!value) {
        setFieldState(form, fieldName, "error", message);
        return false;
    }

    clearFieldState(form, fieldName);
    return true;
}

function validateEmailField(form, fieldName, value) {
    if (!validateRequired(form, fieldName, value, "Please enter your email address.")) {
        return false;
    }

    if (!isValidEmail(value)) {
        setFieldState(form, fieldName, "error", "Enter a valid email address.");
        return false;
    }

    clearFieldState(form, fieldName);
    return true;
}

function validatePassword(form, fieldName, value) {
    if (!validateRequired(form, fieldName, value, "Please create a password.")) {
        return false;
    }

    if (value.length < 6) {
        setFieldState(form, fieldName, "error", "Password must be at least 6 characters.");
        return false;
    }

    clearFieldState(form, fieldName);
    return true;
}

function validateConfirmPassword(form, password, confirmPassword) {
    if (!validateRequired(form, "confirm-password", confirmPassword, "Please confirm your password.")) {
        return false;
    }

    if (password !== confirmPassword) {
        setFieldState(form, "confirm-password", "error", "Passwords do not match.");
        return false;
    }

    clearFieldState(form, "confirm-password");
    return true;
}

function clearNonRoomBookingFields(form) {
    ["name", "email", "checkin", "checkout", "guests"].forEach((fieldName) => {
        const field = form.elements.namedItem(fieldName);
        if (field) {
            field.value = "";
        }
        clearFieldState(form, fieldName);
    });
}

function clearFormState(form) {
    form.querySelectorAll(".field-message").forEach((message) => {
        message.textContent = "";
        message.classList.remove("is-visible", "is-error", "is-success");
    });

    form.querySelectorAll("input, select, textarea").forEach((field) => {
        field.classList.remove("is-error", "is-focused");
    });
}

function setFieldState(form, fieldName, state, message) {
    const field = form.elements.namedItem(fieldName);
    const container = field?.closest(".field");
    const fieldMessage = container?.querySelector(".field-message");

    if (!field || !fieldMessage) {
        return;
    }

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
    if (!element) {
        return;
    }

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
    const difference = end.getTime() - start.getTime();
    return Math.round(difference / 86400000);
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP",
        maximumFractionDigits: 0
    }).format(value);
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function initializeCarousels() {
    const carousels = document.querySelectorAll("[data-carousel]");
    if (carousels.length === 0) {
        return;
    }

    carousels.forEach((carousel) => {
        const track = carousel.querySelector(".carousel-track");
        const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
        const prevBtn = carousel.querySelector(".carousel-btn--prev");
        const nextBtn = carousel.querySelector(".carousel-btn--next");
        const dotsContainer = carousel.querySelector(".carousel-dots");

        let currentIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));
        if (currentIndex === -1) {
            currentIndex = 0;
        }
        
        let autoPlayInterval = null;
        const AUTO_PLAY_DELAY = 5000; // 5 seconds

        function createDots() {
            if (!dotsContainer) {
                return;
            }
            dotsContainer.innerHTML = "";
            slides.forEach((_, index) => {
                const dot = document.createElement("button");
                dot.className = "carousel-dot" + (index === currentIndex ? " is-active" : "");
                dot.setAttribute("role", "tab");
                dot.setAttribute("aria-label", `Slide ${index + 1} of ${slides.length}`);
                dot.setAttribute("aria-selected", String(index === currentIndex));
                dot.addEventListener("click", () => goToSlide(index));
                dotsContainer.appendChild(dot);
            });
        }

        function updateDots() {
            if (!dotsContainer) {
                return;
            }
            const dots = dotsContainer.querySelectorAll(".carousel-dot");
            dots.forEach((dot, index) => {
                dot.classList.toggle("is-active", index === currentIndex);
                dot.setAttribute("aria-selected", String(index === currentIndex));
            });
        }

        function goToSlide(index) {
            slides[currentIndex].classList.remove("is-active");
            currentIndex = index;
            if (currentIndex < 0) {
                currentIndex = slides.length - 1;
            }
            if (currentIndex >= slides.length) {
                currentIndex = 0;
            }
            slides[currentIndex].classList.add("is-active");
            updateDots();
        }

        function nextSlide() {
            goToSlide(currentIndex + 1);
        }

        function prevSlide() {
            goToSlide(currentIndex - 1);
        }

        function startAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
            autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
        }

        function stopAutoPlay() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
                autoPlayInterval = null;
            }
        }

        // Start auto play when carousel is initialized
        startAutoPlay();

        // Pause auto play when user interacts with carousel
        if (prevBtn) {
            prevBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                stopAutoPlay();
                prevSlide();
                // Restart auto play after interaction
                startAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                stopAutoPlay();
                nextSlide();
                // Restart auto play after interaction
                startAutoPlay();
            });
        }

        // Pause auto play when user hovers over carousel
        carousel.addEventListener("mouseenter", stopAutoPlay);
        carousel.addEventListener("mouseleave", startAutoPlay);

        // Pause auto play when user focuses on carousel controls
        const focusableElements = carousel.querySelectorAll("button");
        focusableElements.forEach((el) => {
            el.addEventListener("focus", stopAutoPlay);
            el.addEventListener("blur", startAutoPlay);
        });

        createDots();
    });
}

function getCurrentPageName() {
    const path = window.location.pathname.split("/").pop();
    return path || "index.html";
}

function shouldHandleNavigation(event, href) {
    if (!href || href.startsWith("#")) {
        return false;
    }

    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return false;
    }

    return !/^https?:\/\//i.test(href);
}

function readStorage(key, fallback) {
    try {
        const rawValue = window.localStorage.getItem(key);
        return rawValue ? JSON.parse(rawValue) : fallback;
    } catch {
        return fallback;
    }
}

function writeStorage(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
}

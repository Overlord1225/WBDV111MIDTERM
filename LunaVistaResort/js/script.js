const loginForm = document.getElementById("loginForm");
const message = document.getElementById("formMessage");

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            message.textContent = "Please fill in both email and password.";
            message.className = "message error";
            return;
        }

        if (password.length < 3) {
            message.textContent = "Password must be at least 6 characters.";
            message.className = "message error";
            return;
        }

        message.textContent = "Login successful. Welcome to Luna Vista Resort.";
        message.className = "message success";
        setTimeout(() => {
            window.location.href = "index.html";
        }, 700);
    });
}

const slides = Array.from(document.querySelectorAll(".slide"));
const dotsWrap = document.getElementById("carouselDots");
const prevSlideBtn = document.getElementById("prevSlide");
const nextSlideBtn = document.getElementById("nextSlide");
let currentSlide = 0;
let carouselTimer;

function renderCarousel() {
    if (!slides.length) {
        return;
    }

    slides.forEach((slide, index) => {
        slide.classList.toggle("active", index === currentSlide);
    });

    const dots = Array.from(document.querySelectorAll(".dot"));
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentSlide);
    });
}

function goToSlide(index) {
    if (!slides.length) {
        return;
    }
    currentSlide = (index + slides.length) % slides.length;
    renderCarousel();
}

function startCarousel() {
    if (!slides.length) {
        return;
    }
    clearInterval(carouselTimer);
    carouselTimer = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 4500);
}

if (slides.length && dotsWrap && prevSlideBtn && nextSlideBtn) {
    slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "dot";
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.addEventListener("click", () => {
            goToSlide(index);
            startCarousel();
        });
        dotsWrap.appendChild(dot);
    });

    prevSlideBtn.addEventListener("click", () => {
        goToSlide(currentSlide - 1);
        startCarousel();
    });

    nextSlideBtn.addEventListener("click", () => {
        goToSlide(currentSlide + 1);
        startCarousel();
    });

    renderCarousel();
    startCarousel();
}

const roomTypeFilter = document.getElementById("roomTypeFilter");
const amenityInputs = Array.from(document.querySelectorAll(".amenities-filter input[type='checkbox']"));
const roomCards = Array.from(document.querySelectorAll(".room-card"));
const roomSearchInput = document.getElementById("roomSearch");
let selectedRoomCard = null;

const checkInDate = document.getElementById("checkInDate");
const checkOutDate = document.getElementById("checkOutDate");
const checkInBtn = document.getElementById("onlineCheckInBtn");
const unselectRoomBtn = document.getElementById("unselectRoomBtn");
const checkInMessage = document.getElementById("checkInMessage");
const selectedRoomLabel = document.getElementById("selectedRoomLabel");
const selectedRoomImage = document.getElementById("selectedRoomImage");
const bookingPanelHost = document.getElementById("bookingPanelHost");
const bookingBackdrop = document.getElementById("bookingBackdrop");
const closeBookingPanelBtn = document.getElementById("closeBookingPanel");
const roomSelectButtons = Array.from(document.querySelectorAll(".room-select"));
const reservationRoom = document.getElementById("reservationRoom");

function openBookingPanel() {
    if (!bookingPanelHost) {
        return;
    }
    bookingPanelHost.classList.add("is-open");
    bookingPanelHost.setAttribute("aria-hidden", "false");
}

function closeBookingPanel() {
    if (!bookingPanelHost) {
        return;
    }
    bookingPanelHost.classList.remove("is-open");
    bookingPanelHost.setAttribute("aria-hidden", "true");
}

function setCheckInMessage(text, isError) {
    if (!checkInMessage) {
        return;
    }
    checkInMessage.textContent = text;
    checkInMessage.className = isError ? "message error" : "message success";
}

function setSelectedRoom(card) {
    if (!card) {
        return;
    }

    roomCards.forEach((roomCard) => roomCard.classList.remove("is-selected"));
    card.classList.add("is-selected");
    selectedRoomCard = card;

    const roomName = card.querySelector("h3")?.textContent?.trim() || "Selected Room";
    const roomImage = card.querySelector("img");
    if (selectedRoomLabel) {
        selectedRoomLabel.textContent = `Selected room: ${roomName}`;
    }
    if (selectedRoomImage && roomImage) {
        selectedRoomImage.src = roomImage.src;
        selectedRoomImage.alt = roomImage.alt || `${roomName} preview`;
    }

    setCheckInMessage(`${roomName} selected. Choose dates, then confirm check-in.`, false);
    openBookingPanel();
}

function clearSelectedRoom(showMessage = true) {
    if (!selectedRoomCard) {
        if (showMessage) {
            setCheckInMessage("No room is currently selected.", true);
        }
        return;
    }

    selectedRoomCard.classList.remove("is-selected");
    selectedRoomCard = null;
    if (selectedRoomLabel) {
        selectedRoomLabel.textContent = "Selected room: none";
    }
    if (selectedRoomImage) {
        selectedRoomImage.src = "img/room1.jpg";
        selectedRoomImage.alt = "Selected room preview";
    }
    closeBookingPanel();

    if (showMessage) {
        setCheckInMessage("Room unselected. Select another room to continue.", false);
    }
}

function filterRooms() {
    if (!roomCards.length || !roomTypeFilter) {
        return;
    }

    const selectedType = roomTypeFilter.value;
    const selectedAmenities = amenityInputs.filter((input) => input.checked).map((input) => input.value);
    const searchQuery = roomSearchInput ? roomSearchInput.value.trim().toLowerCase() : "";

    roomCards.forEach((card) => {
        const typeMatch = selectedType === "all" || card.dataset.roomType === selectedType;
        const cardAmenities = (card.dataset.amenities || "").split(" ");
        const amenitiesMatch = selectedAmenities.every((amenity) => cardAmenities.includes(amenity));
        const roomName = card.querySelector("h3")?.textContent?.toLowerCase() || "";
        const roomTags = card.querySelector(".room-tags")?.textContent?.toLowerCase() || "";
        const searchMatch = !searchQuery || roomName.includes(searchQuery) || roomTags.includes(searchQuery);
        card.classList.toggle("is-hidden", !(typeMatch && amenitiesMatch && searchMatch));
    });

    if (selectedRoomCard && selectedRoomCard.classList.contains("is-hidden")) {
        clearSelectedRoom(false);
    }
}

function handleCheckIn(triggerCard) {
    if (!checkInDate || !checkOutDate) {
        return;
    }

    const inDate = checkInDate.value;
    const outDate = checkOutDate.value;

    if (!inDate || !outDate) {
        setCheckInMessage("Please select both check-in and check-out dates.", true);
        return;
    }

    if (inDate > outDate) {
        setCheckInMessage("Check-out date must be after check-in date.", true);
        return;
    }

    if (!roomCards.length) {
        const selectedRoom = reservationRoom ? reservationRoom.value : "your selected room";
        setCheckInMessage(`Reservation submitted for ${selectedRoom}. We will contact you shortly.`, false);
        return;
    }

    let card = triggerCard || selectedRoomCard;
    if (!card) {
        card = roomCards.find((roomCard) => !roomCard.classList.contains("is-hidden")) || null;
        if (card) {
            setSelectedRoom(card);
        }
    }

    if (!card) {
        setCheckInMessage("No rooms match your current filters. Try changing room type, amenities, or search.", true);
        return;
    }

    const roomName = card.querySelector("h3")?.textContent?.trim() || "Selected Room";
    card.classList.add("is-booked");
    setCheckInMessage(`Online check-in confirmed for ${roomName}.`, false);
}

if (roomTypeFilter) {
    roomTypeFilter.addEventListener("change", filterRooms);
}

if (amenityInputs.length) {
    amenityInputs.forEach((input) => input.addEventListener("change", filterRooms));
}

if (roomSearchInput) {
    roomSearchInput.addEventListener("input", filterRooms);
}

if (checkInBtn) {
    checkInBtn.addEventListener("click", () => handleCheckIn());
}

if (unselectRoomBtn) {
    unselectRoomBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        clearSelectedRoom();
    });
}

if (bookingBackdrop) {
    bookingBackdrop.addEventListener("click", () => closeBookingPanel());
}

if (closeBookingPanelBtn) {
    closeBookingPanelBtn.addEventListener("click", () => closeBookingPanel());
}

if (roomCards.length) {
    roomCards.forEach((card) => {
        card.addEventListener("click", () => {
            if (selectedRoomCard === card) {
                clearSelectedRoom(false);
                return;
            }
            setSelectedRoom(card);
        });
    });
}

if (roomSelectButtons.length) {
    roomSelectButtons.forEach((button) => {
        const parentCard = button.closest(".room-card");
        button.addEventListener("click", (event) => {
            event.stopPropagation();
            if (parentCard) {
                setSelectedRoom(parentCard);
            }
        });
    });
}

filterRooms();

const galleryLightbox = document.getElementById("galleryLightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxClose = document.getElementById("lightboxClose");
const galleryImages = Array.from(document.querySelectorAll(".gallery-grid .room-card img"));

function openGalleryLightbox(image) {
    if (!galleryLightbox || !lightboxImage || !image) {
        return;
    }
    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt || "Gallery image";
    if (lightboxCaption) {
        lightboxCaption.textContent = image.alt || "Luna Vista Resort";
    }
    galleryLightbox.classList.add("is-open");
    galleryLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
}

function closeGalleryLightbox() {
    if (!galleryLightbox || !lightboxImage) {
        return;
    }
    galleryLightbox.classList.remove("is-open");
    galleryLightbox.setAttribute("aria-hidden", "true");
    lightboxImage.src = "";
    lightboxImage.alt = "";
    document.body.classList.remove("lightbox-open");
}

if (galleryImages.length && galleryLightbox) {
    galleryImages.forEach((image) => {
        image.style.cursor = "zoom-in";
        image.addEventListener("click", () => openGalleryLightbox(image));
    });
}

if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener("click", closeGalleryLightbox);
}

if (lightboxClose) {
    lightboxClose.addEventListener("click", closeGalleryLightbox);
}

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && galleryLightbox?.classList.contains("is-open")) {
        closeGalleryLightbox();
    }
});

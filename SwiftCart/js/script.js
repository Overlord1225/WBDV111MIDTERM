const products = [
    {
        id: 1,
        name: "Wireless Earbuds",
        price: 2499.0,
        image: "img/wirlesserbuds.jpg"
    },
    {
        id: 2,
        name: "Sport Water Bottle",
        price: 699.0,
        image: "img/sportwaterbottle.png"
    },
    {
        id: 3,
        name: "Laptop Sleeve",
        price: 1199.0,
        image: "img/laptopsleeve.jpg"
    },
    {
        id: 4,
        name: "Smart Desk Lamp",
        price: 1799.0,
        image: "img/smartdesklamp.png"
    }
];

const cart = [];
const catalogEl = document.getElementById("catalog");
const cartItemsEl = document.getElementById("cartItems");
const totalPriceEl = document.getElementById("totalPrice");
const checkoutStatusEl = document.getElementById("checkoutStatus");
const checkoutBtn = document.getElementById("checkoutBtn");
const cancelBtn = document.getElementById("cancelBtn");
const checkoutForm = document.getElementById("checkoutForm");
const customerNameEl = document.getElementById("customerName");
const shippingAddressEl = document.getElementById("shippingAddress");
const paymentMethodEl = document.getElementById("paymentMethod");

const trackingInputEl = document.getElementById("trackingInput");
const trackBtn = document.getElementById("trackBtn");
const trackingStatusEl = document.getElementById("trackingStatus");
const latestTrackingNumberEl = document.getElementById("latestTrackingNumber");
const trackingStepsEl = document.getElementById("trackingSteps");
const trackingSteps = trackingStepsEl ? Array.from(trackingStepsEl.querySelectorAll("li")) : [];

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const modalCaption = document.getElementById("modalCaption");
const modalClose = document.getElementById("modalClose");

let orderState = "pending";
let checkoutTimerId = null;
let activeOrder = null;
const trackingStages = ["Order Confirmed", "Packed", "Out for Delivery", "Delivered"];

function formatPeso(value) {
    return new Intl.NumberFormat("en-PH", {
        style: "currency",
        currency: "PHP"
    }).format(value);
}

function setStatus(message, variant) {
    checkoutStatusEl.textContent = `Checkout Status: ${message}`;
    checkoutStatusEl.className = `status ${variant}`;
}

function openImageModal(src, alt) {
    modalImage.src = src;
    modalImage.alt = alt;
    modalCaption.textContent = alt;
    imageModal.classList.add("open");
    imageModal.setAttribute("aria-hidden", "false");
}

function closeImageModal() {
    imageModal.classList.remove("open");
    imageModal.setAttribute("aria-hidden", "true");
    modalImage.src = "";
    modalImage.alt = "";
}

function formatDateStamp(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}

function generateTrackingNumber() {
    const stamp = formatDateStamp(new Date());
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `SC-${stamp}-${randomPart}`;
}

function setTrackingStatus(message, variant) {
    trackingStatusEl.textContent = `Tracking Status: ${message}`;
    trackingStatusEl.className = `status ${variant}`;
}

function renderTrackingSteps(currentStepIndex) {
    trackingSteps.forEach((step, index) => {
        step.classList.remove("active", "done");
        if (index < currentStepIndex) {
            step.classList.add("done");
        } else if (index === currentStepIndex) {
            step.classList.add("active");
        }
    });
}

function clearTrackingDisplay() {
    latestTrackingNumberEl.textContent = "No active tracking number yet.";
    setTrackingStatus("Not Found", "status-info");
    renderTrackingSteps(-1);
}

function renderCatalog() {
    catalogEl.innerHTML = products.map((product) => `
        <article class="product">
            <img class="product-image zoomable" src="${product.image}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p>${formatPeso(product.price)}</p>
            <button class="add-btn" type="button" data-id="${product.id}">Add to Cart</button>
        </article>
    `).join("");

    catalogEl.querySelectorAll(".add-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const productId = Number(btn.dataset.id);
            const item = products.find((product) => product.id === productId);
            if (item) {
                cart.push(item);
                renderCart();
                setStatus("Cart Updated", "status-warn");
                orderState = "pending";
                cancelBtn.disabled = false;
            }
        });
    });
}

function renderCart() {
    if (!cart.length) {
        cartItemsEl.innerHTML = "No items in cart.";
        totalPriceEl.textContent = formatPeso(0);
        cancelBtn.disabled = !activeOrder;
        return;
    }

    cartItemsEl.innerHTML = cart.map((item) => `
        <div class="row">
            <span class="item-name">
                <img class="cart-thumb zoomable" src="${item.image}" alt="${item.name}" loading="lazy">
                ${item.name}
            </span>
            <strong>${formatPeso(item.price)}</strong>
        </div>
    `).join("");

    const total = cart.reduce((sum, item) => sum + item.price, 0);
    totalPriceEl.textContent = formatPeso(total);
    cancelBtn.disabled = false;
}

checkoutBtn.addEventListener("click", () => {
    if (!cart.length) {
        setStatus("Add at least one item", "status-error");
        return;
    }

    if (!checkoutForm.checkValidity()) {
        checkoutForm.reportValidity();
        setStatus("Complete checkout details", "status-error");
        return;
    }

    if (orderState === "processing") {
        return;
    }

    orderState = "processing";
    cancelBtn.disabled = false;
    setStatus("Processing...", "status-info");

    checkoutTimerId = setTimeout(() => {
        orderState = "success";
        setStatus("Success", "status-ok");
        cancelBtn.disabled = false;
        activeOrder = {
            customerName: customerNameEl.value.trim(),
            shippingAddress: shippingAddressEl.value.trim(),
            paymentMethod: paymentMethodEl.value,
            trackingNumber: generateTrackingNumber(),
            trackingStep: 0
        };
        latestTrackingNumberEl.textContent = `Latest Tracking Number: ${activeOrder.trackingNumber}`;
        trackingInputEl.value = activeOrder.trackingNumber;
        setTrackingStatus(trackingStages[activeOrder.trackingStep], "status-info");
        renderTrackingSteps(activeOrder.trackingStep);
        checkoutTimerId = null;
    }, 900);
});

cancelBtn.addEventListener("click", () => {
    if (!cart.length && !activeOrder && orderState !== "processing" && orderState !== "success") {
        setStatus("None", "status-info");
        return;
    }

    if (checkoutTimerId) {
        clearTimeout(checkoutTimerId);
        checkoutTimerId = null;
    }

    orderState = "cancelled";
    cart.length = 0;
    activeOrder = null;
    renderCart();
    setStatus("None", "status-info");
    cancelBtn.disabled = true;
    clearTrackingDisplay();
});

trackBtn.addEventListener("click", () => {
    const number = trackingInputEl.value.trim();

    if (!number) {
        setTrackingStatus("Enter a tracking number", "status-error");
        return;
    }

    if (!activeOrder || number !== activeOrder.trackingNumber) {
        setTrackingStatus("Tracking number not found", "status-error");
        renderTrackingSteps(-1);
        return;
    }

    if (activeOrder.trackingStep < trackingStages.length - 1) {
        activeOrder.trackingStep += 1;
    }

    const stage = trackingStages[activeOrder.trackingStep];
    const variant = activeOrder.trackingStep === trackingStages.length - 1 ? "status-ok" : "status-info";
    setTrackingStatus(stage, variant);
    renderTrackingSteps(activeOrder.trackingStep);
});

document.addEventListener("click", (event) => {
    const image = event.target.closest(".zoomable");
    if (!image) {
        return;
    }

    openImageModal(image.src, image.alt || "Product image");
});

modalClose.addEventListener("click", closeImageModal);

imageModal.addEventListener("click", (event) => {
    if (event.target === imageModal) {
        closeImageModal();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && imageModal.classList.contains("open")) {
        closeImageModal();
    }
});

renderCatalog();
renderCart();
setStatus("None", "status-info");
clearTrackingDisplay();

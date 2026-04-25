document.addEventListener("DOMContentLoaded", () => {
    initializePageState();
    initializeNavigation();
    initializeInteractiveButtons();
    initializeForms();
});

function initializePageState() {
    requestAnimationFrame(() => {
        document.body.classList.add("is-loaded");
    });
}

function initializeNavigation() {
    const currentPath = getCurrentPageName();
    const links = document.querySelectorAll(".site-links a, .site-logo, .action-button[href]");

    document.querySelectorAll(".site-links a").forEach((link) => {
        const href = link.getAttribute("href");
        const isCurrent = href === currentPath;

        link.classList.toggle("is-active", isCurrent);
        if (isCurrent) {
            link.setAttribute("aria-current", "page");
        } else {
            link.removeAttribute("aria-current");
        }
    });

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            const href = link.getAttribute("href");

            if (!shouldHandleNavigation(event, href)) {
                return;
            }

            event.preventDefault();
            document.body.classList.add("is-leaving");
            window.setTimeout(() => {
                window.location.href = href;
            }, 180);
        });
    });
}

function initializeInteractiveButtons() {
    const buttons = document.querySelectorAll(".action-button");

    buttons.forEach((button) => {
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

function initializeForms() {
    const forms = document.querySelectorAll(".contact-form, .auth-form");

    forms.forEach((form) => {
        prepareForm(form);
        const fields = form.querySelectorAll("input, textarea");

        fields.forEach((field) => {
            field.addEventListener("focus", () => {
                field.classList.add("is-focused");
            });

            field.addEventListener("blur", () => {
                field.classList.remove("is-focused");
                validateField(form, field);
            });

            field.addEventListener("input", () => {
                if (field.classList.contains("is-error")) {
                    validateField(form, field);
                }
            });
        });

        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const isValid = validateForm(form);
            const feedback = getFormFeedback(form);

            if (!feedback) {
                return;
            }

            if (isValid) {
                setFeedbackState(feedback, "success", getSuccessMessage(form));
                form.reset();
                form.querySelectorAll("input, textarea").forEach((field) => {
                    field.classList.remove("is-error", "is-focused");
                });
                form.querySelectorAll(".field-message").forEach((message) => {
                    resetFieldMessage(message);
                });
            } else {
                setFeedbackState(feedback, "error", getErrorMessage(form));
            }
        });
    });
}

function prepareForm(form) {
    const fields = form.querySelectorAll("input, textarea");

    fields.forEach((field) => {
        if (getFieldMessage(field)) {
            return;
        }

        const message = document.createElement("p");
        message.className = "field-message";
        message.setAttribute("aria-live", "polite");
        field.insertAdjacentElement("afterend", message);
    });

    if (!getFormFeedback(form)) {
        const feedback = document.createElement("p");
        feedback.className = "form-feedback";
        feedback.setAttribute("aria-live", "polite");
        form.appendChild(feedback);
    }
}

function validateForm(form) {
    let isValid = true;
    const fields = form.querySelectorAll("input, textarea");

    fields.forEach((field) => {
        const fieldIsValid = validateField(form, field);
        if (!fieldIsValid) {
            isValid = false;
        }
    });

    return isValid;
}

function validateField(form, field) {
    const value = field.value.trim();
    let message = "";

    if (field.name === "name" && value === "") {
        message = "Name is required.";
    } else if (field.name === "email") {
        if (value === "") {
            message = "Email is required.";
        } else if (!isValidEmail(value)) {
            message = "Enter a valid email address.";
        }
    } else if (field.name === "message" && value === "") {
        message = "Message is required.";
    } else if (field.name === "username" && value === "") {
        message = "Username is required.";
    } else if (field.name === "password" && value === "") {
        message = "Password is required.";
    } else if (field.name === "confirm-password") {
        const password = form.querySelector('input[name="password"]');

        if (value === "") {
            message = "Please confirm your password.";
        } else if (password && value !== password.value.trim()) {
            message = "Passwords do not match.";
        }
    }

    const fieldMessage = getFieldMessage(field);

    if (message) {
        field.classList.add("is-error");
        setFieldMessage(fieldMessage, "error", message);
        return false;
    }

    field.classList.remove("is-error");
    resetFieldMessage(fieldMessage);
    return true;
}

function getFieldMessage(field) {
    const next = field.nextElementSibling;
    return next && next.classList.contains("field-message") ? next : null;
}

function getFormFeedback(form) {
    return form.querySelector(".form-feedback");
}

function setFieldMessage(element, state, text) {
    if (!element) {
        return;
    }

    element.textContent = text;
    element.classList.add("is-visible");
    element.classList.toggle("is-error", state === "error");
    element.classList.toggle("is-success", state === "success");
}

function resetFieldMessage(element) {
    if (!element) {
        return;
    }

    element.textContent = "";
    element.classList.remove("is-visible", "is-error", "is-success");
}

function setFeedbackState(element, state, text) {
    element.textContent = text;
    element.classList.add("is-visible");
    element.classList.toggle("is-error", state === "error");
    element.classList.toggle("is-success", state === "success");
}

function getSuccessMessage(form) {
    if (form.classList.contains("contact-form")) {
        return "Message submitted.";
    }

    if (form.closest(".auth-panel--secondary")) {
        return "Registration submitted.";
    }

    return "Login submitted.";
}

function getErrorMessage(form) {
    if (form.classList.contains("contact-form")) {
        return "Please complete the contact form.";
    }

    if (form.closest(".auth-panel--secondary")) {
        return "Please complete the registration form.";
    }

    return "Please complete the login form.";
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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

(() => {
    "use strict";

    // Shared utilities keep page-specific behavior small and easier to maintain.
    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
    const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = () => prefersReducedMotionQuery.matches;

    const typeText = (element, text, options = {}) => {
        const { speed = 24, onComplete } = options;
        const content = String(text ?? "");
        const textNode = document.createTextNode("");

        element.replaceChildren(textNode);

        if (!content.length || prefersReducedMotion()) {
            textNode.textContent = content;
            onComplete?.();
            return;
        }

        let index = 0;

        const typeNextCharacter = () => {
            textNode.textContent += content.charAt(index);
            index += 1;

            if (index < content.length) {
                window.setTimeout(typeNextCharacter, speed);
                return;
            }

            onComplete?.();
        };

        window.setTimeout(typeNextCharacter, speed);
    };

    const setStatusMessage = (element, message, tone) => {
        if (!element) return;

        element.textContent = message;
        element.classList.remove("is-success", "is-error");

        if (tone === "success" || tone === "error") {
            element.classList.add(`is-${tone}`);
        }
    };

    const createOutputLogger = outputElement => {
        const maxLines = 10;

        const trim = () => {
            while (outputElement.children.length > maxLines) {
                outputElement.removeChild(outputElement.firstElementChild);
            }
        };

        const append = (message, tone = "info", options = {}) => {
            const { typed = false, speed = 20, replaceLast = false } = options;
            const line = document.createElement("p");

            line.className = `output-log__line output-log__line--${tone}`;

            if (replaceLast && outputElement.lastElementChild) {
                outputElement.removeChild(outputElement.lastElementChild);
            }

            outputElement.append(line);
            trim();

            if (typed) {
                typeText(line, message, {
                    speed,
                    onComplete: () => {
                        outputElement.scrollTop = outputElement.scrollHeight;
                    }
                });
            } else {
                line.textContent = message;
            }

            outputElement.scrollTop = outputElement.scrollHeight;
            return line;
        };

        return { append };
    };

    const initRevealOnScroll = () => {
        const revealElements = $$("[data-reveal]");

        if (!revealElements.length) return;

        if (!("IntersectionObserver" in window) || prefersReducedMotion()) {
            revealElements.forEach(element => element.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                });
            },
            {
                threshold: 0.14,
                rootMargin: "0px 0px -10% 0px"
            }
        );

        revealElements.forEach((element, index) => {
            element.style.transitionDelay = `${Math.min(index * 45, 180)}ms`;
            observer.observe(element);
        });
    };

    const initHeroTyping = () => {
        const typingTarget = $("[data-hero-typing]");

        if (!typingTarget) return;

        typeText(typingTarget, typingTarget.dataset.heroTyping, { speed: 22 });
    };

    const initContactForm = () => {
        const form = $("[data-contact-form]");
        const response = $("[data-form-response]");

        if (!form || !response) return;

        form.addEventListener("input", () => {
            setStatusMessage(response, "", "");
        });

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                setStatusMessage(response, "Please complete every required field before sending.", "error");
                return;
            }

            const formData = new FormData(form);
            const name = String(formData.get("name") ?? "").trim();
            const message = String(formData.get("message") ?? "").trim();

            if (!name) {
                setStatusMessage(response, "Please enter your name before sending the request.", "error");
                return;
            }

            if (message.length < 15) {
                setStatusMessage(response, "Please include a little more detail so we can route the issue properly.", "error");
                return;
            }

            setStatusMessage(
                response,
                `Transmission received, ${name}. Your support ticket is now queued for review.`,
                "success"
            );

            form.reset();
        });
    };

    const initServiceForm = () => {
        const form = $("[data-service-form]");
        const response = $("[data-service-response]");
        const serviceSelect = $("#service-type");
        const detailsField = $("#service-details");

        if (!form || !response || !serviceSelect || !detailsField) return;

        form.addEventListener("input", () => {
            setStatusMessage(response, "", "");
        });

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.checkValidity()) {
                form.reportValidity();
                setStatusMessage(response, "Please complete all required fields before submitting.", "error");
                return;
            }

            const formData = new FormData(form);
            const service = String(formData.get("service") ?? "").trim();
            const name = String(formData.get("name") ?? "").trim();
            const details = String(formData.get("details") ?? "").trim();

            if (details.length < 20) {
                setStatusMessage(response, "Please provide at least 20 characters for the issue details.", "error");
                return;
            }

            setStatusMessage(
                response,
                `${service} request submitted for ${name}. Only one request can be processed at a time.`,
                "success"
            );

            form.reset();
        });
    };

    const initAuthConsole = () => {
        const authRoot = $("[data-auth-app]");

        if (!authRoot) return;

        const form = $("[data-auth-form]", authRoot);
        const output = $("[data-auth-output]", authRoot);
        const modeTitle = $("[data-auth-mode-title]", authRoot);
        const toggleButton = $("[data-auth-toggle]", authRoot);
        const submitButton = $("[data-auth-submit]", authRoot);
        const confirmField = $("[data-confirm-field]", authRoot);
        const usernameInput = $("#username", authRoot);
        const passwordInput = $("#password", authRoot);
        const confirmPasswordInput = $("#confirm-password", authRoot);

        if (!form || !output || !modeTitle || !toggleButton || !submitButton) return;

        const logger = createOutputLogger(output);
        const users = new Map([
            ["admin", "password123"]
        ]);

        let mode = "login";
        let isBusy = false;

        const normalizeUsername = value => value.trim().toLowerCase();

        const focusFieldForError = message => {
            if (message.includes("Username")) {
                usernameInput.focus();
                return;
            }

            if (message.includes("match")) {
                confirmPasswordInput.focus();
                return;
            }

            passwordInput.focus();
        };

        const syncModeUi = () => {
            const isRegisterMode = mode === "register";

            authRoot.dataset.mode = mode;
            modeTitle.textContent = isRegisterMode ? "auth --register" : "auth --login";
            toggleButton.textContent = isRegisterMode ? "Switch to Login" : "Switch to Register";
            submitButton.textContent = isRegisterMode ? "Register" : "Login";
            confirmField.hidden = !isRegisterMode;
            confirmPasswordInput.toggleAttribute("required", isRegisterMode);
            passwordInput.autocomplete = isRegisterMode ? "new-password" : "current-password";

            if (!isRegisterMode) {
                confirmPasswordInput.value = "";
            }
        };

        const setBusy = busy => {
            isBusy = busy;
            toggleButton.disabled = busy;
            submitButton.disabled = busy;

            if (busy) {
                submitButton.textContent = mode === "register" ? "Registering..." : "Authorizing...";
                return;
            }

            syncModeUi();
        };

        const setMode = nextMode => {
            mode = nextMode;
            syncModeUi();
            logger.append(`// Mode changed: ${mode}`, "muted");
            usernameInput.focus();
        };

        const validateForm = () => {
            const username = usernameInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (username.length < 3) {
                return "Username must be at least 3 characters.";
            }

            if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
                return "Username can only contain letters, numbers, underscores, and hyphens.";
            }

            if (password.length < 8) {
                return "Password must be at least 8 characters.";
            }

            if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
                return "Password must include at least one letter and one number.";
            }

            if (mode === "register" && password !== confirmPassword) {
                return "Passwords do not match.";
            }

            if (mode === "register" && users.has(normalizeUsername(username))) {
                return "Username already exists in this session.";
            }

            return "";
        };

        const simulateDelay = (callback, delay = 850) => {
            window.setTimeout(callback, prefersReducedMotion() ? 0 : delay);
        };

        toggleButton.addEventListener("click", () => {
            if (isBusy) return;
            setMode(mode === "login" ? "register" : "login");
        });

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (isBusy) return;

            const validationError = validateForm();

            if (validationError) {
                logger.append(`Error: ${validationError}`, "error", {
                    typed: true,
                    speed: 18,
                    replaceLast: true
                });
                focusFieldForError(validationError);
                return;
            }

            const username = usernameInput.value.trim();
            const normalizedUsername = normalizeUsername(username);
            const password = passwordInput.value;

            logger.append(
                `// ${mode === "login" ? "Authenticating" : "Creating profile"} for ${username}...`,
                "muted",
                { replaceLast: true }
            );

            setBusy(true);

            simulateDelay(() => {
                if (mode === "register") {
                    users.set(normalizedUsername, password);
                    logger.append("Registration successful. Session profile created.", "success", {
                        typed: true,
                        speed: 18,
                        replaceLast: true
                    });

                    setBusy(false);
                    passwordInput.value = "";
                    confirmPasswordInput.value = "";
                    setMode("login");
                    usernameInput.value = username;
                    logger.append("Switching to login mode. Enter your credentials to continue.", "info", {
                        replaceLast: true
                    });
                    passwordInput.focus();
                    return;
                }

                const storedPassword = users.get(normalizedUsername);

                if (storedPassword === password) {
                    logger.append("Access Granted. Redirecting to admin dashboard...", "success", {
                        typed: true,
                        speed: 18,
                        replaceLast: true
                    });

                    setBusy(false);
                    simulateDelay(() => {
                        window.location.href = "admin.html";
                    }, 900);
                    return;
                }

                logger.append("Access Denied. Invalid username or password.", "error", {
                    typed: true,
                    speed: 18,
                    replaceLast: true
                });
                setBusy(false);
                passwordInput.value = "";
                passwordInput.focus();
            });
        });

        syncModeUi();
        usernameInput.focus();
    };

    document.addEventListener("DOMContentLoaded", () => {
        initRevealOnScroll();
        initHeroTyping();
        initContactForm();
        initServiceForm();
        initAuthConsole();
    });
})();

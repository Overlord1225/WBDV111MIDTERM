(() => {
    'use strict';

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function setYear() {
        const year = String(new Date().getFullYear());
        $$('[data-year]').forEach((el) => {
            el.textContent = year;
        });
    }

    function ensureToastContainer() {
        let container = document.querySelector('.toast-container');
        if (container) return container;

        container = document.createElement('div');
        container.className = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        container.setAttribute('aria-relevant', 'additions');
        document.body.appendChild(container);
        return container;
    }

    function toastIcon(type) {
        if (type === 'success') return '✓';
        if (type === 'error') return '✕';
        return '!';
    }

    function createToast(message, type = 'success', { timeoutMs = 4000 } = {}) {
        const container = ensureToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

        const icon = document.createElement('div');
        icon.className = 'toast-icon';
        icon.textContent = toastIcon(type);

        const msg = document.createElement('div');
        msg.className = 'toast-message';
        msg.textContent = message;

        const close = document.createElement('button');
        close.className = 'toast-close';
        close.type = 'button';
        close.setAttribute('aria-label', 'Close notification');
        close.textContent = '×';
        close.addEventListener('click', () => toast.remove());

        toast.append(icon, msg, close);
        container.appendChild(toast);

        if (timeoutMs > 0) {
            window.setTimeout(() => toast.remove(), timeoutMs);
        }
    }

    function initMobileMenu() {
        const btn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        if (!btn || !navLinks) return;

        btn.setAttribute('aria-expanded', btn.getAttribute('aria-expanded') || 'false');
        btn.setAttribute('aria-controls', btn.getAttribute('aria-controls') || 'navLinks');

        const closeMenu = () => {
            navLinks.classList.remove('active');
            btn.setAttribute('aria-expanded', 'false');
        };

        const toggleMenu = () => {
            const isOpen = navLinks.classList.toggle('active');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        };

        btn.addEventListener('click', toggleMenu);

        navLinks.addEventListener('click', (e) => {
            if (e.target.closest('a')) closeMenu();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }

    function initActiveNav() {
        const links = $$('#navLinks a');
        if (!links.length) return;

        const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

        links.forEach((a) => {
            const href = (a.getAttribute('href') || '').split('#')[0].split('?')[0];
            const page = (href.split('/').pop() || '').toLowerCase();
            const isActive = page === currentPage;
            a.classList.toggle('active', isActive);
            if (isActive) a.setAttribute('aria-current', 'page');
            else a.removeAttribute('aria-current');
        });
    }

    function initWizard() {
        const steps = $$('.wizard-step');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const stepIndicator = document.getElementById('stepIndicator');
        const progressFill = document.getElementById('progressFill');

        if (!steps.length || !nextBtn || !prevBtn || !stepIndicator || !progressFill) return;

        let currentStep = 1;
        const totalSteps = steps.length;

        const userData = {
            fullName: '',
            age: '',
            gender: '',
            concern: '',
        };

        const fullNameInput = document.getElementById('fullName');
        fullNameInput?.addEventListener('input', () => {
            userData.fullName = fullNameInput.value.trim();
        });
        fullNameInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                nextBtn.click();
            }
        });

        $$('.option-btn').forEach((btn) => {
            btn.type = 'button';
            btn.addEventListener('click', () => {
                const stepEl = btn.closest('.wizard-step');
                const stepNum = Number(stepEl?.dataset?.step || 0);
                const value = btn.getAttribute('data-value') || '';

                btn.parentElement?.querySelectorAll('.option-btn').forEach((sib) => sib.classList.remove('selected'));
                btn.classList.add('selected');

                if (stepNum === 2) userData.age = value;
                if (stepNum === 3) userData.gender = value;
                if (stepNum === 4) userData.concern = value;
            });
        });

        function showSummary() {
            const map = [
                ['summaryName', userData.fullName],
                ['summaryAge', userData.age],
                ['summaryGender', userData.gender],
                ['summaryConcern', userData.concern],
            ];
            map.forEach(([id, value]) => {
                const el = document.getElementById(id);
                if (el) el.textContent = value || '-';
            });
        }

        function validateStep(step) {
            if (step === 1 && !userData.fullName) {
                createToast('Please enter your full name.', 'error');
                fullNameInput?.focus?.();
                return false;
            }
            if (step === 2 && !userData.age) return (createToast('Please select your age group.', 'error'), false);
            if (step === 3 && !userData.gender) return (createToast('Please select your gender.', 'error'), false);
            if (step === 4 && !userData.concern) return (createToast('Please select your health concern.', 'error'), false);
            return true;
        }

        function setStep(step) {
            currentStep = step;

            steps.forEach((el) => {
                el.classList.toggle('active', Number(el.dataset.step) === currentStep);
            });

            const progress = (currentStep / totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
            stepIndicator.textContent = `Step ${currentStep} of ${totalSteps}`;

            prevBtn.disabled = currentStep === 1;
            nextBtn.textContent = currentStep === totalSteps ? 'Complete' : 'Next';

            if (currentStep === totalSteps) showSummary();
        }

        function submitWizard() {
            if (!validateStep(currentStep)) return;

            const payload = { ...userData, submittedAt: new Date().toISOString() };
            localStorage.setItem('healthsync_intake', JSON.stringify(payload));

            createToast(`Thanks, ${userData.fullName}! We’ll help you schedule your visit.`, 'success', { timeoutMs: 4500 });

            window.setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        }

        nextBtn.addEventListener('click', () => {
            if (currentStep === totalSteps) return submitWizard();
            if (!validateStep(currentStep)) return;
            setStep(Math.min(totalSteps, currentStep + 1));
        });

        prevBtn.addEventListener('click', () => {
            setStep(Math.max(1, currentStep - 1));
        });

        setStep(1);
    }

    function initLogin() {
        const form = document.getElementById('loginForm');
        if (!form) return;

        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput?.value.trim() || '';
            const password = passwordInput?.value || '';

            if (!email || !password) {
                createToast('Please enter your email and password.', 'error');
                return;
            }

            localStorage.setItem(
                'healthsync_session',
                JSON.stringify({ email, loggedInAt: new Date().toISOString() })
            );

            createToast('Login successful! Redirecting…', 'success');
            window.setTimeout(() => (window.location.href = 'index.html'), 1200);
        });
    }

    function initContact() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const required = ['name', 'email', 'subject', 'message'];
            const missing = required.some((id) => !(document.getElementById(id)?.value || '').trim());

            if (missing) {
                createToast('Please fill in all fields before sending.', 'error');
                return;
            }

            createToast('Thanks! Your message has been sent. We’ll reply within 24 hours.', 'success');
            form.reset();
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        setYear();
        initMobileMenu();
        initActiveNav();
        initWizard();
        initLogin();
        initContact();
    });
})();

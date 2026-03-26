// Velvet Crust Cakes - Simple Interactions
(() => {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function setActiveNavLink() {
    const links = qsa('nav a[href]');
    if (links.length === 0) return;

    const currentPath = window.location.pathname.toLowerCase();
    links.forEach((link) => {
      link.classList.remove('active');
      const rawHref = (link.getAttribute('href') || '').toLowerCase();
      const href = rawHref.split('#')[0];
      if (!href || href.startsWith('#')) return;
      if (currentPath.endsWith(href) || (currentPath.endsWith('/') && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  function initFooterYear() {
    const yearEl = qs('[data-current-year]');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  }

  function getMobileNavEls() {
    const hamburger = qs('.hamburger');
    const navMenu = qs('nav ul');
    if (!hamburger || !navMenu) return null;
    return { hamburger, navMenu };
  }

  function closeMobileMenu() {
    const els = getMobileNavEls();
    if (!els) return;
    els.hamburger.classList.remove('active');
    els.navMenu.classList.remove('active');
    els.hamburger.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileMenu() {
    const els = getMobileNavEls();
    if (!els) return;
    const isOpen = els.hamburger.classList.toggle('active');
    els.navMenu.classList.toggle('active', isOpen);
    els.hamburger.setAttribute('aria-expanded', String(isOpen));
  }

  function ensureFormStatusEl(form) {
    let status = qs('.form-status', form);
    if (status) return status;
    status = document.createElement('div');
    status.className = 'form-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.prepend(status);
    return status;
  }

  function setFormStatus(form, type, message) {
    const status = ensureFormStatusEl(form);
    status.classList.remove('success', 'error');
    if (type) status.classList.add(type);
    status.textContent = message || '';
  }

  function validateRequiredFields(form) {
    let ok = true;
    const required = qsa('[required]', form);

    required.forEach((field) => {
      const group = field.closest('.form-group');
      const value = String(field.value || '').trim();
      const isEmpty = value.length === 0;

      if (!group) return;
      group.classList.remove('error');

      if (isEmpty) {
        ok = false;
        group.classList.add('error');
      }

      if (!isEmpty && field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          ok = false;
          group.classList.add('error');
        }
      }
    });

    return ok;
  }

  function attachFormValidation() {
    qsa('form').forEach((form) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        setFormStatus(form, '', '');

        const isValid = validateRequiredFields(form);
        if (!isValid) {
          setFormStatus(form, 'error', 'Please fill out the required fields.');
          return;
        }

        setFormStatus(form, 'success', 'Submitted successfully. (Demo only)');
        form.reset();

        if (form.id === 'loginForm') {
          window.setTimeout(() => (window.location.href = 'index.html'), 900);
        }
      });

      qsa('input, select, textarea', form).forEach((field) => {
        field.addEventListener('input', () => field.closest('.form-group')?.classList.remove('error'));
      });
    });
  }

  function setMinDateForInputs() {
    const dateInputs = qsa('input[type="date"]');
    if (dateInputs.length === 0) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const yyyy = String(now.getFullYear());
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const min = `${yyyy}-${mm}-${dd}`;

    dateInputs.forEach((input) => {
      if (!input.min) input.min = min;
    });
  }

  function initOrderButtons() {
    const select = qs('#cake-type');
    const orderForm = qs('#order-form');
    if (!select || !orderForm) return;

    qsa('[data-order-cake]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const value = btn.getAttribute('data-order-cake') || '';
        if (value) select.value = value;
        orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        qs('#name')?.focus();
      });
    });
  }

  function initGlobalEvents() {
    const hamburger = qs('.hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', toggleMobileMenu);
    }

    qsa('nav a[href]').forEach((link) => {
      link.addEventListener('click', () => closeMobileMenu());
    });

    document.addEventListener('click', (e) => {
      const els = getMobileNavEls();
      if (!els) return;
      if (!els.hamburger.classList.contains('active')) return;
      if (els.hamburger.contains(e.target) || els.navMenu.contains(e.target)) return;
      closeMobileMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobileMenu();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setActiveNavLink();
    initFooterYear();
    attachFormValidation();
    setMinDateForInputs();
    initOrderButtons();
    initGlobalEvents();
  });
})();

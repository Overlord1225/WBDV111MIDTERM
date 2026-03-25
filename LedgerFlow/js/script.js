// LedgerFlow - JavaScript for Form Functionality

document.addEventListener('DOMContentLoaded', function() {
    
    // Set default dates for forms
    setDefaultDates();
    
    // Initialize form handlers
    initLoginForm();
    initInvoiceForm();
    initClientForm();
    initPaymentForm();
    initContactForm();
    
    // Add animation delays for cards
    addAnimationDelays();
});

// Set default dates for forms
function setDefaultDates() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    // Set invoice date
    const invoiceDate = document.getElementById('invoice-date');
    if (invoiceDate) {
        invoiceDate.value = todayStr;
    }
    
    // Set payment date
    const paymentDate = document.getElementById('payment-date');
    if (paymentDate) {
        paymentDate.value = todayStr;
    }
    
    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    const dueDateStr = dueDate.toISOString().split('T')[0];
    
    const invoiceDue = document.getElementById('invoice-due');
    if (invoiceDue) {
        invoiceDue.value = dueDateStr;
    }
}

// Login Form Handler
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (email && password) {
            // Redirect to dashboard after login
            window.location.href = 'index.html';
        }
    });
}

// Invoice Form Handler
function initInvoiceForm() {
    const invoiceForm = document.getElementById('invoiceForm');
    if (!invoiceForm) return;
    
    invoiceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            client: document.getElementById('invoice-client').value,
            invoiceNumber: document.getElementById('invoice-number').value,
            invoiceDate: document.getElementById('invoice-date').value,
            amount: document.getElementById('invoice-amount').value,
            dueDate: document.getElementById('invoice-due').value,
            description: document.getElementById('invoice-description').value
        };
        
        if (formData.client && formData.invoiceNumber && formData.amount) {
            // Show success message
            showSuccess('invoiceSuccess');
            
            // Generate new invoice number
            const invNumber = document.getElementById('invoice-number');
            const num = parseInt(invNumber.value.replace('INV-', '')) || 0;
            invNumber.value = 'INV-' + (num + 1).toString().padStart(3, '0');
            
            // Reset form after delay
            setTimeout(() => {
                invoiceForm.reset();
                setDefaultDates();
            }, 2000);
            
            console.log('Invoice created:', formData);
        }
    });
}

// Client Form Handler
function initClientForm() {
    const clientForm = document.getElementById('clientForm');
    if (!clientForm) return;
    
    clientForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            phone: document.getElementById('client-phone').value,
            status: document.getElementById('client-status').value,
            address: document.getElementById('client-address').value
        };
        
        if (formData.name && formData.email && formData.status) {
            // Show success message
            showSuccess('clientSuccess');
            
            // Reset form after delay
            setTimeout(() => {
                clientForm.reset();
            }, 2000);
            
            console.log('Client saved:', formData);
        }
    });
}

// Payment Form Handler
function initPaymentForm() {
    const paymentForm = document.getElementById('paymentForm');
    if (!paymentForm) return;
    
    // Auto-fill payment amount when invoice is selected
    const invoiceSelect = document.getElementById('payment-invoice');
    const paymentAmount = document.getElementById('payment-amount');
    
    if (invoiceSelect && paymentAmount) {
        invoiceSelect.addEventListener('change', function() {
            const selectedOption = this.options[this.selectedIndex];
            const amountMatch = selectedOption.text.match(/\$([\d,]+)/);
            
            if (amountMatch) {
                paymentAmount.value = amountMatch[1].replace(',', '');
            }
        });
    }
    
    // Generate transaction reference
    const paymentRef = document.getElementById('payment-ref');
    if (paymentRef) {
        paymentRef.value = 'TXN-' + generateTransactionId();
    }
    
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            invoice: document.getElementById('payment-invoice').value,
            amount: document.getElementById('payment-amount').value,
            method: document.getElementById('payment-method').value,
            date: document.getElementById('payment-date').value,
            reference: document.getElementById('payment-ref').value,
            notes: document.getElementById('payment-notes').value
        };
        
        if (formData.invoice && formData.amount && formData.method) {
            // Show success message
            showSuccess('paymentSuccess');
            
            // Generate new transaction reference
            if (paymentRef) {
                paymentRef.value = 'TXN-' + generateTransactionId();
            }
            
            // Reset form after delay
            setTimeout(() => {
                paymentForm.reset();
                setDefaultDates();
            }, 2000);
            
            console.log('Payment processed:', formData);
        }
    });
}

// Contact Form Handler
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            firstName: document.getElementById('contact-firstname').value,
            lastName: document.getElementById('contact-lastname').value,
            email: document.getElementById('contact-email').value,
            phone: document.getElementById('contact-phone').value,
            subject: document.getElementById('contact-subject').value,
            company: document.getElementById('contact-company').value,
            message: document.getElementById('contact-message').value
        };
        
        if (formData.firstName && formData.lastName && formData.email && formData.message) {
            // Show success message
            showSuccess('contactSuccess');
            
            // Reset form after delay
            setTimeout(() => {
                contactForm.reset();
            }, 2000);
            
            console.log('Contact form submitted:', formData);
        }
    });
}

// Helper Functions
function showSuccess(elementId) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            successElement.classList.remove('show');
        }, 3000);
    }
}

function generateTransactionId() {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return timestamp + random;
}

function addAnimationDelays() {
    const cards = document.querySelectorAll('.dashboard-card, .about-section, .contact-info-card, .contact-form-card');
    
    cards.forEach((card, index) => {
        card.style.animationDelay = (index * 0.1) + 's';
    });
}

// Mobile Navigation Toggle (for responsive design)
const navbar = document.querySelector('.navbar');
if (navbar) {
    // Add mobile menu button if needed
    const navContainer = document.querySelector('.nav-container');
    if (navContainer && window.innerWidth <= 768) {
        // Mobile navigation is handled via CSS
    }
}

// Console welcome message
console.log('%c Welcome to LedgerFlow ', 'background: #1a365d; color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c Financial Management System ', 'background: #4a90c2; color: white; font-size: 14px; padding: 5px; border-radius: 3px;');

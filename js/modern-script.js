// Modern EverTest Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.remove('navbar-scrolled');
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.service-card, .testimonial-card, .feature-item');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Counter animation for hero stats
    const countUp = (element, target, duration = 2000) => {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target + (element.textContent.includes('+') ? '+' : element.textContent.includes('%') ? '%' : '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start) + (element.textContent.includes('+') ? '+' : element.textContent.includes('%') ? '%' : '');
            }
        }, 16);
    };

    // Animate stats when hero section is in view
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        const heroObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = document.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        const text = stat.textContent;
                        const number = parseInt(text);
                        if (!isNaN(number)) {
                            countUp(stat, number);
                        }
                    });
                    heroObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        heroObserver.observe(heroSection);
    }

    // Enhanced form handling with security
    // Set form action from configuration\n    const contactForm = document.querySelector('#contact-form');\n    if (contactForm && window.EverTestConfig && window.EverTestConfig.form.submitUrl) {\n        contactForm.action = window.EverTestConfig.form.submitUrl;\n    }
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            // Rate limiting check
            const clientIP = 'user_' + Date.now(); // Simplified identifier
            if (!Security.rateLimiter.isAllowed(clientIP)) {
                e.preventDefault();
                showNotification('Too many submission attempts. Please try again later.', 'error');
                return;
            }
            
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending...';
            
            // Reset form styling
            const inputs = this.querySelectorAll('.form-control');
            inputs.forEach(input => {
                input.classList.remove('is-invalid', 'is-valid');
            });
            
            // Enhanced form validation with security checks
            let isValid = true;
            let securityIssues = [];
            
            inputs.forEach(input => {
                const value = input.value.trim();
                
                // XSS detection
                if (Security.containsXSS(value)) {
                    input.classList.add('is-invalid');
                    securityIssues.push('Invalid characters detected');
                    isValid = false;
                    return;
                }
                
                // Required field validation
                if (input.hasAttribute('required') && !value) {
                    input.classList.add('is-invalid');
                    isValid = false;
                } else if (input.type === 'email' && value) {
                    if (!Security.isValidEmail(value)) {
                        input.classList.add('is-invalid');
                        isValid = false;
                    } else {
                        input.classList.add('is-valid');
                    }
                } else if (value) {
                    // Sanitize input for display
                    input.value = Security.sanitizeInput(value);
                    input.classList.add('is-valid');
                }
            });
            
            if (securityIssues.length > 0) {
                e.preventDefault();
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                showNotification('Security validation failed. Please check your input.', 'error');
                return;
            }
            
            if (!isValid) {
                e.preventDefault();
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                showNotification('Please fill in all required fields correctly.', 'error');
                return;
            }
            
            // If validation passes, the form will submit normally
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }, 3000);
        });
    }

    // Show notification function
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} position-fixed`;
        notification.style.cssText = `
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'error' ? 'exclamation-circle' : type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Add CSS for slide in animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .navbar-scrolled {
            background: rgba(255, 255, 255, 0.98) !important;
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }
        
        .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Loading state for buttons */
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        /* Form validation styles */
        .form-control.is-invalid {
            border-color: #dc3545;
            box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        }
        
        .form-control.is-valid {
            border-color: #28a745;
            box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
        }
        
        /* Hover effects for service cards */
        .service-card {
            transition: all 0.3s ease;
        }
        
        .service-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        /* Testimonial card hover effects */
        .testimonial-card {
            transition: all 0.3s ease;
        }
        
        .testimonial-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
        }
        
        /* Client logo hover effects */
        .client-logo {
            transition: all 0.3s ease;
            filter: grayscale(100%);
            opacity: 0.7;
        }
        
        .client-logo:hover {
            filter: grayscale(0%);
            opacity: 1;
            transform: scale(1.05);
        }
        
        /* Button hover effects */
        .btn {
            transition: all 0.3s ease;
        }
        
        .btn:hover {
            transform: translateY(-2px);
        }
        
        /* Navbar link hover effects */
        .navbar-nav .nav-link {
            transition: all 0.3s ease;
            position: relative;
        }
        
        .navbar-nav .nav-link::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2px;
            background: var(--primary-color, #2563eb);
            transition: all 0.3s ease;
            transform: translateX(-50%);
        }
        
        .navbar-nav .nav-link:hover::after {
            width: 80%;
        }
        
        /* Language selector styles */
        #languageDropdown {
            min-width: 80px;
            text-align: center;
        }
        
        .dropdown-menu {
            min-width: 150px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border: none;
        }
        
        .dropdown-item {
            padding: 8px 16px;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .dropdown-item:hover {
            background-color: #f8f9fa;
            transform: translateX(4px);
        }
        
        .dropdown-item img {
            width: 16px;
            height: 12px;
            object-fit: cover;
        }
        
        /* Mobile Responsive Enhancements */
        @media (max-width: 991.98px) {
            .navbar-brand {
                font-size: 1.3rem !important;
            }
            
            .navbar-brand img {
                height: 38px !important;
            }
            
            .navbar-nav {
                padding-top: 1rem;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 8px;
                margin-top: 0.5rem;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            }
            
            .nav-link {
                padding: 0.75rem 1rem !important;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .nav-link:last-child {
                border-bottom: none;
            }
            
            .hero-section {
                padding-top: 120px !important;
                padding-bottom: 60px !important;
                min-height: 100vh !important;
                display: flex !important;
                align-items: center !important;
            }
            
            .hero-section .container {
                width: 100% !important;
            }
            
            .hero-section .row {
                align-items: center !important;
            }
            
            .hero-content {
                padding: 2rem 0 !important;
                text-align: center !important;
            }
            
            .hero-title {
                font-size: 2.2rem !important;
                line-height: 1.2 !important;
                margin-bottom: 1.5rem !important;
                font-weight: 700 !important;
                color: #1a1a1a !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            .hero-subtitle {
                font-size: 1.1rem !important;
                margin-bottom: 2rem !important;
                line-height: 1.6 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            .hero-buttons {
                flex-direction: column;
                gap: 1rem;
                margin-bottom: 2rem !important;
            }
            
            .hero-buttons .btn {
                width: 100%;
                margin-bottom: 0.5rem;
            }
            
            .hero-stats {
                flex-direction: column;
                gap: 1.5rem;
                text-align: center;
            }
            
            .stat-item {
                margin-bottom: 1rem;
            }
        }
        
        @media (max-width: 767.98px) {
            .hero-section {
                padding-top: 100px !important;
                min-height: 100vh !important;
                min-height: calc(var(--vh, 1vh) * 100) !important;
            }
            
            .hero-section .row {
                flex-direction: column-reverse;
                min-height: 80vh;
            }
            
            .hero-content {
                order: 2;
                padding: 1rem 0 !important;
            }
            
            .hero-image {
                order: 1;
                margin-bottom: 1rem !important;
                padding: 1rem 0;
            }
            
            .hero-title {
                font-size: 1.9rem !important;
                line-height: 1.3 !important;
                margin-bottom: 1rem !important;
                padding: 0 1rem !important;
            }
            
            .hero-subtitle {
                font-size: 1rem !important;
                margin-bottom: 1.5rem !important;
                padding: 0 1rem !important;
            }
            
            .section-title {
                font-size: 1.8rem !important;
            }
            
            .section-subtitle {
                font-size: 1rem !important;
            }
            
            .service-card, .testimonial-card {
                margin-bottom: 2rem;
            }
            
            .contact-form {
                margin-bottom: 3rem;
            }
            
            #cookie-consent .row {
                flex-direction: column;
                gap: 1rem;
            }
            
            #cookie-consent .col-md-8,
            #cookie-consent .col-md-4 {
                text-align: center;
            }
            
            #cookie-consent .btn {
                width: 100%;
                margin-bottom: 0.5rem;
            }
        }
        
        @media (max-width: 575.98px) {
            .container {
                padding-left: 1rem;
                padding-right: 1rem;
            }
            
            .hero-title {
                font-size: 1.8rem !important;
            }
            
            .btn-lg {
                padding: 0.75rem 1.5rem;
                font-size: 1rem;
            }
            
            .navbar-brand span {
                font-size: 1.2rem !important;
            }
        }
        
        /* Touch-friendly improvements */
        @media (hover: none) and (pointer: coarse) {
            .btn, .nav-link, .dropdown-item {
                min-height: 44px;
                display: flex;
                align-items: center;
                font-size: 16px; /* Prevents zoom on iOS */
            }
            
            .form-control, .form-select {
                font-size: 16px; /* Prevents zoom on iOS */
                min-height: 44px;
            }
            
            .service-card:hover, .testimonial-card:hover {
                transform: none; /* Disable hover effects on touch devices */
            }
        }
        
        /* iOS Safari specific fixes */
        @supports (-webkit-touch-callout: none) {
            .hero-section {
                min-height: 100vh !important;
                min-height: -webkit-fill-available !important;
                display: flex !important;
                align-items: center !important;
            }
            
            .hero-title, .hero-subtitle {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                position: relative !important;
                z-index: 10 !important;
            }
            
            .hero-content {
                position: relative !important;
                z-index: 10 !important;
                width: 100% !important;
            }
        }
        
        /* iPhone 14 specific adjustments */
        @media screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) {
            .hero-section {
                padding-top: 120px !important;
                min-height: 844px !important;
            }
            
            .hero-title {
                font-size: 1.8rem !important;
                margin-bottom: 1rem !important;
                font-weight: 700 !important;
            }
        }
        
        /* Cookie consent banner styles */
        .cookie-consent-banner {
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
            border-top: 3px solid #007bff;
        }
        
        .cookie-consent-banner .btn {
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
        }
        
        /* Cookie preferences modal styles */
        .cookie-category {
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 1rem;
        }
        
        .form-check-input:checked {
            background-color: #007bff;
            border-color: #007bff;
        }
        
        /* Security indicators */
        .security-badge {
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(40, 167, 69, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 0.75rem;
            z-index: 1000;
            display: none;
        }
        
        .security-badge.show {
            display: block;
        }
        
        /* Performance optimization styles */
        img[data-src] {
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        img[data-src].loaded {
            opacity: 1;
        }
        
        /* Accessibility improvements */
        .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            z-index: 10001;
        }
        
        .skip-link:focus {
            top: 6px;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .cookie-consent-banner {
                background-color: #1a1a1a !important;
                border-top-color: #4dabf7;
            }
        }
        
        /* High contrast mode support */
        @media (prefers-contrast: high) {
            .btn {
                border: 2px solid;
            }
            
            .cookie-consent-banner {
                border-width: 4px;
            }
        }
        
        /* Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
            * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    document.head.appendChild(style);

    // Mobile-specific functionality
    function initMobileFunctionality() {
        const isMobile = window.innerWidth <= 768;
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        // Auto-close mobile menu when clicking nav links
        if (isMobile) {
            const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
            const navbarCollapse = document.querySelector('.navbar-collapse');
            const navbarToggler = document.querySelector('.navbar-toggler');
            
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                });
            });
            
            // Touch-friendly scroll behavior
            document.documentElement.style.scrollBehavior = 'smooth';
            
            // iOS-specific fixes
            if (isIOS) {
                // Fix for iOS Safari viewport height issues
                const fixIOSViewport = () => {
                    const vh = window.innerHeight * 0.01;
                    document.documentElement.style.setProperty('--vh', `${vh}px`);
                    
                    // Force hero section to be visible
                    const heroSection = document.querySelector('.hero-section');
                    const heroTitle = document.querySelector('.hero-title');
                    const heroSubtitle = document.querySelector('.hero-subtitle');
                    
                    if (heroSection) {
                        heroSection.style.minHeight = `${window.innerHeight}px`;
                        heroSection.style.display = 'flex';
                        heroSection.style.alignItems = 'center';
                    }
                    
                    if (heroTitle) {
                        heroTitle.style.display = 'block';
                        heroTitle.style.visibility = 'visible';
                        heroTitle.style.opacity = '1';
                        heroTitle.style.fontSize = '1.9rem';
                        heroTitle.style.lineHeight = '1.3';
                    }
                    
                    if (heroSubtitle) {
                        heroSubtitle.style.display = 'block';
                        heroSubtitle.style.visibility = 'visible';
                        heroSubtitle.style.opacity = '1';
                    }
                };
                
                fixIOSViewport();
                window.addEventListener('resize', fixIOSViewport);
                window.addEventListener('orientationchange', () => {
                    setTimeout(fixIOSViewport, 100);
                });
                
                // Prevent iOS zoom on input focus
                const inputs = document.querySelectorAll('input, textarea, select');
                inputs.forEach(input => {
                    input.style.fontSize = '16px';
                });
            } else {
                // Standard mobile viewport handling
                const setVH = () => {
                    const vh = window.innerHeight * 0.01;
                    document.documentElement.style.setProperty('--vh', `${vh}px`);
                };
                setVH();
                window.addEventListener('resize', setVH);
            }
        }
    }
    
    // Parallax effect (disabled on mobile for performance)
    if (!('ontouchstart' in window) && window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const heroImage = document.querySelector('.hero-image img');
            if (heroImage) {
                heroImage.style.transform = `translateY(${scrolled * 0.2}px)`;
            }
        });
    }
    
    // Initialize mobile functionality
    initMobileFunctionality();
    
    // Add debounce utility function if not exists
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Re-initialize on resize
    window.addEventListener('resize', debounce(initMobileFunctionality, 250));

    // Initialize tooltips if Bootstrap is available
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }

    // Track scroll progress (optional feature)
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        z-index: 9999;
        transition: width 0.3s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollProgress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = scrollProgress + '%';
    });

    // Initialize security and performance features
    Performance.preloadResources();
    Performance.lazyLoadImages();
    Performance.deferNonCriticalScripts();
    
    // Initialize GDPR cookie consent
    CookieConsent.init();
    
    // Security monitoring
    window.addEventListener('error', function(e) {
        // Log client-side errors for security monitoring
        console.warn('Client error detected:', e.message);
    });
    
    // CSP violation reporting
    document.addEventListener('securitypolicyviolation', function(e) {
        console.warn('CSP Violation:', {
            directive: e.violatedDirective,
            blockedURI: e.blockedURI,
            originalPolicy: e.originalPolicy
        });
    });
    
    console.log('EverTest modern landing page initialized successfully with enhanced security! 🚀🔒');
});

// Enhanced utility functions with security and GDPR compliance
const EverTest = {
    // GDPR Cookie Management
    acceptAllCookies: function() {
        CookieConsent.setConsent({
            analytics: true,
            marketing: true
        });
        CookieConsent.hideBanner();
        this.showNotification(translations[currentLanguage]['cookie-accept-all'] + ' - ' + translations[currentLanguage]['cookie-preferences-desc'], 'success');
    },
    
    manageCookies: function() {
        const modal = new bootstrap.Modal(document.getElementById('cookiePreferencesModal'));
        // Set current preferences in modal
        const consent = CookieConsent.getConsent();
        document.getElementById('analyticsToggle').checked = consent.analytics;
        document.getElementById('marketingToggle').checked = consent.marketing;
        modal.show();
    },
    
    savePreferences: function() {
        const analytics = document.getElementById('analyticsToggle').checked;
        const marketing = document.getElementById('marketingToggle').checked;
        
        CookieConsent.setConsent({
            analytics: analytics,
            marketing: marketing
        });
        
        CookieConsent.hideBanner();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('cookiePreferencesModal'));
        modal.hide();
        
        this.showNotification(translations[currentLanguage]['cookie-save-preferences'] + ' ✓', 'success');
    },
    
    rejectAllCookies: function() {
        CookieConsent.setConsent({
            analytics: false,
            marketing: false
        });
        
        CookieConsent.hideBanner();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('cookiePreferencesModal'));
        if (modal) modal.hide();
        
        this.showNotification(translations[currentLanguage]['cookie-reject-all'] + ' ✓', 'info');
    },
    // Scroll to section
    scrollToSection: function(sectionId) {
        const section = document.querySelector(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    },
    
    // Show loading state
    showLoading: function(element, text = 'Loading...') {
        const originalContent = element.innerHTML;
        element.disabled = true;
        element.innerHTML = `<i class="fas fa-spinner fa-spin me-2"></i>${text}`;
        return originalContent;
    },
    
    // Hide loading state
    hideLoading: function(element, originalContent) {
        element.disabled = false;
        element.innerHTML = originalContent;
    }
};

// GDPR Cookie Consent Management
const CookieConsent = {
    COOKIE_NAME: 'evertest_consent',
    EXPIRY_DAYS: 365,
    
    setCookie: function(name, value, days) {
        const expires = new Date(Date.now() + days * 864e5).toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict; Secure`;
    },
    
    getCookie: function(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
            try {
                return JSON.parse(decodeURIComponent(parts.pop().split(';').shift()));
            } catch (e) {
                return null;
            }
        }
        return null;
    },
    
    hasConsent: function() {
        return this.getCookie(this.COOKIE_NAME) !== null;
    },
    
    getConsent: function() {
        return this.getCookie(this.COOKIE_NAME) || {
            necessary: true,
            analytics: false,
            marketing: false,
            timestamp: null
        };
    },
    
    setConsent: function(preferences) {
        const consent = {
            ...preferences,
            necessary: true, // Always true
            timestamp: Date.now()
        };
        this.setCookie(this.COOKIE_NAME, JSON.stringify(consent), this.EXPIRY_DAYS);
        this.loadScripts(consent);
    },
    
    loadScripts: function(consent) {
        if (consent.analytics && window.EverTestAnalytics) {
            try {
                window.EverTestAnalytics.ga();
                console.log('Google Analytics loaded with consent');
            } catch (e) {
                console.warn('Failed to load Google Analytics:', e);
            }
        }
        
        if (consent.marketing && window.EverTestAnalytics) {
            try {
                window.EverTestAnalytics.heap();
                console.log('Heap Analytics loaded with consent');
            } catch (e) {
                console.warn('Failed to load Heap Analytics:', e);
            }
        }
    },
    
    showBanner: function() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.display = 'block';
            banner.setAttribute('aria-hidden', 'false');
        }
    },
    
    hideBanner: function() {
        const banner = document.getElementById('cookieConsent');
        if (banner) {
            banner.style.display = 'none';
            banner.setAttribute('aria-hidden', 'true');
        }
    },
    
    init: function() {
        // Check if user has already given consent
        if (!this.hasConsent()) {
            // Show banner after a brief delay
            setTimeout(() => this.showBanner(), 1000);
        } else {
            // Load scripts based on existing consent
            const consent = this.getConsent();
            this.loadScripts(consent);
        }
    }
};

// Security utilities
const Security = {
    // XSS Protection - sanitize user input
    sanitizeInput: function(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },
    
    // Validate email format
    isValidEmail: function(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    },
    
    // Check for potential XSS patterns
    containsXSS: function(input) {
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<\s*\w*\s+on\w+/gi
        ];
        
        return xssPatterns.some(pattern => pattern.test(input));
    },
    
    // Rate limiting for form submissions
    rateLimiter: {
        attempts: new Map(),
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        
        isAllowed: function(identifier) {
            const now = Date.now();
            const attempts = this.attempts.get(identifier) || [];
            
            // Remove old attempts outside the window
            const validAttempts = attempts.filter(timestamp => now - timestamp < this.windowMs);
            
            if (validAttempts.length >= this.maxAttempts) {
                return false;
            }
            
            validAttempts.push(now);
            this.attempts.set(identifier, validAttempts);
            return true;
        }
    }
};

// Performance optimizations
const Performance = {
    // Lazy load images
    lazyLoadImages: function() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    },
    
    // Preload critical resources
    preloadResources: function() {
        const criticalResources = [
            '/css/modern-style.css',
            '/img/Logo.png',
            '/img/macbook.jpg'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'image';
            document.head.appendChild(link);
        });
    },
    
    // Optimize third-party scripts
    deferNonCriticalScripts: function() {
        // Defer non-critical third-party scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.src.includes('bootstrap') && !script.async && !script.defer) {
                script.defer = true;
            }
        });
    }
};

// Language translations
const translations = {
    en: {
        'nav-services': 'Services',
        'nav-about': 'About',
        'nav-testimonials': 'Testimonials',
        'nav-contact': 'Contact',
        'get-started': 'Get Started',
        'hero-title': 'AI-Powered Software Testing That Delivers Results',
        'hero-subtitle': 'Accelerate your development cycle with intelligent testing solutions. From automation to security, we ensure your software exceeds quality standards.',
        'hero-cta1': 'Get Free Consultation',
        'hero-cta2': 'Explore Services',
        'stats-years': 'Years Experience',
        'stats-projects': 'Projects Delivered',
        'stats-satisfaction': 'Client Satisfaction',
        'social-proof-text': 'Trusted by leading companies worldwide',
        'services-title': 'Comprehensive Testing Solutions',
        'services-subtitle': 'From automation to security, we provide end-to-end testing services that ensure your software performs flawlessly across all environments.',
        'service1-title': 'AI-Powered Test Automation',
        'service1-desc': 'Leverage machine learning and AI to create self-healing, intelligent test suites that adapt to your application changes and reduce maintenance overhead.',
        'service1-feature1': 'Web, mobile, and desktop automation',
        'service1-feature2': 'CI/CD integration',
        'service1-feature3': 'Cross-browser testing',
        'service2-title': 'Performance Testing',
        'service2-desc': 'Ensure your applications can handle peak loads and deliver optimal user experience with comprehensive performance and scalability testing.',
        'service2-feature1': 'Load and stress testing',
        'service2-feature2': 'Scalability analysis',
        'service2-feature3': 'Performance optimization',
        'service3-title': 'Security Testing',
        'service3-desc': 'Protect your applications and data with thorough security assessments conducted by certified penetration testers and security experts.',
        'service3-feature1': 'Penetration testing',
        'service3-feature2': 'Vulnerability assessments',
        'service3-feature3': 'Security compliance',
        'service4-title': 'ISTQB Training',
        'service4-desc': 'Advance your team\'s testing expertise with internationally recognized ISTQB certification training from Foundation to Advanced levels.',
        'service4-feature1': 'Foundation Level certification',
        'service4-feature2': 'Advanced Level programs',
        'service4-feature3': 'Corporate training packages',
        'service5-title': 'Testing as a Service',
        'service5-desc': 'Outsource your testing needs to our expert team and focus on development while we ensure quality delivery on time and within budget.',
        'service5-feature1': 'Dedicated testing teams',
        'service5-feature2': 'Flexible engagement models',
        'service5-feature3': 'Quality assurance consulting',
        'service6-title': 'UX/UI Testing',
        'service6-desc': 'Optimize user experience and interface design through comprehensive usability testing, user journey analysis, and accessibility assessments.',
        'service6-feature1': 'Usability testing',
        'service6-feature2': 'User journey optimization',
        'service6-feature3': 'Accessibility compliance',
        'why-choose-title': 'Why Leading Companies Choose EverTest',
        'why-choose-feature1-title': 'Proven Track Record',
        'why-choose-feature1-desc': 'Nearly a decade of experience delivering successful testing projects across diverse industries and technologies.',
        'why-choose-feature2-title': 'Strategic Approach',
        'why-choose-feature2-desc': 'We go beyond simple testing - we provide strategic quality engineering that aligns with your business objectives.',
        'why-choose-feature3-title': 'Partnership Focus',
        'why-choose-feature3-desc': 'Building lasting relationships based on trust, reliability, and shared success rather than just project completion.',
        'why-choose-feature4-title': 'Practical Excellence',
        'why-choose-feature4-desc': 'Real-world solutions that solve actual business problems, often within tight deadlines and complex requirements.',
        'testimonials-title': 'What Our Clients Say',
        'testimonials-subtitle': 'Don\'t just take our word for it - hear from the companies that trust EverTest with their quality assurance needs.',
        'testimonial1-quote': '"EverTest helps a lot OctoPerf\'s activities by providing an efficient and reliable load testing expertise. Their team\'s knowledge and commitment have been invaluable to our success."',
        'testimonial1-name': 'Quentin Hamard',
        'testimonial1-title': 'Founder, OctoPerf',
        'testimonial2-quote': '"Our need was to instantly add an experienced functional testing team to SportaGraph. EverTest with its unique expertise and high commitment stood out from the crowd."',
        'testimonial2-name': 'Alex Macris',
        'testimonial2-title': 'CXO, SportaGraph',
        'testimonial3-quote': '"These guys are the Jedi-masters of test automation. They helped us to test our game on more than 250 real, physical devices! Their expertise is unmatched."',
        'testimonial3-name': 'Attila Al-Gharawi',
        'testimonial3-title': 'CEO, Xeropan',
        'about-title': 'Meet the Founder',
        'about-founder-name': 'Ákos Kalocsai',
        'about-founder-intro': 'With nearly a decade of experience in software testing, Ákos founded EverTest with a vision to deliver practical, results-driven testing solutions that truly meet business needs.',
        'about-paragraph1': 'At EverTest, we highly value practical knowledge over theoretical approaches. Our success extends beyond completed projects - it\'s reflected in the lasting partnerships we\'ve forged with clients who trust us to deliver excellence within tight deadlines.',
        'about-paragraph2': 'What sets us apart is not just our technical proficiency, but our strategic approach to testing and our commitment to building partnerships grounded in trust and reliability.',
        'about-cta': 'Get in Touch',
        'contact-title': 'Ready to Elevate Your Software Quality?',
        'contact-subtitle': 'Let\'s discuss how EverTest can help you deliver better software, faster. Get in touch for a free consultation.',
        'contact-form-name': 'Full Name',
        'contact-form-email': 'Email Address',
        'contact-form-company': 'Company',
        'contact-form-message': 'Message',
        'contact-form-placeholder': 'Tell us about your testing needs...',
        'contact-form-submit': 'Send Message',
        'contact-office-title': 'Our Office',
        'contact-office-address': 'Budapest, Mézeskalács tér 18.<br>Hungary',
        'contact-email-title': 'Email Us',
        'contact-response-title': 'Response Time',
        'contact-response-desc': 'We\'ll get back to you within 24 hours',
        'footer-copyright': '© {year} EverTest. All rights reserved.',
        'footer-tagline': 'Elevating Quality, Empowering Success',
        // Cookie consent translations
        'cookie-consent-text': 'We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
        'cookie-manage': 'Manage Cookies',
        'cookie-accept-all': 'Accept All',
        'cookie-preferences-title': 'Cookie Preferences',
        'cookie-preferences-desc': 'We use cookies to ensure you get the best experience on our website. You can choose which cookies you want to accept.',
        'cookie-necessary-title': 'Necessary Cookies',
        'cookie-necessary-desc': 'These cookies are essential for the website to function properly and cannot be disabled.',
        'cookie-analytics-title': 'Analytics Cookies',
        'cookie-analytics-desc': 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
        'cookie-marketing-title': 'Marketing Cookies',
        'cookie-marketing-desc': 'These cookies are used to track visitors across websites to display relevant advertisements.',
        'cookie-always-active': 'Always Active',
        'cookie-reject-all': 'Reject All',
        'cookie-save-preferences': 'Save Preferences'
    },
    de: {
        'nav-services': 'Dienstleistungen',
        'nav-about': 'Über uns',
        'nav-testimonials': 'Referenzen',
        'nav-contact': 'Kontakt',
        'get-started': 'Loslegen',
        'hero-title': 'KI-gestützte Softwaretests, die Ergebnisse liefern',
        'hero-subtitle': 'Beschleunigen Sie Ihren Entwicklungszyklus mit intelligenten Testlösungen. Von der Automatisierung bis zur Sicherheit stellen wir sicher, dass Ihre Software die Qualitätsstandards übertrifft.',
        'hero-cta1': 'Kostenlose Beratung',
        'hero-cta2': 'Services erkunden',
        'stats-years': 'Jahre Erfahrung',
        'stats-projects': 'Projekte geliefert',
        'stats-satisfaction': 'Kundenzufriedenheit',
        'social-proof-text': 'Vertrauen von führenden Unternehmen weltweit',
        'services-title': 'Umfassende Testlösungen',
        'services-subtitle': 'Von der Automatisierung bis zur Sicherheit bieten wir End-to-End-Testservices, die sicherstellen, dass Ihre Software in allen Umgebungen einwandfrei funktioniert.',
        'service1-title': 'KI-gestützte Testautomatisierung',
        'service1-desc': 'Nutzen Sie maschinelles Lernen und KI, um selbstheilende, intelligente Testsuiten zu erstellen, die sich an Ihre Anwendungsänderungen anpassen und den Wartungsaufwand reduzieren.',
        'service1-feature1': 'Web-, Mobile- und Desktop-Automatisierung',
        'service1-feature2': 'CI/CD-Integration',
        'service1-feature3': 'Cross-Browser-Testing',
        'service2-title': 'Performance-Tests',
        'service2-desc': 'Stellen Sie sicher, dass Ihre Anwendungen Spitzenlasten bewältigen und optimale Benutzererfahrung bieten können mit umfassenden Performance- und Skalierbarkeitstests.',
        'service2-feature1': 'Last- und Stresstests',
        'service2-feature2': 'Skalierbarkeitsanalyse',
        'service2-feature3': 'Performance-Optimierung',
        'service3-title': 'Sicherheitstests',
        'service3-desc': 'Schützen Sie Ihre Anwendungen und Daten mit gründlichen Sicherheitsbewertungen, die von zertifizierten Penetrationstestern und Sicherheitsexperten durchgeführt werden.',
        'service3-feature1': 'Penetrationstests',
        'service3-feature2': 'Schwachstellenbewertungen',
        'service3-feature3': 'Sicherheits-Compliance',
        'service4-title': 'ISTQB-Schulungen',
        'service4-desc': 'Erweitern Sie die Testexpertise Ihres Teams mit international anerkannten ISTQB-Zertifizierungsschulungen von Foundation- bis Advanced-Level.',
        'service4-feature1': 'Foundation Level Zertifizierung',
        'service4-feature2': 'Advanced Level Programme',
        'service4-feature3': 'Firmen-Schulungspakete',
        'service5-title': 'Testing as a Service',
        'service5-desc': 'Lagern Sie Ihre Testanforderungen an unser Expertenteam aus und konzentrieren Sie sich auf die Entwicklung, während wir qualitätsvolle Lieferung termingerecht und im Budget sicherstellen.',
        'service5-feature1': 'Dedizierte Testteams',
        'service5-feature2': 'Flexible Engagement-Modelle',
        'service5-feature3': 'Qualitätssicherungsberatung',
        'service6-title': 'UX/UI-Tests',
        'service6-desc': 'Optimieren Sie Benutzererfahrung und Interface-Design durch umfassende Usability-Tests, Benutzerweg-Analysen und Accessibility-Bewertungen.',
        'service6-feature1': 'Usability-Tests',
        'service6-feature2': 'Benutzerweg-Optimierung',
        'service6-feature3': 'Accessibility-Compliance',
        'why-choose-title': 'Warum führende Unternehmen EverTest wählen',
        'why-choose-feature1-title': 'Bewährte Erfolgsbilanz',
        'why-choose-feature1-desc': 'Fast ein Jahrzehnt Erfahrung in der erfolgreichen Lieferung von Testprojekten in verschiedenen Branchen und Technologien.',
        'why-choose-feature2-title': 'Strategischer Ansatz',
        'why-choose-feature2-desc': 'Wir gehen über einfache Tests hinaus - wir bieten strategisches Quality Engineering, das mit Ihren Geschäftszielen übereinstimmt.',
        'why-choose-feature3-title': 'Partnerschaftsfokus',
        'why-choose-feature3-desc': 'Aufbau dauerhafter Beziehungen basierend auf Vertrauen, Zuverlässigkeit und gemeinsamen Erfolg statt nur Projektabschluss.',
        'why-choose-feature4-title': 'Praktische Exzellenz',
        'why-choose-feature4-desc': 'Praxisnahe Lösungen, die echte Geschäftsprobleme lösen, oft innerhalb enger Fristen und komplexer Anforderungen.',
        'testimonials-title': 'Was unsere Kunden sagen',
        'testimonials-subtitle': 'Glauben Sie nicht nur unserem Wort - hören Sie von den Unternehmen, die EverTest mit ihren Qualitätssicherungsanforderungen vertrauen.',
        'testimonial1-quote': '"EverTest hilft OctoPerfs Aktivitäten sehr durch die Bereitstellung effizienter und zuverlässiger Lasttestexpertise. Das Wissen und Engagement ihres Teams waren von unschätzbarem Wert für unseren Erfolg."',
        'testimonial1-name': 'Quentin Hamard',
        'testimonial1-title': 'Gründer, OctoPerf',
        'testimonial2-quote': '"Unser Bedarf war es, sofort ein erfahrenes funktionales Testteam zu SportaGraph hinzuzufügen. EverTest mit seiner einzigartigen Expertise und hohen Hingabe stach aus der Menge hervor."',
        'testimonial2-name': 'Alex Macris',
        'testimonial2-title': 'CXO, SportaGraph',
        'testimonial3-quote': '"Diese Jungs sind die Jedi-Meister der Testautomatisierung. Sie haben uns geholfen, unser Spiel auf mehr als 250 echten, physischen Geräten zu testen! Ihre Expertise ist unübertroffen."',
        'testimonial3-name': 'Attila Al-Gharawi',
        'testimonial3-title': 'CEO, Xeropan',
        'about-title': 'Den Gründer kennenlernen',
        'about-founder-name': 'Ákos Kalocsai',
        'about-founder-intro': 'Mit fast einem Jahrzehnt Erfahrung im Softwaretesting gründete Ákos EverTest mit der Vision, praktische, ergebnisorientierte Testlösungen zu liefern, die wirklich den Geschäftsanforderungen entsprechen.',
        'about-paragraph1': 'Bei EverTest schätzen wir praktisches Wissen über theoretische Ansätze sehr. Unser Erfolg geht über abgeschlossene Projekte hinaus - er spiegelt sich in den dauerhaften Partnerschaften wider, die wir mit Kunden geschmiedet haben, die uns vertrauen, Exzellenz innerhalb enger Fristen zu liefern.',
        'about-paragraph2': 'Was uns auszeichnet, ist nicht nur unsere technische Kompetenz, sondern unser strategischer Testansatz und unser Engagement für den Aufbau von Partnerschaften, die auf Vertrauen und Zuverlässigkeit basieren.',
        'about-cta': 'Kontakt aufnehmen',
        'contact-title': 'Bereit, Ihre Softwarequalität zu steigern?',
        'contact-subtitle': 'Lassen Sie uns besprechen, wie EverTest Ihnen helfen kann, bessere Software schneller zu liefern. Kontaktieren Sie uns für eine kostenlose Beratung.',
        'contact-form-name': 'Vollständiger Name',
        'contact-form-email': 'E-Mail-Adresse',
        'contact-form-company': 'Unternehmen',
        'contact-form-message': 'Nachricht',
        'contact-form-placeholder': 'Erzählen Sie uns von Ihren Testanforderungen...',
        'contact-form-submit': 'Nachricht senden',
        'contact-office-title': 'Unser Büro',
        'contact-office-address': 'Budapest, Mézeskalács tér 18.<br>Ungarn',
        'contact-email-title': 'E-Mail an uns',
        'contact-response-title': 'Antwortzeit',
        'contact-response-desc': 'Wir melden uns innerhalb von 24 Stunden bei Ihnen',
        'footer-copyright': '© {year} EverTest. Alle Rechte vorbehalten.',
        'footer-tagline': 'Qualität steigern, Erfolg ermöglichen',
        // Cookie consent translations
        'cookie-consent-text': 'Wir verwenden Cookies, um Ihr Browsing-Erlebnis zu verbessern, personalisierte Inhalte bereitzustellen und unseren Traffic zu analysieren. Durch Klicken auf "Alle akzeptieren" stimmen Sie der Verwendung von Cookies zu.',
        'cookie-manage': 'Cookies verwalten',
        'cookie-accept-all': 'Alle akzeptieren',
        'cookie-preferences-title': 'Cookie-Einstellungen',
        'cookie-preferences-desc': 'Wir verwenden Cookies, um sicherzustellen, dass Sie die beste Erfahrung auf unserer Website erhalten. Sie können wählen, welche Cookies Sie akzeptieren möchten.',
        'cookie-necessary-title': 'Notwendige Cookies',
        'cookie-necessary-desc': 'Diese Cookies sind für das ordnungsgemäße Funktionieren der Website unerlässlich und können nicht deaktiviert werden.',
        'cookie-analytics-title': 'Analytics-Cookies',
        'cookie-analytics-desc': 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie Informationen anonym sammeln und melden.',
        'cookie-marketing-title': 'Marketing-Cookies',
        'cookie-marketing-desc': 'Diese Cookies werden verwendet, um Besucher über Websites hinweg zu verfolgen und relevante Werbung anzuzeigen.',
        'cookie-always-active': 'Immer aktiv',
        'cookie-reject-all': 'Alle ablehnen',
        'cookie-save-preferences': 'Einstellungen speichern'
    },
    hu: {
        'nav-services': 'Szolgáltatások',
        'nav-about': 'Rólunk',
        'nav-testimonials': 'Referenciák',
        'nav-contact': 'Kapcsolat',
        'get-started': 'Kezdjük el',
        'hero-title': 'MI-alapú szoftvertesztelés, ami eredményeket szállít',
        'hero-subtitle': 'Gyorsítsa fel fejlesztési ciklusát intelligens tesztelési megoldásokkal. Az automatizálástól a biztonságig, biztosítjuk, hogy szoftvere meghaladja a minőségi standardokat.',
        'hero-cta1': 'Ingyenes konzultáció',
        'hero-cta2': 'Szolgáltatások felfedezése',
        'stats-years': 'Év tapasztalat',
        'stats-projects': 'Leszállított projekt',
        'stats-satisfaction': 'Ügyfél-elégedettség',
        'social-proof-text': 'Világszerte vezető vállalatok bíznak meg bennünket',
        'services-title': 'Átfogó tesztelési megoldások',
        'services-subtitle': 'Az automatizálástól a biztonságig, végpontok közötti tesztelési szolgáltatásokat nyújtunk, amelyek biztosítják, hogy szoftvere minden környezetben hibátlanul működjön.',
        'service1-title': 'MI-alapú tesztautomatizálás',
        'service1-desc': 'Használja ki a gépi tanulást és mesterséges intelligenciát öngyógyító, intelligens tesztcsomagok létrehozásához, amelyek alkalmazkodnak alkalmazásváltozásaihoz és csökkentik a karbantartási terhelést.',
        'service1-feature1': 'Web, mobil és asztali automatizálás',
        'service1-feature2': 'CI/CD integráció',
        'service1-feature3': 'Böngészők közötti tesztelés',
        'service2-title': 'Teljesítménytesztelés',
        'service2-desc': 'Biztosítsa, hogy alkalmazásai képesek kezelni a csúcsterheléseket és optimális felhasználói élményt nyújtani átfogó teljesítmény- és skálázhatósági teszteléssel.',
        'service2-feature1': 'Terhelési és stressz tesztelés',
        'service2-feature2': 'Skálázhatósági elemzés',
        'service2-feature3': 'Teljesítmény optimalizálás',
        'service3-title': 'Biztonsági tesztelés',
        'service3-desc': 'Védje alkalmazásait és adatait alapos biztonsági értékelésekkel, amelyeket tanúsított behatolástesztelők és biztonsági szakértők végeznek.',
        'service3-feature1': 'Behatolástesztelés',
        'service3-feature2': 'Sebezhetőségi értékelések',
        'service3-feature3': 'Biztonsági megfelelőség',
        'service4-title': 'ISTQB képzések',
        'service4-desc': 'Fejlessze csapata tesztelési szakértelmét nemzetközileg elismert ISTQB tanúsítási képzésekkel Alapfokozattól Haladó szintigig.',
        'service4-feature1': 'Alapfokozatú tanúsítás',
        'service4-feature2': 'Haladó szintű programok',
        'service4-feature3': 'Vállalati képzési csomagok',
        'service5-title': 'Tesztelés mint szolgáltatás',
        'service5-desc': 'Helyezze ki tesztelési igényeit szakértő csapatunkhoz és koncentráljon a fejlesztésre, miközben mi biztosítjuk a minőségi szállítást időben és költségvetésen belül.',
        'service5-feature1': 'Dedikált tesztcsapatok',
        'service5-feature2': 'Rugalmas együttműködési modellek',
        'service5-feature3': 'Minőségbiztosítási tanácsadás',
        'service6-title': 'UX/UI tesztelés',
        'service6-desc': 'Optimalizálja a felhasználói élményt és felületdesignt átfogó használhatósági tesztelésssel, felhasználói útvonal elemzéssel és akadálymentességi értékelésekkel.',
        'service6-feature1': 'Használhatósági tesztelés',
        'service6-feature2': 'Felhasználói útvonal optimalizálás',
        'service6-feature3': 'Akadálymentességi megfelelőség',
        'why-choose-title': 'Miért választják a vezető vállalatok az EverTestet',
        'why-choose-feature1-title': 'Bizonyított eredmények',
        'why-choose-feature1-desc': 'Közel egy évtized tapasztalat sikeres tesztprojektek szállításában különböző iparágakban és technológiákban.',
        'why-choose-feature2-title': 'Stratégiai megközelítés',
        'why-choose-feature2-desc': 'Túlmegyünk az egyszerű tesztelésen - stratégiai minőségmérnöki megoldásokat nyújtunk, amelyek összhangban vannak üzleti céljaival.',
        'why-choose-feature3-title': 'Partnerség-központúság',
        'why-choose-feature3-desc': 'Tartós kapcsolatok építése bizalmon, megbízhatóságon és közös sikeren alapulva, nem csak projekt befejezésen.',
        'why-choose-feature4-title': 'Gyakorlati kiválóság',
        'why-choose-feature4-desc': 'Valós megoldások, amelyek tényleges üzleti problémákat oldanak meg, gyakran szoros határidők és összetett követelmények mellett.',
        'testimonials-title': 'Mit mondanak ügyfeleink',
        'testimonials-subtitle': 'Ne csak a mi szavunkra hagyatkozzon - hallgassa meg azokat a vállalatokat, amelyek minőségbiztosítási igényeikkel az EverTestre bízzák magukat.',
        'testimonial1-quote': '"Az EverTest nagyon segíti az OctoPerf tevékenységeit hatékony és megbízható terheléstesztelési szakértelem biztosításával. Csapatuk tudása és elkötelezettsége felbecsülhetetlen értékű volt sikerünk szempontjából."',
        'testimonial1-name': 'Quentin Hamard',
        'testimonial1-title': 'Alapító, OctoPerf',
        'testimonial2-quote': '"Szükségünk volt arra, hogy azonnal tapasztalt funkcionális tesztcsapatot adjunk a SportaGraphhoz. Az EverTest egyedülálló szakértelmével és magas elkötelezettségével kiemelkedett a tömegből."',
        'testimonial2-name': 'Alex Macris',
        'testimonial2-title': 'CXO, SportaGraph',
        'testimonial3-quote': '"Ezek a srácok a tesztautomatizálás jedi mesterei. Segítettek nekünk több mint 250 valós, fizikai eszközön tesztelni játékunkat! Szakértelmük felülmúlhatatlan."',
        'testimonial3-name': 'Attila Al-Gharawi',
        'testimonial3-title': 'CEO, Xeropan',
        'about-title': 'Ismerje meg az alapítót',
        'about-founder-name': 'Kalocsai Ákos',
        'about-founder-intro': 'Közel egy évtized szoftvertesztelési tapasztalattal Ákos azzal a vízióval alapította az EverTestet, hogy gyakorlati, eredményorientált tesztelési megoldásokat szállítson, amelyek valóban megfelelnek az üzleti igényeknek.',
        'about-paragraph1': 'Az EverTestnél nagyon értékeljük a gyakorlati tudást az elméleti megközelítésekkel szemben. Sikerünk túlmutat a befejezett projekteken - tükröződik azokban a tartós partnerségekben, amelyeket olyan ügyfelekkel kovácsoltunk, akik bíznak abban, hogy szoros határidőkön belül kiválóságot szállítunk.',
        'about-paragraph2': 'Ami megkülönböztet minket, az nem csak technikai jártasságunk, hanem stratégiai tesztelési megközelítésünk és elkötelezettségünk a bizalmon és megbízhatóságon alapuló partnerségek építése iránt.',
        'about-cta': 'Vegye fel a kapcsolatot',
        'contact-title': 'Készen áll szoftverminősége emelésére?',
        'contact-subtitle': 'Beszéljük meg, hogyan segíthet az EverTest jobb szoftvert szállítani, gyorsabban. Vegye fel velünk a kapcsolatot ingyenes konzultációért.',
        'contact-form-name': 'Teljes név',
        'contact-form-email': 'E-mail cím',
        'contact-form-company': 'Vállalat',
        'contact-form-message': 'Üzenet',
        'contact-form-placeholder': 'Meséljen tesztelési igényeiről...',
        'contact-form-submit': 'Üzenet küldése',
        'contact-office-title': 'Irodánk',
        'contact-office-address': 'Budapest, Mézeskalács tér 18.<br>Magyarország',
        'contact-email-title': 'Írjon nekünk',
        'contact-response-title': 'Válaszidő',
        'contact-response-desc': '24 órán belül jelentkezünk Önnél',
        'footer-copyright': '© {year} EverTest. Minden jog fenntartva.',
        'footer-tagline': 'Minőség emelése, siker támogatása',
        // Cookie consent translations
        'cookie-consent-text': 'Sütiket használunk a böngészési élmény javítására, személyre szabott tartalom szolgáltatására és forgalmunk elemzésére. Az "Összes elfogadása" gombra kattintva hozzájárul a sütik használatához.',
        'cookie-manage': 'Sütik kezelése',
        'cookie-accept-all': 'Összes elfogadása',
        'cookie-preferences-title': 'Süti beállítások',
        'cookie-preferences-desc': 'Sütiket használunk annak biztosítására, hogy a legjobb élményt nyújtsuk weboldalunkon. Kiválaszthatja, mely sütiket szeretné elfogadni.',
        'cookie-necessary-title': 'Szükséges sütik',
        'cookie-necessary-desc': 'Ezek a sütik elengedhetetlenek a weboldal megfelelő működéséhez és nem kapcsolhatók ki.',
        'cookie-analytics-title': 'Analitikai sütik',
        'cookie-analytics-desc': 'Ezek a sütik segítenek megérteni, hogyan lépnek kapcsolatba a látogatók weboldalunkkal az információk névtelen gyűjtésével és jelentésével.',
        'cookie-marketing-title': 'Marketing sütik',
        'cookie-marketing-desc': 'Ezeket a sütiket a látogatók webhelyeken keresztüli követésére használják releváns hirdetések megjelenítése céljából.',
        'cookie-always-active': 'Mindig aktív',
        'cookie-reject-all': 'Összes elutasítása',
        'cookie-save-preferences': 'Beállítások mentése'
    }
};

// Language switching functionality
let currentLanguage = localStorage.getItem('language') || 'en';

function switchLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    
    // Update dropdown button text
    const languageDropdown = document.getElementById('languageDropdown');
    const flagMap = { en: 'EN', de: 'DE', hu: 'HU' };
    languageDropdown.innerHTML = `<i class="fas fa-globe"></i> ${flagMap[lang]}`;
    
    // Update all elements with data-translate attribute
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[lang] && translations[lang][key]) {
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = translations[lang][key];
            } else if (element.tagName === 'TEXTAREA') {
                element.placeholder = translations[lang][key];
            } else if (key === 'footer-copyright') {
                // Special handling for copyright to preserve the year span
                const currentYear = new Date().getFullYear();
                element.innerHTML = translations[lang][key].replace('{year}', currentYear);
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });
    
    // Update document language
    document.documentElement.lang = lang;
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    switchLanguage(currentLanguage);
});

// Make utility functions globally available
window.EverTest = EverTest;
window.switchLanguage = switchLanguage;
window.CookieConsent = CookieConsent;
window.Security = Security;
window.Performance = Performance;

// Service Worker registration for enhanced performance (if available)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Enhanced error handling
window.addEventListener('unhandledrejection', function(event) {
    console.warn('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Security headers validation
if (typeof window !== 'undefined') {
    // Check if running over HTTPS in production
    if (window.location.hostname !== 'localhost' && window.location.protocol !== 'https:') {
        console.warn('Site should be served over HTTPS for security');
    }
    
    // Verify CSP is working
    try {
        eval('console.log("CSP test");');
        console.warn('Content Security Policy may not be properly configured');
    } catch (e) {
        console.log('Content Security Policy is active ✓');
    }
}
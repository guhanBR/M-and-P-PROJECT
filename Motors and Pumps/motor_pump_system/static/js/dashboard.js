/* ==============================================
   SPARE PARTS ORDERING SYSTEM — DASHBOARD JS
   Vanilla JavaScript — No Frameworks
   Designed for future Java Spring Boot API integration
   ============================================== */

document.addEventListener('DOMContentLoaded', function () {
    initNavbar();
    initSearch();
    initNotifications();
    initCartDropdown();
    initProfileDropdown();
    initMobileMenu();
    initOrderFilter();
    initStatCounters();
    initDateDisplay();
    initDashSearch();
    initSmoothScroll();
    initSearchModal();
});

/* ==================== API CONFIGURATION ====================
   These endpoints are structured to match a Java Spring Boot
   REST API backend with MySQL database.
   
   Example Spring Boot controller mapping:
   @RestController
   @RequestMapping("/api/customer")
   public class CustomerController {
       @GetMapping("/orders")
       @GetMapping("/orders/{id}")
       @GetMapping("/equipment")
       @GetMapping("/reminders")
       @GetMapping("/notifications")
       @PutMapping("/notifications/read-all")
       @GetMapping("/search")
   }
   ============================================================ */

const API_BASE = '/api/customer';

const API_ENDPOINTS = {
    orders: `${API_BASE}/orders`,
    orderDetail: (id) => `${API_BASE}/orders/${id}`,
    equipment: `${API_BASE}/equipment`,
    reminders: `${API_BASE}/reminders`,
    notifications: `${API_BASE}/notifications`,
    markNotificationsRead: `${API_BASE}/notifications/read-all`,
    search: `${API_BASE}/search`,
    profile: `${API_BASE}/profile`,
};

/* ==================== NAVBAR ==================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', function () {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }, { passive: true });

    // Active link highlighting based on scroll position
    const sections = document.querySelectorAll('[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-section]');

    window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(function (section) {
            const sectionTop = section.offsetTop - 100;
            if (window.pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
                link.classList.add('active');
            }
        });
    }, { passive: true });
}

/* ==================== SEARCH ==================== */
function initSearch() {
    const searchToggle = document.getElementById('searchToggle');
    const searchOverlay = document.getElementById('searchOverlay');
    const globalSearch = document.getElementById('globalSearch');

    if (!searchToggle || !searchOverlay) return;

    searchToggle.addEventListener('click', function () {
        searchOverlay.classList.toggle('active');
        if (searchOverlay.classList.contains('active') && globalSearch) {
            globalSearch.focus();
        }
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            searchOverlay.classList.remove('active');
            closeSearchModal();
        }
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
        if (!searchOverlay.contains(e.target) && !searchToggle.contains(e.target)) {
            searchOverlay.classList.remove('active');
        }
    });

    // Search input with debounce
    if (globalSearch) {
        let debounceTimer;
        globalSearch.addEventListener('input', function () {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(function () {
                const query = globalSearch.value.trim();
                if (query.length >= 2) {
                    performSearch(query);
                }
            }, 400);
        });

        globalSearch.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = globalSearch.value.trim();
                if (query) {
                    performSearch(query);
                }
            }
        });
    }
}

/**
 * Perform search via API
 * Spring Boot: @GetMapping("/search") with @RequestParam("q")
 */
function performSearch(query) {
    // When backend is connected, replace with:
    // fetch(`${API_ENDPOINTS.search}?q=${encodeURIComponent(query)}`)
    //     .then(response => response.json())
    //     .then(data => displaySearchResults(data))
    //     .catch(error => showToast('Search failed', 'error'));

    console.log('[Search] Query:', query);
}

/* ==================== SEARCH MODAL ==================== */
function initSearchModal() {
    const searchModal = document.getElementById('searchModal');
    const closeBtn = document.getElementById('closeSearchModal');
    const modalInput = document.getElementById('modalSearchInput');

    if (!searchModal || !closeBtn) return;

    closeBtn.addEventListener('click', closeSearchModal);

    searchModal.addEventListener('click', function (e) {
        if (e.target === searchModal) {
            closeSearchModal();
        }
    });

    // Tag click fills search
    document.querySelectorAll('.suggestion-tags .tag').forEach(function (tag) {
        tag.addEventListener('click', function () {
            if (modalInput) {
                modalInput.value = this.textContent;
                modalInput.focus();
            }
        });
    });

    // Keyboard shortcut: Ctrl+K or Cmd+K to open
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
    });
}

function openSearchModal() {
    const modal = document.getElementById('searchModal');
    const input = document.getElementById('modalSearchInput');
    if (modal) {
        modal.classList.add('active');
        if (input) {
            setTimeout(function () { input.focus(); }, 200);
        }
    }
}

function closeSearchModal() {
    var modal = document.getElementById('searchModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

/* ==================== DASHBOARD SEARCH SECTION ==================== */
function initDashSearch() {
    var searchInput = document.getElementById('dashSearchInput');
    var searchBtn = document.getElementById('dashSearchBtn');
    var filterBtn = document.getElementById('dashFilterBtn');

    if (!searchInput) return;

    function performSearch() {
        var query = searchInput.value.trim();
        if (!query) return;
        console.log('[Dashboard Search] Query:', query);
        searchInput.blur();
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    if (filterBtn) {
        filterBtn.addEventListener('click', function () {
            console.log('[Dashboard Search] Filter clicked');
        });
    }

    document.querySelectorAll('.search-tag').forEach(function (tag) {
        tag.addEventListener('click', function () {
            searchInput.value = this.getAttribute('data-tag') || this.textContent;
            searchInput.focus();
        });
    });
}

/* ==================== NOTIFICATIONS ==================== */
function initNotifications() {
    const toggle = document.getElementById('notificationToggle');
    const dropdown = document.getElementById('notificationDropdown');
    const clearBtn = document.getElementById('clearNotifications');
    const badge = document.getElementById('notificationBadge');

    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        closeAllDropdowns('notification');
        dropdown.classList.toggle('active');
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Mark all as read
    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            document.querySelectorAll('.notif-item.unread').forEach(function (item) {
                item.classList.remove('unread');
            });
            if (badge) {
                badge.style.display = 'none';
            }
            showToast('All notifications marked as read', 'success');

            // API call when backend is connected:
            // fetch(API_ENDPOINTS.markNotificationsRead, { method: 'PUT' })
        });
    }

    // Individual notification click
    document.querySelectorAll('.notif-item').forEach(function (item) {
        item.addEventListener('click', function () {
            this.classList.remove('unread');
            updateNotificationCount();
        });
    });
}

function updateNotificationCount() {
    const badge = document.getElementById('notificationBadge');
    const unreadCount = document.querySelectorAll('.notif-item.unread').length;

    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

/* ==================== CART DROPDOWN ==================== */
function initCartDropdown() {
    const toggle = document.getElementById('cartToggle');
    const dropdown = document.getElementById('cartDropdown');

    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        closeAllDropdowns('cart');
        dropdown.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });

    // Cart item remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var item = this.closest('.cart-item');
            if (item) {
                item.style.opacity = '0';
                item.style.transform = 'translateX(20px)';
                item.style.transition = 'all 0.25s ease';
                setTimeout(function () {
                    item.remove();
                    updateCartCount();
                }, 250);
            }
        });
    });
}

function updateCartCount() {
    var badge = document.getElementById('cartCountBadge');
    var items = document.querySelectorAll('.cart-item');
    var count = items.length;

    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }

    var countLabel = document.querySelector('.cart-item-count');
    if (countLabel) {
        countLabel.textContent = count + ' item' + (count !== 1 ? 's' : '');
    }
}

/* ==================== PROFILE DROPDOWN ==================== */
function initProfileDropdown() {
    const toggle = document.getElementById('profileToggle');
    const dropdown = document.getElementById('profileDropdown');

    if (!toggle || !dropdown) return;

    toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        closeAllDropdowns('profile');
        dropdown.classList.toggle('active');
    });

    document.addEventListener('click', function (e) {
        if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
            dropdown.classList.remove('active');
        }
    });
}

function closeAllDropdowns(except) {
    if (except !== 'notification') {
        var nd = document.getElementById('notificationDropdown');
        if (nd) nd.classList.remove('active');
    }
    if (except !== 'cart') {
        var cd = document.getElementById('cartDropdown');
        if (cd) cd.classList.remove('active');
    }
    if (except !== 'profile') {
        var pd = document.getElementById('profileDropdown');
        if (pd) pd.classList.remove('active');
    }
}

/* ==================== MOBILE MENU ==================== */
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const menu = document.getElementById('navMenu');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
        menu.classList.toggle('active');
        const icon = this.querySelector('i');
        if (menu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // Close menu on link click
    menu.querySelectorAll('.nav-link').forEach(function (link) {
        link.addEventListener('click', function () {
            menu.classList.remove('active');
            toggle.querySelector('i').className = 'fas fa-bars';
        });
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove('active');
            toggle.querySelector('i').className = 'fas fa-bars';
        }
    });
}

/* ==================== ORDER FILTER ==================== */
function initOrderFilter() {
    const filterSelect = document.getElementById('orderFilter');
    if (!filterSelect) return;

    filterSelect.addEventListener('change', function () {
        const filter = this.value;
        const rows = document.querySelectorAll('#ordersTable tbody tr');

        rows.forEach(function (row) {
            if (filter === 'all') {
                row.style.display = '';
            } else {
                const status = row.getAttribute('data-status');
                row.style.display = status === filter ? '' : 'none';
            }
        });
    });
}

/* ==================== STAT COUNTER ANIMATION ==================== */
function initStatCounters() {
    const counters = document.querySelectorAll('.stat-value[data-count]');
    if (counters.length === 0) return;

    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(function (counter) {
        observer.observe(counter);
    });
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'), 10);
    const duration = 1200;
    const startTime = performance.now();
    const startValue = 0;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(startValue + (target - startValue) * eased);

        if (target > 1000) {
            element.textContent = '₹' + current.toLocaleString('en-IN');
        } else {
            element.textContent = current;
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

/* ==================== DATE & TIME DISPLAY ==================== */
function initDateDisplay() {
    var dateEl = document.getElementById('currentDate');
    var timeEl = document.getElementById('currentTime');
    if (!dateEl) return;

    var dateOpts = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    var timeOpts = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };

    function updateDateTime() {
        var now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-IN', dateOpts);
        if (timeEl) {
            timeEl.textContent = now.toLocaleTimeString('en-IN', timeOpts);
        }
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);
}

/* ==================== SMOOTH SCROLL ==================== */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });

                // Update active nav link
                document.querySelectorAll('.nav-link').forEach(function (link) {
                    link.classList.remove('active');
                });
                const correspondingLink = document.querySelector('.nav-link[data-section="' + targetId.substring(1) + '"]');
                if (correspondingLink) {
                    correspondingLink.classList.add('active');
                }
            }
        });
    });
}

/* ==================== TOAST NOTIFICATION SYSTEM ==================== */
function showToast(message, type) {
    type = type || 'info';
    var container = document.getElementById('toastContainer');
    if (!container) return;

    var iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-times-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML =
        '<i class="toast-icon ' + (iconMap[type] || iconMap.info) + '"></i>' +
        '<span class="toast-message">' + message + '</span>' +
        '<button class="toast-close"><i class="fas fa-times"></i></button>';

    container.appendChild(toast);

    var closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', function () {
        removeToast(toast);
    });

    setTimeout(function () {
        removeToast(toast);
    }, 4000);
}

function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(function () {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/* ==================== UTILITY FUNCTIONS ==================== */

/**
 * Format currency in INR
 * Matches Spring Boot backend format: NumberFormat.getCurrencyInstance(new Locale("en", "IN"))
 */
function formatINR(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

/**
 * Format date for display
 * Matches Java LocalDateTime pattern: "dd MMM yyyy"
 */
function formatDate(dateString) {
    var options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

/**
 * Debounce utility
 */
function debounce(func, wait) {
    var timeout;
    return function () {
        var context = this;
        var args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            func.apply(context, args);
        }, wait);
    };
}

/**
 * Generic API fetch wrapper
 * Ready for Spring Boot backend integration
 *
 * Usage when backend is ready:
 * apiFetch(API_ENDPOINTS.orders).then(data => renderOrders(data));
 */
function apiFetch(url, options) {
    options = options || {};
    var defaults = {
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'same-origin'
    };

    var config = Object.assign({}, defaults, options);
    if (options.headers) {
        config.headers = Object.assign({}, defaults.headers, options.headers);
    }

    return fetch(url, config)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('API Error: ' + response.status);
            }
            return response.json();
        })
        .catch(function (error) {
            console.error('[API Error]', error);
            showToast('Something went wrong. Please try again.', 'error');
            throw error;
        });
}

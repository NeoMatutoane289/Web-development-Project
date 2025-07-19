// Dashboard Management with comprehensive error handling and debugging
class DashboardManager {
    constructor() {
        this.debugMode = true; // Set to false in production
        this.currentUser = null;
        this.profileData = null;

        this.log('DashboardManager constructor called');

        try {
            this.initializeUser();
            if (this.currentUser) {
                this.init();
            }
        } catch (error) {
            this.logError('Constructor error:', error);
            this.handleCriticalError('Failed to initialize dashboard');
        }
    }

    log(message, data = null) {
        if (this.debugMode) {
            console.log(`[Dashboard] ${message}`, data || '');
        }
    }

    logError(message, error) {
        console.error(`[Dashboard Error] ${message}`, error);
    }

    logWarn(message, data = null) {
        console.warn(`[Dashboard Warning] ${message}`, data || '');
    }

    initializeUser() {
        try {
            this.log('Initializing user authentication check');

            const savedUser = localStorage.getItem('currentUser');
            if (!savedUser) {
                this.log('No saved user found, redirecting to start page');
                this.redirectToStartPage();
                return;
            }

            this.currentUser = JSON.parse(savedUser);
            this.log('User loaded successfully', {
                id: this.currentUser.id,
                email: this.currentUser.email,
                isGuest: this.currentUser.isGuest || false
            });

            // Validate user object
            if (!this.currentUser.id) {
                throw new Error('Invalid user object - missing ID');
            }

        } catch (error) {
            this.logError('Error initializing user:', error);
            this.redirectToStartPage();
        }
    }

    init() {
        this.log('Initializing dashboard');

        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeDashboard());
            } else {
                this.initializeDashboard();
            }
        } catch (error) {
            this.logError('Error in init:', error);
            this.showError('Failed to initialize dashboard');
        }
    }

    initializeDashboard() {
        this.log('Starting dashboard initialization');

        try {
            this.verifyRequiredElements();
            this.loadStoreProfile();
            this.bindAllEvents();
            this.setupResponsiveHandlers();
            this.log('Dashboard initialization completed successfully');
        } catch (error) {
            this.logError('Error initializing dashboard:', error);
            this.showError('Failed to load dashboard. Please refresh the page.');
        }
    }

    verifyRequiredElements() {
        this.log('Verifying required DOM elements');

        const requiredElements = [
            'editProfileBtn',
            'logoutBtn',
            'displayStoreName',
            'displayBusinessType',
            'displayDescription',
            'displayPhone',
            'displayEmail',
            'displayWebsite',
            'displayFullAddress',
            'displayHours'
        ];

        const missingElements = [];

        requiredElements.forEach(elementId => {
            const element = document.getElementById(elementId);
            if (!element) {
                missingElements.push(elementId);
                this.logWarn(`Missing required element: ${elementId}`);
            }
        });

        if (missingElements.length > 0) {
            this.logWarn('Some elements are missing but continuing', missingElements);
        }

        // Verify navigation elements
        const navLinks = document.querySelectorAll('.nav-link');
        this.log(`Found ${navLinks.length} navigation links`);

        if (navLinks.length === 0) {
            this.logWarn('No navigation links found');
        }
    }

    loadStoreProfile() {
        this.log('Loading store profile');

        try {
            const profileKey = `storeProfile_${this.currentUser.id}`;
            const profileData = localStorage.getItem(profileKey);

            this.log('Profile key:', profileKey);
            this.log('Profile data exists:', !!profileData);

            if (!profileData) {
                this.log('No profile data found, redirecting to profile setup');
                this.redirectToProfileSetup();
                return;
            }

            this.profileData = JSON.parse(profileData);
            this.log('Profile loaded successfully', {
                storeName: this.profileData.storeName,
                businessType: this.profileData.businessType
            });

            this.displayProfile(this.profileData);

        } catch (error) {
            this.logError('Error loading store profile:', error);
            this.showError('Failed to load store profile. Please try again.');
        }
    }

    displayProfile(profile) {
        this.log('Displaying profile information');

        try {
            // Display basic information with error handling for each field
            this.safeSetElementText('displayStoreName', profile.storeName);
            this.safeSetElementText('displayBusinessType', this.formatBusinessType(profile.businessType));
            this.safeSetElementText('displayDescription', profile.description);

            // Display contact information
            this.safeSetElementText('displayPhone', this.formatPhone(profile.phone));
            this.safeSetElementText('displayEmail', profile.email);
            this.safeSetElementText('displayWebsite', this.formatWebsite(profile.website));

            // Display address
            const fullAddress = this.formatAddress(profile);
            this.safeSetElementText('displayFullAddress', fullAddress);

            // Display hours
            this.displayHours(profile.hours || {});

            this.log('Profile display completed successfully');

        } catch (error) {
            this.logError('Error displaying profile:', error);
            this.showError('Failed to display profile information.');
        }
    }

    safeSetElementText(elementId, value) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = value || '-';
                this.log(`Set ${elementId}:`, value || 'empty');
            } else {
                this.logWarn(`Element not found: ${elementId}`);
            }
        } catch (error) {
            this.logError(`Error setting text for ${elementId}:`, error);
        }
    }

    formatBusinessType(businessType) {
        if (!businessType) return '';

        const types = {
            'retail': 'Retail Store',
            'restaurant': 'Restaurant',
            'grocery': 'Grocery Store',
            'pharmacy': 'Pharmacy',
            'electronics': 'Electronics',
            'clothing': 'Clothing',
            'other': 'Other'
        };

        return types[businessType] || businessType;
    }

    formatPhone(phone) {
        if (!phone) return '';

        // Basic phone formatting (can be enhanced)
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0,3)}) ${cleaned.slice(3,6)}-${cleaned.slice(6)}`;
        }
        return phone;
    }

    formatWebsite(website) {
        if (!website) return '';

        // Ensure website has protocol
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
            return `https://${website}`;
        }
        return website;
    }

    formatAddress(profile) {
        try {
            const parts = [
                profile.address,
                profile.city,
                profile.state,
                profile.zipCode,
                profile.country
            ].filter(part => part && part.trim());

            return parts.length > 0 ? parts.join(', ') : '';
        } catch (error) {
            this.logError('Error formatting address:', error);
            return '';
        }
    }

    displayHours(hours) {
        this.log('Displaying operating hours');

        try {
            const hoursContainer = document.getElementById('displayHours');
            if (!hoursContainer) {
                this.logWarn('Hours container not found');
                return;
            }

            hoursContainer.innerHTML = '';

            const days = [
                { key: 'monday', label: 'Monday' },
                { key: 'tuesday', label: 'Tuesday' },
                { key: 'wednesday', label: 'Wednesday' },
                { key: 'thursday', label: 'Thursday' },
                { key: 'friday', label: 'Friday' },
                { key: 'saturday', label: 'Saturday' },
                { key: 'sunday', label: 'Sunday' }
            ];

            days.forEach(day => {
                try {
                    const hourItem = document.createElement('div');
                    hourItem.className = 'hour-item';

                    const daySpan = document.createElement('span');
                    daySpan.className = 'day';
                    daySpan.textContent = day.label;

                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'time';

                    if (hours && hours[day.key]) {
                        const dayData = hours[day.key];
                        if (dayData.closed) {
                            timeSpan.textContent = 'Closed';
                            timeSpan.style.color = '#e74c3c';
                        } else if (dayData.open && dayData.close) {
                            timeSpan.textContent = `${this.formatTime(dayData.open)} - ${this.formatTime(dayData.close)}`;
                            timeSpan.style.color = '#27ae60';
                        } else {
                            timeSpan.textContent = 'Not set';
                            timeSpan.style.color = '#95a5a6';
                        }
                    } else {
                        timeSpan.textContent = 'Not set';
                        timeSpan.style.color = '#95a5a6';
                    }

                    hourItem.appendChild(daySpan);
                    hourItem.appendChild(timeSpan);
                    hoursContainer.appendChild(hourItem);

                } catch (error) {
                    this.logError(`Error creating hour item for ${day.label}:`, error);
                }
            });

            this.log('Hours display completed');

        } catch (error) {
            this.logError('Error displaying hours:', error);
        }
    }

    formatTime(timeString) {
        try {
            if (!timeString) return '';

            // Convert 24-hour format to 12-hour format
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;

            return `${displayHour}:${minutes} ${ampm}`;
        } catch (error) {
            this.logError('Error formatting time:', error);
            return timeString; // Return original if formatting fails
        }
    }

    bindAllEvents() {
        this.log('Binding all event listeners');

        try {
            this.bindButtonEvents();
            this.bindNavigationEvents();
            this.bindWindowEvents();
            this.log('All events bound successfully');
        } catch (error) {
            this.logError('Error binding events:', error);
        }
    }

    bindButtonEvents() {
        this.log('Binding button events');

        // Edit Profile Button
        const editBtn = document.getElementById('editProfileBtn');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                this.log('Edit profile button clicked');
                this.handleEditProfile(e);
            });
            this.log('Edit profile button event bound');
        } else {
            this.logWarn('Edit profile button not found');
        }

        // Logout Button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                this.log('Logout button clicked');
                this.handleLogout(e);
            });
            this.log('Logout button event bound');
        } else {
            this.logWarn('Logout button not found');
        }
    }

    bindNavigationEvents() {
        this.log('Binding navigation events');

        const navLinks = document.querySelectorAll('.nav-link');
        this.log(`Found ${navLinks.length} navigation links to bind`);

        navLinks.forEach((link, index) => {
            try {
                const href = link.getAttribute('href');
                this.log(`Binding navigation link ${index + 1}:`, href);

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.log('Navigation link clicked:', href);
                    this.handleNavigation(href, e);
                });

            } catch (error) {
                this.logError(`Error binding navigation link ${index + 1}:`, error);
            }
        });
    }

    bindWindowEvents() {
        this.log('Binding window events');

        try {
            // Handle window resize for responsive design
            window.addEventListener('resize', () => {
                this.log('Window resized');
                this.handleResize();
            });

            // Handle page visibility changes
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    this.log('Page became visible, refreshing data');
                    this.refreshProfile();
                }
            });

            // Handle beforeunload for cleanup
            window.addEventListener('beforeunload', () => {
                this.log('Page unloading, performing cleanup');
                this.cleanup();
            });

        } catch (error) {
            this.logError('Error binding window events:', error);
        }
    }

    setupResponsiveHandlers() {
        this.log('Setting up responsive handlers');

        try {
            // Initial responsive check
            this.handleResize();
        } catch (error) {
            this.logError('Error setting up responsive handlers:', error);
        }
    }

    handleEditProfile(event) {
        this.log('Handling edit profile action');

        try {
            // Prevent any default behavior
            if (event) {
                event.preventDefault();
            }

            // Check permissions
            const permissions = this.checkPermissions();
            if (!permissions.canEdit) {
                this.showError('You do not have permission to edit the profile.');
                return;
            }

            // Redirect to store profile page for editing
            this.log('Redirecting to store profile page');
            window.location.href = 'storeProfile.html';

        } catch (error) {
            this.logError('Error handling edit profile:', error);
            this.showError('Failed to open edit profile page.');
        }
    }

    handleLogout(event) {
        this.log('Handling logout action');

        try {
            // Prevent any default behavior
            if (event) {
                event.preventDefault();
            }

            const confirmLogout = confirm('Are you sure you want to logout?');
            this.log('Logout confirmation:', confirmLogout);

            if (confirmLogout) {
                this.performLogout();
            }

        } catch (error) {
            this.logError('Error handling logout:', error);
            this.showError('Failed to logout properly.');
        }
    }

    performLogout() {
        this.log('Performing logout');

        try {
            // Clear user data
            localStorage.removeItem('currentUser');
            this.log('Current user data cleared');

            // Clear any session data if needed
            sessionStorage.clear();

            // Reset current user
            this.currentUser = null;
            this.profileData = null;

            // Redirect to start page
            this.log('Redirecting to start page');
            this.redirectToStartPage();

        } catch (error) {
            this.logError('Error performing logout:', error);
            // Force redirect even if there's an error
            window.location.href = 'startUpPage.html';
        }
    }

    handleNavigation(section, event) {
        this.log('Handling navigation to:', section);

        try {
            // Prevent default link behavior
            if (event) {
                event.preventDefault();
            }

            // Update active navigation state
            this.updateActiveNavigation(section);

            // Handle different sections
            switch(section) {
                case '#profile':
                    this.log('Navigating to profile section');
                    this.refreshProfile();
                    break;
                case '#inventory':
                    this.log('Navigating to inventory section');
                    this.showComingSoon('Inventory Management');
                    break;
                case '#reports':
                    this.log('Navigating to reports section');
                    this.showComingSoon('Reports & Analytics');
                    break;
                case '#settings':
                    this.log('Navigating to settings section');
                    this.showComingSoon('Settings');
                    break;
                default:
                    this.logWarn('Unknown navigation section:', section);
                    this.showError('Unknown page section');
            }

        } catch (error) {
            this.logError('Error handling navigation:', error);
            this.showError('Navigation failed');
        }
    }

    updateActiveNavigation(section) {
        try {
            // Remove active class from all nav links
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });

            // Add active class to clicked link
            const activeLink = document.querySelector(`a[href="${section}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                this.log('Updated active navigation to:', section);
            } else {
                this.logWarn('Could not find navigation link for:', section);
            }
        } catch (error) {
            this.logError('Error updating active navigation:', error);
        }
    }

    handleResize() {
        try {
            const width = window.innerWidth;
            this.log('Handling resize, width:', width);

            const sidebar = document.querySelector('.sidebar');
            const mainContent = document.querySelector('.main-content');

            if (width <= 768) {
                // Mobile view adjustments
                if (sidebar) sidebar.classList.add('mobile');
                if (mainContent) mainContent.classList.add('mobile');
                this.log('Applied mobile styles');
            } else {
                // Desktop view
                if (sidebar) sidebar.classList.remove('mobile');
                if (mainContent) mainContent.classList.remove('mobile');
                this.log('Applied desktop styles');
            }
        } catch (error) {
            this.logError('Error handling resize:', error);
        }
    }

    refreshProfile() {
        this.log('Refreshing profile data');

        try {
            this.loadStoreProfile();
        } catch (error) {
            this.logError('Error refreshing profile:', error);
            this.showError('Failed to refresh profile data.');
        }
    }

    checkPermissions() {
        try {
            if (!this.currentUser) {
                this.logWarn('No current user for permission check');
                return {
                    canEdit: false,
                    canDelete: false,
                    canExport: false
                };
            }

            if (this.currentUser.isGuest) {
                this.log('Guest user permissions applied');
                return {
                    canEdit: true,
                    canDelete: false,
                    canExport: false
                };
            }

            this.log('Full user permissions applied');
            return {
                canEdit: true,
                canDelete: true,
                canExport: true
            };
        } catch (error) {
            this.logError('Error checking permissions:', error);
            return {
                canEdit: false,
                canDelete: false,
                canExport: false
            };
        }
    }

    showComingSoon(featureName) {
        try {
            const message = `${featureName} feature is coming soon!\n\nThis feature will be available in a future update.`;
            alert(message);
            this.log('Showed coming soon message for:', featureName);
        } catch (error) {
            this.logError('Error showing coming soon message:', error);
        }
    }

    showError(message) {
        this.log('Showing error message:', message);

        try {
            // Create error notification
            this.createErrorNotification(message);
        } catch (error) {
            this.logError('Error showing error notification:', error);
            // Fallback to alert
            alert(`Error: ${message}`);
        }
    }

    createErrorNotification(message) {
        try {
            // Remove any existing error notifications
            const existingErrors = document.querySelectorAll('.error-notification');
            existingErrors.forEach(error => error.remove());

            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-notification';
            errorDiv.innerHTML = `
                <div class="error-content">
                    <span class="error-icon">⚠️</span>
                    <span class="error-message">${message}</span>
                    <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;

            // Add error styles if not already present
            this.addErrorStyles();

            // Add to page
            document.body.appendChild(errorDiv);

            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentElement) {
                    errorDiv.remove();
                }
            }, 5000);

        } catch (error) {
            this.logError('Error creating error notification:', error);
            alert(message);
        }
    }

    addErrorStyles() {
        if (!document.getElementById('errorStyles')) {
            const style = document.createElement('style');
            style.id = 'errorStyles';
            style.textContent = `
                .error-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: #e74c3c;
                    color: white;
                    padding: 15px;
                    border-radius: 5px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    z-index: 1000;
                    max-width: 400px;
                    animation: slideIn 0.3s ease-out;
                }
                
                .error-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .error-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    margin-left: auto;
                }
                
                .error-close:hover {
                    opacity: 0.7;
                }
                
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    validateProfile(profile) {
        try {
            const errors = [];

            if (!profile.storeName || profile.storeName.trim() === '') {
                errors.push('Store name is required');
            }

            if (profile.email && !this.isValidEmail(profile.email)) {
                errors.push('Invalid email format');
            }

            if (profile.website && !this.isValidUrl(profile.website)) {
                errors.push('Invalid website URL format');
            }

            return {
                isValid: errors.length === 0,
                errors: errors
            };
        } catch (error) {
            this.logError('Error validating profile:', error);
            return {
                isValid: false,
                errors: ['Validation error occurred']
            };
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    exportProfile() {
        try {
            const permissions = this.checkPermissions();
            if (!permissions.canExport) {
                this.showError('You do not have permission to export profile data.');
                return;
            }

            const profileData = localStorage.getItem(`storeProfile_${this.currentUser.id}`);
            if (!profileData) {
                this.showError('No profile data to export.');
                return;
            }

            const profile = JSON.parse(profileData);
            const dataStr = JSON.stringify(profile, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });

            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `store-profile-${profile.storeName || 'export'}.json`;
            link.click();

        } catch (error) {
            this.logError('Error exporting profile:', error);
            this.showError('Failed to export profile data.');
        }
    }

    handleCriticalError(message) {
        this.logError('Critical error:', message);

        try {
            alert(`Critical Error: ${message}\n\nThe page will be redirected to the start page.`);
            this.redirectToStartPage();
        } catch (error) {
            // Last resort
            window.location.href = 'startUpPage.html';
        }
    }

    redirectToStartPage() {
        this.log('Redirecting to start page');
        window.location.href = 'startUpPage.html';
    }

    redirectToProfileSetup() {
        this.log('Redirecting to profile setup');
        window.location.href = 'storeProfile.html';
    }

    cleanup() {
        this.log('Performing cleanup');

        try {
            // Remove any temporary data
            // Clear any intervals or timeouts if they exist
            // Perform any necessary cleanup
            this.log('Cleanup completed');
        } catch (error) {
            this.logError('Error during cleanup:', error);
        }
    }
}

// Global error handlers
window.addEventListener('error', (event) => {
    console.error('[Global Error]', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled Promise Rejection]', event.reason);
    event.preventDefault();
});

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Dashboard] DOM Content Loaded - Initializing Dashboard');

    try {
        window.dashboardManager = new DashboardManager();
    } catch (error) {
        console.error('[Dashboard] Failed to initialize:', error);
        alert('Failed to initialize dashboard. Please refresh the page and try again.');
    }
});

// Handle page load as backup
window.addEventListener('load', () => {
    console.log('[Dashboard] Window Load Event');

    // Only initialize if not already done
    if (!window.dashboardManager) {
        console.log('[Dashboard] Initializing from window load event');
        try {
            window.dashboardManager = new DashboardManager();
        } catch (error) {
            console.error('[Dashboard] Failed to initialize from window load:', error);
        }
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

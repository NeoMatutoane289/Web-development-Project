// Store Profile Management
class StoreProfileManager {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!this.currentUser) {
            window.location.href = 'startUpPage.html';
            return;
        }
        this.init();
    }

    init() {
        this.loadExistingProfile();
        this.bindEvents();
    }

    loadExistingProfile() {
        const existingProfile = localStorage.getItem(`storeProfile_${this.currentUser.id}`);
        if (existingProfile) {
            const profile = JSON.parse(existingProfile);
            this.populateForm(profile);
        }
    }

    populateForm(profile) {
        // Populate basic details
        document.getElementById('storeName').value = profile.storeName || '';
        document.getElementById('businessType').value = profile.businessType || '';
        document.getElementById('description').value = profile.description || '';
        
        // Populate contact info
        document.getElementById('phone').value = profile.phone || '';
        document.getElementById('email').value = profile.email || '';
        document.getElementById('website').value = profile.website || '';
        
        // Populate address
        document.getElementById('address').value = profile.address || '';
        document.getElementById('city').value = profile.city || '';
        document.getElementById('state').value = profile.state || '';
        document.getElementById('zipCode').value = profile.zipCode || '';
        document.getElementById('country').value = profile.country || '';
        
        // Populate hours
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            if (profile.hours && profile.hours[day]) {
                const dayData = profile.hours[day];
                const openInput = document.querySelector(`input[name="${day}Open"]`);
                const closeInput = document.querySelector(`input[name="${day}Close"]`);
                const closedCheckbox = document.querySelector(`input[name="${day}Closed"]`);
                
                if (openInput) openInput.value = dayData.open || '';
                if (closeInput) closeInput.value = dayData.close || '';
                if (closedCheckbox) closedCheckbox.checked = dayData.closed || false;
            }
        });
    }

    bindEvents() {
        const saveBtn = document.getElementById('saveProfileBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveProfile());
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => this.handleCancel());
        }

        // Handle closed checkboxes
        const closedCheckboxes = document.querySelectorAll('input[type="checkbox"][name$="Closed"]');
        closedCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const day = e.target.name.replace('Closed', '');
                const openInput = document.querySelector(`input[name="${day}Open"]`);
                const closeInput = document.querySelector(`input[name="${day}Close"]`);
                
                if (e.target.checked) {
                    openInput.disabled = true;
                    closeInput.disabled = true;
                    openInput.value = '';
                    closeInput.value = '';
                } else {
                    openInput.disabled = false;
                    closeInput.disabled = false;
                }
            });
        });
    }

    saveProfile() {
        const formData = new FormData(document.getElementById('storeProfileForm'));
        const profile = {};

        // Basic details
        profile.storeName = formData.get('storeName');
        profile.businessType = formData.get('businessType');
        profile.description = formData.get('description');
        
        // Contact info
        profile.phone = formData.get('phone');
        profile.email = formData.get('email');
        profile.website = formData.get('website');
        
        // Address
        profile.address = formData.get('address');
        profile.city = formData.get('city');
        profile.state = formData.get('state');
        profile.zipCode = formData.get('zipCode');
        profile.country = formData.get('country');
        
        // Hours
        profile.hours = {};
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        days.forEach(day => {
            profile.hours[day] = {
                open: formData.get(`${day}Open`) || '',
                close: formData.get(`${day}Close`) || '',
                closed: formData.get(`${day}Closed`) === 'on'
            };
        });

        // Validate required fields
        if (!profile.storeName) {
            alert('Store name is required');
            return;
        }

        // Save to localStorage
        profile.updatedAt = new Date().toISOString();
        localStorage.setItem(`storeProfile_${this.currentUser.id}`, JSON.stringify(profile));
        
        alert('Store profile saved successfully!');
        window.location.href = 'dashboard.html';
    }

    handleCancel() {
        if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
            window.location.href = 'dashboard.html';
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new StoreProfileManager();
});

// Authentication functionality
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.redirectToDashboard();
        }

        // Bind event listeners
        this.bindEvents();
    }

    bindEvents() {
        const signInBtn = document.getElementById('signInBtn');
        const signUpBtn = document.getElementById('signUpBtn');
        const freeModeBtn = document.getElementById('freeModeBtn');

        if (signInBtn) {
            signInBtn.addEventListener('click', () => this.handleSignIn());
        }

        if (signUpBtn) {
            signUpBtn.addEventListener('click', () => this.handleSignUp());
        }

        if (freeModeBtn) {
            freeModeBtn.addEventListener('click', () => this.handleGuestMode());
        }
    }

    async handleSignIn() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Simulate authentication (replace with real authentication)
        const user = this.authenticateUser(email, password);
        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.redirectToDashboard();
        } else {
            alert('Invalid credentials');
        }
    }

    async handleSignUp() {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (!email || !password) {
            alert('Please fill in all fields');
            return;
        }

        // Simulate user creation (replace with real registration)
        const user = this.createUser(email, password);
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Redirect to store profile setup
        window.location.href = 'storeProfile.html';
    }

    handleGuestMode() {
        const guestUser = {
            id: 'guest',
            email: 'guest@example.com',
            isGuest: true
        };
        this.currentUser = guestUser;
        localStorage.setItem('currentUser', JSON.stringify(guestUser));
        window.location.href = 'storeProfile.html';
    }

    authenticateUser(email, password) {
        // Simulate authentication - replace with real API call
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        return users.find(user => user.email === email && user.password === password);
    }

    createUser(email, password) {
        // Simulate user creation - replace with real API call
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const newUser = {
            id: Date.now().toString(),
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        return newUser;
    }

    redirectToDashboard() {
        // Check if user has a store profile
        const storeProfile = localStorage.getItem(`storeProfile_${this.currentUser.id}`);
        if (storeProfile) {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'storeProfile.html';
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'startUpPage.html';
    }
}

// Google Sign-In callback
function handleCredentialResponse(response) {
    // Handle Google Sign-In response
    console.log("Encoded JWT ID token: " + response.credential);
    // Decode and process the JWT token
    // For now, simulate successful Google login
    const authManager = new AuthManager();
    const googleUser = {
        id: 'google_' + Date.now(),
        email: 'matutoaneneo9@gmail.com', // Extract from JWT
        provider: 'google',
        createdAt: new Date().toISOString()
    };
    authManager.currentUser = googleUser;
    localStorage.setItem('currentUser', JSON.stringify(googleUser));
    authManager.redirectToDashboard();
}

// Initialize authentication when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});

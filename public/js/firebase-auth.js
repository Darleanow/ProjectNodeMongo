// Firebase Authentication Helper
class FirebaseAuthUI {
    constructor(firebaseConfig) {
      this.initFirebase(firebaseConfig);
      this.setupAuthUI();
      this.setupListeners();
    }
  
    // Initialize Firebase
    initFirebase(config) {
      firebase.initializeApp(config);
      this.auth = firebase.auth();
    }
  
    // Set up auth UI elements
    setupAuthUI() {
      // Login button
      this.loginWithGoogleBtn = document.getElementById('google-login');
      this.loginWithEmailBtn = document.getElementById('login-button');
      this.logoutBtn = document.getElementById('logout-button');
      
      // User info display
      this.userDisplay = document.getElementById('user-display');
      this.userEmail = document.getElementById('user-email');
      this.userAvatar = document.getElementById('user-avatar');
      
      // Form elements
      this.emailInput = document.getElementById('email');
      this.passwordInput = document.getElementById('password');
      this.loginForm = document.getElementById('login-form');
      
      // Error display
      this.errorElement = document.getElementById('login-error');
    }
  
    // Set up event listeners
    setupListeners() {
      // Google sign-in
      if (this.loginWithGoogleBtn) {
        this.loginWithGoogleBtn.addEventListener('click', () => {
          this.signInWithGoogle();
        });
      }
      
      // Email/password sign-in
      if (this.loginForm) {
        this.loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.signInWithEmail();
        });
      }
      
      // Logout
      if (this.logoutBtn) {
        this.logoutBtn.addEventListener('click', () => {
          this.signOut();
        });
      }
      
      // Listen for auth state changes
      this.auth.onAuthStateChanged(this.handleAuthStateChange.bind(this));
    }
  
    // Handle Google Sign-In
    signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      
      // Add scopes if needed
      // provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
      
      // Sign in with popup
      this.auth.signInWithPopup(provider)
        .then((result) => {
          // Get the access token
          const credential = result.credential;
          const token = credential.accessToken;
          const user = result.user;
          
          // Store the ID token
          user.getIdToken().then(idToken => {
            localStorage.setItem('authToken', idToken);
            this.updateUIAfterLogin(user);
          });
        })
        .catch((error) => {
          this.handleAuthError(error);
        });
    }
  
    // Handle Email/Password Sign-In
    signInWithEmail() {
      if (!this.emailInput || !this.passwordInput) return;
      
      const email = this.emailInput.value;
      const password = this.passwordInput.value;
      
      this.auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          
          user.getIdToken().then(token => {
            localStorage.setItem('authToken', token);
            this.updateUIAfterLogin(user);
          });
        })
        .catch((error) => {
          this.handleAuthError(error);
        });
    }
  
    // Handle Sign Out
    signOut() {
      this.auth.signOut()
        .then(() => {
          localStorage.removeItem('authToken');
          this.updateUIAfterLogout();
          
          if (window.location.pathname.includes('/profile')) {
            window.location.href = '/';
          }
        })
        .catch((error) => {
          console.error('Error signing out:', error);
        });
    }
  
    // Handle Auth State Change
    handleAuthStateChange(user) {
      if (user) {
        user.getIdToken().then(token => {
          localStorage.setItem('authToken', token);
          this.updateUIAfterLogin(user);
        });
      } else {
        localStorage.removeItem('authToken');
        this.updateUIAfterLogout();
      }
    }
  
    // Update UI after login
    updateUIAfterLogin(user) {
      // Update UI elements
      if (this.userDisplay) {
        this.userDisplay.style.display = 'flex';
      }
      
      if (this.userEmail) {
        this.userEmail.textContent = user.email || 'Anonymous User';
      }
      
      if (this.userAvatar && user.photoURL) {
        this.userAvatar.src = user.photoURL;
      }
      
      if (this.loginWithGoogleBtn) {
        this.loginWithGoogleBtn.style.display = 'none';
      }
      
      if (this.loginWithEmailBtn) {
        this.loginWithEmailBtn.style.display = 'none';
      }
      
      if (this.logoutBtn) {
        this.logoutBtn.style.display = 'inline-block';
      }
      
      // Hide login link in the header if exists
      const loginLink = document.getElementById('login-link');
      if (loginLink) {
        loginLink.style.display = 'none';
      }
      
      // Refresh the page if needed
      if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) {
        window.location.href = '/';
      }
    }
  
    // Update UI after logout
    updateUIAfterLogout() {
      if (this.userDisplay) {
        this.userDisplay.style.display = 'none';
      }
      
      if (this.loginWithGoogleBtn) {
        this.loginWithGoogleBtn.style.display = 'inline-block';
      }
      
      if (this.loginWithEmailBtn) {
        this.loginWithEmailBtn.style.display = 'inline-block';
      }
      
      if (this.logoutBtn) {
        this.logoutBtn.style.display = 'none';
      }
      
      // Show login link in the header if exists
      const loginLink = document.getElementById('login-link');
      if (loginLink) {
        loginLink.style.display = 'inline-block';
      }
    }
  
    // Handle authentication errors
    handleAuthError(error) {
      console.error('Authentication error:', error);
      
      // Display error message
      if (this.errorElement) {
        this.errorElement.textContent = error.message;
        this.errorElement.style.display = 'block';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
          this.errorElement.style.display = 'none';
        }, 5000);
      }
    }
  
    // Helper function to get auth token for API calls
    static getAuthToken() {
      return localStorage.getItem('authToken');
    }
  
    // Helper function to add auth token to fetch requests
    static async fetchWithAuth(url, options = {}) {
      const token = this.getAuthToken();
      
      if (!token) {
        return fetch(url, options);
      }
      
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        ...(options.headers || {})
      };
      
      return fetch(url, {
        ...options,
        headers: authHeaders
      });
    }
  }
  
  // Make the auth class available globally
  window.FirebaseAuthUI = FirebaseAuthUI;
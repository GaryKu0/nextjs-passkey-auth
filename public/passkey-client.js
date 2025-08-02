/**
 * Passkey Authentication Client Library
 * 
 * A simple JavaScript library for integrating with the Passkey Authentication Service.
 * Supports both registration and login flows with WebAuthn passkeys.
 * 
 * Dependencies: @simplewebauthn/browser
 * 
 * @version 1.0.0
 * @author SUKO KUO
 */

class PasskeyAuthClient {
    /**
     * Initialize the Passkey Authentication Client
     * 
     * @param {Object} config - Configuration object
     * @param {string} config.baseUrl - Base URL of the authentication service
     * @param {boolean} [config.enableCaptcha=false] - Whether CAPTCHA is enabled
     * @param {string} [config.tokenStorageKey='auth_token'] - Local storage key for auth token
     * @param {boolean} [config.debug=false] - Enable debug logging
     */
    constructor(config) {
        this.baseUrl = config.baseUrl;
        this.enableCaptcha = config.enableCaptcha || false;
        this.tokenStorageKey = config.tokenStorageKey || 'auth_token';
        this.debug = config.debug || false;
        this.token = localStorage.getItem(this.tokenStorageKey);

        // Check if SimpleWebAuthnBrowser is available
        if (typeof SimpleWebAuthnBrowser === 'undefined') {
            throw new Error('SimpleWebAuthnBrowser is not loaded. Please include @simplewebauthn/browser library.');
        }

        this.startRegistration = SimpleWebAuthnBrowser.startRegistration;
        this.startAuthentication = SimpleWebAuthnBrowser.startAuthentication;
    }

    /**
     * Log debug messages if debug mode is enabled
     * @private
     */
    _log(...args) {
        if (this.debug) {
            console.log('[PasskeyAuth]', ...args);
        }
    }

    /**
     * Make HTTP request with error handling
     * @private
     */
    async _request(url, options = {}) {
        try {
            this._log('Making request to:', url, options);
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const responseText = await response.text();
            this._log('Response status:', response.status);
            this._log('Response text:', responseText);

            if (!response.ok) {
                let errorMessage;
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || `HTTP ${response.status}`;
                } catch (e) {
                    errorMessage = `HTTP ${response.status}: ${responseText}`;
                }
                throw new Error(errorMessage);
            }

            return JSON.parse(responseText);
        } catch (error) {
            this._log('Request error:', error);
            throw error;
        }
    }

    /**
     * Check server CAPTCHA configuration before registration
     * @private
     */
    async _checkCaptchaConfig() {
        try {
            this._log('Checking server CAPTCHA configuration...');
            
            // Make a simple request to check if CAPTCHA is required
            const response = await this._request(`${this.baseUrl}/api/auth/register-begin`, {
                method: 'POST',
                body: JSON.stringify({ username: '__captcha_check__' })
            });
            
            return false; // No CAPTCHA required
        } catch (error) {
            // If error message indicates CAPTCHA is required
            if (error.message && (
                error.message.includes('CAPTCHA') || 
                error.message.includes('captcha') ||
                error.message.includes('verification')
            )) {
                return true; // CAPTCHA required
            }
            return false; // Other error, assume no CAPTCHA
        }
    }

    /**
     * Register a new user with passkey
     * 
     * @param {Object} userData - User registration data
     * @param {string} userData.username - Unique username
     * @param {string} [userData.email] - User email address
     * @param {string} [userData.displayName] - Display name for the user
     * @param {string} [userData.capToken] - CAPTCHA token (required if CAPTCHA is enabled)
     * @returns {Promise<Object>} User object and auth token
     */
    async register(userData) {
        const { username, email, displayName, capToken } = userData;

        if (!username) {
            throw new Error('Username is required');
        }

        // Pre-check for CAPTCHA requirements if not explicitly disabled
        if (!this.enableCaptcha && !capToken) {
            const captchaRequired = await this._checkCaptchaConfig();
            if (captchaRequired) {
                throw new Error('Remote registration not supported. CAPTCHA verification is required - please register directly on the server.');
            }
        }

        try {
            this._log('Starting registration for:', username);

            // Step 1: Begin registration - check for CAPTCHA requirements
            const requestBody = { username, email, displayName };
            if (this.enableCaptcha && capToken) {
                requestBody.capToken = capToken;
            }

            const options = await this._request(`${this.baseUrl}/api/auth/register-begin`, {
                method: 'POST',
                body: JSON.stringify(requestBody)
            });

            // Check if server returned CAPTCHA requirement error
            if (options.error && options.error.includes('CAPTCHA')) {
                throw new Error('Remote registration not supported. CAPTCHA is required - please register directly on the server.');
            }

            this._log('Registration options received:', options);

            // Step 2: Create credential with WebAuthn
            // Extract tempUserId and pass clean options to WebAuthn
            const { tempUserId, ...registrationOptions } = options;

            this._log('Creating WebAuthn credential...');
            const credential = await this.startRegistration(registrationOptions);
            this._log('Credential created:', credential);

            // Step 3: Complete registration
            this._log('Completing registration...');
            const result = await this._request(`${this.baseUrl}/api/auth/register-complete`, {
                method: 'POST',
                body: JSON.stringify({
                    username,
                    tempUserId,
                    expectedChallenge: options.challenge,
                    email,
                    displayName,
                    credential
                })
            });

            if (result.success) {
                this.token = result.token;
                localStorage.setItem(this.tokenStorageKey, this.token);
                this._log('Registration successful:', result.user);
                return result;
            } else {
                throw new Error(result.error || 'Registration failed');
            }

        } catch (error) {
            this._log('Registration error:', error);
            throw error;
        }
    }

    /**
     * Login with existing passkey
     * 
     * @param {Object} [loginData] - Login data
     * @param {string} [loginData.username] - Username (optional, for specific user login)
     * @returns {Promise<Object>} User object and auth token
     */
    async login(loginData = {}) {
        const { username } = loginData;

        try {
            this._log('Starting login', username ? `for user: ${username}` : '(any user)');

            // Step 1: Begin login
            const options = await this._request(`${this.baseUrl}/api/auth/login-begin`, {
                method: 'POST',
                body: JSON.stringify({
                    username: username || undefined
                })
            });

            this._log('Login options received:', options);

            // Step 2: Get credential with WebAuthn
            this._log('Getting WebAuthn credential...');
            const credential = await this.startAuthentication(options);
            this._log('Credential received:', credential);

            // Step 3: Complete login
            this._log('Completing login...');
            const result = await this._request(`${this.baseUrl}/api/auth/login-complete`, {
                method: 'POST',
                body: JSON.stringify({
                    credential,
                    expectedChallenge: options.challenge
                })
            });

            if (result.success) {
                this.token = result.token;
                localStorage.setItem(this.tokenStorageKey, this.token);
                this._log('Login successful:', result.user);
                return result;
            } else {
                throw new Error(result.error || 'Login failed');
            }

        } catch (error) {
            this._log('Login error:', error);
            throw error;
        }
    }

    /**
     * Get current user profile
     * 
     * @returns {Promise<Object>} User profile data
     */
    async getProfile() {
        // Always refresh token from localStorage before checking
        this.token = localStorage.getItem(this.tokenStorageKey);
        
        if (!this.token) {
            throw new Error('No authentication token. Please login first.');
        }

        try {
            this._log('Getting user profile...');

            const profile = await this._request(`${this.baseUrl}/api/auth/external`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            this._log('Profile retrieved:', profile);
            return profile;

        } catch (error) {
            this._log('Profile error:', error);
            // If token is invalid, clear it
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                this.logout();
            }
            throw error;
        }
    }

    /**
     * Logout current user
     * 
     * @returns {Promise<void>}
     */
    async logout() {
        try {
            if (this.token) {
                this._log('Logging out...');
                await this._request(`${this.baseUrl}/api/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                });
            }
        } catch (error) {
            this._log('Logout error (ignoring):', error);
            // Ignore logout errors and proceed with local cleanup
        } finally {
            // Always clear local state
            this.token = null;
            localStorage.removeItem(this.tokenStorageKey);
            this._log('Logged out successfully');
        }
    }

    /**
     * Check if user is currently authenticated
     * 
     * @returns {boolean} True if user has a valid token
     */
    isAuthenticated() {
        // Always check localStorage for the latest token state
        this.token = localStorage.getItem(this.tokenStorageKey);
        return !!this.token;
    }

    /**
     * Get current auth token
     * 
     * @returns {string|null} Current auth token or null
     */
    getToken() {
        // Always refresh from localStorage
        this.token = localStorage.getItem(this.tokenStorageKey);
        return this.token;
    }

    /**
     * SSO Login with external token
     * 
     * @param {Object} ssoData - SSO login data
     * @param {string} ssoData.ssoToken - JWT token from external SSO provider
     * @param {string} ssoData.provider - SSO provider identifier
     * @returns {Promise<Object>} User object and auth token
     */
    async ssoLogin(ssoData) {
        const { ssoToken, provider } = ssoData;

        if (!ssoToken || !provider) {
            throw new Error('SSO token and provider are required');
        }

        try {
            this._log('Starting SSO login with provider:', provider);

            const result = await this._request(`${this.baseUrl}/api/auth/sso`, {
                method: 'POST',
                body: JSON.stringify({
                    ssoToken,
                    provider
                })
            });

            if (result.success) {
                this.token = result.token;
                localStorage.setItem(this.tokenStorageKey, this.token);
                this._log('SSO login successful:', result.user);
                return result;
            } else {
                throw new Error(result.error || 'SSO login failed');
            }

        } catch (error) {
            this._log('SSO login error:', error);
            throw error;
        }
    }

    /**
     * Check SSO configuration
     * 
     * @param {string} provider - SSO provider identifier
     * @returns {Promise<Object>} SSO configuration
     */
    async checkSSOConfig(provider) {
        if (!provider) {
            throw new Error('Provider is required');
        }

        try {
            this._log('Checking SSO config for provider:', provider);

            const config = await this._request(`${this.baseUrl}/api/auth/sso?provider=${encodeURIComponent(provider)}`, {
                method: 'GET'
            });

            this._log('SSO config:', config);
            return config;

        } catch (error) {
            this._log('SSO config error:', error);
            throw error;
        }
    }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
    // CommonJS
    module.exports = PasskeyAuthClient;
} else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], function () {
        return PasskeyAuthClient;
    });
} else {
    // Browser global
    window.PasskeyAuthClient = PasskeyAuthClient;
}

# Passkey Authentication Service - Integration Guide

## Overview

This document provides comprehensive instructions for integrating with the Passkey Authentication Service. This service provides secure, passwordless authentication using WebAuthn passkeys with CAPTCHA protection for registration.

## Base URL

```
https://your-domain.com
```

Replace `your-domain.com` with your actual deployment domain.

## Authentication Flow

### 1. Registration Flow

The registration process consists of two steps: begin registration and complete registration.

#### Step 1: Begin Registration

**Endpoint:** `POST /api/auth/register-begin`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "user123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "capToken": "cap_token_from_captcha_widget"
}
```

**Field Descriptions:**

- `username` (required): Unique identifier for the user
- `email` (optional): User's email address
- `displayName` (optional): Human-readable display name
- `capToken` (conditional): CAPTCHA token obtained from Cap.js widget. Required only when CAPTCHA is enabled (`ENABLE_CAPTCHA=true`)

**Response (Success - 200):**

```json
{
  "challenge": "base64-encoded-challenge-data",
  "user": {
    "id": "base64-user-id",
    "name": "user123",
    "displayName": "John Doe"
  },
  "rp": {
    "name": "Your App Name",
    "id": "your-domain.com"
  },
  "pubKeyCredParams": [...],
  "authenticatorSelection": {...},
  "timeout": 60000,
  "attestation": "none"
}
```

**Response (Error - 400):**

```json
{
  "error": "Invalid CAPTCHA token"
}
```

#### Step 2: Complete Registration

**Endpoint:** `POST /api/auth/register-complete`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "user123",
  "credential": {
    "id": "credential-id",
    "rawId": "base64-raw-id",
    "response": {
      "attestationObject": "base64-attestation-object",
      "clientDataJSON": "base64-client-data"
    },
    "type": "public-key"
  }
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "username": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

### 2. Login Flow

#### Step 1: Begin Login

**Endpoint:** `POST /api/auth/login-begin`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "username": "user123"
}
```

**Note:** If `username` is omitted, the service will allow authentication with any registered passkey on the device.

**Response (Success - 200):**

```json
{
  "challenge": "base64-challenge",
  "allowCredentials": [
    {
      "id": "credential-id",
      "type": "public-key",
      "transports": ["internal", "hybrid"]
    }
  ],
  "timeout": 60000,
  "rpId": "your-domain.com",
  "userVerification": "required"
}
```

#### Step 2: Complete Login

**Endpoint:** `POST /api/auth/login-complete`

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "credential": {
    "id": "credential-id",
    "rawId": "base64-raw-id",
    "response": {
      "authenticatorData": "base64-authenticator-data",
      "clientDataJSON": "base64-client-data",
      "signature": "base64-signature",
      "userHandle": "base64-user-handle"
    },
    "type": "public-key"
  }
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "username": "user123",
    "email": "user@example.com",
    "displayName": "John Doe"
  }
}
```

### 3. User Profile

**Endpoint:** `GET /api/auth/me`

**Headers:**

```
Authorization: Bearer jwt-token
```

**Response (Success - 200):**

```json
{
  "username": "user123",
  "email": "user@example.com",
  "displayName": "John Doe"
}
```

### 4. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**

```
Authorization: Bearer jwt-token
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## CAPTCHA Integration

This service uses Cap.js for CAPTCHA protection during registration. CAPTCHA can be disabled via environment configuration for testing or specific deployment scenarios.

### CAPTCHA Configuration

The CAPTCHA system can be controlled using environment variables:

```bash
# Enable CAPTCHA (default)
ENABLE_CAPTCHA=true
NEXT_PUBLIC_ENABLE_CAPTCHA=true

# Disable CAPTCHA
ENABLE_CAPTCHA=false
NEXT_PUBLIC_ENABLE_CAPTCHA=false
```

When CAPTCHA is disabled:

- The registration API will not require a `capToken` parameter
- The client-side widget will not be rendered
- Server-side validation will be skipped automatically

### CAPTCHA Widget Setup

**Note:** Only include these when CAPTCHA is enabled.

Include the Cap.js widget script in your HTML:

```html
<script src="https://unpkg.com/@cap.js/widget@0.1.25/dist/index.js"></script>
```

### Widget Implementation

```html
<cap-widget
  site-key="your_site_key_here"
  endpoint="https://your-captcha-service.com"
  id="cap-widget"
>
</cap-widget>
```

### JavaScript Event Handling

```javascript
function setupCapEventListeners() {
  const widget = document.getElementById("cap-widget");

  if (widget) {
    widget.addEventListener("solve", (event) => {
      const token = event.detail.token;
      // Use this token in registration request
      console.log("CAPTCHA solved, token:", token);
    });

    widget.addEventListener("error", (event) => {
      console.error("CAPTCHA error:", event.detail.error);
    });

    widget.addEventListener("reset", () => {
      console.log("CAPTCHA reset");
    });
  }
}

// Setup after page load
document.addEventListener("DOMContentLoaded", setupCapEventListeners);
```

### Checking CAPTCHA Status

You can check if CAPTCHA is enabled by examining the environment variables or making a test API call:

```javascript
// Client-side check
const isCaptchaEnabled =
  process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== "false" &&
  process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== "disabled";

// Conditional widget setup
if (isCaptchaEnabled) {
  setupCapEventListeners();
} else {
  console.log("CAPTCHA disabled, skipping widget setup");
}
```

## Client-Side Implementation Examples

### Vanilla JavaScript Example

```javascript
class PasskeyAuth {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem("auth_token");
    // Check if CAPTCHA is enabled
    this.isCaptchaEnabled =
      process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== "false" &&
      process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== "disabled";
  }

  async register(username, email, displayName, capToken = null) {
    // Validate CAPTCHA token only if CAPTCHA is enabled
    if (this.isCaptchaEnabled && !capToken) {
      throw new Error("CAPTCHA token is required when CAPTCHA is enabled");
    }

    try {
      // Step 1: Begin registration
      const requestBody = { username, email, displayName };

      // Only include capToken if CAPTCHA is enabled
      if (this.isCaptchaEnabled && capToken) {
        requestBody.capToken = capToken;
      }

      const beginResponse = await fetch(
        `${this.baseUrl}/api/auth/register-begin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      if (!beginResponse.ok) {
        const error = await beginResponse.json();
        throw new Error(error.error || "Registration failed");
      }

      const options = await beginResponse.json();

      // Step 2: Create credential with WebAuthn
      const credential = await navigator.credentials.create({
        publicKey: options,
      });

      // Step 3: Complete registration
      const completeResponse = await fetch(
        `${this.baseUrl}/api/auth/register-complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            credential: {
              id: credential.id,
              rawId: Array.from(new Uint8Array(credential.rawId)),
              response: {
                attestationObject: Array.from(
                  new Uint8Array(credential.response.attestationObject)
                ),
                clientDataJSON: Array.from(
                  new Uint8Array(credential.response.clientDataJSON)
                ),
              },
              type: credential.type,
            },
          }),
        }
      );

      const result = await completeResponse.json();

      if (result.success) {
        this.token = result.token;
        localStorage.setItem("auth_token", this.token);
        return result.user;
      } else {
        throw new Error(result.error || "Registration completion failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async login(username = null) {
    try {
      // Step 1: Begin login
      const beginResponse = await fetch(
        `${this.baseUrl}/api/auth/login-begin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }
      );

      const options = await beginResponse.json();

      // Step 2: Get credential with WebAuthn
      const credential = await navigator.credentials.get({
        publicKey: options,
      });

      // Step 3: Complete login
      const completeResponse = await fetch(
        `${this.baseUrl}/api/auth/login-complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            credential: {
              id: credential.id,
              rawId: Array.from(new Uint8Array(credential.rawId)),
              response: {
                authenticatorData: Array.from(
                  new Uint8Array(credential.response.authenticatorData)
                ),
                clientDataJSON: Array.from(
                  new Uint8Array(credential.response.clientDataJSON)
                ),
                signature: Array.from(
                  new Uint8Array(credential.response.signature)
                ),
                userHandle: credential.response.userHandle
                  ? Array.from(new Uint8Array(credential.response.userHandle))
                  : null,
              },
              type: credential.type,
            },
          }),
        }
      );

      const result = await completeResponse.json();

      if (result.success) {
        this.token = result.token;
        localStorage.setItem("auth_token", this.token);
        return result.user;
      } else {
        throw new Error(result.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async getProfile() {
    if (!this.token) {
      throw new Error("No authentication token");
    }

    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${this.token}` },
    });

    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Failed to get profile");
    }
  }

  async logout() {
    if (!this.token) return;

    await fetch(`${this.baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}` },
    });

    this.token = null;
    localStorage.removeItem("auth_token");
  }
}

// Usage
const auth = new PasskeyAuth("https://your-domain.com");
```

### React Example

```jsx
import { useState, useEffect } from "react";

function usePasskeyAuth(baseUrl) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));

  const register = async (username, email, displayName, capToken) => {
    setLoading(true);
    try {
      // Begin registration
      const beginResponse = await fetch(`${baseUrl}/api/auth/register-begin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, displayName, capToken }),
      });

      if (!beginResponse.ok) {
        const error = await beginResponse.json();
        throw new Error(error.error);
      }

      const options = await beginResponse.json();

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: options,
      });

      // Complete registration
      const completeResponse = await fetch(
        `${baseUrl}/api/auth/register-complete`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username,
            credential: {
              id: credential.id,
              rawId: Array.from(new Uint8Array(credential.rawId)),
              response: {
                attestationObject: Array.from(
                  new Uint8Array(credential.response.attestationObject)
                ),
                clientDataJSON: Array.from(
                  new Uint8Array(credential.response.clientDataJSON)
                ),
              },
              type: credential.type,
            },
          }),
        }
      );

      const result = await completeResponse.json();

      if (result.success) {
        setToken(result.token);
        setUser(result.user);
        localStorage.setItem("auth_token", result.token);
        return result.user;
      } else {
        throw new Error(result.error);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username = null) => {
    setLoading(true);
    try {
      // Implementation similar to vanilla JS example
      // ... (login logic)
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      await fetch(`${baseUrl}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
  };

  return { user, loading, register, login, logout };
}
```

## Cross-Origin Configuration

### CORS Setup

Ensure your authentication service allows requests from your subdomain:

```javascript
// In your Next.js middleware or API routes
const allowedOrigins = [
  "https://your-main-domain.com",
  "https://subdomain.your-main-domain.com",
  "https://another-subdomain.your-main-domain.com",
];
```

### Domain Configuration

For WebAuthn to work across subdomains, ensure:

1. The `rpId` (Relying Party ID) is set to your main domain (e.g., `your-domain.com`)
2. All subdomains share the same `rpId`
3. Cookies (if used) are configured for the domain scope

## Security Considerations

### JWT Token Handling

- Store JWT tokens securely (consider `httpOnly` cookies for sensitive applications)
- Implement token refresh mechanism if needed
- Validate tokens on every protected endpoint

### CAPTCHA Security

- CAPTCHA tokens are single-use and expire after 10 minutes
- Always validate CAPTCHA tokens server-side
- Never expose the CAPTCHA secret key client-side

### WebAuthn Security

- Passkeys are bound to the origin/domain
- User verification is required by default
- Credentials cannot be extracted or transferred

## Error Handling

### Common Error Responses

```json
{
  "error": "Invalid CAPTCHA token",
  "code": "CAPTCHA_INVALID"
}
```

```json
{
  "error": "User already exists",
  "code": "USER_EXISTS"
}
```

```json
{
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

```json
{
  "error": "WebAuthn verification failed",
  "code": "WEBAUTHN_ERROR"
}
```

### Client-Side Error Handling

```javascript
try {
  await auth.register(username, email, displayName, capToken);
} catch (error) {
  if (error.message.includes("CAPTCHA")) {
    // Handle CAPTCHA error - maybe reset widget
  } else if (error.message.includes("already exists")) {
    // Handle user exists error
  } else {
    // Handle general error
  }
}
```

## Rate Limiting

The service implements rate limiting:

- Registration: 5 attempts per hour per IP
- Login: 10 attempts per hour per IP
- CAPTCHA validation: 20 attempts per hour per IP

## Testing

### Test Credentials

For development/testing, you can use these test values:

- Test usernames: `test_user_1`, `test_user_2`
- CAPTCHA site key: `d95908a5bb` (development)

### WebAuthn Testing

- Use Chrome DevTools > Application > WebAuthn for virtual authenticator testing
- Enable "Virtual authenticator environment" for automated testing

## Support and Troubleshooting

### Common Issues

1. **WebAuthn not supported**: Check browser compatibility
2. **CAPTCHA not loading**: Verify site key and endpoint URL
3. **Cross-origin errors**: Check CORS configuration
4. **Token expired**: Implement token refresh or re-authentication

### Browser Compatibility

- Chrome 67+
- Firefox 60+
- Safari 14+
- Edge 79+

### Debugging

Enable debug mode by adding `?debug=true` to your page URL. This will show additional console logs for troubleshooting.

---

**Last Updated:** August 2, 2025  
**Version:** 1.0.0  
**Contact:** [Your support contact information]

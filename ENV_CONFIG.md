# Environment Variables Configuration

This document describes all the customizable environment variables for the Passkey Authentication Demo.

## Required Variables

### Supabase Configuration

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### JWT Configuration

```env
JWT_SECRET=your_jwt_secret_key
```

### WebAuthn/Passkey Configuration

```env
NEXT_PUBLIC_RP_ID=your_domain.com
```

## Optional Customization Variables

### App Branding

```env
# Main page title (default: "$ passkey-auth --demo")
NEXT_PUBLIC_APP_TITLE=$ passkey-auth --demo

# Main page description (default: "Secure, passwordless authentication using WebAuthn passkeys")
NEXT_PUBLIC_APP_DESCRIPTION=Secure, passwordless authentication using WebAuthn passkeys

# Main page subtitle (default: "No passwords required - just your device's biometrics")
NEXT_PUBLIC_APP_SUBTITLE=No passwords required - just your device's biometrics

# Browser tab title (default: "Passkey Authentication Demo")
NEXT_PUBLIC_SITE_TITLE=Passkey Authentication Demo

# Meta description for SEO (default: "Secure passwordless authentication using WebAuthn passkeys")
NEXT_PUBLIC_SITE_DESCRIPTION=Secure passwordless authentication using WebAuthn passkeys
```

### WebAuthn Configuration

```env
# Relying Party name shown to users (default: "Passkey Demo")
NEXT_PUBLIC_RP_NAME=Passkey Demo

# Full origin URL (auto-generated if not provided)
NEXT_PUBLIC_RP_ORIGIN=https://your_domain.com

# Authenticator attachment preference (default: "platform")
# Options: "platform" | "cross-platform"
NEXT_PUBLIC_AUTHENTICATOR_ATTACHMENT=platform

# User verification requirement (default: "preferred")
# Options: "discouraged" | "preferred" | "required"
NEXT_PUBLIC_USER_VERIFICATION=preferred

# Resident key requirement (default: "preferred")
# Options: "discouraged" | "preferred" | "required"
NEXT_PUBLIC_RESIDENT_KEY=preferred

# Attestation type (default: "none")
# Options: "none" | "direct" | "enterprise"
NEXT_PUBLIC_ATTESTATION_TYPE=none
```

## WebAuthn Settings Explanation

### Authenticator Attachment

- **platform**: Prefers built-in authenticators (Touch ID, Face ID, Windows Hello)
- **cross-platform**: Prefers external authenticators (USB security keys, mobile devices)

### User Verification

- **discouraged**: Won't prompt for PIN/biometrics if not required
- **preferred**: Will use PIN/biometrics when available, but won't require it
- **required**: Always requires PIN/biometrics for multi-factor authentication

### Resident Key

- **discouraged**: Won't use discoverable credentials (saves space on security keys)
- **preferred**: Will create discoverable credentials when possible (enables usernameless login)
- **required**: Always creates discoverable credentials

### Attestation Type

- **none**: No attestation verification (recommended for most use cases)
- **direct**: Verify authenticator attestation (requires additional setup)
- **enterprise**: Enterprise attestation verification (for advanced enterprise use)

## Example Configuration

Here's an example `.env` file with custom branding:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
JWT_SECRET=your_jwt_secret_here

# WebAuthn/Passkey Configuration
NEXT_PUBLIC_RP_ID=myapp.com
NEXT_PUBLIC_RP_NAME=MyApp Secure Login
NEXT_PUBLIC_RP_ORIGIN=https://myapp.com

# App Branding
NEXT_PUBLIC_APP_TITLE=🔐 MyApp Security Demo
NEXT_PUBLIC_APP_DESCRIPTION=Experience the future of authentication with passkeys
NEXT_PUBLIC_APP_SUBTITLE=Login instantly with your fingerprint or face
NEXT_PUBLIC_SITE_TITLE=MyApp - Secure Passkey Authentication
NEXT_PUBLIC_SITE_DESCRIPTION=Secure, passwordless login for MyApp using WebAuthn passkeys

# WebAuthn Settings (recommended defaults)
NEXT_PUBLIC_AUTHENTICATOR_ATTACHMENT=platform
NEXT_PUBLIC_USER_VERIFICATION=preferred
NEXT_PUBLIC_RESIDENT_KEY=preferred
NEXT_PUBLIC_ATTESTATION_TYPE=none
```

# 🔐 Passkey Authentication with Next.js

<div align="center">
  <img src="public/icon.png" alt="Passkey Authentication Logo" width="120" height="120">
</div>

<br>

A modern, passwordless authentication system built with Next.js, WebAuthn passkeys, and Supabase. Features bot protection via CAPTCHA and is optimized for deployment on Cloudflare Pages with Edge Runtime compatibility.

## ✨ Features

- **🔑 Passwordless Authentication**: Secure login using WebAuthn passkeys (Face ID, Touch ID, Windows Hello)
- **🤖 Bot Protection**: Integrated Cap.js CAPTCHA system (configurable)
- **⚡ Edge Runtime**: Optimized for Cloudflare Pages deployment
- **🗃️ Supabase Integration**: User management and data persistence
- **📱 Responsive Design**: Modern UI with Tailwind CSS and shadcn/ui components
- **🔒 JWT Security**: Secure session management
- **🌐 Cross-Platform**: Works across devices and browsers
- **🛠️ TypeScript**: Full type safety throughout the codebase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Cloudflare Pages account (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/GaryKu0/passkey-nextjs.git
   cd passkey-nextjs
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   - Supabase credentials
   - JWT secret
   - Domain configuration
   - CAPTCHA settings (optional)

4. **Set up Supabase database**
   
   Create a `users` table in your Supabase project:
   ```sql
   CREATE TABLE users (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     username TEXT UNIQUE NOT NULL,
     email TEXT,
     display_name TEXT,
     credentials JSONB DEFAULT '[]'::jsonb,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Create indexes for better performance
   CREATE INDEX idx_users_username ON users(username);
   CREATE INDEX idx_users_email ON users(email);
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to `http://localhost:3000` to see the application.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `JWT_SECRET` | Secret for JWT signing | ✅ |
| `NEXT_PUBLIC_RP_ID` | WebAuthn Relying Party ID | ✅ |
| `NEXT_PUBLIC_RP_NAME` | Your application name | ✅ |
| `NEXT_PUBLIC_RP_ORIGIN` | Your application origin URL | ✅ |
| `ENABLE_CAPTCHA` | Enable/disable CAPTCHA protection | ⚠️ |
| `CAP_SECRET_KEY` | Cap.js secret key | ⚠️ |

⚠️ = Required only if CAPTCHA is enabled

### CAPTCHA Configuration

The application supports optional CAPTCHA protection during registration:

**Enable CAPTCHA:**
```bash
ENABLE_CAPTCHA=true
NEXT_PUBLIC_ENABLE_CAPTCHA=true
CAP_ENDPOINT=https://your-captcha-service.com
CAP_SECRET_KEY=your_secret_key
NEXT_PUBLIC_CAP_SITE_KEY=your_site_key
```

**Disable CAPTCHA (for development/testing):**
```bash
ENABLE_CAPTCHA=false
NEXT_PUBLIC_ENABLE_CAPTCHA=false
```

## 🚢 Deployment

### Cloudflare Pages

This application is optimized for Cloudflare Pages deployment:

1. **Connect your repository** to Cloudflare Pages
2. **Set build settings:**
   - Build command: `pnpm build`
   - Build output directory: `.next`
   - Framework preset: `Next.js (Static HTML Export)`

3. **Configure environment variables** in Cloudflare Pages dashboard

4. **Deploy** - Your application will be available on Cloudflare's global CDN

### Other Platforms

The application also works on:
- Vercel
- Netlify
- Railway
- Any platform supporting Next.js Edge Runtime

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │    │   API Routes    │    │    Supabase     │
│                 │    │                 │    │                 │
│ • React/Next.js │◄──►│ • Edge Runtime  │◄──►│ • User Storage  │
│ • WebAuthn      │    │ • JWT Auth      │    │ • PostgreSQL    │
│ • Cap.js Widget │    │ • CAPTCHA Check │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

- **Frontend**: Next.js 14 with App Router
- **Authentication**: WebAuthn via @simplewebauthn/browser
- **Database**: Supabase (PostgreSQL)
- **Runtime**: Edge Runtime for optimal performance
- **UI**: Tailwind CSS + shadcn/ui components
- **Bot Protection**: Cap.js CAPTCHA system

## 📚 API Documentation

Comprehensive API documentation is available in [`API_INTEGRATION_GUIDE.md`](./API_INTEGRATION_GUIDE.md).

### Quick API Reference

#### Registration
```bash
POST /api/auth/register-begin
POST /api/auth/register-complete
```

#### Authentication
```bash
POST /api/auth/login-begin
POST /api/auth/login-complete
```

#### User Management
```bash
GET /api/auth/me
POST /api/auth/logout
```

## 🛠️ Development

### Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript checks
```

### Project Structure

```
passkey-nextjs/
├── app/                    # Next.js App Router
│   ├── api/auth/          # Authentication API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components
│   └── ui/               # shadcn/ui components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   ├── auth-utils.ts     # Authentication utilities
│   ├── cap-utils.ts      # CAPTCHA utilities
│   ├── jwt.ts            # JWT handling
│   ├── supabase.ts       # Supabase client
│   └── webauthn.ts       # WebAuthn utilities
└── docs/                 # Documentation
```

## 🔒 Security Features

- **WebAuthn Standard**: Industry-standard passwordless authentication
- **CAPTCHA Protection**: Bot prevention during registration
- **JWT Security**: Secure session management with signed tokens
- **Edge Runtime**: Enhanced security with Cloudflare's global network
- **Input Validation**: Comprehensive server-side validation
- **Rate Limiting**: Built-in protection against abuse

## 🌍 Browser Support

| Browser | Version | Status |
|---------|---------|---------|
| Chrome | 67+ | ✅ Full Support |
| Firefox | 60+ | ✅ Full Support |
| Safari | 14+ | ✅ Full Support |
| Edge | 79+ | ✅ Full Support |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SimpleWebAuthn](https://simplewebauthn.dev/) - WebAuthn library
- [Supabase](https://supabase.com/) - Backend as a Service
- [Cap.js](https://cap.js.dev/) - CAPTCHA solution
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Cloudflare Pages](https://pages.cloudflare.com/) - Deployment platform

## 📞 Support

If you encounter any issues or have questions:

1. Check the [API Integration Guide](./API_INTEGRATION_GUIDE.md)
2. Search existing [Issues](https://github.com/GaryKu0/passkey-nextjs/issues)
3. Create a new issue with detailed information

---

**Built with ❤️ for the passwordless future**
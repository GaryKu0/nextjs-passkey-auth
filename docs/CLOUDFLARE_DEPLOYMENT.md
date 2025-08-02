# Cloudflare Pages Deployment Guide

This guide will walk you through deploying your Passkey Authentication application to Cloudflare Pages.

## Prerequisites

- Cloudflare account
- GitHub repository with your code
- Supabase project set up
- Domain name (optional, but recommended)

## Deployment Steps

### 1. Connect Repository

1. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
2. Click "Create a project"
3. Connect your GitHub account
4. Select your `passkey-nextjs` repository

### 2. Configure Build Settings

```yaml
Build command: pnpm build
Build output directory: .next
Framework preset: Next.js (Static HTML Export)
Node version: 18 or later
```

### 3. Environment Variables

In the Cloudflare Pages dashboard, go to Settings > Environment Variables and add:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# JWT Secret
JWT_SECRET=your_jwt_secret

# WebAuthn Configuration
NEXT_PUBLIC_RP_ID=your-domain.com
NEXT_PUBLIC_RP_NAME=Your App Name
NEXT_PUBLIC_RP_ORIGIN=https://your-domain.com

# App Branding
NEXT_PUBLIC_APP_TITLE=Your App Name
NEXT_PUBLIC_APP_DESCRIPTION=Your app description
NEXT_PUBLIC_APP_SUBTITLE=Your subtitle
NEXT_PUBLIC_SITE_TITLE=Your Site Title
NEXT_PUBLIC_SITE_DESCRIPTION=Your site description

# CAPTCHA (if enabled)
ENABLE_CAPTCHA=true
NEXT_PUBLIC_ENABLE_CAPTCHA=true
CAP_ENDPOINT=https://your-captcha-service.com
CAP_SECRET_KEY=your_cap_secret
NEXT_PUBLIC_CAP_ENDPOINT=https://your-captcha-service.com/your_site_key/
NEXT_PUBLIC_CAP_SITE_KEY=your_site_key

# WebAuthn Settings
NEXT_PUBLIC_AUTHENTICATOR_ATTACHMENT=platform
NEXT_PUBLIC_USER_VERIFICATION=preferred
NEXT_PUBLIC_RESIDENT_KEY=preferred
NEXT_PUBLIC_ATTESTATION_TYPE=none

# Cron Secret
CRON_SECRET=your_cron_secret
```

### 4. Custom Domain (Optional)

1. Go to Custom Domains in your Pages project
2. Add your domain (e.g., `auth.yourdomain.com`)
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_RP_ID` and `NEXT_PUBLIC_RP_ORIGIN` to match your domain

### 5. Deploy

1. Click "Save and Deploy"
2. Cloudflare will build and deploy your application
3. Your app will be available at `https://your-project.pages.dev`

## Post-Deployment

### 1. Update Supabase Configuration

1. Go to your Supabase project
2. Navigate to Authentication > URL Configuration
3. Add your Cloudflare Pages URL to:
   - Site URL
   - Redirect URLs

### 2. Test WebAuthn

1. Visit your deployed application
2. Try registering a new passkey
3. Test authentication flow
4. Verify CAPTCHA (if enabled)

### 3. Monitor Performance

Cloudflare provides excellent analytics:
- Page views and unique visitors
- Performance metrics
- Error rates
- Geographic distribution

## Optimizations

### Caching

Cloudflare automatically caches static assets. For API routes:

```javascript
// In your API routes, add cache headers
export async function GET() {
  return new Response(data, {
    headers: {
      'Cache-Control': 'no-store', // For auth endpoints
      // or
      'Cache-Control': 'max-age=3600', // For cacheable content
    }
  });
}
```

### Security Headers

Add security headers in `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

## Troubleshooting

### Build Failures

1. **Node.js version**: Ensure you're using Node.js 18+
2. **Dependencies**: Check for conflicting package versions
3. **Environment variables**: Verify all required variables are set

### WebAuthn Issues

1. **Domain mismatch**: Ensure `RP_ID` matches your deployed domain
2. **HTTPS required**: WebAuthn only works over HTTPS (automatic on Cloudflare)
3. **Cross-origin**: Check CORS configuration for subdomain deployments

### Performance Issues

1. **Enable Cloudflare optimization features**:
   - Auto Minify (CSS, HTML, JS)
   - Brotli compression
   - Image optimization

2. **Monitor Core Web Vitals** in Cloudflare Analytics

## Advanced Configuration

### Functions

You can use Cloudflare Functions for additional server-side logic:

```javascript
// functions/api/custom.js
export async function onRequest(context) {
  return new Response('Hello from Cloudflare Functions!');
}
```

### Workers

For more complex server-side requirements, consider Cloudflare Workers:

1. Create a Worker for advanced auth logic
2. Use Workers KV for session storage
3. Implement rate limiting with Workers

## Support

If you encounter issues:

1. Check [Cloudflare Pages documentation](https://developers.cloudflare.com/pages/)
2. Review build logs in the Cloudflare dashboard
3. Test locally with `pnpm build` and `pnpm start`
4. Check the [project issues](https://github.com/GaryKu0/passkey-nextjs/issues)

---

**Happy deploying!** 🚀

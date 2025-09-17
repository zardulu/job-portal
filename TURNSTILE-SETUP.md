# Cloudflare Turnstile Setup Guide

This guide explains how to set up Cloudflare Turnstile bot protection for your job portal.

## 🛡️ What's Implemented

✅ **Turnstile Protection** on critical forms:
- Job board creation form (`/create-job-board`)
- Job posting form (`/[slug]/post-job`)

✅ **Enhanced Security Features**:
- Server-side token verification
- Disposable email blocking
- Client IP logging for monitoring
- Form validation improvements

## 🔧 Setup Instructions

### 1. Get Cloudflare Turnstile Keys

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Turnstile** in the sidebar
3. Click **Add Site**
4. Configure your site:
   - **Site name**: Your job portal name
   - **Domain**: Your domain (e.g., `yoursite.com`)
   - **Widget mode**: Managed (recommended)
5. Copy the **Site Key** and **Secret Key**

### 2. Update Site Key

Replace the test site key in `/src/lib/turnstile.ts`:

```typescript
// Replace this line:
export const TURNSTILE_SITE_KEY = '1x00000000000000000000AA'; // Test key

// With your actual site key:
// export const TURNSTILE_SITE_KEY = 'YOUR_ACTUAL_SITE_KEY';
```

**Note**: The test key `0x4AAAAAAAkh5YjUn_oKKRxQ` will work for development testing, but you need your own keys for production.

### 3. Set Environment Variables

#### For Development (.env.local):
```bash
TURNSTILE_SECRET_KEY=your_secret_key_here
```

#### For Production (Cloudflare Workers):
```bash
# Set the secret in Cloudflare Workers
wrangler secret put TURNSTILE_SECRET_KEY
# Enter your secret key when prompted
```

### 4. Test the Implementation

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Test job board creation**:
   - Go to `/create-job-board`
   - Fill out the form
   - Verify the Turnstile widget appears
   - Submit and check for proper validation

3. **Test job posting**:
   - Create a job board first
   - Go to `/[slug]/post-job`
   - Fill out the form
   - Verify the Turnstile widget appears
   - Submit and check for proper validation

## 🔍 Verification

### Client-Side Verification
- Turnstile widget loads properly
- Form submission is disabled until verification completes
- Error messages appear if verification fails

### Server-Side Verification
Check your server logs for these messages:
- `✅ Turnstile verification successful`
- `❌ Turnstile verification failed`
- `📊 Board creation attempt from IP: [IP]`
- `📊 Job posting attempt from IP: [IP]`

## 🚨 Security Features

### 1. **Disposable Email Blocking**
The following domains are blocked:
- 10minutemail.com
- guerrillamail.com
- tempmail.org
- yopmail.com
- And 15+ more...

### 2. **IP-Based Monitoring**
All form submissions are logged with IP addresses for monitoring patterns.

### 3. **Enhanced Validation**
- Proper email format validation
- Required field validation
- Turnstile token validation

## 🎛️ Configuration Options

### Turnstile Widget Customization

You can customize the Turnstile widget in both form files:

```javascript
turnstileWidget = window.turnstile.render(widget, {
    sitekey: TURNSTILE_SITE_KEY,
    theme: 'light', // 'light', 'dark', 'auto'
    size: 'normal', // 'normal', 'compact'
    // ... other options
});
```

### Adding More Disposable Email Domains

Edit `/src/lib/turnstile.ts` and add domains to the `DISPOSABLE_EMAIL_DOMAINS` array:

```typescript
export const DISPOSABLE_EMAIL_DOMAINS = [
    // ... existing domains
    'newdisposableemail.com',
    'anothertempmail.com'
];
```

## 🔄 Rate Limiting (Future Enhancement)

The code includes rate limiting hooks but requires Cloudflare KV storage:

```typescript
// In wrangler.toml, add:
[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your_kv_namespace_id"
```

## 🐛 Troubleshooting

### Common Issues:

1. **"Security verification not configured"**
   - Ensure `TURNSTILE_SECRET_KEY` is set in your environment

2. **Turnstile widget not loading**
   - Check browser console for JavaScript errors
   - Verify the site key is correct
   - Ensure your domain is added to Turnstile configuration

3. **"Security verification failed"**
   - Check server logs for specific error codes
   - Verify the secret key matches your Turnstile configuration
   - Ensure the site key and secret key are from the same Turnstile site

4. **Form submission blocked**
   - Make sure the Turnstile widget has completed verification
   - Check that the `cf-turnstile-response` field contains a token

### Debug Mode:

Enable debug logging by checking browser console and server logs for detailed Turnstile information.

## 📊 Monitoring

Monitor these metrics in your Cloudflare Dashboard:
- Turnstile verification attempts
- Success/failure rates
- Blocked bot attempts
- Geographic distribution of requests

## 🚀 Deployment

1. **Update your site key** in production code
2. **Set the secret key** using Wrangler:
   ```bash
   wrangler secret put TURNSTILE_SECRET_KEY
   ```
3. **Deploy your application**:
   ```bash
   npm run deploy
   ```

## 📈 Next Steps

Consider implementing:
- Rate limiting with Cloudflare KV
- Advanced bot detection rules
- Analytics integration
- A/B testing different Turnstile configurations

Your job portal is now protected against automated spam and bot attacks! 🛡️

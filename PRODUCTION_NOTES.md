# Production Deployment Notes

This document outlines important considerations and recommendations for deploying this application to production.

## 🔴 Critical: Distributed Rate Limiting

### Current Implementation

The application currently uses **in-memory rate limiting** with JavaScript `Map` objects. This implementation:

- ✅ Works perfectly for development and single-server deployments
- ❌ Does NOT work across multiple server instances
- ❌ Resets on server restart
- ❌ Not suitable for horizontal scaling or serverless/edge deployments

### Affected Files

Rate limiting is implemented in:
- `src/routes/(auth)/sign-in/+page.server.ts`
- `src/routes/(auth)/forgot-password/+page.server.ts`
- `src/routes/(auth)/magic-link/+page.server.ts`
- `src/routes/(auth)/auth/reset-password/+server.ts`
- `src/routes/(auth)/auth/resend-verification/+server.ts`

### Production Solutions

For production, you **must** implement distributed rate limiting. Here are recommended options:

#### Option 1: Redis (Recommended)

**Pros:**
- Battle-tested and reliable
- Low latency
- Supports TTL natively
- Works with most hosting providers

**Implementation:**
```typescript
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN
})

// Example rate limit check
async function checkRateLimit(key: string) {
  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW / 1000)
  }
  return count <= MAX_ATTEMPTS
}
```

**Setup:**
- [Upstash](https://upstash.com) - Serverless Redis (easiest)
- [Redis Cloud](https://redis.com/cloud) - Managed Redis
- Self-hosted Redis

#### Option 2: Upstash Rate Limiting

**Pros:**
- Purpose-built for rate limiting
- Serverless-friendly
- Simple API
- No Redis knowledge needed

**Installation:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Implementation:**
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
});

const { success } = await ratelimit.limit(clientIp);
if (!success) {
  return fail(429, { message: "Too many attempts" });
}
```

#### Option 3: Cloudflare Rate Limiting

If deploying to Cloudflare Pages/Workers:
- Use [Cloudflare Rate Limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
- Built-in, no external services needed
- Fast and integrated

#### Option 4: Database-based Rate Limiting

**Pros:**
- No additional infrastructure
- Uses existing database

**Cons:**
- Slower than Redis
- Requires cleanup job for expired entries
- More database load

### Migration Guide

To migrate from in-memory to distributed rate limiting:

1. **Choose a provider** (Upstash recommended for serverless)

2. **Install dependencies:**
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```

3. **Update `src/lib/utils/rate-limit.ts`:**
   ```typescript
   // Replace Map-based storage with Redis
   import { Ratelimit } from "@upstash/ratelimit";
   import { Redis } from "@upstash/redis";

   export class RateLimiter {
     private ratelimit: Ratelimit;

     constructor(config: RateLimitConfig) {
       this.ratelimit = new Ratelimit({
         redis: Redis.fromEnv(),
         limiter: Ratelimit.slidingWindow(
           config.maxAttempts,
           `${config.windowMs / 1000}s`
         ),
       });
     }

     async check(key: string): Promise<RateLimitResult> {
       const { success, remaining } = await this.ratelimit.limit(key);
       return {
         allowed: success,
         message: success ? "" : "Too many attempts. Please try again later."
       };
     }
   }
   ```

4. **Add environment variables:**
   ```env
   UPSTASH_REDIS_REST_URL=your-redis-url
   UPSTASH_REDIS_REST_TOKEN=your-redis-token
   ```

5. **Update `src/lib/server/env.ts`** to validate new env vars

---

## 🔒 Security Checklist

Before deploying to production:

- [ ] Implement distributed rate limiting (see above)
- [ ] Set up proper environment variables
- [ ] Enable HTTPS only (should be automatic on most platforms)
- [ ] Configure CORS if needed
- [ ] Set up monitoring and alerting
- [ ] Review Supabase Row Level Security (RLS) policies
- [ ] Enable database backups
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Review and adjust rate limit thresholds for your use case
- [ ] Set up log aggregation (don't log PII)

---

## 🚀 Deployment Platforms

### Recommended Platforms

**Vercel** (Recommended)
- Automatic HTTPS
- Edge Functions support
- Easy integration with Upstash
- Zero-config deployment

**Cloudflare Pages**
- Edge deployment
- Built-in rate limiting
- Free tier generous

**Netlify**
- Good SvelteKit support
- Edge Functions available
- Easy setup

### Environment Variables Required

```env
# Required for all deployments
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Required for production rate limiting
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Optional but recommended
NODE_ENV=production
```

---

## 📊 Monitoring Recommendations

### What to Monitor

1. **Authentication failures** - Spike may indicate attack
2. **Rate limit hits** - Adjust thresholds if too many legitimate users hit limits
3. **Session refresh failures** - May indicate token issues
4. **API response times** - Should stay under 200ms
5. **Error rates** - Track 4xx and 5xx responses

### Tools

- **Supabase Dashboard** - Built-in monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay and monitoring
- **Upstash Analytics** - Rate limit analytics (if using Upstash)

---

## 🔧 Performance Optimization

### Current Optimizations

✅ On-demand cleanup for rate limits (no setInterval)
✅ Automatic session refresh before expiration
✅ Efficient cookie filtering (only Supabase cookies sent to client)
✅ SSR with proper hydration

### Additional Recommendations

1. **Enable caching headers** for static assets
2. **Use CDN** for static files (automatic on Vercel/Cloudflare)
3. **Optimize images** with SvelteKit's image optimization
4. **Enable gzip/brotli compression** (usually automatic)
5. **Monitor bundle size** - Keep under 100KB initial load

---

## 🆘 Troubleshooting

### Rate Limiting Issues

**Problem:** Legitimate users getting rate limited
- **Solution:** Increase `maxAttempts` or decrease `windowMs` in rate limit configs

**Problem:** Rate limits not working across servers
- **Solution:** Implement distributed rate limiting (see above)

### Session Issues

**Problem:** Users getting logged out frequently
- **Solution:** Session refresh is implemented. Check Supabase project settings for token expiration time.

**Problem:** Session not refreshing
- **Solution:** Check browser console for errors. Ensure Supabase client is properly initialized.

### CSRF Issues

**Problem:** API calls failing with 403 CSRF errors
- **Solution:** Ensure requests include proper `Origin` or `Referer` headers. For non-browser API clients, you may need to adjust CSRF validation.

---

## 📞 Support

- **Supabase Docs:** https://supabase.com/docs
- **SvelteKit Docs:** https://kit.svelte.dev
- **Upstash Docs:** https://upstash.com/docs

---

## 📝 License

[Your License Here]

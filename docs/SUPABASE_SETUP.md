# Supabase Setup Guide

This guide will help you set up Supabase for your Passkey Authentication application.

## Creating a Supabase Project

### 1. Sign Up / Log In

1. Go to [Supabase](https://supabase.com/)
2. Sign up for a free account or log in
3. Click "New Project"

### 2. Project Configuration

```
Organization: Your Organization
Name: passkey-auth (or your preferred name)
Database Password: Generate a strong password
Region: Choose closest to your users
```

## Database Setup

### 1. Create Users Table

Go to the SQL Editor in your Supabase dashboard and run:

```sql
-- Create the users table
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
CREATE INDEX idx_users_created_at ON users(created_at);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();
```

### 2. Set Up Row Level Security (RLS)

```sql
-- Enable RLS on the users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Policy: Allow public user creation (for registration)
CREATE POLICY "Allow public user creation" ON users
    FOR INSERT WITH CHECK (true);
```

### 3. Optional: Create Additional Tables

If you want to track authentication sessions:

```sql
-- Create sessions table (optional)
CREATE TABLE user_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
```

## Authentication Configuration

### 1. Disable Email Auth (Optional)

Since we're using passkeys, you might want to disable email authentication:

1. Go to Authentication > Settings
2. Under "Auth Providers", disable "Email"
3. Keep "Phone" disabled if not needed

### 2. Configure JWT Settings

In Authentication > Settings > JWT Settings:

```
JWT expiry limit: 3600 (1 hour) or your preferred duration
```

### 3. URL Configuration

In Authentication > URL Configuration:

```
Site URL: https://your-domain.com
Redirect URLs: 
- https://your-domain.com
- https://your-app.pages.dev (for Cloudflare Pages)
```

## API Keys and Environment Variables

### 1. Get Your API Keys

From Settings > API:

```bash
# Copy these values to your .env file
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Service role key (keep this secret!)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Environment Configuration

Update your `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Testing Your Setup

### 1. Test Database Connection

Create a simple test file to verify connection:

```javascript
// test-supabase.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .single();
    
    if (error) throw error;
    console.log('✅ Supabase connection successful');
    console.log('Users count:', data);
  } catch (error) {
    console.error('❌ Supabase connection failed:', error);
  }
}

testConnection();
```

### 2. Test User Creation

In your app, try creating a test user:

```javascript
const { data, error } = await supabase
  .from('users')
  .insert([
    {
      username: 'testuser',
      email: 'test@example.com',
      display_name: 'Test User'
    }
  ])
  .select();
```

## Security Best Practices

### 1. RLS Policies

Always use Row Level Security for data protection:

```sql
-- Example: More restrictive policies
CREATE POLICY "Users can only view public profiles" ON users
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            auth.uid() = id OR 
            (email IS NOT NULL AND email != '')
        )
    );
```

### 2. API Key Security

- Never expose `service_role_key` client-side
- Use `anon_key` for client-side operations
- Rotate keys periodically

### 3. Database Backup

Enable automatic backups:

1. Go to Settings > Database
2. Enable "Point in Time Recovery"
3. Configure backup retention

## Monitoring and Maintenance

### 1. Database Usage

Monitor your usage in the Supabase dashboard:
- Database size
- API requests
- Active connections

### 2. Performance Optimization

```sql
-- Add more indexes based on your queries
CREATE INDEX idx_users_credentials_gin ON users USING gin(credentials);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE username = 'testuser';
```

### 3. Logs and Analytics

Enable logging in Settings > Logs:
- API logs
- Database logs
- Auth logs

## Troubleshooting

### Common Issues

1. **Connection errors**: Check URL and API keys
2. **RLS blocking queries**: Verify policies are correct
3. **CORS issues**: Update URL configuration
4. **Performance**: Add appropriate indexes

### Debug Mode

Enable debug mode in your client:

```javascript
const supabase = createClient(url, key, {
  debug: process.env.NODE_ENV === 'development'
});
```

## Production Considerations

### 1. Scaling

- Monitor database performance
- Consider connection pooling for high traffic
- Use appropriate instance size

### 2. Security

- Regular security updates
- Monitor for unusual activity
- Implement rate limiting

### 3. Backup Strategy

- Enable point-in-time recovery
- Test restore procedures
- Consider cross-region backups

---

**Your Supabase setup is now ready!** 🎉

For more advanced features, check the [Supabase documentation](https://supabase.com/docs).

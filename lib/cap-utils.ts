// Cap.js Standalone Server Integration
const CAP_ENDPOINT = process.env.CAP_ENDPOINT;
const CAP_SECRET_KEY = process.env.CAP_SECRET_KEY;
const CAP_SITE_KEY = process.env.NEXT_PUBLIC_CAP_SITE_KEY;
const ENABLE_CAPTCHA = process.env.ENABLE_CAPTCHA !== 'false' && process.env.ENABLE_CAPTCHA !== 'disabled';

export async function validateCapToken(token: string): Promise<boolean> {
  // If CAPTCHA is disabled, always return true
  if (!ENABLE_CAPTCHA) {
    console.log('CAPTCHA validation disabled, skipping validation');
    return true;
  }

  if (!CAP_ENDPOINT || !CAP_SECRET_KEY || !CAP_SITE_KEY) {
    console.error('Cap.js configuration missing: CAP_ENDPOINT, CAP_SECRET_KEY or CAP_SITE_KEY not set');
    return false;
  }

  try {
    const response = await fetch(`${CAP_ENDPOINT}/${CAP_SITE_KEY}/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: CAP_SECRET_KEY,
        response: token,
      }),
    });

    const result = await response.json();
    console.log('Cap validation result:', result);
    
    return result.success === true;
  } catch (error) {
    console.error('Cap token validation error:', error);
    return false;
  }
}

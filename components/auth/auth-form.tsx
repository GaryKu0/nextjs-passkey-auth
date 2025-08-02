'use client';

import { useState, useRef, useEffect } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, UserPlus, LogIn, Shield } from 'lucide-react';

interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
}

// Declare cap-widget as a custom element
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'cap-widget': any;
    }
  }
}

export function AuthForm({ onAuthSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [capToken, setCapToken] = useState('');
  const capWidgetRef = useRef<any>(null);
  
  // Check if CAPTCHA is enabled
  const isCaptchaEnabled = process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== 'false' && 
                          process.env.NEXT_PUBLIC_ENABLE_CAPTCHA !== 'disabled';

  // Load Cap widget script
  useEffect(() => {
    // Only load CAPTCHA if it's enabled
    if (!isCaptchaEnabled) {
      console.log('CAPTCHA disabled, skipping widget setup');
      return;
    }

    const setupCapEventListeners = () => {
      const widget = document.querySelector('#cap-register');
      if (widget) {
        console.log('Setting up Cap event listeners on widget:', widget);
        
        const handleCapSolve = (e: any) => {
          console.log('Cap solve event:', e.detail);
          setCapToken(e.detail.token);
          setError(''); // Clear any previous CAPTCHA errors
        };

        const handleCapError = (e: any) => {
          console.error('Cap error event:', e.detail);
          setError('CAPTCHA verification failed. Please try again.');
          setCapToken('');
        };

        const handleCapReset = (e: any) => {
          console.log('Cap reset event:', e.detail);
          setCapToken('');
        };

        widget.addEventListener('solve', handleCapSolve);
        widget.addEventListener('error', handleCapError);
        widget.addEventListener('reset', handleCapReset);
      } else {
        console.log('Cap widget not found, retrying in 1 second...');
        setTimeout(setupCapEventListeners, 1000);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@cap.js/widget@0.1.25';
    script.async = true;
    
    script.onload = () => {
      console.log('Cap widget script loaded');
      // Add a small delay to ensure the widget is ready
      setTimeout(() => {
        setupCapEventListeners();
      }, 500);
    };
    
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [isCaptchaEnabled]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    // Only check CAPTCHA token if CAPTCHA is enabled
    if (isCaptchaEnabled && !capToken) {
      setError('Please complete the CAPTCHA verification');
      return;
    }

    console.log('Starting registration with capToken:', capToken);
    setIsLoading(true);
    setError('');

    try {
      // Begin registration
      const beginResponse = await fetch('/api/auth/register-begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(),
          capToken 
        }),
      });

      const beginData = await beginResponse.json();
      
      if (!beginResponse.ok) {
        throw new Error(beginData.error || 'Registration failed');
      }

      // Start WebAuthn registration
      const credential = await startRegistration(beginData.options);

      // Complete registration
      const completeResponse = await fetch('/api/auth/register-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          expectedChallenge: beginData.options.challenge,
          username: username.trim(),
          tempUserId: beginData.tempUserId,
          email: email.trim() || undefined,
          displayName: displayName.trim() || undefined,
        }),
      });

      const completeData = await completeResponse.json();
      
      if (!completeResponse.ok) {
        throw new Error(completeData.error || 'Registration failed');
      }

      onAuthSuccess(completeData.user);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Begin authentication
      const beginResponse = await fetch('/api/auth/login-begin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() || undefined }),
      });

      const beginData = await beginResponse.json();
      
      if (!beginResponse.ok) {
        throw new Error(beginData.error || 'Login failed');
      }

      // Start WebAuthn authentication
      const credential = await startAuthentication(beginData.options);

      // Complete authentication
      const completeResponse = await fetch('/api/auth/login-complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential,
          expectedChallenge: beginData.options.challenge,
        }),
      });

      const completeData = await completeResponse.json();
      
      if (!completeResponse.ok) {
        throw new Error(completeData.error || 'Login failed');
      }

      onAuthSuccess(completeData.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2 px-4 sm:px-6">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <span className="text-blue-600 text-base sm:text-lg">🔐</span>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
            <span className="text-blue-600">{'>'}</span> authenticate
          </CardTitle>
          <CardDescription className="text-gray-600">
            <span className="text-xs sm:text-sm">WebAuthn passkey authentication</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 px-4 sm:px-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6 h-9 sm:h-10">
              <TabsTrigger value="login" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="text-xs">$</span>
                login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <span className="text-xs">+</span>
                register
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800 text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="register-username" className="text-xs sm:text-sm font-medium text-gray-700">
                    username: <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="register-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username"
                    required
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="register-email" className="text-xs sm:text-sm font-medium text-gray-700">
                    email: <span className="text-gray-400">optional</span>
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="register-displayName" className="text-xs sm:text-sm font-medium text-gray-700">
                    display_name: <span className="text-gray-400">optional</span>
                  </Label>
                  <Input
                    id="register-displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your Name"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                </div>

                {/* Cap CAPTCHA Widget - Only show if CAPTCHA is enabled */}
                {isCaptchaEnabled && (
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                      verification: <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <cap-widget
                        ref={capWidgetRef}
                        id="cap-register"
                        data-cap-api-endpoint={process.env.NEXT_PUBLIC_CAP_ENDPOINT}
                        data-cap-i18n-initial-state="I'm human"
                        data-cap-i18n-verifying-label="Verifying..."
                        data-cap-i18n-solved-label="Verified ✓"
                        data-cap-i18n-error-label="Try again"
                        style={{
                          '--cap-widget-width': '100%',
                          '--cap-widget-height': '44px',
                          '--cap-widget-padding': '12px',
                          '--cap-background': '#ffffff',
                          '--cap-border-color': '#e5e7eb',
                          '--cap-border-radius': '6px',
                          '--cap-color': '#374151',
                          '--cap-font': 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
                          '--cap-checkbox-size': '18px',
                          '--cap-checkbox-border': '1px solid #d1d5db',
                          '--cap-checkbox-border-radius': '3px',
                          '--cap-checkbox-background': '#f9fafb',
                          '--cap-checkbox-margin': '0px',
                          '--cap-gap': '10px',
                          '--cap-spinner-color': '#3b82f6',
                          '--cap-spinner-background-color': '#e5e7eb',
                          '--cap-spinner-thickness': '2px',
                          'display': 'block',
                          'width': '100%',
                          'border': '1px solid #e5e7eb',
                          'border-radius': '6px',
                          'min-height': '44px'
                        }}
                      />
                    </div>
                    {capToken && (
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <Shield className="w-3 h-3" />
                        Human verification complete
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading || (isCaptchaEnabled && !capToken)}
                  className="w-full h-10 sm:h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium transition-colors text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      <span className="text-xs sm:text-sm">creating_account...</span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm">$ create --with-passkey</span>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="login-username" className="text-xs sm:text-sm font-medium text-gray-700">
                    username: <span className="text-gray-400">optional</span>
                  </Label>
                  <Input
                    id="login-username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_username || null"
                    className="h-10 sm:h-11 text-sm sm:text-base"
                  />
                                  <div className="mt-2">
                  <p className="text-xs text-gray-500 leading-tight">
                    Leave empty to authenticate with any passkey on this device
                  </p>
                </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 sm:h-11 bg-green-600 hover:bg-green-700 text-white font-medium transition-colors text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                      <span className="text-xs sm:text-sm">authenticating...</span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm">$ auth --passkey</span>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-4 sm:mt-6 text-center px-2">
            <p className="text-xs text-gray-500 leading-tight">
              Uses device biometrics: Face ID | Touch ID | Windows Hello
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
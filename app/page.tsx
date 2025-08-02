"use client";

import { useState, useEffect } from "react";
import { AuthForm } from "@/components/auth/auth-form";
import { UserProfile } from "@/components/auth/user-profile";

interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error("Auth check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <div className="flex-1 flex flex-col justify-center px-4 py-6 sm:py-8 lg:py-12">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-6 sm:mb-8 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
              $ {process.env.NEXT_PUBLIC_APP_TITLE || "passkey-demo"}
            </h1>
            <div className="max-w-2xl mx-auto space-y-1 sm:space-y-2">
              <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600 leading-relaxed">
                <span className="text-blue-600">{">"}</span>{" "}
                <span className="inline-block">
                  {process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
                    "Secure, passwordless authentication using WebAuthn passkeys"}
                </span>
              </p>
              <p className="text-xs sm:text-sm text-gray-500 font-normal leading-relaxed">
                {/* */}{" "}
                <span className="inline-block">
                  {process.env.NEXT_PUBLIC_APP_SUBTITLE ||
                    "No passwords required - just your device's biometrics"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            {user ? (
              <UserProfile user={user} onLogout={handleLogout} />
            ) : (
              <AuthForm onAuthSuccess={handleAuthSuccess} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

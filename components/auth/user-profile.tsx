"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Mail, Calendar, Key } from "lucide-react";

interface User {
  id: string;
  username: string;
  email?: string;
  displayName?: string;
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 sm:px-0">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-4 px-4 sm:px-6">
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-purple-600">
              <AvatarFallback className="text-white text-lg sm:text-xl font-bold">
                {getInitials(user.displayName || user.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
                <span className="text-blue-600">{">"}</span>{" "}
                {user.displayName || user.username}
              </CardTitle>
              {user.displayName && (
                <CardDescription className="text-gray-600">
                  @{user.username}
                </CardDescription>
              )}
            </div>
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-800 border-green-200 text-xs sm:text-sm"
            >
              <span className="text-xs mr-1">✓</span>
              authenticated
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500 text-xs sm:text-sm">$</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  username:
                </p>
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {user.username}
                </p>
              </div>
            </div>

            {user.email && (
              <div className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-xs sm:text-sm">@</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-700">
                    email:
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3 p-2 sm:p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500 text-xs sm:text-sm">✓</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-700">
                  status:
                </p>
                <p className="text-xs sm:text-sm text-green-600 font-medium">
                  active && verified
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t">
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant="outline"
              className="w-full h-10 sm:h-11 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-sm sm:text-base"
            >
              <span className="text-xs mr-2">$</span>
              {isLoggingOut ? "logout..." : "logout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

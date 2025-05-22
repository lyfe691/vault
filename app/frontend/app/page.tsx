"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Shield, LogOut } from "lucide-react";

export default function Home() {
  const { isAuthenticated, isLoading, payload, checkRole, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Vault</CardTitle>
            <CardDescription>
              Internal tool access portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => router.push("/login")}
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            {payload?.preferred_username && (
              <>Hello, <span className="font-medium">{payload.preferred_username}</span></>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <div className="flex gap-2">
              {checkRole("admin") && (
                <Badge variant="secondary" className="gap-1">
                  <Shield className="h-3 w-3" />
                  Admin
                </Badge>
              )}
              {checkRole("user") && (
                <Badge variant="outline" className="gap-1">
                  <User className="h-3 w-3" />
                  User
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {checkRole("admin") && (
              <Button 
                onClick={() => router.push("/admin")}
                className="w-full"
                variant="default"
              >
                Admin Dashboard
              </Button>
            )}
            
            {checkRole("user") && (
              <Button 
                onClick={() => router.push("/user")}
                className="w-full"
                variant={checkRole("admin") ? "outline" : "default"}
              >
                User Dashboard
              </Button>
            )}
          </div>

          <Button 
            onClick={handleLogout}
            variant="ghost"
            className="w-full gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

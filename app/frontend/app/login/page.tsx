"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { AlertCircle } from "lucide-react";
import { AuthApi } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { isAuthenticated, isLoading, refreshAuth, getRedirectPath } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            const redirectPath = getRedirectPath();
            router.push(redirectPath);
        }
    }, [isLoading, isAuthenticated, router, getRedirectPath]);

    const handleLogin = async () => {
        if (!username || !password) {
            setError("Username and password are required");
            return;
        }

        setLoading(true);
        setError("");
        try {
            await AuthApi.login({ username, password });
            await refreshAuth();
            const redirectPath = getRedirectPath();
            toast.success("Login successful");
            router.push(redirectPath);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
            toast.error("Login failed");
        } finally {
            setLoading(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="pt-6">
                        <p className="text-center text-muted-foreground">Checking authentication status...</p>
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
                        Enter your credentials to access your account
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            disabled={loading}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button 
                        onClick={handleLogin} 
                        disabled={loading} 
                        className="w-full"
                        size="lg"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </Button>
                </CardContent>

                <CardFooter>
                    <p className="text-sm text-muted-foreground text-center w-full">
                        Demo credentials: <span className="font-medium">demo</span> / <span className="font-medium">pass1234</span>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
            
            // Successfully logged in, refresh authentication state
            await refreshAuth();
            
            // Get appropriate redirect path based on user roles
            const redirectPath = getRedirectPath();
            toast.success("Login successful");
            
            // Redirect to the appropriate page
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
            <div className="max-w-md mx-auto py-12">
                <p>Checking authentication status...</p>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-12">
            <h1 className="text-2xl font-bold mb-6">Login</h1>

            <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mb-4"
                required
                disabled={loading}
                onKeyDown={handleKeyDown}
            />

            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4"
                required
                disabled={loading}
                onKeyDown={handleKeyDown}
            />

            <Button onClick={handleLogin} disabled={loading} className="w-full">
                {loading ? "Logging in..." : "Login"}
            </Button>

            <p className="text-sm text-gray-500 mt-4">
                Demo credentials: demo, password: pass1234 
            </p>

            {error && (
                <div className="mt-4 bg-red-100 p-3 rounded-md border border-red-300 flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-500 text-sm">
                        {error}
                    </p>
                </div>
            )}
        </div>
    )
}
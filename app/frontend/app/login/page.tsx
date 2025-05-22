"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const { isAuthenticated, isLoading, refreshAuth } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/user");
        }
    }, [isLoading, isAuthenticated, router]);

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include', // Important: This sends and receives cookies
                body: new URLSearchParams({
                    username, 
                    password,
                }),
            });
            
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error_description || "Login failed");
            }
            
            await refreshAuth();
            
            router.push("/user");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

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
            />

            <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mb-4"
                required
                disabled={loading}
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
"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { parseJwt, TokenPayload } from "@/lib/auth";
import { useAuth } from "@/lib/useAuth";
import { AlertCircle } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");
    const [tokenInfo, setTokenInfo] = useState<TokenPayload | null>(null);
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/user");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedToken = localStorage.getItem("access_token");
            if (storedToken) {
                setToken(storedToken);
                try {
                    const decoded = parseJwt(storedToken);
                    setTokenInfo(decoded);
                } catch (error) {
                    console.error("Error decoding token:", error);
                }
            }
        }
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                credentials: 'include',
                body: new URLSearchParams({
                    username, 
                    password,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error_description || "Login failed");
            
            localStorage.setItem("access_token", data.access_token);
            setToken(data.access_token);
            
            try {
                const decoded = parseJwt(data.access_token);
                setTokenInfo(decoded);
                console.log("Token decoded successfully:", decoded);
                
                const validationRes = await fetch("http://localhost:5000/me", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${data.access_token}`
                    }
                });
                
                if (validationRes.ok) {
                    console.log("Token validated with backend");
                    if (decoded?.realm_access?.roles?.includes('user')) {
                        router.push("/user");
                    } else {
                        console.warn("Token does not have 'user' role:", decoded?.realm_access?.roles);
                    }
                } else {
                    throw new Error("Token validation failed");
                }
            } catch (error) {
                console.error("Error validating token:", error);
                setError("Authentication successful but token validation failed");
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    const clearToken = () => {
        localStorage.removeItem("access_token");
        setToken("");
        setTokenInfo(null);
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

            {token && (
                <Button onClick={clearToken} variant="outline" className="w-full mt-2">
                    Clear Token
                </Button>
            )}

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

            {/* no success message cause we're getting redirected or showing the token anyway */}

            {token && (
                <div className="mt-6">
                    <h2 className="text-lg font-bold mb-2">Token</h2>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-40 text-xs">
                        {token}
                    </pre>
                    
                    {tokenInfo && (
                        <>
                            <h2 className="text-lg font-bold mb-2 mt-4">Decoded Token</h2>
                            <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                                {JSON.stringify(tokenInfo, null, 2)}
                            </pre>
                            
                            <h3 className="font-bold mt-4">Roles:</h3>
                            <ul className="list-disc pl-5">
                                {tokenInfo.realm_access?.roles?.map((role: string) => (
                                    <li key={role}>{role}</li>
                                )) || <li>No roles found</li>}
                            </ul>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
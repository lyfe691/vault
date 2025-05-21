"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useRouter } from "next/navigation";


export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [token, setToken] = useState("");

    const handleLogin = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("http://localhost:5000/login", {
                method: "POST", 
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    username, 
                    password,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error_description || "Login failed");
            localStorage.setItem("access_token", data.access_token);
            setToken(data.access_token);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
        } finally {
            setLoading(false);
        }
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

            {error && <p className="text-red-500 mt-4">{error}</p>}

            {token && (
                <div className="mt-6">
                    <h2 className="text-lg font-bold mb-2">Token</h2>
                    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-40">
                        {token}
                    </pre>
                </div>
            )}

        </div>
    )
}
"use client"

import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function UserPage() {
    const { isAuthenticated, isLoading, checkRole, payload, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        } else if (!isLoading && isAuthenticated && !checkRole("user")) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, checkRole, router]);

    const handleLogout = async () => {
        await logout();
        router.push("/login");
    };

    if (isLoading) {
        return (
            <div className="max-w-md mx-auto py-12">
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto py-12">
                <p>You need to be authenticated to view this page.</p>
                <Button 
                    onClick={() => router.push("/login")}
                >
                    Go to Login
                </Button>
            </div>
        );
    }

    if (!checkRole("user")) {
        return (
            <div className="max-w-md mx-auto py-12">
                <p>You don't have the required role to access this page.</p>
                <Button 
                    onClick={() => router.push("/login")}
                >
                    Go to Login
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-12">
            <h1 className="text-2xl font-bold mb-6">User Page</h1>
            <p className="text-lg mb-4">Welcome, {payload?.preferred_username || 'User'}</p>
            <p className="text-sm text-gray-500">
                This is a protected page for users only.
            </p>
            <Button onClick={handleLogout} className="mt-4">Logout</Button>
        </div>
    )
}

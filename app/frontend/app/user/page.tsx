"use client"

import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"
import { useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { TokenPayload } from "@/lib/auth"

export default function UserPage() {
    const { isAuthenticated, isLoading, checkRole, payload } = useAuth();
    const router = useRouter();
    const logout = useCallback(() => {
        localStorage.removeItem("access_token");
        router.push("/login");
    }, [router]);

    const checkAuth = useCallback(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem("access_token");
            if (!token) {
                router.push("/login");
                return false;
            }
            return true;
        }
        return false;
    }, [router]);

    useEffect(() => {
        if (!isLoading) {
            const hasToken = checkAuth();
            
            if (hasToken && isAuthenticated === false) {
                router.push("/login");
            } else if (hasToken && isAuthenticated && !checkRole("user")) {
                router.push("/login");
            }
        }
    }, [isLoading, isAuthenticated, checkRole, router, checkAuth]);

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
                <button 
                    onClick={() => router.push("/login")}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go to Login
                </button>
            </div>
        );
    }

    if (!checkRole("user")) {
        return (
            <div className="max-w-md mx-auto py-12">
                <p>You don't have the required role to access this page.</p>
                <button 
                    onClick={() => router.push("/login")}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Go to Login
                </button>
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
            <Button onClick={logout} className="mt-4">Logout</Button>
        </div>
    )
}

"use client"

import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Shield, ArrowLeft } from "lucide-react"

export default function UserPage() {
    const { isAuthenticated, isLoading, checkRole, payload, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        } else if (!isLoading && isAuthenticated && !checkRole("user") && !checkRole("admin")) {
            // Only redirect if user has neither user nor admin role
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, checkRole, router]);

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
                        <CardTitle className="text-xl">Authentication Required</CardTitle>
                        <CardDescription>You need to be signed in to view this page</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={() => router.push("/login")}
                            className="w-full"
                        >
                            Go to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!checkRole("user") && !checkRole("admin")) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Access Denied</CardTitle>
                        <CardDescription>You don't have the required permissions to access this page</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button 
                            onClick={() => router.push("/")}
                            className="w-full"
                        >
                            Go to Home
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
                    <CardTitle className="text-2xl">User Dashboard</CardTitle>
                    <CardDescription>
                        Welcome, <span className="font-medium">{payload?.preferred_username || 'User'}</span>
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <div className="flex justify-center">
                        <div className="flex gap-2">
                            {checkRole("admin") && (
                                <Badge variant="secondary" className="gap-1">
                                    <Shield className="h-3 w-3" />
                                    Admin Access
                                </Badge>
                            )}
                            <Badge variant="outline" className="gap-1">
                                <User className="h-3 w-3" />
                                User
                            </Badge>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-muted-foreground">
                            This is the user dashboard area. User-specific features and content would be displayed here.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Button 
                            onClick={() => router.push("/")}
                            variant="outline"
                            className="w-full gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>

                        {checkRole("admin") && (
                            <Button 
                                onClick={() => router.push("/admin")}
                                variant="outline"
                                className="w-full"
                            >
                                Go to Admin Dashboard
                            </Button>
                        )}
                    </div>
                </CardContent>

                <CardFooter>
                    <Button 
                        onClick={handleLogout}
                        variant="ghost"
                        className="w-full"
                    >
                        Sign Out
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}

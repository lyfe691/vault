"use client"

import { useAuth } from "@/lib/useAuth"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, ArrowLeft } from "lucide-react"

export default function AdminPage() {
    const { isAuthenticated, isLoading, checkRole, payload, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        } else if (!isLoading && isAuthenticated && !checkRole("admin")) {
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

    if (!checkRole("admin")) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">Access Denied</CardTitle>
                        <CardDescription>You don't have admin permissions to access this page</CardDescription>
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
                    <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                    <CardDescription>
                        Welcome, <span className="font-medium">{payload?.preferred_username || 'Admin'}</span>
                    </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                    <div className="flex justify-center">
                        <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                        </Badge>
                    </div>

                    <div className="text-center">
                        <p className="text-muted-foreground">
                            This is the admin dashboard area. Administrative features and system management tools would be displayed here.
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

                        {checkRole("user") && (
                            <Button 
                                onClick={() => router.push("/user")}
                                variant="outline"
                                className="w-full"
                            >
                                Go to User Dashboard
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

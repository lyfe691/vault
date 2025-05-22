"use client"

import { useEffect, useState, useCallback } from "react";
import { TokenPayload } from "./auth";

export function useAuth() {
    const [payload, setPayload] = useState<TokenPayload | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkAuthentication = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch("http://localhost:5000/me", {
                method: "GET",
                credentials: 'include',
            });
            
            if (response.ok) {
                const data = await response.json();
                setPayload(data.user);
                setIsAuthenticated(true);
            } else {
                setPayload(null);
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Error checking authentication:", error);
            setPayload(null);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthentication();
        
        const intervalId = setInterval(checkAuthentication, 60000);
        
        return () => clearInterval(intervalId);
    }, [checkAuthentication]);

    const checkRole = useCallback((role: string): boolean => {
        if (!payload || !payload.realm_access || !payload.realm_access.roles) {
            return false;
        }
        return payload.realm_access.roles.includes(role);
    }, [payload]);

    const logout = useCallback(async () => {
        try {
            await fetch("http://localhost:5000/logout", {
                method: "POST",
                credentials: 'include',
            });
            setPayload(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error("Error during logout:", error);
        }
    }, []);

    return { payload, isAuthenticated, isLoading, checkRole, logout, refreshAuth: checkAuthentication };
}
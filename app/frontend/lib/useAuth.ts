"use client"

import { useEffect, useState, useCallback } from "react";
import { parseJwt, hasRole, TokenPayload } from "./auth";

export function useAuth() {
    const [token, setToken] = useState<string | null>(null);
    const [payload, setPayload] = useState<TokenPayload | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadToken = useCallback(async () => {
        if (typeof window !== 'undefined') {
            setIsLoading(true);
            const storedToken = localStorage.getItem("access_token");
            setToken(storedToken);

            if (storedToken) {
                try {
                    const decoded = parseJwt(storedToken);
                    
                    const response = await fetch("http://localhost:5000/me", {
                        method: "GET",
                        headers: {
                            "Authorization": `Bearer ${storedToken}`
                        }
                    });
                    
                    if (response.ok) {
                        setPayload(decoded);
                        setIsAuthenticated(true);
                        console.log("Token validated successfully with backend");
                    } else {
                        console.error("Backend rejected token:", await response.text());
                        localStorage.removeItem("access_token");
                        setPayload(null);
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error("Error validating token:", error);
                    localStorage.removeItem("access_token");
                    setPayload(null);
                    setIsAuthenticated(false);
                }
            } else {
                setPayload(null);
                setIsAuthenticated(false);
            }
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadToken();
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === "access_token") {
                loadToken();
            }
        };
        
        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, [loadToken]);

    const checkRole = useCallback((role: string): boolean => {
        return hasRole(payload, role);
    }, [payload]);

    const logout = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem("access_token");
            setToken(null);
            setPayload(null);
            setIsAuthenticated(false);
        }
    }, []);

    return { token, payload, isAuthenticated, isLoading, checkRole, logout };
}
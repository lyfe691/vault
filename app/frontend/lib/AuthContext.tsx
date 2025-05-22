"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { TokenPayload } from "./auth";
import { AuthApi } from "./api";
import { toast } from "sonner";

interface AuthContextType {
  payload: TokenPayload | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  checkRole: (role: string) => boolean;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  getRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getRefreshInterval = (payload: TokenPayload | null): number => {
  if (payload?.exp) {
    const expiryTime = payload.exp * 1000; // ms
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    
    if (timeUntilExpiry < 120000) {
      return 0;
    }
    
    return Math.max(timeUntilExpiry - 60000, 10000);
  }
  
  return 5 * 60 * 1000;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [payload, setPayload] = useState<TokenPayload | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTimerId, setRefreshTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isAuthenticated && payload) {
      const interval = getRefreshInterval(payload);
      
      if (refreshTimerId) {
        clearTimeout(refreshTimerId);
      }
      
      const timerId = setTimeout(checkAuthentication, interval);
      setRefreshTimerId(timerId);
      
      return () => {
        if (timerId) clearTimeout(timerId);
      };
    }
  }, [payload, isAuthenticated]);

  const checkAuthentication = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await AuthApi.getUserInfo();
      setPayload(data.user);
      setIsAuthenticated(true);
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
    
    return () => {
      if (refreshTimerId) {
        clearTimeout(refreshTimerId);
      }
    };
  }, []);

  const checkRole = useCallback((role: string): boolean => {
    if (!payload || !payload.realm_access || !payload.realm_access.roles) {
      return false;
    }
    return payload.realm_access.roles.includes(role);
  }, [payload]);

  const logout = useCallback(async () => {
    try {
      await AuthApi.logout();
      setPayload(null);
      setIsAuthenticated(false);
      toast.success("Successfully logged out");
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("Failed to logout");
    }
  }, []);

  const getRedirectPath = useCallback((): string => {
    if (!isAuthenticated) {
      return "/login";
    }
    
    if (checkRole("admin")) {
      return "/admin";
    }
    
    if (checkRole("user")) {
      return "/user";
    }
    
    return "/login";
  }, [isAuthenticated, checkRole]);

  const value = {
    payload,
    isAuthenticated,
    isLoading,
    checkRole,
    logout,
    refreshAuth: checkAuthentication,
    getRedirectPath
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
} 
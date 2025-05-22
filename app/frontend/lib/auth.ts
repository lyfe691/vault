import { jwtDecode } from "jwt-decode";

export interface TokenPayload {
    preferred_username?: string;
    realm_access?: {
        roles?: string[];
    };
    exp?: number;
    iat?: number;
    auth_time?: number;
    jti?: string;
    iss?: string;
    sub?: string;
    typ?: string;
    azp?: string;
    session_state?: string;
    acr?: string;
    [key: string]: any;
}

export function parseJwt(token: string): TokenPayload {
    try {
        return jwtDecode<TokenPayload>(token);
    } catch (error) {
        console.error("Failed to decode token:", error);
        return {};
    }
}

export function hasRole(payload: TokenPayload | null, role: string): boolean {
    if (!payload || !payload.realm_access || !payload.realm_access.roles) {
        return false;
    }
    return payload.realm_access.roles.includes(role);
}
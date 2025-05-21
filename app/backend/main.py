from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from jose import jwt
import httpx
from typing import List, Optional

app = FastAPI()

# Allow Next.js frontend running at localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600
)

security = HTTPBearer()

KEYCLOAK_INTERNAL_URL = "http://localhost:8080"
REALM = "vault-core"
OIDC_CONFIG_URL = f"{KEYCLOAK_INTERNAL_URL}/realms/{REALM}/.well-known/openid-configuration"
ISSUER = f"http://localhost:8080/realms/{REALM}"  # must match token
CLIENT_ID = "vault-app"
ALGORITHMS = ["RS256"]

# this function fetches the JWKS from the OIDC provider
async def get_jwk_set():
    async with httpx.AsyncClient() as client:
        config_response = await client.get(OIDC_CONFIG_URL)
        if config_response.status_code != 200:
            raise Exception("Failed to fetch OIDC config")

        config = config_response.json()
        jwks_uri = config["jwks_uri"]

        jwks_response = await client.get(jwks_uri)
        if jwks_response.status_code != 200:
            raise Exception("Failed to fetch JWKS keys")

        return jwks_response.json()

# verify and decode the JWT token
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        jwks = await get_jwk_set()
        payload = jwt.decode(
            token,
            key=jwks,
            algorithms=ALGORITHMS,
            audience="account",
            issuer=ISSUER
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTClaimsError as e:
        raise HTTPException(status_code=401, detail=f"Invalid claims: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"JWT validation failed: {str(e)}")

# check if user has required roles
def has_role(payload: dict, required_roles: List[str]) -> bool:
    if not payload.get("realm_access") or not payload["realm_access"].get("roles"):
        return False
    
    user_roles = payload["realm_access"]["roles"]
    return any(role in user_roles for role in required_roles)

# require specific roles
def require_roles(roles: List[str]):
    async def role_checker(payload: dict = Depends(verify_token)):
        if not has_role(payload, roles):
            raise HTTPException(
                status_code=403, 
                detail=f"Access denied. Required roles: {', '.join(roles)}"
            )
        return payload
    return role_checker

# public endpoint;  no authentication required
@app.get("/")
async def root():
    return {"message": "Welcome to the Vault API. Use /me to get user info or /admin for admin functions"}

# this endpoint is used to validate the JWT token and return user information
@app.get("/me")
async def read_user(payload: dict = Depends(verify_token)):
    return {"user": payload}

# admin only endpoint
@app.get("/admin")
async def admin_only(payload: dict = Depends(require_roles(["admin"]))):
    return {
        "message": "Admin access granted",
        "user_info": {
            "username": payload.get("preferred_username", "unknown"),
            "roles": payload.get("realm_access", {}).get("roles", [])
        }
    }

# user only endpoint
@app.get("/user")
async def user_only(payload: dict = Depends(require_roles(["user"]))):
    return {
        "message": "User access granted",
        "user_info": {
            "username": payload.get("preferred_username", "unknown"),
            "roles": payload.get("realm_access", {}).get("roles", [])
        }
    }

@app.post("/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
):
    async with httpx.AsyncClient() as client: 
        res = await client.post("http://localhost:8080/realms/vault-core/protocol/openid-connect/token",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "client_id": "vault-app",
                "client_secret": "vault-client-secret",
                "grant_type": "password",
                "username": username,
                "password": password,
            }
        )
        return JSONResponse(status_code=res.status_code, content=res.json())

from fastapi import FastAPI, Request, HTTPException
from jose import jwt
import httpx

app = FastAPI()

KEYCLOAK_INTERNAL_URL = "http://vault-idp:8080"
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
        jwks_uri = config["jwks_uri"].replace("localhost", "vault-idp")

        jwks_response = await client.get(jwks_uri)
        if jwks_response.status_code != 200:
            raise Exception("Failed to fetch JWKS keys")

        return jwks_response.json()


# this endpoint is used to validate the JWT token and return user information
@app.get("/me")
async def read_user(request: Request):
    auth_header = request.headers.get("authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = auth_header[len("Bearer "):]
    try:
        jwks = await get_jwk_set()

        payload = jwt.decode(
            token,
            key=jwks,
            algorithms=ALGORITHMS,
            audience="account",
            issuer=ISSUER
        )

        return {"user": payload}

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.JWTClaimsError as e:
        raise HTTPException(status_code=401, detail=f"Invalid claims: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"JWT validation failed: {str(e)}")

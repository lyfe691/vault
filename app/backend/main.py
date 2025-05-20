from fastapi import FastAPI, Request, HTTPException
from jose import jwt
import httpx

app = FastAPI()

OIDC_CONFIG_URL = "http://vault-idp:8080/realms/vault-core/.well-known/openid-configuration"
CLIENT_ID = "vault-app"

@app.get("/me")
async def read_user(request: Request):
    auth = request.headers.get("authorization")
    if not auth or not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth[len("Bearer "):]
    async with httpx.AsyncClient() as client:
        r = await client.get(OIDC_CONFIG_URL)
        config = r.json()
        jwks_uri = config["jwks_uri"]
        r = await client.get(jwks_uri)
        keys = r.json()["keys"]

    try:
        payload = jwt.decode(token, keys[0], algorithms=["RS256"], audience=CLIENT_ID)
        return {"user": payload}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

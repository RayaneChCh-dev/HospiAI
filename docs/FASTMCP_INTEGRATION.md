# FastMCP Integration Guide

This guide explains how to integrate your FastMCP server with HospiAI's JWT token authentication system.

## Overview

HospiAI uses JWT tokens with HMAC-SHA256 signing for authenticating FastMCP servers. The authentication flow works as follows:

1. User generates a JWT token in HospiAI dashboard (`/dashboard/tokens`)
2. FastMCP server receives requests with this token in the `Authorization` header
3. FastMCP calls HospiAI validation endpoint to verify the token
4. HospiAI validates JWT signature, checks revocation status, and returns user data
5. FastMCP server processes the request with authenticated user context

## Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │  token  │    FastMCP   │ validate│   HospiAI   │
│  (Claude)   │────────>│    Server    │────────>│     API     │
└─────────────┘         └──────────────┘         └─────────────┘
                              │                          │
                              │<─────────────────────────┘
                              │  user data + scopes
                              │
                              v
                         Process Request
```

## Step 1: Generate a Token in HospiAI

1. Navigate to `/dashboard/tokens` in your HospiAI instance
2. Click "Nouveau Token"
3. Fill in:
   - **Name**: Descriptive name (e.g., "Production FastMCP Server")
   - **Scopes**: Select required permissions:
     - `read:data` - Read patient and hospital data
     - `write:data` - Write/modify data
     - `read:bookings` - View bookings
     - `write:bookings` - Create/modify bookings
   - **Duration**: Token validity period (1-365 days)
4. Copy the generated token (it's shown only once!)

## Step 2: Install Dependencies

```bash
pip install fastmcp httpx requests
```

## Step 3: Implement Authentication in FastMCP

### Option A: Using Custom AuthProvider (Recommended)

Create a file `hospiai_auth.py`:

```python
import httpx
from typing import Optional
from fastmcp.server.auth import AuthProvider, AuthContext


class HospiAIAuthProvider(AuthProvider):
    """Authentication provider that validates tokens with HospiAI API."""

    def __init__(self, validation_url: str, timeout: float = 10.0):
        self.validation_url = validation_url
        self.timeout = timeout
        self._client = httpx.AsyncClient(timeout=timeout)

    async def authenticate(self, token: str) -> Optional[AuthContext]:
        try:
            response = await self._client.post(
                self.validation_url,
                headers={"Authorization": f"Bearer {token}"}
            )

            if response.status_code != 200:
                return None

            data = response.json()
            if not data.get("valid"):
                return None

            user = data.get("user", {})
            scopes = data.get("scopes", [])

            return AuthContext(
                user_id=user.get("id"),
                scopes=scopes,
                metadata={
                    "email": user.get("email"),
                    "name": user.get("name"),
                    "firstName": user.get("firstName"),
                    "lastName": user.get("lastName"),
                }
            )
        except Exception as e:
            print(f"Token validation error: {e}")
            return None

    async def close(self):
        await self._client.aclose()
```

### Use in Your FastMCP Server

```python
from fastmcp import FastMCP
from hospiai_auth import HospiAIAuthProvider

# Create FastMCP app
app = FastMCP("HospiAI Server")

# Configure authentication
app.auth_provider = HospiAIAuthProvider(
    validation_url="https://your-domain.com/api/mcp/validate"
)

# Define tools with required scopes
@app.tool(scopes=["read:data"])
async def get_patient(patient_id: str, ctx: AuthContext):
    """Get patient information (requires read:data scope)."""
    user_email = ctx.metadata.get("email")
    print(f"Request from: {user_email}")

    # Your logic here
    return {"patient_id": patient_id, "name": "John Doe"}

@app.tool(scopes=["write:bookings"])
async def create_booking(patient_id: str, date: str, ctx: AuthContext):
    """Create a booking (requires write:bookings scope)."""
    user_id = ctx.user_id

    # Your logic here
    return {
        "booking_id": "BK123",
        "patient_id": patient_id,
        "date": date,
        "created_by": user_id
    }

# Run server
app.run()
```

## Step 4: Test Your Integration

### Using curl

```bash
# Test token validation
curl -X POST https://your-domain.com/api/mcp/validate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"

# Expected response:
{
  "valid": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    ...
  },
  "token": {
    "id": "token_id",
    "name": "Production Server",
    "scopes": ["read:data", "write:bookings"]
  },
  "scopes": ["read:data", "write:bookings"]
}
```

### Using Python

```python
from hospiai_auth import SimpleHospiAIAuth

auth = SimpleHospiAIAuth("https://your-domain.com/api/mcp/validate")
result = auth.validate_token("YOUR_JWT_TOKEN_HERE")

if result:
    print(f"✓ Token valid for: {result['user']['email']}")
    print(f"  Scopes: {', '.join(result['scopes'])}")
else:
    print("✗ Token invalid or expired")
```

## API Reference

### POST /api/mcp/validate

Validates a JWT token and returns user information.

**Request:**
```
POST /api/mcp/validate
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "string",
    "email": "string",
    "firstname": "string",
    "surname": "string",
    "phoneNumber": "string",
    "profileCompletedAt": "datetime"
  },
  "token": {
    "id": "string",
    "name": "string",
    "scopes": ["string"],
    "expiresAt": "datetime"
  },
  "scopes": ["string"]
}
```

**Error Responses:**

- `401 Unauthorized` - Token missing, invalid, expired, or revoked
  ```json
  { "error": "Token invalide" }
  { "error": "Token expiré" }
  { "error": "Token révoqué ou inexistant" }
  ```

- `500 Internal Server Error` - Server configuration error
  ```json
  { "error": "Configuration serveur invalide" }
  ```

## Security Best Practices

### 1. Token Storage
- **Never** commit tokens to version control
- Store tokens in environment variables or secure secret management systems
- Use different tokens for development, staging, and production

### 2. Token Scopes
- Use minimal scopes required for your FastMCP server
- Request only the permissions you need
- Regularly audit token usage

### 3. Token Rotation
- Rotate tokens regularly (every 90 days recommended)
- Revoke old tokens after rotation
- Monitor token usage in HospiAI dashboard

### 4. Network Security
- Always use HTTPS in production
- Consider IP whitelisting for production tokens
- Implement rate limiting on your FastMCP server

### 5. Error Handling
- Don't expose sensitive information in error messages
- Log authentication failures for security monitoring
- Implement retry logic with exponential backoff

## Environment Variables

Configure these in your FastMCP server environment:

```bash
# HospiAI API Configuration
HOSPIAI_VALIDATION_URL="https://your-domain.com/api/mcp/validate"
HOSPIAI_JWT_TOKEN="your-jwt-token-here"

# Optional: Timeout configuration
HOSPIAI_TIMEOUT=10.0
```

Load in your code:

```python
import os
from hospiai_auth import HospiAIAuthProvider

app = FastMCP("HospiAI Server")
app.auth_provider = HospiAIAuthProvider(
    validation_url=os.getenv("HOSPIAI_VALIDATION_URL"),
    timeout=float(os.getenv("HOSPIAI_TIMEOUT", "10.0"))
)
```

## Troubleshooting

### Token Validation Fails

**Problem:** `401 Unauthorized` response

**Solutions:**
1. Check token hasn't expired in HospiAI dashboard
2. Verify token hasn't been revoked
3. Ensure `Authorization: Bearer` header format is correct
4. Confirm HospiAI API is accessible from your FastMCP server

### Connection Timeout

**Problem:** Timeout when calling validation endpoint

**Solutions:**
1. Check network connectivity to HospiAI API
2. Verify firewall rules allow outbound HTTPS
3. Increase timeout value if HospiAI API is slow
4. Consider implementing token caching (see Advanced section)

### Scope Permission Denied

**Problem:** Tool requires scope that token doesn't have

**Solutions:**
1. Check token scopes in HospiAI dashboard
2. Generate new token with required scopes
3. Update FastMCP tool scope requirements

## Advanced: Token Caching

To reduce validation API calls, implement caching:

```python
from datetime import datetime, timedelta
from typing import Optional, Dict
import httpx


class CachedHospiAIAuthProvider(AuthProvider):
    """Auth provider with built-in token caching."""

    def __init__(self, validation_url: str, cache_ttl: int = 300):
        self.validation_url = validation_url
        self.cache_ttl = cache_ttl  # seconds
        self._cache: Dict[str, tuple[AuthContext, datetime]] = {}
        self._client = httpx.AsyncClient()

    async def authenticate(self, token: str) -> Optional[AuthContext]:
        # Check cache
        if token in self._cache:
            cached_ctx, cached_at = self._cache[token]
            if datetime.now() - cached_at < timedelta(seconds=self.cache_ttl):
                return cached_ctx

        # Validate with API
        ctx = await self._validate_with_api(token)

        if ctx:
            # Cache the result
            self._cache[token] = (ctx, datetime.now())

        return ctx

    async def _validate_with_api(self, token: str) -> Optional[AuthContext]:
        # Same validation logic as before
        ...
```

**Warning:** Caching means revoked tokens may still work until cache expires. Use short TTL (5 minutes) if revocation is critical.

## Support

- **Documentation**: See `/docs` folder in HospiAI repository
- **Issues**: Report bugs in GitHub issues
- **Token Management**: `/dashboard/tokens` in HospiAI

## Example Projects

See `docs/fastmcp_integration.py` for complete working examples including:
- Full authentication provider implementation
- Multiple tool examples with different scopes
- Synchronous validation helper
- Error handling patterns

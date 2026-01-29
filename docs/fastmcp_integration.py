"""
FastMCP Authentication Integration with HospiAI
================================================

This module provides authentication integration between FastMCP servers
and the HospiAI API using JWT tokens.

Installation:
    pip install fastmcp httpx

Usage in your FastMCP server:
    from hospiai_auth import HospiAIAuthProvider

    app = FastMCP("My Server")
    app.auth_provider = HospiAIAuthProvider(
        validation_url="https://your-domain.com/api/mcp/validate"
    )
"""

import httpx
from typing import Optional, Dict, Any
from fastmcp.server.auth import AuthProvider, AuthContext


class HospiAIAuthProvider(AuthProvider):
    """
    Custom authentication provider for FastMCP that validates tokens
    against the HospiAI validation endpoint.
    """

    def __init__(self, validation_url: str, timeout: float = 10.0):
        """
        Initialize the HospiAI authentication provider.

        Args:
            validation_url: Full URL to the HospiAI validation endpoint
                          (e.g., "https://your-domain.com/api/mcp/validate")
            timeout: HTTP request timeout in seconds (default: 10.0)
        """
        self.validation_url = validation_url
        self.timeout = timeout
        self._client = httpx.AsyncClient(timeout=timeout)

    async def authenticate(self, token: str) -> Optional[AuthContext]:
        """
        Authenticate a request by validating the JWT token with HospiAI API.

        Args:
            token: The JWT token from the Authorization header

        Returns:
            AuthContext if valid, None if invalid
        """
        try:
            # Call HospiAI validation endpoint
            response = await self._client.post(
                self.validation_url,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                }
            )

            # Check if token is valid
            if response.status_code != 200:
                print(f"Token validation failed: {response.status_code}")
                return None

            data = response.json()

            if not data.get("valid"):
                print("Token validation returned invalid")
                return None

            # Extract user and token information
            user = data.get("user", {})
            token_info = data.get("token", {})
            scopes = data.get("scopes", [])

            # Return authentication context
            return AuthContext(
                user_id=user.get("id"),
                scopes=scopes,
                metadata={
                    "email": user.get("email"),
                    "firstname": user.get("firstname"),
                    "surname": user.get("surname"),
                    "phoneNumber": user.get("phoneNumber"),
                    "profileCompletedAt": user.get("profileCompletedAt"),
                    "token_name": token_info.get("name"),
                    "token_id": token_info.get("id"),
                    "expires_at": token_info.get("expiresAt"),
                }
            )

        except httpx.TimeoutException:
            print(f"Token validation timeout after {self.timeout}s")
            return None
        except httpx.RequestError as e:
            print(f"Token validation request error: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error during token validation: {e}")
            return None

    async def close(self):
        """Close the HTTP client."""
        await self._client.aclose()


# =============================================================================
# Example Usage
# =============================================================================

if __name__ == "__main__":
    from fastmcp import FastMCP

    # Create your FastMCP application
    app = FastMCP("HospiAI Server")

    # Configure HospiAI authentication
    app.auth_provider = HospiAIAuthProvider(
        validation_url="http://localhost:3000/api/mcp/validate"
    )

    # Define your tools with scope requirements
    @app.tool(scopes=["read:data"])
    async def get_patient_info(patient_id: str, ctx: AuthContext) -> Dict[str, Any]:
        """
        Get patient information.
        Requires 'read:data' scope.
        """
        # Access authenticated user info
        user_email = ctx.metadata.get("email")
        firstname = ctx.metadata.get("firstname")
        surname = ctx.metadata.get("surname")

        print(f"Request from user: {firstname} {surname} ({user_email})")

        # Your logic here
        return {
            "patient_id": patient_id,
            "name": "John Doe",
            "status": "active"
        }

    @app.tool(scopes=["write:bookings"])
    async def create_booking(
        patient_id: str,
        date: str,
        ctx: AuthContext
    ) -> Dict[str, Any]:
        """
        Create a new booking.
        Requires 'write:bookings' scope.
        """
        user_id = ctx.user_id

        # Your booking creation logic here
        return {
            "booking_id": "BK123456",
            "patient_id": patient_id,
            "date": date,
            "created_by": user_id
        }

    # Run the server
    app.run()


# =============================================================================
# Alternative: Simpler synchronous version for basic use cases
# =============================================================================

import requests


class SimpleHospiAIAuth:
    """
    Simplified synchronous authentication helper.
    Use this if you need to validate tokens in synchronous code.
    """

    def __init__(self, validation_url: str):
        self.validation_url = validation_url

    def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Validate a JWT token synchronously.

        Args:
            token: The JWT token to validate

        Returns:
            Dict with user and token info if valid, None otherwise
        """
        try:
            response = requests.post(
                self.validation_url,
                headers={"Authorization": f"Bearer {token}"},
                timeout=10
            )

            if response.status_code == 200:
                data = response.json()
                if data.get("valid"):
                    return data

            return None

        except Exception as e:
            print(f"Token validation error: {e}")
            return None


# Example usage of simple version
def example_simple_auth():
    auth = SimpleHospiAIAuth("http://localhost:3000/api/mcp/validate")

    token = "your-jwt-token-here"
    result = auth.validate_token(token)

    if result:
        print(f"Token valid for user: {result['user']['email']}")
        print(f"Scopes: {result['scopes']}")
    else:
        print("Token invalid or expired")

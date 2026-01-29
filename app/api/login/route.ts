import { findUser } from "@/lib/db";
import { signJWT } from "@/lib/jwt";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for login request
const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

/**
 * POST /api/login
 * Authenticate user and return JWT access token
 *
 * Request body:
 * {
 *   "email": "user@example.com",
 *   "password": "password123"
 * }
 *
 * Response:
 * {
 *   "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "token_type": "Bearer"
 * }
 */
export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find and authenticate user
    const user = await findUser(email, password);

    if (!user) {
      // Use generic error message to prevent user enumeration
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Sign JWT token
    const accessToken = signJWT(user);

    // Return token in OAuth2-compliant format
    return NextResponse.json({
      access_token: accessToken,
      token_type: "Bearer",
      expires_in: 900, // 15 minutes in seconds
    });
  } catch (error) {
    console.error("Login error:", error);

    // Check for specific error types
    if (error instanceof Error && error.message.includes("Private key not found")) {
      return NextResponse.json(
        {
          error: "Server configuration error",
          message: "JWT signing keys not configured",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

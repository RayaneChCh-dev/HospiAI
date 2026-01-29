import fs from "fs";
import { exportJWK } from "jose";
import { createPublicKey } from "crypto";
import path from "path";
import { NextResponse } from "next/server";

/**
 * Get public key from environment variable or file system
 * Priority: JWT_PUBLIC_KEY env var > public.pem file
 */
function getPublicKey(): string {
  // Try environment variable first (for Vercel deployment)
  if (process.env.JWT_PUBLIC_KEY) {
    return process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
  }

  // Fallback to file system (for local development)
  const pubPemPath = path.join(process.cwd(), "public.pem");

  if (!fs.existsSync(pubPemPath)) {
    throw new Error("Public key not found. Set JWT_PUBLIC_KEY env var or generate public.pem");
  }

  return fs.readFileSync(pubPemPath, "utf8");
}

/**
 * GET /.well-known/jwks.json
 * Returns the JSON Web Key Set (JWKS) containing public keys for JWT verification
 */
export async function GET() {
  try {
    // Get public key from env var or file
    const pubPem = getPublicKey();
    const pubKey = createPublicKey(pubPem);

    // Export to JWK format
    const jwk = await exportJWK(pubKey);

    // Return JWKS with additional metadata
    return NextResponse.json({
      keys: [
        {
          ...jwk,
          kid: "main-key",
          use: "sig",
          alg: "RS256",
        },
      ],
    });
  } catch (error) {
    console.error("Error generating JWKS:", error);
    return NextResponse.json(
      {
        error: "Failed to generate JWKS",
        message: error instanceof Error ? error.message : "Unknown error",
        hint: "Set JWT_PUBLIC_KEY environment variable or generate public.pem using: openssl rsa -in private.pem -pubout -out public.pem"
      },
      { status: 500 }
    );
  }
}

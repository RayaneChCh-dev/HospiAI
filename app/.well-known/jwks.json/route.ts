import fs from "fs";
import { exportJWK } from "jose";
import { createPublicKey } from "crypto";
import path from "path";
import { NextResponse } from "next/server";

/**
 * GET /api/.well-known/jwks
 * Returns the JSON Web Key Set (JWKS) containing public keys for JWT verification
 */
export async function GET() {
  try {
    const pubPemPath = path.join(process.cwd(), "public.pem");

    // Check if public key exists
    if (!fs.existsSync(pubPemPath)) {
      return NextResponse.json(
        {
          error: "Public key not found",
          message: "Please generate RSA keys using: openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem",
        },
        { status: 500 }
      );
    }

    // Read public key
    const pubPem = fs.readFileSync(pubPemPath, "utf8");
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
      },
      { status: 500 }
    );
  }
}

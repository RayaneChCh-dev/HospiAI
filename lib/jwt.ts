import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

/**
 * Get private key from environment variable or file system
 * Priority: JWT_PRIVATE_KEY env var > private.pem file
 */
function getPrivateKey(): string {
  // Try environment variable first (for Vercel deployment)
  if (process.env.JWT_PRIVATE_KEY) {
    // Replace escaped newlines with actual newlines
    return process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
  }

  // Fallback to file system (for local development)
  try {
    const privateKeyPath = path.join(process.cwd(), "private.pem");
    return fs.readFileSync(privateKeyPath, 'utf-8');
  } catch (error) {
    console.error("Error reading private key:", error);
    throw new Error(
      "Private key not found. Set JWT_PRIVATE_KEY env var or generate private.pem using: openssl genrsa -out private.pem 2048"
    );
  }
}

/**
 * Get public key from environment variable or file system
 * Priority: JWT_PUBLIC_KEY env var > public.pem file
 */
function getPublicKey(): string {
  // Try environment variable first (for Vercel deployment)
  if (process.env.JWT_PUBLIC_KEY) {
    // Replace escaped newlines with actual newlines
    return process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
  }

  // Fallback to file system (for local development)
  try {
    const publicKeyPath = path.join(process.cwd(), "public.pem");
    return fs.readFileSync(publicKeyPath, 'utf-8');
  } catch (error) {
    console.error("Error reading public key:", error);
    throw new Error(
      "Public key not found. Set JWT_PUBLIC_KEY env var or generate public.pem using: openssl rsa -in private.pem -pubout -out public.pem"
    );
  }
}

export interface JWTUser {
  id: string;
  email: string;
  scopes: string[];
}

/**
 * Sign a JWT token for a user using RS256 algorithm
 * @param user User object with id, email, and scopes
 * @returns Signed JWT token
 */
export function signJWT(user: JWTUser): string {
  const issuer = process.env.AUTH_JWT_ISSUER || "hospiai-api";
  const audience = process.env.AUTH_JWT_AUDIENCE || "hospiai-mcp";
  const privateKey = getPrivateKey();

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      scope: user.scopes.join(" "),
    },
    privateKey,
    {
      algorithm: "RS256",
      issuer,
      audience,
      expiresIn: "15m",
      keyid: "main-key",
    }
  );
}

/**
 * Verify a JWT token using RS256 algorithm
 * @param token JWT token to verify
 * @returns Decoded token payload
 */
export function verifyJWT(token: string): jwt.JwtPayload {
  const issuer = process.env.AUTH_JWT_ISSUER || "hospiai-api";
  const audience = process.env.AUTH_JWT_AUDIENCE || "hospiai-mcp";
  const publicKey = getPublicKey();

  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer,
    audience,
  }) as jwt.JwtPayload;
}

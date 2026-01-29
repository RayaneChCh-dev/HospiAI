import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

/**
 * Get private key from environment variable or file system
 * Priority: JWT_PRIVATE_KEY env var > private.pem file
 */
function getPrivateKey(): string {
  let privateKey: string | undefined;

  // Try environment variable first (for Vercel deployment)
  if (process.env.JWT_PRIVATE_KEY) {
    console.log("[JWT] Loading private key from JWT_PRIVATE_KEY environment variable");
    // Replace escaped newlines with actual newlines
    privateKey = process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');

    // Validate key format
    if (!privateKey.includes('BEGIN') || !privateKey.includes('PRIVATE KEY')) {
      console.error("[JWT] Invalid private key format in JWT_PRIVATE_KEY");
      console.error("[JWT] Key should start with '-----BEGIN PRIVATE KEY-----' or '-----BEGIN RSA PRIVATE KEY-----'");
      console.error("[JWT] First 50 chars:", privateKey.substring(0, 50));
      throw new Error("Invalid private key format in JWT_PRIVATE_KEY environment variable");
    }

    console.log("[JWT] Private key loaded successfully from environment");
    return privateKey;
  }

  // Fallback to file system (for local development)
  console.log("[JWT] JWT_PRIVATE_KEY not found in environment, trying private.pem file");
  try {
    const privateKeyPath = path.join(process.cwd(), "private.pem");
    privateKey = fs.readFileSync(privateKeyPath, 'utf-8');
    console.log("[JWT] Private key loaded successfully from private.pem");
    return privateKey;
  } catch (error) {
    console.error("[JWT] Error reading private key from file:", error);
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
  let publicKey: string | undefined;

  // Try environment variable first (for Vercel deployment)
  if (process.env.JWT_PUBLIC_KEY) {
    console.log("[JWT] Loading public key from JWT_PUBLIC_KEY environment variable");
    // Replace escaped newlines with actual newlines
    publicKey = process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');

    // Validate key format
    if (!publicKey.includes('BEGIN') || !publicKey.includes('PUBLIC KEY')) {
      console.error("[JWT] Invalid public key format in JWT_PUBLIC_KEY");
      console.error("[JWT] Key should start with '-----BEGIN PUBLIC KEY-----'");
      console.error("[JWT] First 50 chars:", publicKey.substring(0, 50));
      throw new Error("Invalid public key format in JWT_PUBLIC_KEY environment variable");
    }

    console.log("[JWT] Public key loaded successfully from environment");
    return publicKey;
  }

  // Fallback to file system (for local development)
  console.log("[JWT] JWT_PUBLIC_KEY not found in environment, trying public.pem file");
  try {
    const publicKeyPath = path.join(process.cwd(), "public.pem");
    publicKey = fs.readFileSync(publicKeyPath, 'utf-8');
    console.log("[JWT] Public key loaded successfully from public.pem");
    return publicKey;
  } catch (error) {
    console.error("[JWT] Error reading public key from file:", error);
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

import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

// Load private key from file system
const privateKeyPath = path.join(process.cwd(), "private.pem");
let privateKey: Buffer;

try {
  privateKey = fs.readFileSync(privateKeyPath);
} catch (error) {
  console.error("Error reading private key:", error);
  throw new Error(
    "Private key not found. Please generate it using: openssl genrsa -out private.pem 2048"
  );
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
  const publicKeyPath = path.join(process.cwd(), "public.pem");
  const publicKey = fs.readFileSync(publicKeyPath);

  const issuer = process.env.AUTH_JWT_ISSUER || "hospiai-api";
  const audience = process.env.AUTH_JWT_AUDIENCE || "hospiai-mcp";

  return jwt.verify(token, publicKey, {
    algorithms: ["RS256"],
    issuer,
    audience,
  }) as jwt.JwtPayload;
}

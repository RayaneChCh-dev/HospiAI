import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export interface UserWithScopes {
  id: string;
  email: string;
  scopes: string[];
}

/**
 * Find and authenticate a user by email and password
 * @param email User email
 * @param password Plain text password
 * @returns User object with scopes if authenticated, null otherwise
 */
export async function findUser(
  email: string,
  password: string
): Promise<UserWithScopes | null> {
  try {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        profileCompletedAt: true,
      },
    });

    if (!user) {
      return null;
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Define scopes based on user properties
    const scopes: string[] = ["read:data"];

    // Add additional scopes for users with completed profiles
    if (user.profileCompletedAt) {
      scopes.push("read:bookings", "write:bookings");
    }

    return {
      id: user.id,
      email: user.email,
      scopes,
    };
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}

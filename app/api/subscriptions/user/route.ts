import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for changing subscription
const changeSubscriptionSchema = z.object({
  subscriptionSlug: z.enum(["free", "premium", "pay_per_use"]),
});

/**
 * GET /api/subscriptions/user
 * Returns the current user's subscription information
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user with subscription
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userSubscription: {
          include: {
            subscription: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // If user has no subscription, assign them the free plan by default
    if (!user.userSubscription) {
      const freeSubscription = await prisma.subscription.findUnique({
        where: { slug: "free" }
      });

      if (!freeSubscription) {
        return NextResponse.json(
          { error: "Free subscription plan not found" },
          { status: 500 }
        );
      }

      // Create free subscription for user
      const userSubscription = await prisma.userSubscription.create({
        data: {
          userId: user.id,
          subscriptionId: freeSubscription.id,
          status: "active",
          startDate: new Date(),
        },
        include: {
          subscription: true
        }
      });

      return NextResponse.json({
        userSubscription: {
          ...userSubscription,
          subscription: {
            ...userSubscription.subscription,
            features: JSON.parse(userSubscription.subscription.features as string)
          }
        }
      });
    }

    return NextResponse.json({
      userSubscription: {
        ...user.userSubscription,
        subscription: {
          ...user.userSubscription.subscription,
          features: JSON.parse(user.userSubscription.subscription.features as string)
        }
      }
    });
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch user subscription",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/subscriptions/user
 * Change the user's subscription plan
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validation = changeSubscriptionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { subscriptionSlug } = validation.data;

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        userSubscription: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get new subscription plan
    const newSubscription = await prisma.subscription.findUnique({
      where: { slug: subscriptionSlug }
    });

    if (!newSubscription) {
      return NextResponse.json(
        { error: "Subscription plan not found" },
        { status: 404 }
      );
    }

    // Check if user already has this subscription
    if (user.userSubscription?.subscriptionId === newSubscription.id) {
      return NextResponse.json(
        { error: "User already has this subscription plan" },
        { status: 400 }
      );
    }

    // Update or create user subscription
    const userSubscription = await prisma.userSubscription.upsert({
      where: { userId: user.id },
      update: {
        subscriptionId: newSubscription.id,
        status: "active",
        startDate: new Date(),
        endDate: null,
        // Reset usage counters when changing plans
        appointmentsThisMonth: 0,
        lastResetDate: new Date(),
        payPerUseBalance: 0,
      },
      create: {
        userId: user.id,
        subscriptionId: newSubscription.id,
        status: "active",
        startDate: new Date(),
      },
      include: {
        subscription: true
      }
    });

    return NextResponse.json({
      message: "Subscription updated successfully",
      userSubscription: {
        ...userSubscription,
        subscription: {
          ...userSubscription.subscription,
          features: JSON.parse(userSubscription.subscription.features as string)
        }
      }
    });
  } catch (error) {
    console.error("Error changing subscription:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to change subscription",
      },
      { status: 500 }
    );
  }
}

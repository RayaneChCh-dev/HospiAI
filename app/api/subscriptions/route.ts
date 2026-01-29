import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * GET /api/subscriptions
 * Returns all available subscription plans
 */
export async function GET() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      orderBy: {
        pricePerMonth: 'asc' // Free first, then Premium, then Pay Per Use
      }
    });

    // Parse features JSON for each subscription
    const subscriptionsWithFeatures = subscriptions.map(sub => ({
      ...sub,
      features: JSON.parse(sub.features as string)
    }));

    return NextResponse.json({
      subscriptions: subscriptionsWithFeatures
    });
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch subscriptions",
      },
      { status: 500 }
    );
  }
}

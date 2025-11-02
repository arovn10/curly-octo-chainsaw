import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const Compare = z.object({
  userId: z.string().uuid(),
  mealAId: z.string().uuid(),
  mealBId: z.string().uuid(),
  winnerId: z.string().uuid(),
});

function expectedScore(rA: number, rB: number) {
  return 1 / (1 + Math.pow(10, (rB - rA) / 400));
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Compare.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const { userId, mealAId, mealBId, winnerId } = parsed.data;
    const K = 32;

    await prisma.$transaction(async (tx) => {
      // Create comparison record
      await tx.pairwiseComparison.create({
        data: { userId, mealAId, mealBId, winnerId },
      });

      // Ensure Elo ratings exist
      const ensure = async (mealId: string) => {
        const e = await tx.eloRating.findUnique({
          where: { userId_mealId: { userId, mealId } },
        });
        return (
          e ??
          (await tx.eloRating.create({
            data: { userId, mealId, rating: 1500 },
          }))
        );
      };

      const a = await ensure(mealAId);
      const b = await ensure(mealBId);

      const aWins = winnerId === mealAId ? 1 : 0;
      const bWins = winnerId === mealBId ? 1 : 0;
      const eA = expectedScore(a.rating, b.rating);
      const eB = expectedScore(b.rating, a.rating);

      // Update Elo ratings
      await tx.eloRating.update({
        where: { userId_mealId: { userId, mealId: mealAId } },
        data: { rating: a.rating + K * (aWins - eA), updatedAt: new Date() },
      });

      await tx.eloRating.update({
        where: { userId_mealId: { userId, mealId: mealBId } },
        data: { rating: b.rating + K * (bWins - eB), updatedAt: new Date() },
      });

      // Update meal global scores
      await tx.meal.update({
        where: { id: mealAId },
        data: { globalScore: a.rating + K * (aWins - eA) },
      });

      await tx.meal.update({
        where: { id: mealBId },
        data: { globalScore: b.rating + K * (bWins - eB) },
      });
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error creating comparison:", error);
    return NextResponse.json({ ok: false, error: "Failed to create comparison" }, { status: 500 });
  }
}

// Get random meals for comparison
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId is required" }, { status: 400 });
    }

    const mealCount = await prisma.meal.count({
      where: { userId },
    });

    if (mealCount < 2) {
      return NextResponse.json({
        ok: true,
        data: [],
        message: "Need at least 2 meals to compare",
      });
    }

    // Get meals excluding recent comparisons
    const recentComparisons = await prisma.pairwiseComparison.findMany({
      where: { userId },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    const excludedIds = new Set(
      recentComparisons.flatMap((c) => [c.mealAId, c.mealBId])
    );

    const meals = await prisma.meal.findMany({
      where: {
        userId,
        id: {
          notIn: Array.from(excludedIds),
        },
      },
      take: 10,
      orderBy: { createdAt: "desc" },
    });

    // If not enough meals, get all
    if (meals.length < 2) {
      const allMeals = await prisma.meal.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
      });
      const shuffled = allMeals.sort(() => 0.5 - Math.random());
      return NextResponse.json({ ok: true, data: shuffled.slice(0, 2) });
    }

    // Return 2 random meals
    const shuffled = meals.sort(() => 0.5 - Math.random());
    return NextResponse.json({ ok: true, data: shuffled.slice(0, 2) });
  } catch (error) {
    console.error("Error fetching comparison meals:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch meals" }, { status: 500 });
  }
}


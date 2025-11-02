import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 });
    }

    const meals = await prisma.meal.findMany({
      where: { userId },
      select: {
        id: true,
        totalMinutes: true,
        costPerServingCents: true,
        servings: true,
        difficulty: true,
        tags: true,
      },
    });

    const totalMeals = meals.length;
    const totalTime = meals.reduce((sum, m) => sum + (m.totalMinutes || 0), 0);
    const avgTime = totalMeals > 0 ? Math.round(totalTime / totalMeals) : 0;
    const totalCost = meals.reduce(
      (sum, m) => sum + (m.costPerServingCents || 0) * (m.servings || 1),
      0
    );
    const avgCost = totalMeals > 0 ? totalCost / totalMeals / 100 : 0;

    const difficultyCounts = meals.reduce(
      (acc, m) => {
        const diff = m.difficulty || "MEDIUM";
        acc[diff] = (acc[diff] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const tagsCount: Record<string, number> = {};
    meals.forEach((m) => {
      (m.tags || []).forEach((tag: string) => {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagsCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    const stats = {
      totalMeals,
      avgTime,
      avgCost: parseFloat(avgCost.toFixed(2)),
      totalTime,
      totalCost: parseFloat((totalCost / 100).toFixed(2)),
      difficultyCounts,
      topTags,
    };

    return NextResponse.json({ ok: true, data: stats });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}


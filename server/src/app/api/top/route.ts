import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

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

    if (mealCount < 15) {
      return NextResponse.json({
        ok: true,
        data: [],
        message: `Log ${15 - mealCount} more meals to see your Top-N ranking`,
      });
    }

    const topMeals = await prisma.meal.findMany({
      where: { userId },
      orderBy: { globalScore: "desc" },
      take: 25,
      include: {
        ingredients: true,
        recipe: {
          include: {
            steps: true,
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    return NextResponse.json({ ok: true, data: topMeals });
  } catch (error) {
    console.error("Error fetching top meals:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch top meals" }, { status: 500 });
  }
}


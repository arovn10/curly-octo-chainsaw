import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const RatingSchema = z.object({
  mealId: z.string().uuid(),
  userId: z.string().uuid(),
  sentiment: z.enum(["LOVED", "FINE", "NOT_FOR_ME"]),
  taste: z.number().int().min(1).max(10).optional(),
  texture: z.number().int().min(1).max(10).optional(),
  difficulty: z.number().int().min(1).max(10).optional(),
  value: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RatingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const data = parsed.data;

    const rating = await prisma.rating.upsert({
      where: {
        mealId_userId: {
          mealId: data.mealId,
          userId: data.userId,
        },
      },
      update: {
        sentiment: data.sentiment,
        taste: data.taste,
        texture: data.texture,
        difficulty: data.difficulty,
        value: data.value,
        notes: data.notes,
      },
      create: data,
    });

    // Update meal sentiment
    await prisma.meal.update({
      where: { id: data.mealId },
      data: {
        sentiment: data.sentiment,
      },
    });

    return NextResponse.json({ ok: true, data: rating });
  } catch (error) {
    console.error("Error rating meal:", error);
    return NextResponse.json({ ok: false, error: "Failed to rate meal" }, { status: 500 });
  }
}


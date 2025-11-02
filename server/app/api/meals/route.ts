import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

// Helper to parse JSON strings or arrays
function parseJsonField(value: any): any {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value || [];
}

export const dynamic = "force-dynamic";

const MealCreate = z.object({
  userId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  prepMinutes: z.number().int().optional(),
  activeMinutes: z.number().int().optional(),
  totalMinutes: z.number().int().optional(),
  servings: z.number().int().optional(),
  isPublic: z.boolean().optional(),
  sentiment: z.enum(["LOVED", "FINE", "NOT_FOR_ME"]).optional(),
  costPerServingCents: z.number().int().optional(),
  photos: z.array(z.string()).optional(),
  ingredients: z.array(
    z.object({
      rawName: z.string().min(1),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      unitPriceCents: z.number().int().optional(),
      isPantry: z.boolean().optional(),
    })
  ).optional(),
  recipe: z.object({
    yield: z.number().int().optional(),
    sourceUrl: z.string().optional(),
    sourceName: z.string().optional(),
    utensils: z.array(z.string()).optional(),
    steps: z.array(
      z.object({
        instruction: z.string(),
        timerSeconds: z.number().int().optional(),
        photoPrompt: z.boolean().optional(),
      })
    ).optional(),
  }).optional(),
});

export async function GET(req: Request) {
  try {
    const { auth } = await import("@/../auth");
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session?.user?.id;
    const isPublic = searchParams.get("isPublic");
    
    const meals = await prisma.meal.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(isPublic === "true" ? { isPublic: true } : {}),
      },
      take: 50,
      orderBy: { createdAt: "desc" },
      include: { 
        ingredients: true,
        recipe: {
          include: {
            steps: {
              orderBy: { stepNumber: "asc" }
            }
          }
        },
        user: {
          select: { id: true, username: true, name: true, image: true }
        },
        _count: {
          select: { likes: true, comments: true }
        }
      }
    });
    
    return NextResponse.json({ ok: true, data: meals });
  } catch (error) {
    console.error("Error fetching meals:", error);
    return NextResponse.json({ ok: false, error: "Failed to fetch meals" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { auth } = await import("../../../../auth");
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = MealCreate.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.flatten() }, { status: 400 });
    }

    const m = parsed.data;

    const meal = await prisma.meal.create({
      data: {
        userId: m.userId || session.user.id,
        title: m.title,
        description: m.description,
        tags: JSON.stringify(Array.isArray(m.tags) ? m.tags : []),
        difficulty: m.difficulty?.toLowerCase() || "medium",
        prepTime: m.prepMinutes,
        activeTime: m.activeMinutes,
        totalTime: m.totalMinutes,
        servings: m.servings,
        isPublic: m.isPublic ?? false,
        sentiment: m.sentiment?.toLowerCase() || null,
        costPerServing: m.costPerServingCents ? m.costPerServingCents / 100 : null,
        photos: JSON.stringify(Array.isArray(m.photos) ? m.photos : []),
        globalScore: 1500,
        recipe: m.recipe
          ? {
              create: {
                yield: m.recipe.yield || m.servings,
                sourceUrl: m.recipe.sourceUrl,
                sourceName: m.recipe.sourceName,
                utensils: JSON.stringify(m.recipe.utensils || []),
                ingredients: m.ingredients
                  ? {
                      create: m.ingredients.map((i) => ({
                        name: i.rawName,
                        quantity: i.quantity || 0,
                        unit: i.unit || "",
                        unitPrice: i.unitPriceCents ? i.unitPriceCents / 100 : null,
                        isPantry: i.isPantry || false,
                      })),
                    }
                  : undefined,
                steps: m.recipe.steps
                  ? {
                      create: m.recipe.steps.map((step, index) => ({
                        stepNumber: index + 1,
                        instruction: step.instruction,
                        timerSeconds: step.timerSeconds,
                        photoPrompt: step.photoPrompt || false,
                      })),
                    }
                  : undefined,
              },
            }
          : undefined,
      },
      include: {
        recipe: {
          include: {
            ingredients: true,
            steps: {
              orderBy: { stepNumber: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: meal }, { status: 201 });
  } catch (error) {
    console.error("Error creating meal:", error);
    return NextResponse.json({ ok: false, error: "Failed to create meal" }, { status: 500 });
  }
}


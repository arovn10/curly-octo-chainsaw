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
  userId: z.string().min(1), // Allow any string for beta (not strict UUID)
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
    // Try importing auth - allow it to fail silently for public feed
    let session = null;
    try {
      // Import from server root (relative path)
      const authModule = await import("../../../auth");
      session = await authModule.auth();
    } catch (authError: any) {
      // Auth may not be needed for public feed - continue without it
      // console.warn("Auth check skipped for public feed:", authError?.message || authError);
    }
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || session?.user?.id;
    const isPublic = searchParams.get("isPublic");
    
    // Simplified query first - we'll add relations back if needed
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
            },
          }
        },
        user: {
          select: { id: true, username: true, name: true, image: true }
        },
      }
    });
    
    // Format response - fields are already correct from Prisma
    const formattedMeals = meals.map((meal: any) => ({
      ...meal,
      tags: Array.isArray(meal.tags) ? meal.tags : parseJsonField(meal.tags),
      photos: Array.isArray(meal.photos) ? meal.photos : parseJsonField(meal.photos),
      dateCooked: meal.createdAt?.toISOString() || meal.createdAt,
    }));
    
    return NextResponse.json({ ok: true, data: formattedMeals });
  } catch (error: any) {
    console.error("Error fetching meals:", error);
    console.error("Error details:", error?.message, error?.stack);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || "Failed to fetch meals",
      details: process.env.NODE_ENV === "development" ? error?.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Auth check for creating meals - optional in beta
    let session = null;
    try {
      const authModule = await import("../../../auth");
      session = await authModule.auth();
    } catch (authError: any) {
      // For beta, allow creation without strict auth
      console.warn("Auth check skipped for meal creation:", authError?.message || authError);
    }
    
    // Still allow creation even without session in beta mode
    // if (!session?.user?.id) {
    //   return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    // }

    const body = await req.json();
    console.log("Received meal data:", JSON.stringify(body, null, 2));
    
    const parsed = MealCreate.safeParse(body);
    
    if (!parsed.success) {
      console.error("Validation errors:", parsed.error.flatten());
      return NextResponse.json({ 
        ok: false, 
        error: "Validation failed",
        details: parsed.error.flatten() 
      }, { status: 400 });
    }

    const m = parsed.data;

    // Ensure user exists in database
    let dbUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: m.userId },
          { email: m.userId },
          { username: m.userId },
        ],
      },
    });
    
    if (!dbUser) {
      // Create new user
      const isEmail = m.userId.includes('@');
      const username = isEmail ? m.userId.split('@')[0] : m.userId.substring(0, 20);
      const isUUID = m.userId.length === 36 && m.userId.includes('-');
      
      dbUser = await prisma.user.create({
        data: {
          ...(isUUID ? { id: m.userId } : {}), // Only set id if it looks like a UUID
          email: isEmail ? m.userId : undefined,
          username: username,
          name: username,
        },
      });
    }

    const meal = await prisma.meal.create({
      data: {
        userId: dbUser.id,
        title: m.title,
        description: m.description,
        tags: Array.isArray(m.tags) ? m.tags : [],
        difficulty: m.difficulty || "MEDIUM",
        prepMinutes: m.prepMinutes,
        totalMinutes: m.totalMinutes,
        servings: m.servings,
        isPublic: m.isPublic ?? false,
        sentiment: m.sentiment || null,
        costPerServingCents: m.costPerServingCents,
        photos: Array.isArray(m.photos) ? m.photos : [],
        globalScore: 1500,
        ingredients: m.ingredients
          ? {
              create: m.ingredients.map((i) => ({
                rawName: i.rawName,
                quantity: i.quantity || null,
                unit: i.unit || null,
                unitPriceCents: i.unitPriceCents || null,
                isPantry: i.isPantry || false,
              })),
            }
          : undefined,
        recipe: m.recipe
          ? {
              create: {
                yield: m.recipe.yield || m.servings,
                sourceUrl: m.recipe.sourceUrl,
                sourceName: m.recipe.sourceName,
                utensils: Array.isArray(m.recipe.utensils) ? m.recipe.utensils : [],
                steps: m.recipe.steps
                  ? {
                      create: m.recipe.steps.map((step, index) => ({
                        stepNumber: index + 1,
                        instruction: step.instruction,
                        timerSeconds: step.timerSeconds || null,
                        photoPrompt: step.photoPrompt || false,
                      })),
                    }
                  : undefined,
              },
            }
          : undefined,
      },
      include: {
        ingredients: true,
        recipe: {
          include: {
            steps: {
              orderBy: { stepNumber: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json({ ok: true, data: meal }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating meal:", error);
    console.error("Error stack:", error?.stack);
    return NextResponse.json({ 
      ok: false, 
      error: error?.message || "Failed to create meal",
      details: process.env.NODE_ENV === "development" ? error?.stack : undefined
    }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { z } from "zod";

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
    steps: z.array(
      z.object({
        instruction: z.string(),
        timerSeconds: z.number().int().optional(),
      })
    ).optional(),
  }).optional(),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const isPublic = searchParams.get("isPublic");
    
    // Build where clause
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (isPublic === "true") {
      where.isPublic = true;
    }
    
    // Try to query database
    let meals;
    try {
      meals = await prisma.meal.findMany({
        where,
        take: 50,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          title: true,
          description: true,
          tags: true,
          difficulty: true,
          prepMinutes: true,
          cookMinutes: true,
          totalMinutes: true,
          servings: true,
          isPublic: true,
          sentiment: true,
          costPerServingCents: true,
          photos: true,
          globalScore: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { 
              id: true, 
              username: true, 
              name: true, 
              image: true 
            }
          },
          // Note: _count requires the Like and Comment models to exist
          // For now, return 0 if relations don't exist
          _count: {
            select: { 
              likes: true, 
              comments: true 
            }
          }
        }
      });
    } catch (dbError: any) {
      console.error("Database error:", dbError);
      console.error("Error code:", dbError?.code);
      console.error("Error meta:", dbError?.meta);
      
      // If table doesn't exist or connection fails, return empty array
      if (dbError?.code === 'P2021' || dbError?.code === 'P1001' || dbError?.message?.includes('does not exist')) {
        console.warn("Database table may not exist yet. Run migrations first.");
        return NextResponse.json({ 
          ok: true, 
          data: [],
          warning: "Database not initialized. Please run migrations."
        });
      }
      throw dbError;
    }
    
    // Format response safely
    const formattedMeals = meals.map((meal: any) => {
      // Safely parse tags
      let tags = [];
      if (Array.isArray(meal.tags)) {
        tags = meal.tags;
      } else if (typeof meal.tags === 'string') {
        try {
          tags = JSON.parse(meal.tags || '[]');
        } catch {
          tags = [];
        }
      }
      
      // Safely parse photos
      let photos = [];
      if (Array.isArray(meal.photos)) {
        photos = meal.photos;
      } else if (typeof meal.photos === 'string') {
        try {
          photos = JSON.parse(meal.photos || '[]');
        } catch {
          photos = [];
        }
      }
      
      return {
        ...meal,
        tags,
        photos,
        dateCooked: meal.createdAt?.toISOString() || meal.createdAt,
      };
    });
    
    return NextResponse.json({ ok: true, data: formattedMeals });
  } catch (error: any) {
    console.error("Error fetching meals:", error);
    console.error("Error message:", error?.message);
    console.error("Error code:", error?.code);
    console.error("Full error:", JSON.stringify(error, null, 2));
    
    // Return empty array instead of error to prevent app crash
    return NextResponse.json({ 
      ok: true, 
      data: [],
      warning: error?.message || "Failed to fetch meals",
      errorCode: error?.code
    });
  }
}

export async function POST(req: Request) {
  try {
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
        sentiment: m.sentiment,
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
                steps: m.recipe.steps
                  ? {
                      create: m.recipe.steps.map((step, index) => ({
                        stepNumber: index + 1,
                        instruction: step.instruction,
                        timerSeconds: step.timerSeconds || null,
                        photoPrompt: false,
                      })),
                    }
                  : undefined,
              },
            }
          : undefined,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        description: true,
        tags: true,
        difficulty: true,
        prepMinutes: true,
        cookMinutes: true,
        totalMinutes: true,
        servings: true,
        isPublic: true,
        sentiment: true,
        costPerServingCents: true,
        photos: true,
        globalScore: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { 
            id: true, 
            username: true, 
            name: true, 
            image: true 
          }
        },
        _count: {
          select: { 
            likes: true, 
            comments: true 
          }
        }
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

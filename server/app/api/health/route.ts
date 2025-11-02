import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      ok: true, 
      status: "healthy",
      database: "connected"
    });
  } catch (error: any) {
    console.error("Health check failed:", error);
    return NextResponse.json({ 
      ok: false, 
      status: "unhealthy",
      database: "disconnected",
      error: error?.message || "Unknown error"
    }, { status: 500 });
  }
}

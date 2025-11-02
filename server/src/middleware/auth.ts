// Authentication middleware for Next.js API routes
// This file is a placeholder - NextAuth handles auth via getServerSession

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export interface AuthRequest extends NextRequest {
  userId?: string;
}

/**
 * Middleware to authenticate API requests
 * Use getServerSession in API routes instead of this for NextAuth
 */
export async function authenticateRequest(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return {
      error: NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      ),
      session: null,
    };
  }

  return {
    session,
    user: session.user,
  };
}

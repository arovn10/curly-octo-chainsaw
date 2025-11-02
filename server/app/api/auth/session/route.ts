import { NextResponse } from "next/server";
import { auth } from "../../../../auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ ok: false, data: null });
    }

    return NextResponse.json({
      ok: true,
      data: {
        user: session.user,
        expires: session.expires,
      },
    });
  } catch (error) {
    console.error("Session error:", error);
    return NextResponse.json({ ok: false, error: "Failed to get session" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import { signIn } from "../../../../auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const LoginSchema = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { username, email } = parsed.data;

    if (!username && !email) {
      return NextResponse.json(
        { ok: false, error: "Username or email required" },
        { status: 400 }
      );
    }

    // Sign in (will create user if doesn't exist in beta)
    const result = await signIn("credentials", {
      username,
      email,
      redirect: false,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { ok: false, error: "Login failed" },
      { status: 500 }
    );
  }
}


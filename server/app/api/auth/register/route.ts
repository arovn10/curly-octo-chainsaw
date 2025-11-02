import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { z } from "zod";
import { signIn } from "../../../../auth";

export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(1),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, username, name } = parsed.data;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: email ? [{ email }, { username }] : [{ username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { ok: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        name: name || username,
      },
    });

    // Sign in the user
    await signIn("credentials", {
      username,
      email,
      redirect: false,
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { ok: false, error: "Registration failed" },
      { status: 500 }
    );
  }
}

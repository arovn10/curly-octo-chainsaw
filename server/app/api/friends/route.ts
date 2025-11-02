import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const type = searchParams.get("type") || "following"; // following or followers

    if (!userId) {
      return NextResponse.json({ ok: false, error: "userId required" }, { status: 400 });
    }

    if (type === "following") {
      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });

      const friends = follows.map((f) => ({
        id: f.following.id,
        name: f.following.name,
        username: f.following.username,
        image: f.following.image,
        isFollowing: true,
      }));

      return NextResponse.json({ ok: true, data: friends });
    } else {
      const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              username: true,
              image: true,
            },
          },
        },
      });

      const followers = follows.map((f) => ({
        id: f.follower.id,
        name: f.follower.name,
        username: f.follower.username,
        image: f.follower.image,
        isFollowing: false, // Check if you follow them back
      }));

      return NextResponse.json({ ok: true, data: followers });
    }
  } catch (error: any) {
    console.error("Error fetching friends:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to fetch friends" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { followerId, followingId } = body;

    if (!followerId || !followingId) {
      return NextResponse.json(
        { ok: false, error: "followerId and followingId required" },
        { status: 400 }
      );
    }

    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    return NextResponse.json({ ok: true, data: follow }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      // Already following
      return NextResponse.json({ ok: true, data: { alreadyFollowing: true } });
    }
    console.error("Error creating follow:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to follow" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const followerId = searchParams.get("followerId");
    const followingId = searchParams.get("followingId");

    if (!followerId || !followingId) {
      return NextResponse.json(
        { ok: false, error: "followerId and followingId required" },
        { status: 400 }
      );
    }

    await prisma.follow.deleteMany({
      where: {
        followerId,
        followingId,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Error unfollowing:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to unfollow" },
      { status: 500 }
    );
  }
}


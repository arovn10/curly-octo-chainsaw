import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadUrl } from "../../../lib/s3";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, contentType = "image/jpeg" } = body;

    if (!filename) {
      return NextResponse.json(
        { ok: false, error: "Filename is required" },
        { status: 400 }
      );
    }

    // Generate presigned URL for client to upload directly to S3
    const { uploadUrl, key, publicUrl } = await getSignedUploadUrl(filename, contentType);

    return NextResponse.json({
      ok: true,
      data: {
        uploadUrl,
        publicUrl,
        key,
      },
    });
  } catch (error: any) {
    console.error("Error generating upload URL:", error);
    console.error("Error details:", error?.message, error?.stack);
    return NextResponse.json(
      { 
        ok: false, 
        error: error?.message || "Failed to generate upload URL",
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}


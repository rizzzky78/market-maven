import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("imageUrl");

  if (!imageUrl) {
    return NextResponse.json(
      { error: "Missing imageUrl parameter" },
      { status: 400 }
    );
  }

  try {
    // Upload the image to Cloudinary (if not already uploaded)
    const uploadResult = await cloudinary.uploader.upload(imageUrl, {
      transformation: [
        { width: 10, height: 10, crop: "fill", quality: "auto" }, // Resize to 10x10 for blur
        { effect: "blur:1000" }, // Apply heavy blur
      ],
    });

    // Get the blurred image URL
    const blurDataURL = uploadResult.secure_url;

    return NextResponse.json({ blurDataURL });
  } catch (error) {
    console.error("Cloudinary error:", error);
    return NextResponse.json(
      { error: "Failed to generate blur data URL" },
      { status: 500 }
    );
  }
}

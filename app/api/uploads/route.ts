import { createHash } from "crypto";
import { NextResponse } from "next/server";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

function signUploadParams(params: Record<string, string | number>, secret: string) {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${secret}`)
    .digest("hex");
}

export async function POST(req: Request) {
  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Cloudinary upload is not configured" },
      { status: 500 },
    );
  }

  const incoming = await req.formData();
  const file = incoming.get("file");

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  const uploadParams = {
    folder: "bruinfun",
    timestamp: Math.round(Date.now() / 1000),
  };
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("api_key", apiKey);
  uploadData.append("folder", uploadParams.folder);
  uploadData.append("timestamp", String(uploadParams.timestamp));
  uploadData.append("signature", signUploadParams(uploadParams, apiSecret));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadData,
  });

  const json = (await res.json()) as CloudinaryUploadResponse;

  if (!res.ok) {
    return NextResponse.json(
      { error: json.error?.message || "Image upload failed" },
      { status: res.status },
    );
  }

  if (!json.secure_url) {
    return NextResponse.json(
      { error: "Cloudinary upload did not return a URL" },
      { status: 502 },
    );
  }

  return NextResponse.json({ secure_url: json.secure_url });
}

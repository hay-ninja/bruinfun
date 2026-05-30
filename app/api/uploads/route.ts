import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { getRequestUser } from "@/lib/auth";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_UPLOADS_PER_WINDOW = 10;

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

type RateLimitWindow = {
  count: number;
  resetAt: number;
};

const uploadRateLimitStore = new Map<string, RateLimitWindow>();

function signUploadParams(params: Record<string, string | number>, secret: string) {
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${payload}${secret}`)
    .digest("hex");
}

function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}

function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function checkUploadRateLimit(key: string): { limited: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const current = uploadRateLimitStore.get(key);

  if (!current || now >= current.resetAt) {
    uploadRateLimitStore.set(key, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { limited: false, retryAfterSeconds: 0 };
  }

  if (current.count >= MAX_UPLOADS_PER_WINDOW) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  uploadRateLimitStore.set(key, current);
  return { limited: false, retryAfterSeconds: 0 };
}

function pruneExpiredRateLimitEntries(now: number) {
  if (uploadRateLimitStore.size < 1000) {
    return;
  }

  for (const [key, window] of uploadRateLimitStore.entries()) {
    if (now >= window.resetAt) {
      uploadRateLimitStore.delete(key);
    }
  }
}

export function __resetUploadRateLimitForTests() {
  uploadRateLimitStore.clear();
}

export async function POST(req: Request) {
  const auth = await getRequestUser(req);
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientIp = getClientIp(req);
  const rateLimitKey = `${auth.user.id}:${clientIp}`;
  const now = Date.now();
  pruneExpiredRateLimitEntries(now);
  const rateLimit = checkUploadRateLimit(rateLimitKey);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again soon." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      },
    );
  }

  const cloudinary = getCloudinaryConfig();
  if (!cloudinary) {
    return NextResponse.json(
      { error: "Cloudinary upload is not configured" },
      { status: 500 },
    );
  }

  const incoming = await req.formData();
  const file = incoming.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "file must be an image" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "file exceeds 10MB limit" },
      { status: 400 },
    );
  }

  const uploadParams = {
    folder: "bruinfun",
    timestamp: Math.round(Date.now() / 1000),
  };
  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("api_key", cloudinary.apiKey);
  uploadData.append("folder", uploadParams.folder);
  uploadData.append("timestamp", String(uploadParams.timestamp));
  uploadData.append("signature", signUploadParams(uploadParams, cloudinary.apiSecret));

  let res: Response;
  try {
    res = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`, {
      method: "POST",
      body: uploadData,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { error: "Image upload service is unavailable" },
      { status: 502 },
    );
  }

  const json = (await res.json().catch(() => ({}))) as CloudinaryUploadResponse;

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

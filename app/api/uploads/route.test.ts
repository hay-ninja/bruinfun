import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetRequestUser } = vi.hoisted(() => ({
  mockGetRequestUser: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getRequestUser: mockGetRequestUser,
}));

const cloudinaryFetchResponse = {
  ok: true,
  status: 200,
  json: vi.fn().mockResolvedValue({ secure_url: "https://res.cloudinary.com/demo/image/upload/v1/test.jpg" }),
} as unknown as Response;

function makeRequest(file?: File) {
  const data = new FormData();
  if (file) {
    data.append("file", file);
  }

  return new Request("http://localhost/api/uploads", {
    method: "POST",
    body: data,
  });
}

describe("POST /api/uploads", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";
    mockGetRequestUser.mockResolvedValue({ user: { id: "user-123" }, db: {} as any, error: null });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(cloudinaryFetchResponse);
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetRequestUser.mockResolvedValue({ user: null, error: "Unauthorized" });
    const { POST } = await import("./route");

    const res = await POST(makeRequest(new File(["abc"], "test.jpg", { type: "image/jpeg" })));

    expect(res.status).toBe(401);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("returns 400 when file is missing", async () => {
    const { POST } = await import("./route");

    const res = await POST(makeRequest());

    expect(res.status).toBe(400);
  });

  it("returns 400 when file is not an image", async () => {
    const { POST } = await import("./route");

    const res = await POST(makeRequest(new File(["abc"], "notes.txt", { type: "text/plain" })));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "file must be an image" });
  });

  it("returns 400 when file exceeds size limit", async () => {
    const { POST } = await import("./route");
    const bigData = new Uint8Array(10 * 1024 * 1024 + 1);

    const res = await POST(makeRequest(new File([bigData], "big.jpg", { type: "image/jpeg" })));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "file exceeds 10MB limit" });
  });

  it("returns 201 payload on successful upload", async () => {
    const { POST } = await import("./route");

    const res = await POST(makeRequest(new File(["abc"], "test.jpg", { type: "image/jpeg" })));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      secure_url: "https://res.cloudinary.com/demo/image/upload/v1/test.jpg",
    });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });
});

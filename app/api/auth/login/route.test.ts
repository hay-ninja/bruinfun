import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { signInWithPassword, createServerSupabaseClient } = vi.hoisted(() => {
  const signInWithPassword = vi.fn();
  return {
    signInWithPassword,
    createServerSupabaseClient: vi.fn(async () => ({
      auth: {
        signInWithPassword,
      },
    })),
  };
});

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/login", () => {
  it("returns 400 when email/password are missing", async () => {
    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 when login succeeds", async () => {
    signInWithPassword.mockResolvedValue({
      data: {
        user: { id: "u1" },
        session: { access_token: "token" },
      },
      error: null,
    });

    const req = new Request("http://localhost/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "Password123!",
    });
  });
});
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { signUp, createServerSupabaseClient } = vi.hoisted(() => {
  const signUp = vi.fn();
  return {
    signUp,
    createServerSupabaseClient: vi.fn(async () => ({
      auth: {
        signUp,
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


describe("POST /api/auth/signup", () => {
  it("returns 400 when required fields are missing", async () => {
    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("calls supabase.auth.signUp with metadata", async () => {
    signUp.mockResolvedValue({
      data: {
        user: { id: "u1" },
        session: null,
      },
      error: null,
    });

    const req = new Request("http://localhost/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
        username: "bruin_user",
        first_name: "Ryder",
        last_name: "Bear",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);
    expect(signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "Password123!",
      options: {
        data: {
          username: "bruin_user",
          first_name: "Ryder",
          last_name: "Bear",
        },
      },
    });
  });
});
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

const { signOut, createServerSupabaseClient } = vi.hoisted(() => {
  const signOut = vi.fn();
  return {
    signOut,
    createServerSupabaseClient: vi.fn(async () => ({
      auth: {
        signOut,
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


describe("POST /api/auth/logout", () => {
  it("returns 200 when logout succeeds", async () => {
    signOut.mockResolvedValue({ error: null });

    const res = await POST();
    expect(res.status).toBe(200);
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("returns 400 when logout fails", async () => {
    signOut.mockResolvedValue({ error: { message: "logout failed" } });

    const res = await POST();
    expect(res.status).toBe(400);
  });
});
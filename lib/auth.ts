import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type AuthResult =
  | { user: User; db: SupabaseClient; error: null }
  | { user: null; error: string };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function getRequestUser(req?: NextRequest | Request): Promise<AuthResult> {
  const token = req?.headers.get("authorization")?.replace("Bearer ", "");

  if (token) {
    const db = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
      error,
    } = await db.auth.getUser(token);

    if (error || !user) {
      return { user: null, error: "Unauthorized" };
    }

    return { user, db, error: null };
  }

  const db = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await db.auth.getUser();

  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  return { user, db, error: null };
}

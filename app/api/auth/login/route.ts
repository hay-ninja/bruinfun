import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as LoginBody;
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "email and password are required" },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json(
    {
      user: data.user,
      session: data.session,
      message: "Login successful",
    },
    { status: 200 },
  );
}
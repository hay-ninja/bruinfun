import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type SignupBody = {
  email?: string;
  password?: string;
  username?: string;
  first_name?: string;
  last_name?: string;
};

export async function POST(req: Request) {
  const body = (await req.json()) as SignupBody;
  const { email, password, username, first_name, last_name } = body;

  if (!email || !password || !username || !first_name || !last_name) {
    return NextResponse.json(
      {
        error:
          "email, password, username, first_name, and last_name are required",
      },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        first_name,
        last_name,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      user: data.user,
      session: data.session,
      message: "Signup successful",
    },
    { status: 201 },
  );
}
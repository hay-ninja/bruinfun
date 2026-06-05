-- Supabase Auth disconnect cleanup.
-- This removes legacy profile auto-provisioning from auth.users.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
create table if not exists public.auth_credentials (
  profile_id uuid primary key references public.profiles(profile_id) on delete cascade,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists auth_credentials_email_idx
on public.auth_credentials (email);

create or replace function public.set_auth_credentials_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists auth_credentials_set_updated_at on public.auth_credentials;

create trigger auth_credentials_set_updated_at
before update on public.auth_credentials
for each row execute procedure public.set_auth_credentials_updated_at();

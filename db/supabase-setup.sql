-- Run once in the SQL Editor of the dedicated Yojeumpick Supabase project.
-- No existing content is replaced. Server-side access only.
begin;
create table if not exists public.yojeumpick_content (
 id text primary key check (id='main'),
 draft jsonb not null check (jsonb_typeof(draft)='object'),
 published jsonb not null check (jsonb_typeof(published)='object'),
 revision integer not null default 0 check (revision>=0),
 published_revision integer not null default 0 check (published_revision>=0),
 updated_at timestamptz default now()
);
alter table public.yojeumpick_content enable row level security;
revoke all on table public.yojeumpick_content from public,anon,authenticated,service_role;
grant select,insert,update on table public.yojeumpick_content to service_role;
commit;

create table guests (
id uuid primary key default gen_random_uuid(),
guest_code text unique not null,
first_name text not null,
last_name text not null,
attending boolean,
guests_count integer default 1,
comment text,
responded_at timestamptz,
created_at timestamptz default now()
);

alter table guests enable row level security;

create policy public_select on guests for select using (true);
create policy public_update on guests for update using (true) with check (true);

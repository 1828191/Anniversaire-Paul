-- À exécuter une seule fois dans Supabase > SQL Editor.
-- Ce script complète les tables déjà créées et autorise le site public à fonctionner.

alter table public.guests enable row level security;
alter table public.responses enable row level security;

-- Garantit une seule réponse par invité, nécessaire pour l'upsert.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'unique_response_per_guest'
  ) then
    alter table public.responses
      add constraint unique_response_per_guest unique (guest_id);
  end if;
end $$;

-- Supprime les anciennes politiques portant les mêmes noms pour rendre le script réexécutable.
drop policy if exists "Public can read guests" on public.guests;
drop policy if exists "Public can read responses" on public.responses;
drop policy if exists "Public can insert responses" on public.responses;
drop policy if exists "Public can update responses" on public.responses;

create policy "Public can read guests"
on public.guests for select
to anon, authenticated
using (true);

create policy "Public can read responses"
on public.responses for select
to anon, authenticated
using (true);

create policy "Public can insert responses"
on public.responses for insert
to anon, authenticated
with check (
  guest_count >= 1
  and exists (
    select 1 from public.guests g
    where g.id = guest_id and guest_count <= g.max_guests
  )
);

create policy "Public can update responses"
on public.responses for update
to anon, authenticated
using (true)
with check (
  guest_count >= 1
  and exists (
    select 1 from public.guests g
    where g.id = guest_id and guest_count <= g.max_guests
  )
);

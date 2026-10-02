alter table public.guests enable row level security;
alter table public.responses enable row level security;
do $$ begin if not exists(select 1 from pg_constraint where conname='unique_response_per_guest') then alter table public.responses add constraint unique_response_per_guest unique(guest_id); end if; end $$;
drop policy if exists "Public can read guests" on public.guests;
drop policy if exists "Public can read responses" on public.responses;
drop policy if exists "Public can insert responses" on public.responses;
drop policy if exists "Public can update responses" on public.responses;
create policy "Public can read guests" on public.guests for select to anon,authenticated using(true);
create policy "Public can read responses" on public.responses for select to anon,authenticated using(true);
create policy "Public can insert responses" on public.responses for insert to anon,authenticated with check(guest_count>=1);
create policy "Public can update responses" on public.responses for update to anon,authenticated using(true) with check(guest_count>=1);
-- La colonne max_guests reste dans guests pour compatibilité, mais le site ne l'utilise plus.

-- V7.5 - correctif centre de contrôle + vérification des droits
-- À exécuter après le SQL V7.4. Peut être relancé sans supprimer les données.

create or replace view public.registration_people_dashboard_v74 as
select
  p.id as person_id,
  g.id as registration_id,
  p.first_name,
  p.last_name,
  g.attendance,
  g.message,
  g.responded_at
from public.registration_people p
join public.registration_groups g on g.id = p.registration_id;

grant usage on schema public to anon, authenticated;
grant select on public.registration_people_dashboard_v74 to anon, authenticated;
grant execute on function public.submit_registration_v74(boolean,text,jsonb) to anon, authenticated;
grant execute on function public.delete_registration_person_v74(bigint) to anon, authenticated;

-- Contrôle final : ce SELECT doit afficher une ligne PAR PERSONNE enregistrée.
select *
from public.registration_people_dashboard_v74
order by responded_at desc, registration_id desc, person_id asc;

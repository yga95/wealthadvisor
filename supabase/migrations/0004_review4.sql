-- =========================================================
-- 0004_review4.sql : corrections après la Review #4
-- À exécuter une fois, après 0001 à 0003.
-- =========================================================

-- 1. Raison d'un échec de génération (Review #4, Recommended 1)
--    Une catégorie courte, jamais le message brut de l'API.
alter table public.recommendations
  add column error_reason text,
  add constraint error_reason_values
    check (error_reason in ('config', 'rate_limit', 'api', 'invalid_output')),
  add constraint error_reason_only_when_failed
    check (error_reason is null or status = 'failed');

-- 2. guard_reco_update : la nouvelle colonne est figée elle aussi.
--    Un conseiller ne peut toujours faire que done -> archived, sans rien toucher d'autre.
create or replace function public.guard_reco_update() returns trigger
language plpgsql set search_path = public as $$
begin
  -- chemin serveur (service role, sans JWT) : vérifié dans le code (§2.8)
  if auth.uid() is null then return new; end if;
  if old.status <> 'done' or new.status <> 'archived'
     or (new.client_id, new.created_by, new.pct_actions, new.pct_obligations,
         new.pct_liquidites, new.explanation, new.error_reason, new.created_at)
        is distinct from
        (old.client_id, old.created_by, old.pct_actions, old.pct_obligations,
         old.pct_liquidites, old.explanation, old.error_reason, old.created_at) then
    raise exception 'only done -> archived is allowed';
  end if;
  return new;
end $$;

-- 3. Changement de conseiller ou de rôle (Review #4, Required 3 + Recommended 4)
--    Décision : les notes appartiennent au couple conseiller–client.
--    Quand ce couple se termine, les notes de l'ancien conseiller sur ce client
--    sont supprimées, au lieu de rester en base sans que personne ne puisse les lire.
--    Le trigger s'exécute dans la même transaction que l'UPDATE de l'admin :
--    rôle, désaffectation des clients et suppression des notes réussissent ou échouent ensemble.
create function public.after_assignment_change() returns trigger
language plpgsql security definer
set search_path = public as $$
begin
  -- a. Le client change de conseiller (ou n'en a plus) : notes de l'ancien supprimées.
  if old.advisor_id is not null and new.advisor_id is distinct from old.advisor_id then
    delete from public.notes
    where client_id = new.id and author_id = old.advisor_id;
  end if;

  -- b. Un conseiller perd son rôle : ses clients repassent « non affectés ».
  --    Cet UPDATE redéclenche ce trigger pour chaque client, ce qui supprime ses notes (cas a).
  if old.role = 'advisor' and new.role <> 'advisor' then
    update public.users set advisor_id = null where advisor_id = new.id;
  end if;

  return null;
end $$;
revoke execute on function public.after_assignment_change() from public, anon, authenticated;

create trigger t_after_assignment_change
  after update of role, advisor_id on public.users
  for each row execute function public.after_assignment_change();

-- =========================================================
-- 0002_functions_triggers.sql  (Design Rev. 3, §2.3–2.5)
-- =========================================================

-- 1. auth_role() : lit le rôle de l'appelant sans boucle RLS (§2.4)
create function public.auth_role() returns user_role
language sql security definer stable
set search_path = public as $$
  select role from public.users where id = auth.uid()
$$;

-- 2. Inscription : crée la ligne public.users, rôle forcé à 'client' (§2.5)
create function public.handle_new_user() returns trigger
language plpgsql security definer
set search_path = public as $$
begin
  insert into public.users (id, full_name, role)
  values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
                  'New user'), 120),
    'client'                  -- jamais lu depuis la requête
  );
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Protection des colonnes de users (§2.5)
create function public.guard_user_cols() returns trigger
language plpgsql set search_path = public as $$
declare
  r          user_role := public.auth_role();   -- NULL sans JWT utilisateur
  is_admin   boolean   := coalesce(r = 'admin', false);
  is_self    boolean   := coalesce(old.id = auth.uid(), false);
  is_advisor boolean   := coalesce(r = 'advisor'
                                   and old.advisor_id = auth.uid(), false);
begin
  -- contexte système uniquement : migrations, SQL editor, actions de clé étrangère
  if current_user = 'postgres' then return new; end if;

  if new.id is distinct from old.id
     or new.created_at is distinct from old.created_at then
    raise exception 'id and created_at are immutable';
  end if;
  if (new.role is distinct from old.role
      or new.advisor_id is distinct from old.advisor_id) and not is_admin then
    raise exception 'only an admin can change role or advisor_id';
  end if;
  if new.full_name is distinct from old.full_name and not (is_self or is_admin) then
    raise exception 'full_name can only be changed by its owner or an admin';
  end if;
  if (new.age is distinct from old.age
      or new.risk_tolerance is distinct from old.risk_tolerance)
     and not is_advisor then
    raise exception 'age and risk_tolerance: assigned advisor only';
  end if;
  return new;
end $$;
create trigger t_guard_user_cols before update on public.users
  for each row execute function public.guard_user_cols();

-- 4. Archivage des recommandations : seulement done -> archived (§2.3)
create function public.guard_reco_update() returns trigger
language plpgsql set search_path = public as $$
begin
  -- chemin serveur (service role, sans JWT) : vérifié dans le code (§2.8)
  if auth.uid() is null then return new; end if;
  if old.status <> 'done' or new.status <> 'archived'
     or (new.client_id, new.created_by, new.pct_actions, new.pct_obligations,
         new.pct_liquidites, new.explanation, new.created_at)
        is distinct from
        (old.client_id, old.created_by, old.pct_actions, old.pct_obligations,
         old.pct_liquidites, old.explanation, old.created_at) then
    raise exception 'only done -> archived is allowed';
  end if;
  return new;
end $$;
create trigger t_guard_reco before update on public.recommendations
  for each row execute function public.guard_reco_update();

-- 5. updated_at mis à jour automatiquement sur assets et income
create function public.set_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;
create trigger t_assets_updated_at before update on public.assets
  for each row execute function public.set_updated_at();
create trigger t_income_updated_at before update on public.income
  for each row execute function public.set_updated_at();

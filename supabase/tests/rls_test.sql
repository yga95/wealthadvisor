-- Test RLS v2 : chaque ligne doit finir par ✅
create schema if not exists tests;
drop table if exists tests.results;
create table tests.results (n int, test text, attendu text, obtenu text);
grant usage on schema tests to authenticated;
grant insert on tests.results to authenticated;

do $$
declare
  admin_id uuid := (select id from public.users where full_name = 'Admin Test');
  adv_id   uuid := (select id from public.users where full_name = 'Advisor One');
  c1_id    uuid := (select id from public.users where full_name = 'Client One');
  c2_id    uuid := (select id from public.users where full_name = 'Client Two');
  n int;
begin
  -- ===================== advisor1 =====================
  perform set_config('request.jwt.claims', json_build_object('sub', adv_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.assets;
  insert into tests.results values (1, 'advisor1 : actifs visibles (Client One seul)', '1', n::text);
  select count(*) into n from public.users;
  insert into tests.results values (2, 'advisor1 : users visibles (lui + Client One)', '2', n::text);
  begin
    insert into public.notes (client_id, author_id, content) values (c2_id, adv_id, 'test');
    insert into tests.results values (3, 'advisor1 : note sur Client Two (pas son client)', 'refusé', 'ACCEPTÉ');
  exception when others then
    insert into tests.results values (3, 'advisor1 : note sur Client Two (pas son client)', 'refusé', 'refusé');
  end;
  begin
    insert into public.notes (client_id, author_id, content) values (c1_id, adv_id, 'Prudent sur les actions');
    insert into tests.results values (4, 'advisor1 : note sur Client One (son client)', 'ok', 'ok');
  exception when others then
    insert into tests.results values (4, 'advisor1 : note sur Client One (son client)', 'ok', 'refusé : ' || sqlerrm);
  end;
  update public.users set age = 40 where id = c1_id;
  get diagnostics n = row_count;
  insert into tests.results values (5, 'advisor1 : modifie l''âge de Client One', '1', n::text);
  begin
    update public.users set role = 'admin' where id = c1_id;
    get diagnostics n = row_count;
    insert into tests.results values (6, 'advisor1 : passe Client One en admin', 'refusé',
      case when n = 0 then '0 ligne touchée' else 'ACCEPTÉ' end);
  exception when others then
    insert into tests.results values (6, 'advisor1 : passe Client One en admin', 'refusé', 'refusé');
  end;
  update public.users set age = 50 where id = c2_id;
  get diagnostics n = row_count;
  insert into tests.results values (7, 'advisor1 : modifie l''âge de Client Two (invisible)', '0', n::text);
  reset role;

  -- ===================== client1 =====================
  perform set_config('request.jwt.claims', json_build_object('sub', c1_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.assets;
  insert into tests.results values (8, 'client1 : actifs visibles (les siens)', '1', n::text);
  select count(*) into n from public.users;
  insert into tests.results values (9, 'client1 : users visibles (lui seul)', '1', n::text);
  select count(*) into n from public.notes;
  insert into tests.results values (10, 'client1 : notes visibles (jamais)', '0', n::text);
  begin
    insert into public.assets (owner_id, label, amount) values (c1_id, 'Hack', 1);
    insert into tests.results values (11, 'client1 : ajoute un actif', 'refusé', 'ACCEPTÉ');
  exception when others then
    insert into tests.results values (11, 'client1 : ajoute un actif', 'refusé', 'refusé');
  end;
  begin
    update public.users set role = 'admin' where id = c1_id;
    get diagnostics n = row_count;
    insert into tests.results values (12, 'client1 : se met admin', 'refusé',
      case when n = 0 then '0 ligne touchée' else 'ACCEPTÉ' end);
  exception when others then
    insert into tests.results values (12, 'client1 : se met admin', 'refusé', 'refusé');
  end;
  begin
    update public.users set age = 20 where id = c1_id;
    get diagnostics n = row_count;
    insert into tests.results values (13, 'client1 : modifie son âge', 'refusé',
      case when n = 0 then '0 ligne touchée' else 'ACCEPTÉ' end);
  exception when others then
    insert into tests.results values (13, 'client1 : modifie son âge', 'refusé', 'refusé');
  end;
  update public.users set full_name = 'Client One' where id = c1_id;
  get diagnostics n = row_count;
  insert into tests.results values (14, 'client1 : modifie son nom', '1', n::text);
  reset role;

  -- ===================== admin =====================
  perform set_config('request.jwt.claims', json_build_object('sub', admin_id, 'role', 'authenticated')::text, true);
  set local role authenticated;

  select count(*) into n from public.assets;
  insert into tests.results values (15, 'admin : actifs visibles (séparation des pouvoirs)', '0', n::text);
  select count(*) into n from public.notes;
  insert into tests.results values (16, 'admin : notes visibles', '0', n::text);
  select count(*) into n from public.users;
  insert into tests.results values (17, 'admin : users visibles (tous)', '4', n::text);
  update public.users set advisor_id = adv_id where id = c2_id;
  get diagnostics n = row_count;
  insert into tests.results values (18, 'admin : affecte Client Two à advisor1', '1', n::text);
  reset role;

  -- remise à l'état de départ (exécuté en tant que postgres)
  update public.users set advisor_id = null where id = c2_id;
end $$;

select n as "#", test, attendu, obtenu,
       case when attendu = obtenu then '✅' else '❌' end as ok
from tests.results order by n;
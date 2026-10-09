-- 0003_rls_policies.sql  (Design Rev. 3, §2.6) : 24 politiques

-- ===== users =====
create policy users_select_self on public.users for select to authenticated
  using (id = auth.uid());
create policy users_select_advisor on public.users for select to authenticated
  using (public.auth_role() = 'advisor' and advisor_id = auth.uid());
create policy users_select_admin on public.users for select to authenticated
  using (public.auth_role() = 'admin');
create policy users_update_self on public.users for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy users_update_advisor on public.users for update to authenticated
  using      (public.auth_role() = 'advisor' and advisor_id = auth.uid())
  with check (public.auth_role() = 'advisor' and advisor_id = auth.uid());
create policy users_update_admin on public.users for update to authenticated
  using (public.auth_role() = 'admin') with check (public.auth_role() = 'admin');

-- ===== assets =====
create policy assets_select_client on public.assets for select to authenticated
  using (public.auth_role() = 'client' and owner_id = auth.uid());
create policy assets_select_advisor on public.assets for select to authenticated
  using (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()));
create policy assets_insert_advisor on public.assets for insert to authenticated
  with check (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()));
create policy assets_update_advisor on public.assets for update to authenticated
  using (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()))
  with check (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()));
create policy assets_delete_advisor on public.assets for delete to authenticated
  using (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()));

-- ===== income (identique à assets) =====
create policy income_select_client on public.income for select to authenticated
  using (public.auth_role() = 'client' and owner_id = auth.uid());
create policy income_select_advisor on public.income for select to authenticated
  using (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()));
create policy income_insert_advisor on public.income for insert to authenticated
  with check (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()));
create policy income_update_advisor on public.income for update to authenticated
  using (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()))
  with check (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()));
create policy income_delete_advisor on public.income for delete to authenticated
  using (public.auth_role() = 'advisor'
         and owner_id in (select id from public.users where advisor_id = auth.uid()));

-- ===== recommendations =====
create policy reco_select_advisor on public.recommendations for select to authenticated
  using (public.auth_role() = 'advisor'
         and client_id in (select id from public.users where advisor_id = auth.uid()));
create policy reco_select_client on public.recommendations for select to authenticated
  using (public.auth_role() = 'client' and client_id = auth.uid() and status = 'done');
create policy reco_insert_advisor on public.recommendations for insert to authenticated
  with check (public.auth_role() = 'advisor'
         and client_id in (select id from public.users where advisor_id = auth.uid())
         and created_by = auth.uid() and status = 'generating');
create policy reco_archive_advisor on public.recommendations for update to authenticated
  using (public.auth_role() = 'advisor' and status = 'done'
         and client_id in (select id from public.users where advisor_id = auth.uid()))
  with check (status = 'archived'
         and client_id in (select id from public.users where advisor_id = auth.uid()));

-- ===== notes =====
create policy notes_insert_advisor on public.notes for insert to authenticated
  with check (public.auth_role() = 'advisor' and author_id = auth.uid()
         and client_id in (select id from public.users where advisor_id = auth.uid()));
create policy notes_select_advisor on public.notes for select to authenticated
  using (public.auth_role() = 'advisor' and author_id = auth.uid()
         and client_id in (select id from public.users where advisor_id = auth.uid()));
create policy notes_update_advisor on public.notes for update to authenticated
  using (public.auth_role() = 'advisor' and author_id = auth.uid()
         and client_id in (select id from public.users where advisor_id = auth.uid()))
  with check (public.auth_role() = 'advisor' and author_id = auth.uid()
         and client_id in (select id from public.users where advisor_id = auth.uid()));
create policy notes_delete_advisor on public.notes for delete to authenticated
  using (public.auth_role() = 'advisor' and author_id = auth.uid()
         and client_id in (select id from public.users where advisor_id = auth.uid()));
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'players'
      and policyname = 'demo create players'
  ) then
    create policy "demo create players"
      on public.players
      for insert
      with check (true);
  end if;
end $$;

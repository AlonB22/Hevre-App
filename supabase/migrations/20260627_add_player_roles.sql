alter table public.players
  add column if not exists role text not null default 'player';

alter table public.players
  drop constraint if exists players_role_check;

alter table public.players
  add constraint players_role_check
  check (role in ('player', 'organizer', 'municipality_admin'));

update public.players
set role = 'organizer'
where id in (1, 2, 3, 6, 9, 12, 14, 16, 19, 20, 22);

update public.players
set role = 'municipality_admin'
where id = 31;

create table if not exists public.players (
  id bigint primary key,
  name text not null,
  username text not null unique,
  email text not null unique,
  position text not null,
  rating numeric(4, 2) not null check (rating >= 1 and rating <= 10),
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  clean_sheets integer not null default 0 check (clean_sheets >= 0),
  games_played integer not null default 0 check (games_played >= 0),
  neighborhood text not null,
  paid boolean not null default false,
  role text not null default 'player' check (role in ('player', 'organizer', 'municipality_admin')),
  bio text,
  avatar_data_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.locations (
  id bigint primary key,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  type text not null check (type in ('turf', 'grass', 'indoor', 'sand'))
);

create table if not exists public.games (
  id bigint primary key,
  location_id bigint not null references public.locations(id),
  title text not null,
  date date not null,
  time text not null,
  format text not null,
  spots_total integer not null check (spots_total > 0),
  price_per_player numeric(8, 2) not null check (price_per_player >= 0),
  organizer_id bigint not null references public.players(id),
  status text not null check (status in ('upcoming', 'past', 'cancelled')),
  score_a integer check (score_a >= 0),
  score_b integer check (score_b >= 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.game_players (
  game_id bigint not null references public.games(id) on delete cascade,
  player_id bigint not null references public.players(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (game_id, player_id)
);

create table if not exists public.game_payments (
  game_id bigint not null references public.games(id) on delete cascade,
  player_id bigint not null references public.players(id) on delete cascade,
  paid_at timestamptz not null default now(),
  primary key (game_id, player_id)
);

create table if not exists public.game_teams (
  game_id bigint not null references public.games(id) on delete cascade,
  player_id bigint not null references public.players(id) on delete cascade,
  team text not null check (team in ('A', 'B')),
  primary key (game_id, player_id)
);

create table if not exists public.player_stats (
  game_id bigint not null references public.games(id) on delete cascade,
  player_id bigint not null references public.players(id) on delete cascade,
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  primary key (game_id, player_id)
);

create table if not exists public.ratings (
  game_id bigint not null references public.games(id) on delete cascade,
  rated_player_id bigint not null references public.players(id) on delete cascade,
  rater_id bigint not null references public.players(id) on delete cascade,
  score numeric(3, 1) not null check (score >= 1 and score <= 10),
  created_at timestamptz not null default now(),
  primary key (game_id, rated_player_id, rater_id),
  check (rated_player_id <> rater_id)
);

create table if not exists public.balance_feedback (
  game_id bigint not null references public.games(id) on delete cascade,
  user_id bigint not null references public.players(id) on delete cascade,
  balance text check (balance in ('Team A stronger', 'Balanced', 'Team B stronger')),
  note text,
  created_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

create index if not exists idx_games_status_date on public.games (status, date);
create index if not exists idx_games_location_id on public.games (location_id);
create index if not exists idx_game_players_player_id on public.game_players (player_id);
create index if not exists idx_game_payments_player_id on public.game_payments (player_id);
create index if not exists idx_game_teams_game_team on public.game_teams (game_id, team);
create index if not exists idx_ratings_rated_player_id on public.ratings (rated_player_id);

alter table public.players enable row level security;
alter table public.locations enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.game_payments enable row level security;
alter table public.game_teams enable row level security;
alter table public.player_stats enable row level security;
alter table public.ratings enable row level security;
alter table public.balance_feedback enable row level security;

create policy "public read players" on public.players for select using (true);
create policy "public read locations" on public.locations for select using (true);
create policy "public read games" on public.games for select using (true);
create policy "public read game_players" on public.game_players for select using (true);
create policy "public read game_payments" on public.game_payments for select using (true);
create policy "public read game_teams" on public.game_teams for select using (true);
create policy "public read player_stats" on public.player_stats for select using (true);
create policy "public read ratings" on public.ratings for select using (true);
create policy "public read balance_feedback" on public.balance_feedback for select using (true);

create policy "demo update player profiles" on public.players for update using (true) with check (true);
create policy "demo manage games" on public.games for update using (true) with check (true);
create policy "demo manage game_players" on public.game_players for all using (true) with check (true);
create policy "demo manage game_payments" on public.game_payments for all using (true) with check (true);
create policy "demo manage game_teams" on public.game_teams for all using (true) with check (true);
create policy "demo manage ratings" on public.ratings for all using (true) with check (true);
create policy "demo manage balance_feedback" on public.balance_feedback for all using (true) with check (true);

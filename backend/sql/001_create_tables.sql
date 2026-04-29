create table if not exists countries (
    id bigserial primary key,
    name varchar(120) not null unique,
    code varchar(8) unique
);

create table if not exists competitions (
    id bigserial primary key,
    name varchar(160) not null unique,
    slug varchar(180) not null unique,
    region varchar(120)
);

create table if not exists seasons (
    id bigserial primary key,
    competition_id bigint not null references competitions(id) on delete cascade,
    name varchar(40) not null,
    year_start integer,
    year_end integer,
    constraint uq_seasons_competition_name unique (competition_id, name)
);

create table if not exists teams (
    id bigserial primary key,
    name varchar(160) not null,
    slug varchar(180) not null unique,
    country_id bigint references countries(id),
    constraint uq_teams_name_country unique (name, country_id)
);

create table if not exists venues (
    id bigserial primary key,
    name varchar(180) not null,
    city varchar(120),
    country_id bigint references countries(id),
    constraint uq_venues_name_country unique (name, country_id)
);

create table if not exists data_sources (
    id bigserial primary key,
    name varchar(160) not null unique,
    base_url varchar(500),
    is_official boolean not null default false,
    is_active boolean not null default true
);

create table if not exists matches (
    id bigserial primary key,
    competition_id bigint not null references competitions(id),
    season_id bigint not null references seasons(id),
    home_team_id bigint not null references teams(id),
    away_team_id bigint not null references teams(id),
    venue_id bigint references venues(id),
    country_id bigint references countries(id),
    data_source_id bigint references data_sources(id),
    match_date timestamptz not null,
    round varchar(80),
    stage varchar(120),
    status varchar(40) not null default 'scheduled',
    home_score integer,
    away_score integer,
    source_url varchar(500),
    external_match_id varchar(160),
    last_updated_at timestamptz not null default now(),
    created_at timestamptz not null default now(),
    constraint uq_matches_competition_season_teams_date unique (
        competition_id,
        season_id,
        home_team_id,
        away_team_id,
        match_date
    ),
    constraint uq_matches_source_external_id unique (data_source_id, external_match_id)
);

create table if not exists match_events (
    id bigserial primary key,
    match_id bigint not null references matches(id) on delete cascade,
    team_id bigint references teams(id),
    minute integer,
    event_type varchar(80) not null,
    player_name varchar(160),
    description text,
    created_at timestamptz not null default now()
);

create table if not exists standings (
    id bigserial primary key,
    competition_id bigint not null references competitions(id),
    season_id bigint not null references seasons(id),
    team_id bigint not null references teams(id),
    played integer not null default 0,
    won integer not null default 0,
    drawn integer not null default 0,
    lost integer not null default 0,
    goals_for integer not null default 0,
    goals_against integer not null default 0,
    points integer not null default 0,
    last_updated_at timestamptz not null default now(),
    constraint uq_standings_competition_season_team unique (competition_id, season_id, team_id)
);

create table if not exists ingestion_logs (
    id bigserial primary key,
    competition_id bigint references competitions(id),
    data_source_id bigint references data_sources(id),
    status varchar(40) not null,
    records_found integer not null default 0,
    records_inserted integer not null default 0,
    records_updated integer not null default 0,
    error_message text,
    started_at timestamptz not null default now(),
    finished_at timestamptz
);

create or replace function set_last_updated_at()
returns trigger as $$
begin
    new.last_updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_matches_last_updated_at on matches;
create trigger trg_matches_last_updated_at
before update on matches
for each row
execute function set_last_updated_at();

drop trigger if exists trg_standings_last_updated_at on standings;
create trigger trg_standings_last_updated_at
before update on standings
for each row
execute function set_last_updated_at();


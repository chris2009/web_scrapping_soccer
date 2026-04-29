create index if not exists idx_matches_match_date on matches(match_date);
create index if not exists idx_matches_competition_id on matches(competition_id);
create index if not exists idx_matches_home_team_id on matches(home_team_id);
create index if not exists idx_matches_away_team_id on matches(away_team_id);
create index if not exists idx_matches_status on matches(status);
create index if not exists idx_matches_season_id on matches(season_id);
create index if not exists idx_matches_source_external_id on matches(data_source_id, external_match_id);
create index if not exists idx_teams_country_id on teams(country_id);
create index if not exists idx_venues_country_id on venues(country_id);
create index if not exists idx_ingestion_logs_started_at on ingestion_logs(started_at);


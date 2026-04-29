export type Match = {
  id: number;
  competition_id: number;
  competition_name: string;
  season_id: number;
  season_name: string;
  home_team_id: number;
  home_team_name: string;
  away_team_id: number;
  away_team_name: string;
  match_date: string;
  round?: string | null;
  stage?: string | null;
  status: string;
  home_score?: number | null;
  away_score?: number | null;
  venue_name?: string | null;
  country_name?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  external_match_id?: string | null;
  last_updated_at: string;
};


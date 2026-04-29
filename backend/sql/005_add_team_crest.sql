-- Add crest_url to teams for football-data.org logo URLs
ALTER TABLE teams ADD COLUMN IF NOT EXISTS crest_url TEXT;

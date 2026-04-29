insert into countries (name, code)
values
    ('Europe', 'EUR'),
    ('Spain', 'ESP'),
    ('England', 'ENG'),
    ('France', 'FRA'),
    ('Germany', 'DEU'),
    ('Italy', 'ITA')
on conflict (name) do nothing;

insert into competitions (name, slug, region)
values ('Champions League', 'champions-league', 'Europe')
on conflict (slug) do update
set name = excluded.name,
    region = excluded.region;

insert into seasons (competition_id, name, year_start, year_end)
select id, '2025/2026', 2025, 2026
from competitions
where slug = 'champions-league'
on conflict (competition_id, name) do update
set year_start = excluded.year_start,
    year_end = excluded.year_end;

insert into data_sources (name, base_url, is_official, is_active)
values ('mock_champions_league_source', 'https://example.com/mock/champions-league', false, true)
on conflict (name) do update
set base_url = excluded.base_url,
    is_active = excluded.is_active;


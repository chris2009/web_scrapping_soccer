delete from matches
where competition_id in (
    select id from competitions where slug = 'champions-league'
)
and season_id in (
    select seasons.id
    from seasons
    join competitions on competitions.id = seasons.competition_id
    where competitions.slug = 'champions-league'
      and seasons.name = '2025/2026'
);


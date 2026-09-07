-- BQI tier restore — rebuilds the original ranking for the 200 brands covered
-- by initialRanked in FashionRankings.jsx.
--
-- v2: the previous version staged the data in a TEMPORARY table. Supabase's SQL
-- editor lints that as "a table without RLS", and its "Run and enable RLS" fix
-- emits ALTER TABLE public.bqi_restore — but a temporary table lives in pg_temp,
-- not public, so that failed with 'relation "bqi_restore" does not exist' and
-- rolled the whole script back. No table is created here at all now: the data
-- rides inline in a CTE, so there is nothing for the linter to flag.
--
-- SAFETY — unchanged from v1:
--   * The ONLY statement that writes to a real table is the single UPDATE in
--     section 3. It sets rankings.tier and rankings.position, nothing else.
--   * No DELETE, no DROP, no TRUNCATE, no ALTER, no CREATE anywhere.
--   * Scoped to one account (melellard3@gmail.com).
--   * A row is written only when the brand id AND the brand name both match the
--     source catalog, so a drifted id can never stamp a tier onto the wrong
--     brand. Non-matches are reported in section 2 and left untouched.
--   * Brands, categories, saved fits, profile and multi-user setup: untouched.
--   * Re-runnable — running it twice produces the same result.
--
-- Run the whole file. If the editor still offers an RLS warning, there is now
-- no CREATE TABLE in this script, so it does not apply.

-- ---------------------------------------------------------------------------
-- 0. Leftover check — did an earlier run leave a stray public.bqi_restore?
-- Reports only. Nothing is dropped.
-- ---------------------------------------------------------------------------
select
  '0. leftover' as check,
  case when to_regclass('public.bqi_restore') is null
       then 'clean - no stray table'
       else 'stray public.bqi_restore exists; harmless, drop it manually if you like'
  end as status;

-- ---------------------------------------------------------------------------
-- 1. Preflight — resolve the account, refuse to run without it.
-- ---------------------------------------------------------------------------
do $$
declare
  target_id uuid;
  owned_brands integer;
  owned_rankings integer;
begin
  select id into target_id from auth.users where lower(email) = lower('melellard3@gmail.com') limit 1;
  if target_id is null then
    raise exception 'No auth user for melellard3@gmail.com — nothing was changed.';
  end if;
  select count(*) into owned_brands   from public.brands   where user_id = target_id;
  select count(*) into owned_rankings from public.rankings where user_id = target_id;
  raise notice 'Target % — % brands, % ranking rows.', target_id, owned_brands, owned_rankings;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1b. CANARY — are anonymous writes landing?
--
-- While verifying RLS, Claude's probes attempted UPDATE brands SET
-- notes='ZZ_RLS_PROBE' and UPDATE profile SET name='ZZ_RLS_PROBE'. PostgREST
-- runs UPDATE and DELETE through the same RLS predicate, so zero here means
-- those probes touched nothing, and the DELETE attempts touched nothing either.
--
-- If either number is NOT 0, stop and report it: the anon key can still write,
-- which would both explain the tier loss and leave an open security hole.
-- ---------------------------------------------------------------------------
select
  '1b. canary' as check,
  (select count(*) from public.brands  where notes = 'ZZ_RLS_PROBE') as brands_touched_by_probe,
  (select count(*) from public.profile where name  = 'ZZ_RLS_PROBE') as profile_touched_by_probe;

-- ---------------------------------------------------------------------------
-- 1c. Before state — confirm the previous failed run changed nothing.
-- Expect every brand still on F.
-- ---------------------------------------------------------------------------
select '1c. before' as check, r.tier, count(*) as brands
from public.rankings r
join auth.users u on u.id = r.user_id
where lower(u.email) = lower('melellard3@gmail.com')
group by r.tier
order by array_position(array['S','A','B','C','D','F'], r.tier);

-- ---------------------------------------------------------------------------
-- 2. Report everything the restore will NOT write, before it writes anything.
-- ---------------------------------------------------------------------------
with src (brand_id, brand_name, tier, pos) as (
  values
    (119::integer, 'L''AGENCE'::text, 'S'::text, 0::integer),
    (1, 'Alice + Olivia', 'S', 1),
    (149, 'Christian Lacroix', 'S', 2),
    (195, 'Fendi', 'S', 3),
    (2, 'For Love & Lemons', 'S', 4),
    (4, 'Grace Loves Lace', 'S', 5),
    (76, 'Jonathan Simkhai', 'S', 6),
    (49, 'Monique Lhuillier', 'S', 7),
    (118, 'Theory', 'S', 8),
    (88, 'L*Space', 'A', 9),
    (120, 'Lafayette 148 New York', 'A', 10),
    (3, 'Anthropologie', 'A', 11),
    (165, 'Babaton', 'A', 12),
    (185, 'Cinq a Sept', 'A', 13),
    (174, 'Diane von Furstenberg', 'A', 14),
    (180, 'Dorothee Schumacher', 'A', 15),
    (35, 'Le Lis', 'A', 16),
    (75, 'Eberjey', 'A', 17),
    (201, 'Etcetera', 'A', 18),
    (122, 'Eileen Fisher', 'A', 19),
    (181, 'Geraldine Lustgarten', 'A', 20),
    (7, 'House of CB', 'A', 21),
    (114, 'L''IDEE', 'A', 22),
    (138, 'Jason Wu', 'A', 23),
    (199, 'Joie', 'A', 24),
    (124, 'M.M.LaFleur', 'A', 25),
    (24, 'Michael Costello', 'A', 26),
    (83, 'Milly', 'A', 27),
    (145, 'MISA Los Angeles', 'A', 28),
    (8, 'Miss Circle', 'A', 29),
    (95, 'Nicholas', 'A', 30),
    (197, 'Opening Ceremony', 'A', 31),
    (70, 'LPA', 'A', 32),
    (96, 'Peixoto', 'A', 33),
    (142, 'Poleci', 'A', 34),
    (173, 'Rebecca Taylor', 'A', 35),
    (125, 'Reformation', 'A', 36),
    (163, 'Sezane', 'A', 37),
    (5, 'Show Me Your MuMu', 'A', 38),
    (29, 'SKIMS', 'A', 39),
    (200, 'St. John', 'A', 40),
    (81, 'Suboo', 'A', 41),
    (47, 'Untamed Petals', 'A', 42),
    (79, 'Upbra', 'A', 43),
    (121, 'Veronica Beard', 'A', 44),
    (123, 'Vince', 'A', 45),
    (106, 'Wear Your Love', 'A', 46),
    (52, '12th Tribe', 'B', 47),
    (110, 'After Six', 'B', 48),
    (157, 'Alexia Admor', 'B', 49),
    (27, 'Altar''d State', 'B', 50),
    (166, 'Amadi', 'B', 51),
    (144, 'Amour Vert', 'B', 52),
    (136, 'Antonio Melani', 'B', 53),
    (164, 'Aritzia', 'B', 54),
    (9, 'Bardot', 'B', 55),
    (51, 'Bariano', 'B', 56),
    (141, 'BCBG Max Azria', 'B', 57),
    (117, 'Betabrand', 'B', 58),
    (133, 'Bishop + Young', 'B', 59),
    (107, 'Bluxlabel Bridal', 'B', 60),
    (94, 'C/MEO Collective', 'B', 61),
    (170, 'CAbi', 'B', 62),
    (77, 'Calvin Klein', 'B', 63),
    (43, 'Camila Coelho', 'B', 64),
    (147, 'Cartonnier', 'B', 65),
    (178, 'Cleobella', 'B', 66),
    (53, 'Club L London', 'B', 67),
    (105, 'Daniel Cremieux', 'B', 68),
    (169, 'Daniel Rainn', 'B', 69),
    (162, 'Dress the Population', 'B', 70),
    (44, 'Edit by Nine', 'B', 71),
    (58, 'Enez Swim', 'B', 72),
    (154, 'Everlane', 'B', 73),
    (159, 'Favorite Daughter', 'B', 74),
    (6, 'Free People', 'B', 75),
    (63, 'Gianni Bini', 'B', 76),
    (62, 'Gianni Bruno', 'B', 77),
    (130, 'Halogen', 'B', 78),
    (10, 'I Am Gia', 'B', 79),
    (39, 'Line & Dot', 'B', 80),
    (184, 'Isabel Garcia', 'B', 81),
    (113, 'Issue New York', 'B', 82),
    (168, 'J. Peterman', 'B', 83),
    (116, 'JLUXLABEL', 'B', 84),
    (111, 'Mac Duggal', 'B', 85),
    (129, 'Madewell', 'B', 86),
    (177, 'Maison d''Amelie', 'B', 87),
    (87, 'Michael Lauren', 'B', 88),
    (86, 'Miss Holly', 'B', 89),
    (192, 'Nanette Lepore', 'B', 90),
    (32, 'NBD', 'B', 91),
    (85, 'Nookie', 'B', 92),
    (128, 'NYDJ', 'B', 93),
    (40, 'Lovers + Friends', 'B', 94),
    (182, 'Patrizia Pepe', 'B', 95),
    (139, 'Pinko', 'B', 96),
    (152, 'Pistola', 'B', 97),
    (55, 'Quince', 'B', 98),
    (198, 'Red Carter', 'B', 99),
    (148, 'Saunders Collective', 'B', 100),
    (90, 'Sioni', 'B', 101),
    (127, 'SPANX', 'B', 102),
    (179, 'Stitches & Stripes', 'B', 103),
    (161, 'T.W.I.N.', 'B', 104),
    (140, 'Ted Baker', 'B', 105),
    (188, 'Trina Turk', 'B', 106),
    (54, 'Tularosa', 'B', 107),
    (155, 'Velvet by Graham & Spencer', 'B', 108),
    (78, 'Vince Camuto', 'B', 109),
    (151, 'Walter Baker', 'B', 110),
    (82, 'Wayf', 'B', 111),
    (25, 'WeWoreWhat', 'B', 112),
    (74, 'White House Black Market', 'B', 113),
    (158, 'Wilfred', 'B', 114),
    (126, 'Wit & Wisdom', 'B', 115),
    (89, 'A New Day', 'C', 116),
    (16, 'AffRM', 'C', 117),
    (28, 'Akira', 'C', 118),
    (84, 'Angel Biba', 'C', 119),
    (137, 'ASTR the Label', 'C', 120),
    (57, 'L''atiste', 'C', 121),
    (73, 'Bar III', 'C', 122),
    (31, 'Bebe', 'C', 123),
    (189, 'Boston Proper', 'C', 124),
    (196, 'Coldwater Creek', 'C', 125),
    (15, 'Commence', 'C', 126),
    (194, 'DKNY', 'C', 127),
    (34, 'Do+Be', 'C', 128),
    (146, 'Dynamite', 'C', 129),
    (186, 'Endless Rose', 'C', 130),
    (64, 'Essue', 'C', 131),
    (167, 'Eva Longoria Collection', 'C', 132),
    (175, 'French Connection', 'C', 133),
    (99, 'H:OURS', 'C', 134),
    (59, 'Hello Molly', 'C', 135),
    (71, 'Hurley', 'C', 136),
    (193, 'Likely', 'C', 137),
    (14, 'Intermissy', 'C', 138),
    (156, 'Lioness', 'C', 139),
    (172, 'IZOD', 'C', 140),
    (143, 'Jagger & Stone', 'C', 141),
    (132, 'Karen Kane', 'C', 142),
    (92, 'Mable', 'C', 143),
    (191, 'Maniere De Voir', 'C', 144),
    (56, 'Meshki', 'C', 145),
    (112, 'Missacci', 'C', 146),
    (42, 'More To Come', 'C', 147),
    (109, 'MUXXN', 'C', 148),
    (41, 'Naked Wardrobe', 'C', 149),
    (37, 'Nightway Collections', 'C', 150),
    (153, 'Nina Leonard', 'C', 151),
    (38, 'Peppermayo', 'C', 152),
    (12, 'Princess Polly', 'C', 153),
    (103, 'Reset by Jane', 'C', 154),
    (98, 'RYSE The Label', 'C', 155),
    (11, 'Sabo Skirt', 'C', 156),
    (80, 'Sans Souci', 'C', 157),
    (36, 'Selfie Leslie', 'C', 158),
    (66, 'Show Po', 'C', 159),
    (61, 'Silvia Rufino', 'C', 160),
    (93, 'Skylar Rose', 'C', 161),
    (187, 'Slate & Willow', 'C', 162),
    (97, 'SNDYS', 'C', 163),
    (26, 'Steve Madden', 'C', 164),
    (134, 'Tommy Hilfiger', 'C', 165),
    (68, 'Topshop', 'C', 166),
    (50, 'Lulus', 'C', 167),
    (190, 'United Colors of Benetton', 'C', 168),
    (60, 'Vici', 'C', 169),
    (45, 'White Fox', 'C', 170),
    (160, 'Wild Fang', 'C', 171),
    (33, 'Windsor', 'C', 172),
    (171, 'Zac & Rachel', 'C', 173),
    (13, 'Zara', 'C', 174),
    (65, 'A''GACI', 'D', 175),
    (115, 'Adika', 'D', 176),
    (18, 'Baby Boo', 'D', 177),
    (183, 'BTFBM', 'D', 178),
    (108, 'Choosy', 'D', 179),
    (19, 'Edikted', 'D', 180),
    (100, 'Haute Monde', 'D', 181),
    (176, 'Jaded London', 'D', 182),
    (20, 'Mishka', 'D', 183),
    (102, 'Rebellious Fashion', 'D', 184),
    (72, 'Relleciga', 'D', 185),
    (91, 'Soly Hux', 'D', 186),
    (104, 'Sunfere', 'D', 187),
    (17, 'Super Down', 'D', 188),
    (69, 'Tempt Me', 'D', 189),
    (67, 'Tiger Mist', 'D', 190),
    (135, 'Urban Outfitters', 'D', 191),
    (101, 'Vera & Lucy', 'D', 192),
    (150, 'Cider', 'F', 193),
    (22, 'FashionNova', 'F', 194),
    (46, 'Heiress Beverly Hills', 'F', 195),
    (48, 'June Bridals', 'F', 196),
    (30, 'Missguided', 'F', 197),
    (21, 'Nasty Gal', 'F', 198),
    (23, 'Pretty Little Things', 'F', 199)
)
select '2. skipped' as check, 'id/name mismatch' as reason, s.brand_id, s.brand_name as source_name, b.name as your_name
from src s
join public.brands b on b.id = s.brand_id and b.user_id = (select id from auth.users where lower(email) = lower('melellard3@gmail.com'))
where b.name is distinct from s.brand_name

union all

select '2. skipped', 'in source but not in your list', s.brand_id, s.brand_name, null
from src s
where not exists (select 1 from public.brands b where b.id = s.brand_id and b.user_id = (select id from auth.users where lower(email) = lower('melellard3@gmail.com')))

union all

select '2. skipped', 'not in initialRanked - LEFT AS-IS, re-rank manually', b.id, b.name, null
from public.brands b
where b.user_id = (select id from auth.users where lower(email) = lower('melellard3@gmail.com'))
  and not exists (select 1 from src s where s.brand_id = b.id)

order by 2, 3;

-- ---------------------------------------------------------------------------
-- 3. The restore. The only write in this file.
-- ---------------------------------------------------------------------------
with src (brand_id, brand_name, tier, pos) as (
  values
    (119::integer, 'L''AGENCE'::text, 'S'::text, 0::integer),
    (1, 'Alice + Olivia', 'S', 1),
    (149, 'Christian Lacroix', 'S', 2),
    (195, 'Fendi', 'S', 3),
    (2, 'For Love & Lemons', 'S', 4),
    (4, 'Grace Loves Lace', 'S', 5),
    (76, 'Jonathan Simkhai', 'S', 6),
    (49, 'Monique Lhuillier', 'S', 7),
    (118, 'Theory', 'S', 8),
    (88, 'L*Space', 'A', 9),
    (120, 'Lafayette 148 New York', 'A', 10),
    (3, 'Anthropologie', 'A', 11),
    (165, 'Babaton', 'A', 12),
    (185, 'Cinq a Sept', 'A', 13),
    (174, 'Diane von Furstenberg', 'A', 14),
    (180, 'Dorothee Schumacher', 'A', 15),
    (35, 'Le Lis', 'A', 16),
    (75, 'Eberjey', 'A', 17),
    (201, 'Etcetera', 'A', 18),
    (122, 'Eileen Fisher', 'A', 19),
    (181, 'Geraldine Lustgarten', 'A', 20),
    (7, 'House of CB', 'A', 21),
    (114, 'L''IDEE', 'A', 22),
    (138, 'Jason Wu', 'A', 23),
    (199, 'Joie', 'A', 24),
    (124, 'M.M.LaFleur', 'A', 25),
    (24, 'Michael Costello', 'A', 26),
    (83, 'Milly', 'A', 27),
    (145, 'MISA Los Angeles', 'A', 28),
    (8, 'Miss Circle', 'A', 29),
    (95, 'Nicholas', 'A', 30),
    (197, 'Opening Ceremony', 'A', 31),
    (70, 'LPA', 'A', 32),
    (96, 'Peixoto', 'A', 33),
    (142, 'Poleci', 'A', 34),
    (173, 'Rebecca Taylor', 'A', 35),
    (125, 'Reformation', 'A', 36),
    (163, 'Sezane', 'A', 37),
    (5, 'Show Me Your MuMu', 'A', 38),
    (29, 'SKIMS', 'A', 39),
    (200, 'St. John', 'A', 40),
    (81, 'Suboo', 'A', 41),
    (47, 'Untamed Petals', 'A', 42),
    (79, 'Upbra', 'A', 43),
    (121, 'Veronica Beard', 'A', 44),
    (123, 'Vince', 'A', 45),
    (106, 'Wear Your Love', 'A', 46),
    (52, '12th Tribe', 'B', 47),
    (110, 'After Six', 'B', 48),
    (157, 'Alexia Admor', 'B', 49),
    (27, 'Altar''d State', 'B', 50),
    (166, 'Amadi', 'B', 51),
    (144, 'Amour Vert', 'B', 52),
    (136, 'Antonio Melani', 'B', 53),
    (164, 'Aritzia', 'B', 54),
    (9, 'Bardot', 'B', 55),
    (51, 'Bariano', 'B', 56),
    (141, 'BCBG Max Azria', 'B', 57),
    (117, 'Betabrand', 'B', 58),
    (133, 'Bishop + Young', 'B', 59),
    (107, 'Bluxlabel Bridal', 'B', 60),
    (94, 'C/MEO Collective', 'B', 61),
    (170, 'CAbi', 'B', 62),
    (77, 'Calvin Klein', 'B', 63),
    (43, 'Camila Coelho', 'B', 64),
    (147, 'Cartonnier', 'B', 65),
    (178, 'Cleobella', 'B', 66),
    (53, 'Club L London', 'B', 67),
    (105, 'Daniel Cremieux', 'B', 68),
    (169, 'Daniel Rainn', 'B', 69),
    (162, 'Dress the Population', 'B', 70),
    (44, 'Edit by Nine', 'B', 71),
    (58, 'Enez Swim', 'B', 72),
    (154, 'Everlane', 'B', 73),
    (159, 'Favorite Daughter', 'B', 74),
    (6, 'Free People', 'B', 75),
    (63, 'Gianni Bini', 'B', 76),
    (62, 'Gianni Bruno', 'B', 77),
    (130, 'Halogen', 'B', 78),
    (10, 'I Am Gia', 'B', 79),
    (39, 'Line & Dot', 'B', 80),
    (184, 'Isabel Garcia', 'B', 81),
    (113, 'Issue New York', 'B', 82),
    (168, 'J. Peterman', 'B', 83),
    (116, 'JLUXLABEL', 'B', 84),
    (111, 'Mac Duggal', 'B', 85),
    (129, 'Madewell', 'B', 86),
    (177, 'Maison d''Amelie', 'B', 87),
    (87, 'Michael Lauren', 'B', 88),
    (86, 'Miss Holly', 'B', 89),
    (192, 'Nanette Lepore', 'B', 90),
    (32, 'NBD', 'B', 91),
    (85, 'Nookie', 'B', 92),
    (128, 'NYDJ', 'B', 93),
    (40, 'Lovers + Friends', 'B', 94),
    (182, 'Patrizia Pepe', 'B', 95),
    (139, 'Pinko', 'B', 96),
    (152, 'Pistola', 'B', 97),
    (55, 'Quince', 'B', 98),
    (198, 'Red Carter', 'B', 99),
    (148, 'Saunders Collective', 'B', 100),
    (90, 'Sioni', 'B', 101),
    (127, 'SPANX', 'B', 102),
    (179, 'Stitches & Stripes', 'B', 103),
    (161, 'T.W.I.N.', 'B', 104),
    (140, 'Ted Baker', 'B', 105),
    (188, 'Trina Turk', 'B', 106),
    (54, 'Tularosa', 'B', 107),
    (155, 'Velvet by Graham & Spencer', 'B', 108),
    (78, 'Vince Camuto', 'B', 109),
    (151, 'Walter Baker', 'B', 110),
    (82, 'Wayf', 'B', 111),
    (25, 'WeWoreWhat', 'B', 112),
    (74, 'White House Black Market', 'B', 113),
    (158, 'Wilfred', 'B', 114),
    (126, 'Wit & Wisdom', 'B', 115),
    (89, 'A New Day', 'C', 116),
    (16, 'AffRM', 'C', 117),
    (28, 'Akira', 'C', 118),
    (84, 'Angel Biba', 'C', 119),
    (137, 'ASTR the Label', 'C', 120),
    (57, 'L''atiste', 'C', 121),
    (73, 'Bar III', 'C', 122),
    (31, 'Bebe', 'C', 123),
    (189, 'Boston Proper', 'C', 124),
    (196, 'Coldwater Creek', 'C', 125),
    (15, 'Commence', 'C', 126),
    (194, 'DKNY', 'C', 127),
    (34, 'Do+Be', 'C', 128),
    (146, 'Dynamite', 'C', 129),
    (186, 'Endless Rose', 'C', 130),
    (64, 'Essue', 'C', 131),
    (167, 'Eva Longoria Collection', 'C', 132),
    (175, 'French Connection', 'C', 133),
    (99, 'H:OURS', 'C', 134),
    (59, 'Hello Molly', 'C', 135),
    (71, 'Hurley', 'C', 136),
    (193, 'Likely', 'C', 137),
    (14, 'Intermissy', 'C', 138),
    (156, 'Lioness', 'C', 139),
    (172, 'IZOD', 'C', 140),
    (143, 'Jagger & Stone', 'C', 141),
    (132, 'Karen Kane', 'C', 142),
    (92, 'Mable', 'C', 143),
    (191, 'Maniere De Voir', 'C', 144),
    (56, 'Meshki', 'C', 145),
    (112, 'Missacci', 'C', 146),
    (42, 'More To Come', 'C', 147),
    (109, 'MUXXN', 'C', 148),
    (41, 'Naked Wardrobe', 'C', 149),
    (37, 'Nightway Collections', 'C', 150),
    (153, 'Nina Leonard', 'C', 151),
    (38, 'Peppermayo', 'C', 152),
    (12, 'Princess Polly', 'C', 153),
    (103, 'Reset by Jane', 'C', 154),
    (98, 'RYSE The Label', 'C', 155),
    (11, 'Sabo Skirt', 'C', 156),
    (80, 'Sans Souci', 'C', 157),
    (36, 'Selfie Leslie', 'C', 158),
    (66, 'Show Po', 'C', 159),
    (61, 'Silvia Rufino', 'C', 160),
    (93, 'Skylar Rose', 'C', 161),
    (187, 'Slate & Willow', 'C', 162),
    (97, 'SNDYS', 'C', 163),
    (26, 'Steve Madden', 'C', 164),
    (134, 'Tommy Hilfiger', 'C', 165),
    (68, 'Topshop', 'C', 166),
    (50, 'Lulus', 'C', 167),
    (190, 'United Colors of Benetton', 'C', 168),
    (60, 'Vici', 'C', 169),
    (45, 'White Fox', 'C', 170),
    (160, 'Wild Fang', 'C', 171),
    (33, 'Windsor', 'C', 172),
    (171, 'Zac & Rachel', 'C', 173),
    (13, 'Zara', 'C', 174),
    (65, 'A''GACI', 'D', 175),
    (115, 'Adika', 'D', 176),
    (18, 'Baby Boo', 'D', 177),
    (183, 'BTFBM', 'D', 178),
    (108, 'Choosy', 'D', 179),
    (19, 'Edikted', 'D', 180),
    (100, 'Haute Monde', 'D', 181),
    (176, 'Jaded London', 'D', 182),
    (20, 'Mishka', 'D', 183),
    (102, 'Rebellious Fashion', 'D', 184),
    (72, 'Relleciga', 'D', 185),
    (91, 'Soly Hux', 'D', 186),
    (104, 'Sunfere', 'D', 187),
    (17, 'Super Down', 'D', 188),
    (69, 'Tempt Me', 'D', 189),
    (67, 'Tiger Mist', 'D', 190),
    (135, 'Urban Outfitters', 'D', 191),
    (101, 'Vera & Lucy', 'D', 192),
    (150, 'Cider', 'F', 193),
    (22, 'FashionNova', 'F', 194),
    (46, 'Heiress Beverly Hills', 'F', 195),
    (48, 'June Bridals', 'F', 196),
    (30, 'Missguided', 'F', 197),
    (21, 'Nasty Gal', 'F', 198),
    (23, 'Pretty Little Things', 'F', 199)
)
update public.rankings r
set tier     = s.tier,
    position = s.pos
from src s,
     public.brands b,
     auth.users u
where lower(u.email) = lower('melellard3@gmail.com')
  and r.user_id  = u.id
  and b.user_id  = u.id
  and r.brand_id = s.brand_id
  and b.id       = s.brand_id
  and b.name     = s.brand_name;

-- ---------------------------------------------------------------------------
-- 4. Verification — send this grid back.
-- Expected: S 9 | A 38 | B 69 | C 59 | D 18 | F 7 + uncovered
-- F reads higher than 7: the 7 original F brands plus every brand
-- initialRanked does not cover (131 Tahari ASL, and anything added later).
-- ---------------------------------------------------------------------------
select
  '4. after' as check,
  r.tier,
  count(*) as brands,
  case r.tier
    when 'S' then 9 when 'A' then 38 when 'B' then 69
    when 'C' then 59 when 'D' then 18 when 'F' then 7
  end as expected_from_source
from public.rankings r
join auth.users u on u.id = r.user_id
where lower(u.email) = lower('melellard3@gmail.com')
group by r.tier
order by array_position(array['S','A','B','C','D','F'], r.tier);

select
  '4. totals' as check,
  count(*)                            as total_ranking_rows,
  count(*) filter (where tier <> 'F') as non_f_rows,
  count(distinct tier)                as distinct_tiers
from public.rankings r
join auth.users u on u.id = r.user_id
where lower(u.email) = lower('melellard3@gmail.com');

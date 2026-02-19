USE marsai;
START TRANSACTION;

-- ------------------------------------------------------------
-- Génère 400 films sans WITH RECURSIVE (compatible + stable)
-- ------------------------------------------------------------

INSERT INTO films (
  title,
  country,
  description,
  film_url,
  youtube_url,
  poster_url,
  thumbnail_url,
  ai_tools_used,
  ai_certification,
  director_firstname,
  director_lastname,
  director_email,
  director_bio,
  director_school,
  director_website,
  social_instagram,
  social_youtube,
  social_vimeo,
  status,
  status_changed_at,
  status_changed_by,
  rejection_reason,
  created_at
)
SELECT
  CONCAT('MarsAI Film #', LPAD(n, 4, '0')),

  ELT(1 + (n % 10),
    'France','United States','Japan','Germany','Canada',
    'United Kingdom','Spain','Italy','Sweden','Brazil'
  ),

  CONCAT('Submission auto-générée pour test #', n,
         '. Court-métrage IA: futurisme, société, environnement, tech.'),

  CONCAT(''),
  CONCAT('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=RDdQw4w9WgXcQ&start_radio=1'),
  CONCAT('https://cdn.marsai.local/posters/', LPAD(n, 4, '0'), '.jpg'),
  CONCAT('https://cdn.marsai.local/thumbs/', LPAD(n, 4, '0'), '.jpg'),

  ELT(1 + (n % 8),
    'ChatGPT, Runway',
    'Midjourney, Stable Diffusion',
    'ElevenLabs, Runway',
    'Sora, ChatGPT',
    'Pika, Midjourney',
    'Stable Diffusion, After Effects',
    'Kling, ElevenLabs',
    'ComfyUI, GPT'
  ),

  CASE WHEN (n % 10) < 8 THEN 1 ELSE 0 END,

  ELT(1 + (n % 10),
    'Marie','Oscar','Yuki','Hans','Alex',
    'Sofia','Lina','Noah','Camille','Diego'
  ),

  CONCAT('Director', LPAD(n, 4, '0')),

  CONCAT('director', LPAD(n, 4, '0'), '@example.com'),

  CONCAT('Bio auto-générée pour le/la réalisateur·rice #', n, '.'),

  ELT(1 + (n % 6),
    'La Plateforme','Les Gobelins','NYU Tisch','CalArts','Tokyo University of the Arts','Filmakademie'
  ),

  CONCAT('https://portfolio.example.com/director/', LPAD(n, 4, '0')),
  CONCAT('https://instagram.com/marsai_director_', LPAD(n, 4, '0')),
  CONCAT('https://youtube.com/@marsai_director_', LPAD(n, 4, '0')),
  CONCAT('https://vimeo.com/marsai_director_', LPAD(n, 4, '0')),

  CASE
    WHEN (n % 20) = 0 THEN 'rejected'
    WHEN (n % 10) = 0 THEN 'approved'
    ELSE 'pending'
  END,

  CASE
    WHEN (n % 20) = 0 OR (n % 10) = 0 THEN NOW()
    ELSE NULL
  END,

  CASE
    WHEN (n % 20) = 0 OR (n % 10) = 0 THEN 1
    ELSE NULL
  END,

  CASE
    WHEN (n % 20) = 0 THEN 'Auto-reject (test data)'
    ELSE NULL
  END,

  DATE_SUB(NOW(), INTERVAL (n % 120) DAY)

FROM (
  SELECT (a.d + b.d*10 + c.d*100) + 1 AS n
  FROM (SELECT 0 d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) a
  CROSS JOIN (SELECT 0 d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4
        UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) b
  CROSS JOIN (SELECT 0 d UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4) c
) nums
WHERE n BETWEEN 1 AND 400
ORDER BY n;

-- Récupère le premier id inséré (MySQL: LAST_INSERT_ID() = 1er id du dernier INSERT)
SET @first_id := LAST_INSERT_ID();
SET @last_id := @first_id + 399;

-- 1 catégorie par film, rotation 1..5
SET @i := 0;
INSERT INTO film_categories (film_id, category_id)
SELECT f.id, 1 + MOD((@i := @i + 1) - 1, 5)
FROM (
  SELECT id
  FROM films
  WHERE id BETWEEN @first_id AND @last_id
  ORDER BY id
) f;

COMMIT;

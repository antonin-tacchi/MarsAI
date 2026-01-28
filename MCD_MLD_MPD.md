# MarsAI - Modélisation de la Base de Données

**Version:** 1.1
**Date:** 2026-01-27
**Auteur:** Équipe MarsAI

---

## 1. MCD - Modèle Conceptuel de Données

> Le MCD représente les entités et leurs associations sans détails techniques.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                     MCD                                         │
│                        Modèle Conceptuel de Données                             │
└─────────────────────────────────────────────────────────────────────────────────┘


                                 ┌───────────┐
                                 │   ROLE    │
                                 ├───────────┤
                                 │ nom       │
                                 └─────┬─────┘
                                       │
                                       │ possède
                                       │ (0,n)
                                       │
        ┌──────────────┐         ┌─────┴─────┐         ┌──────────────┐
        │  INVITATION  │         │           │         │  ASSIGNATION │
        ├──────────────┤  invite │UTILISATEUR│ assigne ├──────────────┤
        │ email        │◄────────┤           ├────────►│ date         │
        │ token        │  (0,n)  ├───────────┤  (0,n)  └───────┬──────┘
        │ date_expir   │         │ nom       │                 │
        │ date_accept  │         │ email     │                 │ concerne
        └──────────────┘         │ password  │                 │ (1,1)
                                 └─────┬─────┘                 │
                                       │                       │
                          note  (0,n)  │                       │
                        ┌──────────────┘                       │
                        │                                      │
                        ▼                                      ▼
                 ┌─────────────┐                        ┌─────────────┐
                 │   NOTATION  │      évalue           │    FILM     │
                 ├─────────────┤◄──────────────────────┤             │
                 │ note (1-5)  │        (0,n)          ├─────────────┤
                 │ commentaire │                       │ titre       │
                 │ date        │                       │ pays        │
                 └──────┬──────┘                       │ description │
                        │                              │ statut      │
                        │                              │ réalisateur │
                        │ détermine                    └──────┬──────┘
                        │ (calcul moyenne)                    │
                        │                                     │
                        ▼                                     │
                 ┌─────────────┐                              │
                 │    PRIX     │◄─────────────────────────────┤ gagne (0,n)
                 ├─────────────┤                              │
                 │ rang        │         appartient           │
                 │ type        │◄──────────────────────┐      │
                 │ score_final │                       │      │
                 │ montant     │                       │      │
                 │ année       │                ┌──────┴──────┤
                 └─────────────┘                │  CATEGORIE  │
                                               ├─────────────┤
                                               │ nom         │
                 ┌─────────────┐               │ description │
                 │ EMAIL_LOG   │◄──────────────└─────────────┘
                 ├─────────────┤    reçoit
                 │ type        │     (0,n)
                 │ date        │
                 └─────────────┘
```

### Cardinalités

| Association | Entité 1 | Cardinalité | Entité 2 | Cardinalité |
|-------------|----------|-------------|----------|-------------|
| possède | UTILISATEUR | (1,n) | ROLE | (0,n) |
| invite | UTILISATEUR | (1,1) | INVITATION | (0,n) |
| note | UTILISATEUR | (0,n) | NOTATION | (0,n) |
| évalue | NOTATION | (1,1) | FILM | (0,n) |
| assigne | UTILISATEUR | (0,n) | ASSIGNATION | (0,n) |
| concerne | ASSIGNATION | (1,1) | FILM | (0,n) |
| appartient | FILM | (0,n) | CATEGORIE | (0,n) |
| **gagne** | **FILM** | **(0,n)** | **PRIX** | **(1,1)** |
| **par_categorie** | **PRIX** | **(0,1)** | **CATEGORIE** | **(0,n)** |
| reçoit | FILM | (0,n) | EMAIL_LOG | (1,1) |

---

## 2. MLD - Modèle Logique de Données

> Le MLD traduit le MCD en tables relationnelles avec clés primaires et étrangères.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                     MLD                                         │
│                         Modèle Logique de Données                               │
└─────────────────────────────────────────────────────────────────────────────────┘


    roles                          users                         invitations
┌──────────────┐              ┌──────────────┐              ┌──────────────────┐
│ #id (PK)     │              │ #id (PK)     │              │ #id (PK)         │
│  role_name   │              │  name        │              │  email           │
└──────┬───────┘              │  email       │              │  name            │
       │                      │  password    │              │  token           │
       │                      │  created_at  │              │ @role_id (FK)────┼───┐
       │                      └──────┬───────┘              │ @invited_by (FK)─┼─┐ │
       │                             │                      │  expires_at      │ │ │
       │         user_roles          │                      │  accepted_at     │ │ │
       │     ┌──────────────┐        │                      └──────────────────┘ │ │
       │     │ @user_id (FK)├────────┘                                           │ │
       └────►│ @role_id (FK)│                                                    │ │
             │  (PK composée)│◄──────────────────────────────────────────────────┼─┘
             └──────────────┘                                                    │
                                                                                 │
       ┌─────────────────────────────────────────────────────────────────────────┘
       │
       │     jury_assignments                              jury_ratings
       │   ┌──────────────────┐                        ┌──────────────────┐
       │   │ #id (PK)         │                        │ #id (PK)         │
       │   │ @jury_id (FK)────┼────────────┐           │ @film_id (FK)────┼───────┐
       │   │ @film_id (FK)────┼─────────┐  │           │ @user_id (FK)────┼────┐  │
       └──►│ @assigned_by (FK)│         │  │           │  rating (1-5)    │    │  │
           │  assigned_at     │         │  │           │  comment         │    │  │
           └──────────────────┘         │  │           │  created_at      │    │  │
                                        │  │           └──────────────────┘    │  │
                                        │  │                    │              │  │
                                        │  │                    │ moyenne      │  │
                                        │  │                    ▼              │  │
                                        │  └───────────────────────────────────┼──┼───┐
                                        │                                      │  │   │
                                        ▼                                      │  │   │
    categories                      films                                      │  │   │
┌──────────────┐              ┌──────────────────────┐                        │  │   │
│ #id (PK)     │              │ #id (PK)             │◄───────────────────────┘  │   │
│  name        │              │  title               │                           │   │
│  description │              │  country             │◄──────────────────────────┘   │
└──────┬───────┘              │  description         │                               │
       │                      │  film_url            │◄──────────────────────────────┘
       │                      │  poster_url          │
       │                      │  thumbnail_url       │
       │   film_categories    │  status              │
       │  ┌──────────────┐    │  director_*          │
       │  │ @film_id (FK)├───►│  created_at          │
       └─►│@category_id(FK)   └──────────┬───────────┘
          │  (PK composée)│              │
          └──────────────┘              │
                   │                    │
                   │                    │ gagne
                   │                    ▼
                   │           ┌──────────────────────┐
                   │           │       awards         │
                   │           ├──────────────────────┤
                   │           │ #id (PK)             │
                   └──────────►│ @film_id (FK)        │ ◄── Film gagnant
                               │ @category_id (FK)   │ ◄── Prix par catégorie
                               │  rank               │ ◄── 1er, 2ème, 3ème
                               │  award_type         │ ◄── grand_prix, gold...
                               │  final_score        │ ◄── Moyenne des notes
                               │  award_name         │
                               │  prize_amount       │
                               │  year               │
                               │  awarded_at         │
                               └──────────────────────┘


Légende:
  #  = Clé Primaire (PK)
  @  = Clé Étrangère (FK)
  ─► = Référence
```

---

## 3. Flux de Notation → Prix

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     FLUX : DES NOTES AUX PRIX                                   │
└─────────────────────────────────────────────────────────────────────────────────┘

  ÉTAPE 1: Notation par les jurys
  ═══════════════════════════════

    Jury A                Jury B                Jury C
       │                     │                     │
       │ note: 4/5           │ note: 5/5           │ note: 4/5
       │                     │                     │
       └─────────────────────┼─────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  jury_ratings   │
                    │                 │
                    │ Film X: 4,5,4   │
                    │ Film Y: 3,4,3   │
                    │ Film Z: 5,5,4   │
                    └────────┬────────┘
                             │
                             │
  ÉTAPE 2: Calcul des moyennes
  ════════════════════════════
                             │
                             ▼
                    ┌─────────────────┐
                    │    Moyennes     │
                    │                 │
                    │ Film X: 4.33    │
                    │ Film Y: 3.33    │
                    │ Film Z: 4.67    │
                    └────────┬────────┘
                             │
                             │
  ÉTAPE 3: Classement par catégorie
  ══════════════════════════════════
                             │
                             ▼
        ┌────────────────────────────────────────┐
        │         Catégorie: Futurisme           │
        │                                        │
        │   1er: Film Z (4.67) ──► Grand Prix    │
        │   2ème: Film X (4.33) ──► Prix Jury    │
        │   3ème: Film Y (3.33) ──► Mention      │
        └────────────────────────────────────────┘
                             │
                             │
  ÉTAPE 4: Attribution des prix
  ══════════════════════════════
                             │
                             ▼
                    ┌─────────────────┐
                    │     awards      │
                    │                 │
                    │ film_id: Z      │
                    │ category_id: 1  │
                    │ rank: 1         │
                    │ type: grand_prix│
                    │ final_score:4.67│
                    │ year: 2026      │
                    └─────────────────┘
```

---

## 4. MPD - Modèle Physique de Données

### Table: `awards` (MISE À JOUR)

```sql
┌────────────────────────────────────────────────────────────────┐
│                          awards                                │
│              Prix basés sur le classement des notes            │
├────────────────┬──────────────────┬────────────┬──────────────┤
│ Colonne        │ Type             │ Contrainte │ Description  │
├────────────────┼──────────────────┼────────────┼──────────────┤
│ id             │ INT              │ PK, AI     │ Identifiant  │
│ film_id        │ INT              │ FK, NN     │ → films.id   │
│ category_id    │ INT              │ FK, NULL   │→categories.id│
│ rank           │ INT              │ NN         │ 1, 2, 3...   │
│ award_type     │ ENUM             │ NN         │ Type de prix │
│ award_name     │ VARCHAR(100)     │ NN         │ Nom affiché  │
│ final_score    │ DECIMAL(3,2)     │ NULL       │ Moyenne notes│
│ year           │ INT              │ NN         │ Année        │
│ description    │ TEXT             │ NULL       │ Description  │
│ prize_amount   │ DECIMAL(10,2)    │ NULL       │ Montant €    │
│ awarded_at     │ DATETIME         │ DEFAULT NOW│ Date remise  │
└────────────────┴──────────────────┴────────────┴──────────────┘

ENUM award_type: 'grand_prix', 'jury_prize', 'public_prize',
                 'special_mention', 'gold', 'silver', 'bronze'

INDEX: idx_year_rank (year, rank)
UNIQUE: (film_id, category_id, year)

FK: film_id → films(id) ON DELETE CASCADE
FK: category_id → categories(id) ON DELETE SET NULL
```

### Table: `jury_ratings`

```sql
┌─────────────────────────────────────────────────────────┐
│                     jury_ratings                        │
│                  Notes des jurys                        │
├─────────────┬──────────────┬────────────┬──────────────┤
│ Colonne     │ Type         │ Contrainte │ Description  │
├─────────────┼──────────────┼────────────┼──────────────┤
│ id          │ INT          │ PK, AI     │ Identifiant  │
│ film_id     │ INT          │ FK, NN     │ → films.id   │
│ user_id     │ INT          │ FK, NN     │ → users.id   │
│ rating      │ INT          │ NN, CHECK  │ 1-5 étoiles  │
│ comment     │ TEXT         │ NULL       │ Commentaire  │
│ created_at  │ DATETIME     │ DEFAULT NOW│ Date         │
│ updated_at  │ DATETIME     │ ON UPDATE  │ Mise à jour  │
└─────────────┴──────────────┴────────────┴──────────────┘

CHECK: rating >= 1 AND rating <= 5
UNIQUE: (film_id, user_id) -- Un jury = une note par film
```

---

## 5. Requêtes SQL Utiles

### Calcul de la moyenne par film
```sql
SELECT
    f.id,
    f.title,
    AVG(jr.rating) as average_rating,
    COUNT(jr.id) as rating_count
FROM films f
LEFT JOIN jury_ratings jr ON f.id = jr.film_id
WHERE f.status = 'approved'
GROUP BY f.id
ORDER BY average_rating DESC;
```

### Classement par catégorie
```sql
SELECT
    c.name as category,
    f.title,
    AVG(jr.rating) as score,
    RANK() OVER (PARTITION BY c.id ORDER BY AVG(jr.rating) DESC) as rank
FROM films f
JOIN film_categories fc ON f.id = fc.film_id
JOIN categories c ON fc.category_id = c.id
JOIN jury_ratings jr ON f.id = jr.film_id
GROUP BY c.id, f.id
HAVING COUNT(jr.id) >= 3
ORDER BY c.name, rank;
```

### Attribution d'un prix
```sql
INSERT INTO awards (film_id, category_id, rank, award_type, award_name, final_score, year)
SELECT
    f.id,
    1, -- category_id
    1, -- rank (1er)
    'grand_prix',
    'Grand Prix Futurisme 2026',
    AVG(jr.rating),
    2026
FROM films f
JOIN jury_ratings jr ON f.id = jr.film_id
JOIN film_categories fc ON f.id = fc.film_id
WHERE fc.category_id = 1
GROUP BY f.id
ORDER BY AVG(jr.rating) DESC
LIMIT 1;
```

---

## 6. Résumé des Relations

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        SCHÉMA SIMPLIFIÉ                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

    users ◄───── user_roles ─────► roles
      │
      ├──────► invitations
      │
      ├──────► jury_assignments ──────┐
      │                               │
      └──────► jury_ratings ──────────┼──────► films ◄──── film_categories ──► categories
                    │                 │          │                                  │
                    │                 │          │                                  │
                    │   moyenne       │          │                                  │
                    │      │          │          │                                  │
                    ▼      ▼          ▼          ▼                                  │
               ┌─────────────────────────────────────────────────────────────────┐ │
               │                         awards                                  │ │
               │                                                                 │◄┘
               │  film_id ───────────────────► Film gagnant                      │
               │  category_id ─────────────────► Catégorie du prix               │
               │  rank ────────────────────────► 1er, 2ème, 3ème                 │
               │  final_score ─────────────────► Moyenne au moment du prix       │
               └─────────────────────────────────────────────────────────────────┘
```

---

## 7. Règles Métier

| Règle | Description |
|-------|-------------|
| **Minimum 3 notes** | Un film doit avoir au moins 3 notes pour être éligible aux prix |
| **1 note par jury** | Un jury ne peut noter qu'une seule fois par film |
| **Prix par catégorie** | Chaque catégorie a son propre classement et ses propres prix |
| **Score final figé** | Le `final_score` est enregistré au moment de l'attribution du prix |
| **Rang unique** | Un seul film peut avoir le rang 1 dans une catégorie par année |

---

*Document mis à jour le 27/01/2026 - MarsAI Festival v1.1*

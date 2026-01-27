# MarsAI - Modélisation de la Base de Données

**Version:** 1.0
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
                                 │ date_crea │                 │
                                 └─────┬─────┘                 │
                                       │                       │
                          note  (0,n)  │                       │
                        ┌──────────────┘                       │
                        │                                      │
                        ▼                                      ▼
                 ┌─────────────┐                        ┌─────────────┐
                 │   NOTATION  │                        │    FILM     │
                 ├─────────────┤      évalue           ├─────────────┤
                 │ note (1-5)  │◄──────────────────────┤ titre       │
                 │ commentaire │        (0,n)          │ pays        │
                 │ date        │                       │ description │
                 └─────────────┘                       │ url_video   │
                                                       │ url_poster  │
                                                       │ url_thumb   │
                 ┌─────────────┐                       │ outils_ia   │
                 │  CATEGORIE  │      appartient       │ statut      │
                 ├─────────────┤◄──────────────────────┤ date_crea   │
                 │ nom         │        (0,n)          │             │
                 │ description │                       │ -- Réalis.--│
                 └─────────────┘                       │ prenom      │
                                                       │ nom         │
                                                       │ email       │
                 ┌─────────────┐      reçoit           │ bio         │
                 │ EMAIL_LOG   │◄──────────────────────┤ ecole       │
                 ├─────────────┤        (0,n)          └─────────────┘
                 │ type        │
                 │ date        │
                 │ succès      │
                 └─────────────┘


                 ┌─────────────┐      attribué_à       ┌─────────────┐
                 │    PRIX     │◄──────────────────────┤   FESTIVAL  │
                 ├─────────────┤        (0,n)          ├─────────────┤
                 │ nom         │                       │ date_debut  │
                 │ type        │                       │ date_fin    │
                 │ montant     │                       │ lieu        │
                 │ année       │                       │ actif       │
                 └─────────────┘                       └─────────────┘
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
| reçoit | FILM | (0,n) | EMAIL_LOG | (1,1) |
| attribué_à | FILM | (0,1) | PRIX | (0,n) |

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
       └──►│ @assigned_by (FK)│         │  │           │  rating          │    │  │
           │  assigned_at     │         │  │           │  comment         │    │  │
           └──────────────────┘         │  │           │  created_at      │    │  │
                                        │  │           └──────────────────┘    │  │
                                        │  │                                   │  │
                                        │  └───────────────────────────────────┼──┼───┐
                                        │                                      │  │   │
                                        ▼                                      │  │   │
    categories                      films                                      │  │   │
┌──────────────┐              ┌──────────────────────┐                        │  │   │
│ #id (PK)     │              │ #id (PK)             │◄───────────────────────┘  │   │
│  name        │              │                      │                           │   │
│  description │              │  title               │◄──────────────────────────┘   │
└──────┬───────┘              │  country             │                               │
       │                      │  description         │◄──────────────────────────────┘
       │                      │  film_url            │
       │                      │  youtube_link        │
       │   film_categories    │  poster_url          │
       │  ┌──────────────┐    │  thumbnail_url       │
       │  │ @film_id (FK)├───►│  ai_tools_used       │
       └─►│@category_id(FK)   │  ai_certification    │
          │  (PK composée)│    │                      │
          └──────────────┘    │  director_firstname  │
                              │  director_lastname   │
                              │  director_email      │
                              │  director_bio        │        email_logs
                              │  director_school     │    ┌──────────────────┐
                              │  director_website    │    │ #id (PK)         │
                              │  social_instagram    │    │ @film_id (FK)────┼────┐
                              │  social_youtube      │    │  recipient_email │    │
                              │  social_vimeo        │    │  email_type      │    │
                              │                      │    │  sent_at         │    │
                              │  status              │    │  success         │    │
                              │ @status_changed_by(FK)────│  error_message   │    │
                              │  status_changed_at   │    └──────────────────┘    │
                              │  rejection_reason    │                            │
                              │  created_at          │◄───────────────────────────┘
                              └──────────────────────┘


    awards                        festival_config              events
┌──────────────────┐          ┌──────────────────┐      ┌──────────────────┐
│ #id (PK)         │          │ #id (PK)         │      │ #id (PK)         │
│  award_name      │          │  submission_start│      │  event_type      │
│  award_type      │          │  submission_end  │      │  title           │
│ @film_id (FK)────┼────►     │  event_date      │      │  description     │
│  year            │          │  location        │      │  event_date      │
│  description     │          │  is_active       │      │  location        │
│  prize_amount    │          └──────────────────┘      │  max_attendees   │
└──────────────────┘                                    └──────────────────┘


Légende:
  #  = Clé Primaire (PK)
  @  = Clé Étrangère (FK)
  ─► = Référence
```

### Résumé des Tables

| Table | Clé Primaire | Clés Étrangères |
|-------|--------------|-----------------|
| `roles` | id | - |
| `users` | id | - |
| `user_roles` | (user_id, role_id) | user_id → users, role_id → roles |
| `invitations` | id | role_id → roles, invited_by → users |
| `films` | id | status_changed_by → users |
| `categories` | id | - |
| `film_categories` | (film_id, category_id) | film_id → films, category_id → categories |
| `jury_ratings` | id | film_id → films, user_id → users |
| `jury_assignments` | id | jury_id → users, film_id → films, assigned_by → users |
| `email_logs` | id | film_id → films |
| `awards` | id | film_id → films |
| `festival_config` | id | - |
| `events` | id | - |

---

## 3. MPD - Modèle Physique de Données

> Le MPD détaille l'implémentation physique avec types de données et contraintes.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                     MPD                                         │
│                         Modèle Physique de Données                              │
│                                  (MySQL 8)                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Table: `roles`
```sql
┌─────────────────────────────────────────────────────────┐
│                        roles                            │
├─────────────┬──────────────┬────────────┬──────────────┤
│ Colonne     │ Type         │ Contrainte │ Description  │
├─────────────┼──────────────┼────────────┼──────────────┤
│ id          │ INT          │ PK, AI     │ Identifiant  │
│ role_name   │ VARCHAR(50)  │ UNIQUE, NN │ Nom du rôle  │
└─────────────┴──────────────┴────────────┴──────────────┘
Données: (1, 'Jury'), (2, 'Admin'), (3, 'Super Jury')
```

### Table: `users`
```sql
┌─────────────────────────────────────────────────────────┐
│                        users                            │
├─────────────┬──────────────┬────────────┬──────────────┤
│ Colonne     │ Type         │ Contrainte │ Description  │
├─────────────┼──────────────┼────────────┼──────────────┤
│ id          │ INT          │ PK, AI     │ Identifiant  │
│ name        │ VARCHAR(100) │ NN         │ Nom complet  │
│ email       │ VARCHAR(100) │ UNIQUE, NN │ Email        │
│ password    │ VARCHAR(255) │ NN         │ Hash bcrypt  │
│ created_at  │ DATETIME     │ DEFAULT NOW│ Date création│
└─────────────┴──────────────┴────────────┴──────────────┘
Index: idx_email (email)
```

### Table: `user_roles`
```sql
┌─────────────────────────────────────────────────────────┐
│                      user_roles                         │
├─────────────┬──────────────┬────────────┬──────────────┤
│ Colonne     │ Type         │ Contrainte │ Description  │
├─────────────┼──────────────┼────────────┼──────────────┤
│ user_id     │ INT          │ PK, FK     │ → users.id   │
│ role_id     │ INT          │ PK, FK     │ → roles.id   │
└─────────────┴──────────────┴────────────┴──────────────┘
ON DELETE CASCADE
```

### Table: `invitations`
```sql
┌─────────────────────────────────────────────────────────┐
│                     invitations                         │
├─────────────┬──────────────┬────────────┬──────────────┤
│ Colonne     │ Type         │ Contrainte │ Description  │
├─────────────┼──────────────┼────────────┼──────────────┤
│ id          │ INT          │ PK, AI     │ Identifiant  │
│ email       │ VARCHAR(255) │ NN         │ Email invité │
│ name        │ VARCHAR(100) │ NULL       │ Nom optionnel│
│ role_id     │ INT          │ FK, NN     │ → roles.id   │
│ token       │ VARCHAR(255) │ UNIQUE, NN │ Token 64 hex │
│ invited_by  │ INT          │ FK, NN     │ → users.id   │
│ created_at  │ DATETIME     │ DEFAULT NOW│ Date création│
│ expires_at  │ DATETIME     │ NN         │ +7 jours     │
│ accepted_at │ DATETIME     │ NULL       │ Date accept. │
└─────────────┴──────────────┴────────────┴──────────────┘
Index: idx_token (token)
```

### Table: `films`
```sql
┌─────────────────────────────────────────────────────────┐
│                        films                            │
├───────────────────┬──────────────┬──────────┬──────────┤
│ Colonne           │ Type         │Contrainte│Descript. │
├───────────────────┼──────────────┼──────────┼──────────┤
│ id                │ INT          │ PK, AI   │ ID       │
│ title             │ VARCHAR(255) │ NN       │ Titre    │
│ country           │ VARCHAR(100) │ NULL     │ Pays     │
│ description       │ TEXT         │ NULL     │ Synopsis │
│ film_url          │ VARCHAR(500) │ NULL     │ URL vidéo│
│ youtube_link      │ VARCHAR(500) │ NULL     │ Lien YT  │
│ poster_url        │ VARCHAR(500) │ NULL     │ Affiche  │
│ thumbnail_url     │ VARCHAR(500) │ NULL     │ Miniature│
│ ai_tools_used     │ TEXT         │ NULL     │ Outils IA│
│ ai_certification  │ TINYINT(1)   │ DEFAULT 0│ Certifié │
├───────────────────┼──────────────┼──────────┼──────────┤
│ director_firstname│ VARCHAR(100) │ NN       │ Prénom   │
│ director_lastname │ VARCHAR(100) │ NN       │ Nom      │
│ director_email    │ VARCHAR(255) │ NN       │ Email    │
│ director_bio      │ TEXT         │ NULL     │ Bio      │
│ director_school   │ VARCHAR(255) │ NULL     │ École    │
│ director_website  │ VARCHAR(500) │ NULL     │ Site web │
│ social_instagram  │ VARCHAR(255) │ NULL     │ Instagram│
│ social_youtube    │ VARCHAR(255) │ NULL     │ YouTube  │
│ social_vimeo      │ VARCHAR(255) │ NULL     │ Vimeo    │
├───────────────────┼──────────────┼──────────┼──────────┤
│ status            │ ENUM         │ DEFAULT  │ pending/ │
│                   │              │ 'pending'│ approved/│
│                   │              │          │ rejected │
│ status_changed_at │ DATETIME     │ NULL     │ Date chgt│
│ status_changed_by │ INT          │ FK, NULL │→users.id │
│ rejection_reason  │ TEXT         │ NULL     │ Motif    │
│ created_at        │ DATETIME     │ DEF. NOW │ Date     │
└───────────────────┴──────────────┴──────────┴──────────┘
Index: idx_status, idx_created_at, idx_director_email
```

### Table: `categories`
```sql
┌─────────────────────────────────────────────────────────┐
│                      categories                         │
├─────────────┬──────────────┬────────────┬──────────────┤
│ Colonne     │ Type         │ Contrainte │ Description  │
├─────────────┼──────────────┼────────────┼──────────────┤
│ id          │ INT          │ PK, AI     │ Identifiant  │
│ name        │ VARCHAR(100) │ UNIQUE, NN │ Nom          │
│ description │ TEXT         │ NULL       │ Description  │
└─────────────┴──────────────┴────────────┴──────────────┘
Données: Futurisme, Environnement, Société, Technologie, Art
```

### Table: `film_categories`
```sql
┌─────────────────────────────────────────────────────────┐
│                    film_categories                      │
├─────────────┬──────────────┬────────────┬──────────────┤
│ Colonne     │ Type         │ Contrainte │ Description  │
├─────────────┼──────────────┼────────────┼──────────────┤
│ film_id     │ INT          │ PK, FK     │ → films.id   │
│ category_id │ INT          │ PK, FK     │→categories.id│
└─────────────┴──────────────┴────────────┴──────────────┘
ON DELETE CASCADE
```

### Table: `jury_ratings`
```sql
┌─────────────────────────────────────────────────────────┐
│                     jury_ratings                        │
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
UNIQUE: (film_id, user_id) - Un jury = une note par film
CHECK: rating >= 1 AND rating <= 5
ON DELETE CASCADE
```

### Table: `jury_assignments`
```sql
┌─────────────────────────────────────────────────────────┐
│                   jury_assignments                      │
├─────────────┬──────────────┬────────────┬──────────────┤
│ Colonne     │ Type         │ Contrainte │ Description  │
├─────────────┼──────────────┼────────────┼──────────────┤
│ id          │ INT          │ PK, AI     │ Identifiant  │
│ jury_id     │ INT          │ FK, NN     │ → users.id   │
│ film_id     │ INT          │ FK, NN     │ → films.id   │
│ assigned_by │ INT          │ FK, NN     │ → users.id   │
│ assigned_at │ DATETIME     │ DEFAULT NOW│ Date assign. │
└─────────────┴──────────────┴────────────┴──────────────┘
UNIQUE: (jury_id, film_id) - Un film assigné une fois par jury
ON DELETE CASCADE
```

### Table: `email_logs`
```sql
┌─────────────────────────────────────────────────────────┐
│                      email_logs                         │
├─────────────────┬──────────────┬──────────┬────────────┤
│ Colonne         │ Type         │Contrainte│ Description│
├─────────────────┼──────────────┼──────────┼────────────┤
│ id              │ INT          │ PK, AI   │ Identifiant│
│ film_id         │ INT          │ FK, NN   │ → films.id │
│ recipient_email │ VARCHAR(255) │ NN       │ Destinataire│
│ email_type      │ ENUM         │ NN       │ Type email │
│ sent_at         │ DATETIME     │ DEF. NOW │ Date envoi │
│ success         │ TINYINT(1)   │ DEFAULT 1│ Succès?    │
│ error_message   │ TEXT         │ NULL     │ Erreur     │
└─────────────────┴──────────────┴──────────┴────────────┘
ENUM: 'submission_received', 'status_approved', 'status_rejected'
```

### Table: `awards`
```sql
┌─────────────────────────────────────────────────────────┐
│                        awards                           │
├─────────────┬──────────────┬────────────┬──────────────┤
│ Colonne     │ Type         │ Contrainte │ Description  │
├─────────────┼──────────────┼────────────┼──────────────┤
│ id          │ INT          │ PK, AI     │ Identifiant  │
│ award_name  │ VARCHAR(100) │ NN         │ Nom du prix  │
│ award_type  │ ENUM         │ NN         │ Type         │
│ film_id     │ INT          │ FK, NULL   │ → films.id   │
│ year        │ INT          │ NN         │ Année        │
│ description │ TEXT         │ NULL       │ Description  │
│ prize_amount│ DECIMAL(10,2)│ NULL       │ Montant €    │
└─────────────┴──────────────┴────────────┴──────────────┘
ENUM: 'grand_prix', 'jury_prize', 'public_prize', 'special_mention'
```

### Table: `festival_config`
```sql
┌─────────────────────────────────────────────────────────┐
│                    festival_config                      │
├──────────────────┬──────────────┬─────────┬────────────┤
│ Colonne          │ Type         │Contraint│ Description│
├──────────────────┼──────────────┼─────────┼────────────┤
│ id               │ INT          │ PK, AI  │ Identifiant│
│ submission_start │ DATETIME     │ NN      │ Début      │
│ submission_end   │ DATETIME     │ NN      │ Fin        │
│ event_date       │ DATETIME     │ NULL    │ Événement  │
│ location         │ VARCHAR(255) │ DEFAULT │ Lieu       │
│ is_active        │ TINYINT(1)   │ DEFAULT 1│ Actif?    │
└──────────────────┴──────────────┴─────────┴────────────┘
```

---

## 4. Diagramme des Relations (Simplifié)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     DIAGRAMME DES RELATIONS                                     │
└─────────────────────────────────────────────────────────────────────────────────┘


                          ┌─────────┐
                          │  roles  │
                          └────┬────┘
                               │
                               │ 1
                               │
                               │ N
                          ┌────┴────┐
         ┌────────────────┤user_roles├────────────────┐
         │                └────┬────┘                 │
         │                     │                      │
         │ N                   │ N                    │
         │                     │                      │
    ┌────┴────┐           ┌────┴────┐           ┌────┴────┐
    │invitations          │  users  │           │  roles  │
    └─────────┘           └────┬────┘           └─────────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            │ 1                │ 1                │ 1
            │                  │                  │
            │ N                │ N                │ N
       ┌────┴────┐        ┌────┴────┐       ┌────┴────┐
       │jury_    │        │jury_    │       │  films  │
       │assign.  │        │ratings  │       └────┬────┘
       └────┬────┘        └────┬────┘            │
            │                  │                 │
            │ N                │ N               │
            │                  │                 │
            └─────────────┬────┴─────────────────┤
                          │                      │
                     ┌────┴────┐            ┌────┴────┐
                     │  films  │            │film_cat.│
                     └────┬────┘            └────┬────┘
                          │                      │
                          │ 1                    │ N
                          │                      │
                          │ N                    │ 1
                     ┌────┴────┐            ┌────┴────┐
                     │email_   │            │category │
                     │logs     │            └─────────┘
                     └─────────┘
```

---

## 5. Contraintes d'Intégrité

| Contrainte | Table | Description |
|------------|-------|-------------|
| `chk_rating_range` | jury_ratings | `rating >= 1 AND rating <= 5` |
| `unique_jury_film` | jury_ratings | Un jury ne peut noter qu'une fois par film |
| `unique_jury_assignment` | jury_assignments | Un film assigné une fois par jury |
| `fk_cascade` | Toutes | Suppression en cascade |

---

## 6. Règles Métier

1. **Notation:** Minimum 3 notes différentes par film
2. **Invitation:** Token expire après 7 jours
3. **Rôles:** Un utilisateur peut avoir plusieurs rôles
4. **Upload:** Vidéo max 2GB, Images max 10MB

---

*Document généré le 27/01/2026 - MarsAI Festival*

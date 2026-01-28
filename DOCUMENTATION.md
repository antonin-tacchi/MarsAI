# MarsAI Festival - Documentation Technique

**Version:** 1.0
**Date:** 2026-01-27
**Projet:** Plateforme de festival de films IA

---

## 1. Vue d'ensemble

MarsAI est une plateforme web pour un festival de films générés par Intelligence Artificielle. Les réalisateurs soumettent leurs films via un formulaire public, et les membres du Jury/Super Jury/Admin les valident.

**Principe clé:** Pas d'inscription publique - Système d'invitation uniquement pour Jury/Admin.

---

## 2. Schéma de la Base de Données

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           SCHEMA BASE DE DONNEES                                │
│                                  MarsAI                                         │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐          ┌──────────────┐          ┌──────────────┐
    │    roles     │          │    users     │          │  invitations │
    ├──────────────┤          ├──────────────┤          ├──────────────┤
    │ PK id        │◄─────┐   │ PK id        │◄─────────│ FK invited_by│
    │    role_name │      │   │    name      │          │ FK role_id   │──────┐
    │              │      │   │    email     │          │    email     │      │
    │ 1=Jury       │      │   │    password  │          │    token     │      │
    │ 2=Admin      │      │   │    created_at│          │    expires_at│      │
    │ 3=Super Jury │      │   └──────────────┘          │    accepted_at      │
    └──────────────┘      │          │                  └──────────────┘      │
           │              │          │                                        │
           │              │          │                                        │
           ▼              │          ▼                                        │
    ┌──────────────┐      │   ┌──────────────┐                               │
    │  user_roles  │      │   │jury_assignments                              │
    ├──────────────┤      │   ├──────────────┤                               │
    │ FK user_id   │──────┘   │ PK id        │                               │
    │ FK role_id   │◄─────────│ FK jury_id   │                               │
    │              │          │ FK film_id   │───────┐                       │
    └──────────────┘          │ FK assigned_by│       │                       │
                              │    assigned_at│       │                       │
                              └──────────────┘       │                       │
                                                     │                       │
                                                     ▼                       │
┌──────────────┐          ┌──────────────────────────────────┐               │
│  categories  │          │              films               │               │
├──────────────┤          ├──────────────────────────────────┤               │
│ PK id        │◄─────┐   │ PK id                            │◄──────────────┘
│    name      │      │   │                                  │
│    description      │   │ -- Film Info --                  │
│              │      │   │    title                         │
│ • Futurisme  │      │   │    country                       │
│ • Environnement     │   │    description                   │
│ • Société    │      │   │    film_url                      │
│ • Technologie│      │   │    youtube_link                  │
│ • Art/Culture│      │   │    poster_url                    │
└──────────────┘      │   │    thumbnail_url                 │
        │             │   │    ai_tools_used                 │
        │             │   │    ai_certification              │
        ▼             │   │                                  │
┌──────────────┐      │   │ -- Director Info --              │
│film_categories      │   │    director_firstname            │
├──────────────┤      │   │    director_lastname             │
│ FK film_id   │──────┼──►│    director_email                │
│ FK category_id◄─────┘   │    director_bio                  │
└──────────────┘          │    director_school               │
                          │    director_website              │
                          │    social_instagram              │
                          │    social_youtube                │
                          │    social_vimeo                  │
                          │                                  │
                          │ -- Status --                     │
                          │    status (pending/approved/rejected)
                          │ FK status_changed_by             │
                          │    rejection_reason              │
                          │    created_at                    │
                          └──────────────────────────────────┘
                                    │           │
                                    │           │
                    ┌───────────────┘           └───────────────┐
                    ▼                                           ▼
          ┌──────────────┐                            ┌──────────────┐
          │ jury_ratings │                            │  email_logs  │
          ├──────────────┤                            ├──────────────┤
          │ PK id        │                            │ PK id        │
          │ FK film_id   │                            │ FK film_id   │
          │ FK user_id   │                            │    recipient │
          │    rating 1-5│                            │    email_type│
          │    comment   │                            │    sent_at   │
          │    created_at│                            │    success   │
          └──────────────┘                            └──────────────┘


          ┌──────────────┐                            ┌──────────────┐
          │festival_config                            │    awards    │
          ├──────────────┤                            ├──────────────┤
          │ PK id        │                            │ PK id        │
          │ submission_start                          │    award_name│
          │ submission_end│                           │    award_type│
          │ event_date   │                            │ FK film_id   │
          │ location     │                            │    year      │
          │ is_active    │                            │    prize_amount
          └──────────────┘                            └──────────────┘


          ┌──────────────┐                            ┌──────────────┐
          │   events     │                            │ newsletter   │
          ├──────────────┤                            ├──────────────┤
          │ PK id        │                            │ PK id        │
          │    event_type│                            │    email     │
          │    title     │                            │ subscribed_at│
          │    event_date│                            └──────────────┘
          │    location  │
          └──────────────┘
```

---

## 3. Relations entre tables

| Table Source | Relation | Table Cible | Description |
|--------------|----------|-------------|-------------|
| `user_roles` | N:N | `users` ↔ `roles` | Un user peut avoir plusieurs rôles |
| `invitations` | N:1 | `users` | Invité par un admin/super jury |
| `invitations` | N:1 | `roles` | Rôle attribué à l'invitation |
| `jury_assignments` | N:N | `users` ↔ `films` | Films assignés aux jurys |
| `jury_ratings` | N:N | `users` ↔ `films` | Notes des jurys par film |
| `film_categories` | N:N | `films` ↔ `categories` | Catégories des films |
| `email_logs` | N:1 | `films` | Historique emails par film |
| `awards` | N:1 | `films` | Prix attribués aux films |
| `films.status_changed_by` | N:1 | `users` | Qui a changé le statut |

---

## 4. Rôles et Permissions

```
┌─────────────────────────────────────────────────────────────────┐
│                    HIERARCHIE DES ROLES                         │
└─────────────────────────────────────────────────────────────────┘

                    ┌─────────────┐
                    │    ADMIN    │  (role_id = 2)
                    │             │
                    │ • Tout      │
                    │ • Invitations│
                    │ • Suppression│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ SUPER JURY  │  (role_id = 3)
                    │             │
                    │ • Assigner  │
                    │   films aux │
                    │   jurys     │
                    │ • Voir stats│
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    JURY     │  (role_id = 1)
                    │             │
                    │ • Voir films│
                    │ • Noter 1-5 │
                    │ • Catégoriser│
                    │ • Approuver │
                    │ • Refuser   │
                    └─────────────┘
```

| Action | Jury | Super Jury | Admin |
|--------|------|------------|-------|
| Voir films assignés | ✅ | ✅ | ✅ |
| Noter films (1-5 ⭐) | ✅ | ✅ | ✅ |
| Choisir catégories | ✅ | ✅ | ✅ |
| Approuver/Refuser | ✅ | ✅ | ✅ |
| Assigner films aux jurys | ❌ | ✅ | ✅ |
| Voir tous les jurys | ❌ | ✅ | ✅ |
| Inviter membres | ❌ | ❌ | ✅ |
| Supprimer films | ❌ | ❌ | ✅ |
| Annuler invitations | ❌ | ❌ | ✅ |

---

## 5. Flux Utilisateurs

### 5.1 Soumission de Film (Public)

```
┌────────────────────────────────────────────────────────────────┐
│                    SOUMISSION DE FILM                          │
└────────────────────────────────────────────────────────────────┘

    Réalisateur                    Serveur                    BDD
         │                            │                         │
         │  1. /submit               │                         │
         │  ─────────────────────────►                         │
         │                            │                         │
         │  2. Formulaire multi-étapes│                         │
         │  ◄─────────────────────────│                         │
         │                            │                         │
         │  3. Envoi données + fichiers                        │
         │     • Titre, pays, description                      │
         │     • Vidéo (max 2GB)      │                         │
         │     • Poster (max 10MB)    │                         │
         │     • Miniature (requis)   │                         │
         │     • Infos réalisateur    │                         │
         │  ─────────────────────────►│                         │
         │                            │  4. INSERT films        │
         │                            │  ─────────────────────► │
         │                            │                         │
         │                            │  5. Stockage fichiers   │
         │                            │     /uploads/films/     │
         │                            │     /uploads/posters/   │
         │                            │     /uploads/thumbnails/│
         │                            │                         │
         │  6. Email confirmation     │                         │
         │  ◄─────────────────────────│                         │
         │                            │                         │
         │  7. Page succès            │                         │
         │  ◄─────────────────────────│                         │
```

### 5.2 Système d'Invitation

```
┌────────────────────────────────────────────────────────────────┐
│                   INVITATION JURY/ADMIN                        │
└────────────────────────────────────────────────────────────────┘

    Admin                         Serveur                   Invité
      │                              │                         │
      │  1. POST /api/auth/invite    │                         │
      │     {email, name, role}      │                         │
      │  ───────────────────────────►│                         │
      │                              │                         │
      │                              │  2. Génère token unique │
      │                              │     crypto.randomBytes(32)
      │                              │     Expire: 7 jours     │
      │                              │                         │
      │                              │  3. Email avec lien     │
      │                              │  ────────────────────────►
      │                              │                         │
      │  4. "Invitation envoyée"     │     /invite/{token}     │
      │  ◄───────────────────────────│                         │
      │                              │                         │
      │                              │  5. Clique sur lien     │
      │                              │  ◄────────────────────────
      │                              │                         │
      │                              │  6. Vérifie token       │
      │                              │     (valide + non expiré)│
      │                              │                         │
      │                              │  7. Formulaire password │
      │                              │  ────────────────────────►
      │                              │                         │
      │                              │  8. Crée compte         │
      │                              │  ◄────────────────────────
      │                              │                         │
      │                              │  9. Redirige /dashboard │
      │                              │  ────────────────────────►
```

### 5.3 Évaluation par le Jury

```
┌────────────────────────────────────────────────────────────────┐
│                    EVALUATION DES FILMS                        │
└────────────────────────────────────────────────────────────────┘

  Super Jury                    Jury                        Film
      │                           │                           │
      │  1. Sélectionne films     │                           │
      │  2. Assigne à jury        │                           │
      │  ────────────────────────►│                           │
      │                           │                           │
      │                           │  3. Voit films assignés   │
      │                           │  ◄─────────────────────────
      │                           │                           │
      │                           │  4. Visionne vidéo        │
      │                           │  ◄─────────────────────────
      │                           │                           │
      │                           │  5. Note (1-5 ⭐)         │
      │                           │  ─────────────────────────►
      │                           │                           │
      │                           │  6. Choisit catégories    │
      │                           │  ─────────────────────────►
      │                           │                           │
      │                           │  7. Approuve/Refuse       │
      │                           │  ─────────────────────────►
      │                           │                           │
      │  8. Voit progression      │     status = approved     │
      │     (X/3 notes par film)  │     ou rejected           │
      │  ◄────────────────────────│                           │
      │                           │                           │
      │  Film avec 3+ notes       │  9. Email au réalisateur  │
      │  → Évaluation complète    │  ─────────────────────────►
```

---

## 6. API Endpoints

### Authentification
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/login` | Connexion | Non |
| GET | `/api/auth/profile` | Profil utilisateur | Oui |
| POST | `/api/auth/invite` | Envoyer invitation | Admin |
| GET | `/api/auth/invitations` | Liste invitations | Admin |
| DELETE | `/api/auth/invitations/:id` | Annuler invitation | Admin |
| GET | `/api/auth/invite/:token` | Vérifier invitation | Non |
| POST | `/api/auth/invite/:token/accept` | Accepter invitation | Non |

### Films
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/films/submit` | Soumettre film | Non |
| GET | `/api/films/catalog` | Films approuvés | Non |
| GET | `/api/films/status?email=` | Statut soumission | Non |
| GET | `/api/films` | Tous les films | Jury+ |
| GET | `/api/films/pending` | Films en attente | Jury+ |
| GET | `/api/films/jury` | Films pour jury | Jury |
| GET | `/api/films/super-jury` | Films pour super jury | Super Jury |
| POST | `/api/films/:id/rate` | Noter un film | Jury+ |
| POST | `/api/films/:id/categories` | Définir catégories | Jury+ |
| POST | `/api/films/:id/approve` | Approuver | Jury+ |
| POST | `/api/films/:id/reject` | Refuser | Jury+ |
| DELETE | `/api/films/:id` | Supprimer | Admin |

### Super Jury
| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/films/jury-members` | Liste des jurys | Super Jury |
| POST | `/api/films/assign` | Assigner films | Super Jury |
| GET | `/api/films/jury/:id/assignments` | Films d'un jury | Super Jury |
| DELETE | `/api/films/assignment/:juryId/:filmId` | Retirer assignation | Super Jury |

---

## 7. Stack Technique

```
┌─────────────────────────────────────────────────────────────────┐
│                      ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │ React 19│  │  Vite   │  │Tailwind │  │  Router │           │
│  │         │  │   7.x   │  │   CSS   │  │   DOM   │           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│                                                                 │
│  Pages: Home, Login, Submit, Dashboard, ProfileJury,           │
│         ProfileSuperJury, ProfileAdmin, AcceptInvitation...    │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTP/REST
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐           │
│  │ Node.js │  │ Express │  │   JWT   │  │ Multer  │           │
│  │   20.x  │  │   4.x   │  │         │  │ (upload)│           │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘           │
│                                                                 │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│  │ bcryptjs│  │Nodemailer│ │  MySQL2 │                        │
│  │ (hash)  │  │ (email) │  │         │                        │
│  └─────────┘  └─────────┘  └─────────┘                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │ SQL
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                      MySQL 8                             │   │
│  │                                                          │   │
│  │  Tables: users, roles, user_roles, films, categories,   │   │
│  │          invitations, jury_ratings, jury_assignments,   │   │
│  │          film_categories, email_logs, awards, events... │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Structure des Dossiers

```
MarsAI/
├── Front-end/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   └── Footer.jsx
│   │   ├── layouts/
│   │   │   └── RootLayout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx          # Redirection selon rôle
│   │   │   ├── SubmitFilm.jsx         # Formulaire soumission
│   │   │   ├── AcceptInvitation.jsx   # Accepter invitation
│   │   │   ├── ProfileJury.jsx        # Interface Netflix Jury
│   │   │   ├── ProfileSuperJury.jsx   # Assignation films
│   │   │   ├── ProfileAdmin.jsx       # Admin + invitations
│   │   │   └── ...
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   └── filmService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── back-end/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── film.controller.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Film.js
│   │   │   └── Invitation.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── film.routes.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── authorize.middleware.js
│   │   ├── services/
│   │   │   └── email.service.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── upload.js
│   │   └── index.js
│   └── package.json
│
├── BDD/
│   └── marsai.sql
│
├── docker-compose.yml
├── CLAUDE.md
└── DOCUMENTATION.md    ◄── CE FICHIER
```

---

## 9. Règles Métier

### Système de notation
- Chaque film doit être noté par **minimum 3 jurys différents**
- Notes de 1 à 5 étoiles
- Une fois 3+ notes atteintes → film en "Évaluation complète"
- Super Jury peut assigner jusqu'à **50 films par session** à un jury

### Invitations
- Token unique de 64 caractères hexadécimaux
- Expiration après **7 jours**
- Utilisable **une seule fois**

### Upload fichiers
- Vidéo: MP4, MOV, AVI, WebM, MKV (max **2GB**)
- Poster: JPG, PNG, WebP, GIF (max **10MB**)
- Miniature: JPG, PNG, WebP, GIF (max **5MB**) - **REQUIS**

---

## 10. État Actuel du Projet

### ✅ Terminé
- [x] Système d'authentification JWT
- [x] Système d'invitation par email
- [x] Formulaire de soumission multi-étapes
- [x] Upload vidéo/poster/miniature
- [x] Interface Jury style Netflix
- [x] Interface Super Jury (assignation)
- [x] Interface Admin (invitations + films)
- [x] Notation 1-5 étoiles
- [x] Sélection catégories
- [x] Système d'assignation films→jurys
- [x] Limite 3 notes minimum par film
- [x] Page Dashboard (redirection selon rôle)

### 🔄 En cours / À faire
- [ ] Modération contenu vidéo (API externe)
- [ ] Page d'accueil complète
- [ ] Catalogue public des films approuvés
- [ ] Statistiques avancées
- [ ] Tests unitaires
- [ ] Déploiement production

---

## 11. Comptes par Défaut

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@marsai.com` | `admin123` |

---

## 12. Variables d'Environnement

### Backend (.env)
```env
PORT=5000
JWT_SECRET=change-this-in-production
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=marsai
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 13. Commandes

```bash
# Docker (recommandé)
docker-compose up -d

# Manuel
cd Front-end && npm install && npm run dev    # Port 5173
cd back-end && npm install && npm run dev     # Port 5000
```

---

*Document généré le 27/01/2026 - MarsAI Festival*

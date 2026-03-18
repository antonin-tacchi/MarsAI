# MarsAI — Plateforme de Festival de Cinéma

MarsAI est une plateforme complète de gestion de festival de courts-métrages. Elle permet aux réalisateurs de soumettre leurs films, aux membres du jury de les évaluer, et au public de parcourir le catalogue.

---

## Table des matières

- [Aperçu](#aperçu)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation rapide (Docker)](#installation-rapide-docker)
- [Installation manuelle](#installation-manuelle)
- [Variables d'environnement](#variables-denvironnement)
- [Rôles utilisateurs](#rôles-utilisateurs)
- [API — Endpoints principaux](#api--endpoints-principaux)
- [Frontend — Pages et composants](#frontend--pages-et-composants)
- [Base de données](#base-de-données)
- [Stockage des médias](#stockage-des-médias)
- [Emails](#emails)
- [Sécurité](#sécurité)

---

## Aperçu

| Composant | Technologie | Port |
|-----------|-------------|------|
| Backend API | Node.js + Express 4 | 5001 |
| Frontend | React 19 + Vite | 5173 |
| Base de données | MySQL 8.0 | 3309 |
| Stockage médias | Scaleway Object Storage (S3) | — |
| Emails | Resend | — |
| Admin BDD | phpMyAdmin | 8080 |

---

## Fonctionnalités

- **Soumission de films** avec affiche, miniature et vidéo (jusqu'à 800 MB)
- **Workflow de statuts** : `pending` → `approved` / `rejected` → `selected`
- **Streaming sécurisé** via URLs signées Scaleway
- **Système de notation** confidentiel pour les jurys
- **Distribution des prix** par le Super Jury
- **Modération admin** des soumissions
- **Catalogue public** avec recherche et filtres avancés (genre, langue, pays, durée)
- **Newsletter** avec double opt-in (FR/EN)
- **Multi-langue** français / anglais (persisté en localStorage)
- **Réinitialisation de mot de passe** par email

---

## Architecture

```
MarsAI/
├── back-end/                  # API REST Express.js
│   └── src/
│       ├── routes/            # 12 modules de routes
│       ├── controllers/       # 13 contrôleurs
│       ├── models/            # 11 modèles (accès MySQL)
│       ├── middleware/        # Auth JWT + contrôle par rôle
│       ├── services/          # Email, Scaleway S3, filmStatus
│       ├── config/            # Pool MySQL, client S3
│       └── docs/api/          # API_DOC.md — référence complète
├── Front-end/                 # SPA React + Vite
│   └── src/
│       ├── pages/             # 20+ pages
│       ├── components/        # 14+ composants réutilisables
│       ├── context/           # LanguageContext (i18n FR/EN)
│       ├── services/          # Appels API (auth, films, modération)
│       ├── hooks/             # useFilmFilters
│       └── i18n/              # fr.js, en.js
├── BDD/init/
│   ├── 01-marsai.sql          # Schéma complet (20+ tables)
│   └── 02-seed-400-films.sql  # Données de test
├── .env.example
└── docker-compose.yml
```

### Flux de requête

```
Client React → API Express → Middleware (JWT + rôle) → Controller → Model → MySQL
                                                      ↘ Services (S3, email)
```

---

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose **(recommandé)**
- **OU** Node.js 20+ et MySQL 8.0+

---

## Installation rapide (Docker)

```bash
git clone <url-du-repo>
cd MarsAI
cp .env.example .env
# Éditer .env (voir section Variables d'environnement)
docker-compose up
```

Les services démarrent et la base de données est initialisée automatiquement.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:5001 |
| phpMyAdmin | http://localhost:8080 |

---

## Installation manuelle

### Backend

```bash
cd back-end
npm install
# Configurer .env à la racine du projet
npm run dev     # développement (nodemon)
npm start       # production
```

### Frontend

```bash
cd Front-end
npm install
npm run dev     # http://localhost:5173
npm run build   # build production
```

### Base de données

```bash
mysql -u root -p -e "CREATE DATABASE marsai;"
mysql -u root -p marsai < BDD/init/01-marsai.sql
# Optionnel : données de test
mysql -u root -p marsai < BDD/init/02-seed-400-films.sql
```

---

## Variables d'environnement

Copiez `.env.example` en `.env` à la racine du projet.

```env
# Ports
BACKEND_PORT=5001
MYSQL_PORT=3309
MYSQL_ROOT_PASSWORD=rootpassword

# Base de données
DB_USER=root
DB_PASSWORD=rootpassword

# JWT — IMPORTANT : changer en production (min. 32 caractères)
JWT_SECRET=changez-cette-valeur-en-production-minimum-32-caracteres

# URLs
VITE_API_URL=http://localhost:5001
FRONTEND_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173

# Scaleway Object Storage
SCALEWAY_ACCESS_KEY=
SCALEWAY_SECRET_KEY=
SCALEWAY_ENDPOINT=https://s3.fr-par.scw.cloud
SCALEWAY_BUCKET_NAME=
SCALEWAY_REGION=fr-par
SCALEWAY_FOLDER=

# Emails (Resend)
RESEND_API_KEY=
RESEND_FROM=noreply@votredomaine.com
RESEND_DEV_RECIPIENT=votre@email.com   # redirection en dev
```

---

## Rôles utilisateurs

| Rôle | Niveau | Permissions |
|------|--------|-------------|
| Public / Réalisateur | 0 | Soumettre des films, parcourir le catalogue |
| Jury | 1 | Notation des films assignés |
| Admin | 2 | Gestion films, utilisateurs, statistiques |
| Super Jury | 3 | Tout Admin + distribution des prix |

### Flux de statut des films

```
pending → approved → selected
        ↘ rejected
```

---

## API — Endpoints principaux

Tous les endpoints sont préfixés par `/api`.

### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion → retourne un token JWT |
| GET | `/auth/profile` | Profil de l'utilisateur connecté |
| POST | `/auth/forgot-password` | Demande de réinitialisation |
| POST | `/auth/reset-password` | Nouveau mot de passe via token |
| POST | `/auth/change-password` | Changement de mot de passe |

**Utiliser le token :**
```
Authorization: Bearer <token>
```

### Films

| Méthode | Endpoint | Accès | Description |
|---------|----------|-------|-------------|
| GET | `/films/public/catalog` | Public | Catalogue avec filtres |
| GET | `/films/public/:id` | Public | Détail d'un film |
| POST | `/films/submit` | Authentifié | Soumettre un film |
| GET | `/films/my-films` | Réalisateur | Mes films |
| GET | `/films/admin/all` | Admin | Tous les films |
| PATCH | `/films/:id/status` | Admin | Changer le statut |
| DELETE | `/films/:id` | Admin | Supprimer un film |

### Jury & Notation

| Méthode | Endpoint | Accès | Description |
|---------|----------|-------|-------------|
| GET | `/jury/films` | Jury | Films assignés |
| POST | `/rating` | Jury | Soumettre une note |
| GET | `/rating/film/:id` | Jury/Admin | Notes d'un film |
| GET | `/jury/rankings` | Admin | Classement général |

### Admin & Autres

| Méthode | Endpoint | Accès | Description |
|---------|----------|-------|-------------|
| GET | `/admin/users` | Admin | Liste des utilisateurs |
| PATCH | `/admin/users/:id/role` | Admin | Changer le rôle |
| GET | `/stats` | Admin | Statistiques |
| POST | `/newsletter/subscribe` | Public | Inscription newsletter |
| GET | `/partners` | Public | Partenaires |
| GET | `/festival-config` | Public | Config du festival |
| GET | `/health` | Public | Health check |

> Documentation complète : [`back-end/src/docs/api/API_DOC.md`](back-end/src/docs/api/API_DOC.md)

---

## Frontend — Pages et composants

### Pages principales

| Page | Route | Accès |
|------|-------|-------|
| Accueil | `/` | Public |
| Catalogue | `/catalog` | Public |
| Connexion / Inscription | `/login`, `/register` | Public |
| Réinitialisation MDP | `/forgot-password`, `/reset-password` | Public |
| Profil réalisateur | `/profile` | Auth |
| Espace jury | `/jury` | Rôle jury |
| Dashboard admin | `/admin` | Rôle admin |
| Modération | `/moderation` | Rôle admin |
| Super Jury | `/super-jury` | Rôle super jury |
| Palmarès | `/prizes` | Public |
| Membres du jury | `/jury-members` | Public |
| À propos, Règlement, Partenaires… | `/about`, `/regulations`, etc. | Public |

### Composants clés

| Composant | Description |
|-----------|-------------|
| `MovieForm` | Formulaire de soumission (upload affiche + miniature + vidéo) |
| `FilmCard` | Carte d'aperçu d'un film |
| `FilmPlayer` | Lecteur vidéo (URL signée) |
| `FilmFilters` + `SearchBar` | Filtres et recherche du catalogue |
| `Header` / `Footer` | Navigation, changement de langue |
| `Modal` / `ConfirmModal` | Boîtes de dialogue |
| `NewsletterSubscribe` | Inscription newsletter |

### Internationalisation

```jsx
import { useLanguage } from '../context/LanguageContext';

const { t, language, setLanguage } = useLanguage();
// t('cle.traduction') → texte dans la langue courante
```

Les traductions sont dans `src/i18n/fr.js` et `src/i18n/en.js`.

---

## Base de données

| Table | Description |
|-------|-------------|
| `users` | Comptes utilisateurs |
| `roles` / `user_roles` | Rôles et associations |
| `films` | Films soumis (statut, fichiers, métadonnées) |
| `jury_assignments` | Attribution films → jurys |
| `jury_ratings` | Notes des jurys |
| `password_reset_tokens` | Tokens de reset (1h d'expiration) |
| `newsletter_subscribers` | Abonnés newsletter (double opt-in) |
| `partners` | Partenaires du festival |
| `festival_config` | Configuration générale |
| `jury_members` | Annuaire public des membres du jury |

---

## Stockage des médias

Les fichiers sont hébergés sur **Scaleway Object Storage** (S3 compatible, `fr-par`).

| Type | Limite |
|------|--------|
| Vidéo | 800 MB |
| Affiche | 5 MB |
| Miniature | 3 MB |

Le streaming utilise des **URLs signées** temporaires pour empêcher l'accès direct aux fichiers.

---

## Emails

Gérés via **Resend** (`email.service.js`) :

- Réinitialisation de mot de passe
- Confirmation de soumission de film
- Confirmation newsletter (double opt-in)
- Credentials jury (création de compte)

En développement, tous les emails sont redirigés vers `RESEND_DEV_RECIPIENT`.

---

## Sécurité

- Mots de passe hashés avec **bcryptjs**
- Tokens **JWT** avec expiration 24h
- URLs de streaming **signées** (accès temporaire)
- **Rate limiting** : 5 requêtes / 15 min sur les soumissions
- **Validation** de toutes les entrées avec express-validator
- **CORS** restreint aux origines configurées
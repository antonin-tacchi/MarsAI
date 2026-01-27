# MarsAI Backend API

API Backend pour le festival MarsAI - Plateforme de gestion de films avec systeme d'invitation Jury/Admin.

## Prerequis

- Node.js (v18 ou superieur)
- MySQL (v8 ou superieur)

## Installation

### 1. Installer les dependances

```bash
npm install
```

### 2. Configuration de la base de donnees

Creez une base de donnees MySQL nommee `marsai` :

```sql
CREATE DATABASE marsai;
```

Importez le schema de base de donnees :

```bash
mysql -u root -p marsai < ../BDD/marsai.sql
```

### 3. Configuration

Creez un fichier `.env` a la racine du projet back-end :

```env
# Server Configuration
PORT=5000
CORS_ORIGIN=*

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=marsai

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Demarrage

```bash
# Mode developpement
npm run dev

# Mode production
npm start
```

## API Endpoints

### Authentification

#### Login (Connexion Jury/Admin)

**POST** `/api/auth/login`

```json
{
  "email": "admin@marsai.com",
  "password": "admin123"
}
```

#### Profil utilisateur

**GET** `/api/auth/profile`

Headers: `Authorization: Bearer <token>`

### Systeme d'invitation (Admin only)

#### Envoyer une invitation

**POST** `/api/auth/invite`

Headers: `Authorization: Bearer <token>`

```json
{
  "email": "nouveau@email.com",
  "name": "Nom de la personne",
  "role": "jury"
}
```

Roles disponibles: `jury`, `admin`

#### Voir les invitations en attente

**GET** `/api/auth/invitations`

#### Annuler une invitation

**DELETE** `/api/auth/invitations/:id`

### Acceptation d'invitation (Public)

#### Verifier une invitation

**GET** `/api/auth/invite/:token`

#### Accepter et creer le compte

**POST** `/api/auth/invite/:token/accept`

```json
{
  "password": "motdepasse123",
  "name": "Mon nom"
}
```

### Soumission de films (Public)

#### Soumettre un film

**POST** `/api/films/submit`

Content-Type: `multipart/form-data`

Champs:
- `film` (fichier video) - MP4, MOV, AVI, WebM, MKV (max 2GB)
- `poster` (fichier image) - JPG, PNG, WebP, GIF (max 10MB)
- `title` (requis)
- `country`
- `description`
- `ai_tools_used`
- `ai_certification` (boolean)
- `director_firstname` (requis)
- `director_lastname` (requis)
- `director_email` (requis)
- `director_bio`
- `director_school`
- `director_website`
- `social_instagram`
- `social_youtube`
- `social_vimeo`

#### Voir le catalogue (films approuves)

**GET** `/api/films/catalog`

#### Verifier le statut de soumission

**GET** `/api/films/status?email=realisateur@email.com`

### Gestion des films (Jury/Admin)

#### Voir tous les films

**GET** `/api/films`

Query params: `?status=pending|approved|rejected`

#### Voir les films en attente

**GET** `/api/films/pending`

#### Statistiques

**GET** `/api/films/stats`

#### Approuver un film

**POST** `/api/films/:id/approve`

#### Refuser un film

**POST** `/api/films/:id/reject`

```json
{
  "reason": "Raison du refus (optionnel)"
}
```

#### Supprimer un film (Admin only)

**DELETE** `/api/films/:id`

## Roles

| ID | Role | Permissions |
|----|------|-------------|
| 1 | Jury | Voir/Approuver/Refuser films |
| 2 | Admin | Tout + Invitations + Suppression |

## Compte Admin par defaut

- Email: `admin@marsai.com`
- Password: `admin123`

## Structure de la base de donnees

- `users` : Comptes Jury/Admin
- `user_roles` : Association utilisateurs-roles
- `roles` : Roles (Jury=1, Admin=2)
- `invitations` : Invitations en attente
- `films` : Films soumis avec infos realisateur
- `film_categories` : Categories des films
- `categories` : Categories du festival
- `email_logs` : Historique des emails envoyes
- `awards` : Prix et recompenses
- `events` : Evenements du festival
- `festival_config` : Configuration du festival

## Technologies

- **Express.js** : Framework web
- **MySQL2** : Driver MySQL
- **bcryptjs** : Hashage des mots de passe
- **jsonwebtoken** : Authentification JWT
- **express-validator** : Validation des donnees
- **multer** : Upload de fichiers
- **nodemailer** : Envoi d'emails

## Notes importantes

- Pas d'inscription publique - Systeme d'invitation uniquement
- Les realisateurs soumettent leurs films via le formulaire public
- Ils recoivent un email a chaque changement de statut
- Changez le `JWT_SECRET` en production

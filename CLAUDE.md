# CLAUDE.md - Guide AI pour MarsAI

**Derniere mise a jour**: 2026-01-26

## Apercu du projet

**MarsAI** est une plateforme web pour un festival de films IA. Les realisateurs soumettent leurs films via un formulaire public, et les membres du Jury/Admin les valident.

**Pas d'inscription publique** - Systeme d'invitation uniquement pour Jury/Admin.

## Structure du projet

```
MarsAI/
├── Front-end/                 # React SPA (Vite)
│   ├── src/
│   │   ├── pages/            # Pages React
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx           # Connexion Jury/Admin
│   │   │   ├── AcceptInvitation.jsx # Accepter invitation
│   │   │   ├── SubmitFilm.jsx      # Soumission film (public)
│   │   │   ├── Catalogs.jsx
│   │   │   ├── ProfileJury.jsx     # Dashboard Jury
│   │   │   ├── ProfileAdmin.jsx    # Dashboard Admin
│   │   │   └── ...
│   │   ├── components/       # Composants reutilisables
│   │   ├── services/         # Services API
│   │   │   ├── authService.js
│   │   │   └── filmService.js
│   │   ├── layouts/
│   │   └── App.jsx           # Routes principales
│   └── package.json
│
├── back-end/                  # Express API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.routes.js    # Auth + Invitations
│   │   │   ├── film.routes.js    # Films CRUD
│   │   │   └── health.routes.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── film.controller.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Film.js
│   │   │   └── Invitation.js
│   │   ├── services/
│   │   │   └── email.service.js  # Nodemailer
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── authorize.middleware.js
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── upload.js         # Multer config
│   │   └── index.js
│   └── package.json
│
├── BDD/
│   └── marsai.sql            # Schema MySQL
│
└── docker-compose.yml        # Dev environment
```

## Stack technique

**Frontend**: React 19, Vite, Tailwind CSS, React Router DOM
**Backend**: Node.js, Express, MySQL2, JWT, bcryptjs, multer, nodemailer
**Base de donnees**: MySQL 8

## Roles et permissions

| Role | ID | Permissions |
|------|-----|-------------|
| Jury | 1 | Voir/Approuver/Refuser films |
| Admin | 2 | Tout + Invitations + Suppression |

**Compte admin par defaut**: `admin@marsai.com` / `admin123`

## API Endpoints principaux

### Authentification
- `POST /api/auth/login` - Connexion Jury/Admin
- `GET /api/auth/profile` - Profil utilisateur (protege)

### Invitations (Admin only)
- `POST /api/auth/invite` - Envoyer invitation
- `GET /api/auth/invitations` - Voir invitations en attente
- `DELETE /api/auth/invitations/:id` - Annuler invitation

### Acceptation invitation (Public)
- `GET /api/auth/invite/:token` - Verifier invitation
- `POST /api/auth/invite/:token/accept` - Creer compte

### Films
- `POST /api/films/submit` - Soumettre film (public, multipart/form-data)
- `GET /api/films/catalog` - Voir films approuves (public)
- `GET /api/films/status?email=...` - Statut soumission (public)
- `GET /api/films` - Tous les films (Jury/Admin)
- `GET /api/films/pending` - Films en attente (Jury/Admin)
- `POST /api/films/:id/approve` - Approuver (Jury/Admin)
- `POST /api/films/:id/reject` - Refuser (Jury/Admin)
- `DELETE /api/films/:id` - Supprimer (Admin only)

## Flux utilisateur

### Realisateur (public)
1. Va sur `/submit`
2. Remplit le formulaire multi-etapes (film + infos realisateur)
3. Upload video (max 2GB) et poster (max 10MB)
4. Recoit email de confirmation
5. Recoit email quand film approuve/refuse

### Nouveau Jury/Admin
1. Admin envoie invitation via API
2. Recoit email avec lien `/invite/:token`
3. Definit mot de passe et nom
4. Connecte automatiquement au dashboard

## Commandes de developpement

```bash
# Docker (recommande)
docker-compose up

# Manuel
cd Front-end && npm run dev    # Port 5173
cd back-end && npm run dev     # Port 5000
```

## Variables d'environnement

**Backend (.env)**:
```
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

## Conventions de code

- ES Modules partout (`import/export`)
- Async/await avec try/catch
- Reponses JSON: `{ success: true/false, data/message, errors? }`
- Fichiers backend: inclure `.js` dans les imports

## Base de donnees - Tables principales

- `users` - Comptes Jury/Admin
- `user_roles` - Junction table roles
- `roles` - 1=Jury, 2=Admin
- `invitations` - Invitations en attente
- `films` - Soumissions avec infos realisateur integrees
- `categories` - Categories festival
- `film_categories` - Junction films-categories
- `email_logs` - Historique emails

## Notes importantes

- **Pas de registration publique** - Invitation uniquement
- Les infos realisateur sont liees au film (pas de compte)
- Upload video: MP4, MOV, AVI, WebM, MKV (max 2GB)
- Upload poster: JPG, PNG, WebP, GIF (max 10MB)
- Emails via Gmail (utiliser App Password)

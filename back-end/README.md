# MarsAI Backend API

API Backend pour l'application MarsAI avec authentification JWT et base de données MySQL.

## Prérequis

- Node.js (v18 ou supérieur)
- MySQL (v8 ou supérieur)

## Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configuration de la base de données

Créez une base de données MySQL nommée `marsai` :

```sql
CREATE DATABASE marsai;
```

Importez le schéma de base de données :

```bash
mysql -u root -p marsai < ../BDD/marsai.sql
```

### 3. Configuration

Créez un fichier `.env` à la racine du projet back-end :

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
```

## Démarrage

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## Endpoints d'authentification

### Register (Inscription)

**POST** `/api/auth/register`

Body:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

Response (201):
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-20T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Login (Connexion)

**POST** `/api/auth/login`

Body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response (200):
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "created_at": "2024-01-20T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get Profile (Profil utilisateur)

**GET** `/api/auth/profile`

Headers:
```
Authorization: Bearer <token>
```

Response (200):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "bio": null,
    "country": null,
    "school": null,
    "created_at": "2024-01-20T10:00:00.000Z"
  }
}
```

## Validation des données

### Register
- `email`: doit être un email valide
- `password`: minimum 6 caractères
- `name`: requis (nom complet)

### Login
- `email`: doit être un email valide
- `password`: requis

## Codes d'erreur

- `400`: Données invalides
- `401`: Non authentifié
- `403`: Token invalide ou expiré
- `404`: Ressource non trouvée
- `500`: Erreur serveur

## Structure de la base de données

La base de données `marsai` contient plusieurs tables :
- `users` : Utilisateurs de la plateforme
- `films` : Films soumis au festival
- `votes` : Votes du public
- `awards` : Prix et récompenses
- `events` : Événements du festival
- `roles` : Rôles utilisateurs (Director, Jury, Admin)
- `user_roles` : Association utilisateurs-rôles

Voir le fichier `/BDD/marsai.sql` pour le schéma complet.

## Technologies utilisées

- **Express.js** : Framework web
- **MySQL2** : Driver MySQL avec support des promesses
- **bcryptjs** : Hashage des mots de passe
- **jsonwebtoken** : Authentification JWT
- **express-validator** : Validation des données

## Notes importantes

✅ **Ce backend utilise une base de données MySQL persistante.**

🔐 N'oubliez pas de changer le `JWT_SECRET` en production avec une clé secrète forte.

🗄️ Assurez-vous que MySQL est en cours d'exécution avant de démarrer le serveur.

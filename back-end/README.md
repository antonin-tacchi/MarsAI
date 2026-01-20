# MarsAI Backend API

API Backend pour l'application MarsAI avec authentification JWT.

## Installation

```bash
npm install
```

## Configuration

Créez un fichier `.env` à la racine du projet :

```env
PORT=5000
CORS_ORIGIN=*
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
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
  "firstName": "John",
  "lastName": "Doe"
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
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-20T10:00:00.000Z"
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
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-20T10:00:00.000Z"
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
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-20T10:00:00.000Z"
  }
}
```

## Validation des données

### Register
- `email`: doit être un email valide
- `password`: minimum 6 caractères
- `firstName`: requis
- `lastName`: requis

### Login
- `email`: doit être un email valide
- `password`: requis

## Codes d'erreur

- `400`: Données invalides
- `401`: Non authentifié
- `403`: Token invalide ou expiré
- `404`: Ressource non trouvée
- `500`: Erreur serveur

## Notes importantes

⚠️ **Ce backend utilise un stockage en mémoire pour les utilisateurs. Les données seront perdues au redémarrage du serveur.**

Pour la production, il est recommandé d'utiliser une vraie base de données (PostgreSQL, MongoDB, etc.).

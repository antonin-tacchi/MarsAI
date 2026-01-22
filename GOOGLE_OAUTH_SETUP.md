# 🔐 Configuration Google OAuth

Ce guide vous explique comment configurer l'authentification Google OAuth pour MarsAI.

## 📋 Prérequis

- Un compte Google
- Accès à la [Google Cloud Console](https://console.cloud.google.com/)

## 🚀 Étapes de configuration

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur le sélecteur de projet en haut
3. Cliquez sur **"Nouveau projet"**
4. Nommez votre projet (ex: "MarsAI Authentication")
5. Cliquez sur **"Créer"**

### 2. Activer l'API Google+ et Google Identity

1. Dans le menu de navigation, allez à **"APIs & Services"** > **"Bibliothèque"**
2. Recherchez **"Google+ API"**
3. Cliquez sur **"ACTIVER"**

### 3. Créer les identifiants OAuth 2.0

1. Allez à **"APIs & Services"** > **"Identifiants"**
2. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"**
3. Sélectionnez **"ID client OAuth"**

4. **Configurer l'écran de consentement** (si demandé) :
   - Type d'application : **Externe**
   - Nom de l'application : **MarsAI**
   - Email de l'assistance utilisateur : votre email
   - Logo de l'application : (optionnel)
   - Domaines autorisés : (laissez vide pour dev)
   - Coordonnées du développeur : votre email
   - Cliquez sur **"Enregistrer et continuer"**
   - Portées : laissez par défaut
   - Utilisateurs tests : ajoutez votre email pour tester
   - Cliquez sur **"Enregistrer et continuer"**

5. **Créer l'ID client** :
   - Type d'application : **Application Web**
   - Nom : **MarsAI Web Client**

6. **Origines JavaScript autorisées** :
   - Pour le développement, ajoutez :
     ```
     http://localhost:5173
     http://localhost:5000
     ```
   - Pour la production, ajoutez votre domaine :
     ```
     https://votre-domaine.com
     ```

7. **URI de redirection autorisés** :
   - Pour le développement :
     ```
     http://localhost:5173
     http://localhost:5173/login
     http://localhost:5173/register
     ```
   - Pour la production :
     ```
     https://votre-domaine.com
     https://votre-domaine.com/login
     https://votre-domaine.com/register
     ```

8. Cliquez sur **"Créer"**

### 4. Récupérer votre Client ID

Après la création, une fenêtre s'affiche avec :
- **ID client** : `123456789-abcdefghijk.apps.googleusercontent.com`
- **Code secret du client** : (vous n'en avez pas besoin pour cette implémentation)

**Copiez l'ID client** !

### 5. Configurer votre application

#### Frontend (.env)

Créez un fichier `.env` à la racine du dossier `Front-end/` :

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijk.apps.googleusercontent.com
VITE_API_URL=http://localhost:5000/api
```

Remplacez `123456789-abcdefghijk.apps.googleusercontent.com` par votre véritable Client ID.

#### Backend (.env)

Le backend n'a pas besoin de configuration supplémentaire pour cette implémentation.
Les variables JWT existantes sont suffisantes.

### 6. Tester l'authentification

1. **Démarrer les services** :
   ```bash
   docker compose up -d
   ```

2. **Ouvrir l'application** :
   ```
   http://localhost:5173/login
   ```

3. **Cliquer sur le bouton "Se connecter avec Google"** :
   - Une popup Google devrait s'ouvrir
   - Sélectionnez votre compte Google
   - Autorisez l'application
   - Vous serez redirigé vers la page d'accueil

## 🔧 Fonctionnement technique

### Architecture

```
Frontend (React)
    ↓
Google Sign-In (popup)
    ↓
Google vérifie l'identité
    ↓
Token JWT de Google (credential)
    ↓
POST /api/auth/google { credential }
    ↓
Backend vérifie le token
    ↓
Crée/récupère l'utilisateur
    ↓
Génère un JWT MarsAI
    ↓
Frontend stocke le token
    ↓
Redirection vers /
```

### Sécurité

- ✅ Le token Google est vérifié côté backend
- ✅ Un mot de passe aléatoire est généré pour les utilisateurs Google
- ✅ Le token JWT MarsAI est généré avec une expiration de 24h
- ✅ Le mot de passe n'est jamais retourné au frontend

## 📝 Variables d'environnement

### Frontend (.env)

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# API Backend
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)

Le backend utilise les variables existantes :

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Database
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=marsai
```

## ⚠️ Important pour la production

### 1. Sécuriser la vérification du token Google

Dans `back-end/src/controllers/googleAuth.controller.js`, la vérification du token Google est simplifiée.

**Pour la production**, vous devez vérifier le token avec les clés publiques de Google :

```bash
npm install google-auth-library
```

```javascript
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ticket = await client.verifyIdToken({
  idToken: credential,
  audience: process.env.GOOGLE_CLIENT_ID,
});

const payload = ticket.getPayload();
const { email, name, picture, sub: googleId } = payload;
```

### 2. Mettre à jour les origines autorisées

Dans Google Cloud Console, mettez à jour les origines JavaScript autorisées avec votre domaine de production.

### 3. Changer JWT_SECRET

Générez une nouvelle clé secrète forte :

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🐛 Dépannage

### Erreur : "Redirect URI mismatch"

**Cause** : L'URI de redirection n'est pas autorisée dans Google Cloud Console.

**Solution** : Ajoutez l'URI dans **"Origines JavaScript autorisées"**.

### Le popup Google ne s'ouvre pas

**Cause** : Le Client ID n'est pas configuré ou incorrect.

**Solution** :
1. Vérifiez que le fichier `.env` existe dans `Front-end/`
2. Vérifiez que `VITE_GOOGLE_CLIENT_ID` est correct
3. Redémarrez le serveur frontend : `docker compose restart frontend`

### Erreur : "Invalid Google credential"

**Cause** : Le token Google n'est pas valide ou a expiré.

**Solution** : Réessayez de vous connecter. Si le problème persiste, vérifiez les logs backend.

### L'utilisateur n'est pas créé dans la base de données

**Cause** : Problème de connexion à MySQL ou erreur dans le modèle User.

**Solution** :
1. Vérifiez que MySQL est démarré : `docker compose ps`
2. Vérifiez les logs backend : `docker compose logs backend`
3. Testez la connexion DB : `docker compose exec backend node scripts/test-db-connection.js`

## 📚 Ressources

- [Google Identity Services](https://developers.google.com/identity/gsi/web/guides/overview)
- [OAuth 2.0 for Web Server Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ Checklist de configuration

- [ ] Projet Google Cloud créé
- [ ] API Google+ activée
- [ ] ID client OAuth créé
- [ ] Origines JavaScript configurées
- [ ] Client ID copié
- [ ] Fichier `.env` créé dans `Front-end/`
- [ ] Variable `VITE_GOOGLE_CLIENT_ID` configurée
- [ ] Docker compose redémarré
- [ ] Test de connexion Google réussi

---

**Besoin d'aide ?** Consultez les logs avec `docker compose logs -f backend` pour plus d'informations.

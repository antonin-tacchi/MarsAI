# 🚀 Configuration Rapide Google OAuth (5 minutes)

## ✅ Fichiers créés
- ✅ `Front-end/.env.local` - Configuration frontend
- ✅ `back-end/.env` - Configuration backend

## 📝 Étape 1 : Obtenir votre Google Client ID

### 1.1 Créer un projet Google Cloud
1. Allez sur **https://console.cloud.google.com/**
2. Cliquez sur **"Nouveau projet"** en haut
3. Nom du projet : `MarsAI`
4. Cliquez sur **"Créer"**

### 1.2 Configurer OAuth
1. Dans le menu ☰, allez à **"APIs & Services"** > **"Identifiants"**
2. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"** > **"ID client OAuth"**

### 1.3 Écran de consentement (première fois seulement)
Si demandé, configurez l'écran de consentement :
- Type : **Externe**
- Nom de l'application : **MarsAI**
- Email d'assistance : votre email
- Cliquez sur **"Enregistrer et continuer"** (×3)
- Ajoutez votre email dans **"Utilisateurs tests"**

### 1.4 Créer l'ID client
1. Type d'application : **Application Web**
2. Nom : **MarsAI Web Client**
3. **Origines JavaScript autorisées** :
   ```
   http://localhost:5173
   ```
4. **URI de redirection autorisés** : (laissez vide)
5. Cliquez sur **"CRÉER"**

### 1.5 Copier votre Client ID
Une popup apparaît avec votre **ID client**. Il ressemble à :
```
123456789-abcdefghijklmnop.apps.googleusercontent.com
```
**→ Copiez-le !**

---

## 🔧 Étape 2 : Configurer votre application

### 2.1 Configuration Frontend

Ouvrez le fichier **`Front-end/.env.local`** et remplacez le Client ID :

```bash
# API Backend URL
VITE_API_URL=http://localhost:5000/api

# Google OAuth Client ID
# ⚠️ REMPLACEZ par votre vrai Client ID !
VITE_GOOGLE_CLIENT_ID=VOTRE_CLIENT_ID_ICI.apps.googleusercontent.com
```

### 2.2 Configuration Backend

Le fichier **`back-end/.env`** est déjà configuré. Vérifiez juste :

```bash
# Server Configuration
PORT=5000
CORS_ORIGIN=*

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=marsai
```

**Note :** Pour la production, changez `JWT_SECRET` et restreignez `CORS_ORIGIN`.

---

## 🎯 Étape 3 : Démarrer l'application

### 3.1 Démarrer la base de données (si Docker)
```bash
docker-compose up -d
```

### 3.2 Démarrer le backend
```bash
cd back-end
npm install  # Si première fois
npm run dev
```

### 3.3 Démarrer le frontend (dans un autre terminal)
```bash
cd Front-end
npm install  # Si première fois
npm run dev
```

---

## ✨ Étape 4 : Tester Google OAuth

1. Ouvrez votre navigateur sur **http://localhost:5173/login**
2. Cliquez sur **"Se connecter avec Google"**
3. Une popup Google devrait s'ouvrir
4. Connectez-vous avec votre compte Google
5. Vous serez redirigé vers la page d'accueil !

---

## 🐛 Dépannage

### Erreur : "redirect_uri_mismatch"
→ Vérifiez que `http://localhost:5173` est bien dans les **"Origines JavaScript autorisées"** sur Google Cloud Console.

### Le bouton Google ne fait rien
→ Vérifiez que vous avez bien remplacé `VITE_GOOGLE_CLIENT_ID` dans `Front-end/.env.local`.

### Erreur CORS
→ Vérifiez que le backend tourne bien sur `http://localhost:5000`.

### Erreur "Invalid Google credential"
→ Videz le cache du navigateur et réessayez.

---

## 📚 Plus d'informations

Pour un guide détaillé, voir **`GOOGLE_OAUTH_SETUP.md`** à la racine du projet.

---

## ✅ Checklist finale

- [ ] J'ai créé un projet Google Cloud
- [ ] J'ai obtenu mon Client ID
- [ ] J'ai remplacé `VITE_GOOGLE_CLIENT_ID` dans `Front-end/.env.local`
- [ ] J'ai démarré la base de données (MySQL/Docker)
- [ ] J'ai démarré le backend (`npm run dev`)
- [ ] J'ai démarré le frontend (`npm run dev`)
- [ ] J'ai testé la connexion Google

---

**🎉 Félicitations ! Votre Google OAuth est maintenant configuré !**

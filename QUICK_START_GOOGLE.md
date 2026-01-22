# 🚀 Démarrage Rapide - Google OAuth

## ⚠️ Configuration requise pour que le bouton Google fonctionne

Le bouton "Se connecter avec Google" nécessite une configuration Google Cloud. Voici les étapes simples :

### 📝 Étape 1 : Obtenir un Google Client ID (5 minutes)

1. **Allez sur** : https://console.cloud.google.com/
2. **Créez un nouveau projet** (ou sélectionnez un existant)
   - Nom : "MarsAI" (ou autre)
   - Cliquez sur "Créer"
3. **Allez dans "APIs & Services" > "Identifiants"**
4. **Cliquez sur "+ CRÉER DES IDENTIFIANTS"**
5. **Sélectionnez "ID client OAuth"**
6. **Si demandé, configurez l'écran de consentement** :
   - Type : Externe
   - Nom : MarsAI
   - Email : votre email
   - Cliquez sur "Enregistrer et continuer" jusqu'à la fin
7. **Retournez créer l'ID client** :
   - Type d'application : **Application Web**
   - Nom : MarsAI Web Client
   - **Origines JavaScript autorisées** :
     ```
     http://localhost:5173
     ```
   - Cliquez sur "Créer"
8. **Copiez l'ID client** qui s'affiche
   - Format : `123456789-abcdefg.apps.googleusercontent.com`

### ⚙️ Étape 2 : Configurer votre application

1. **Ouvrez le fichier** : `Front-end/.env`
2. **Remplacez la ligne** :
   ```env
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

   Par votre véritable Client ID :
   ```env
   VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   ```

3. **Sauvegardez le fichier**

### 🔄 Étape 3 : Redémarrer l'application

```bash
# Redémarrer Docker
docker compose restart

# Ou si vous utilisez npm
cd Front-end
npm run dev
```

### ✅ Étape 4 : Tester

1. Ouvrez http://localhost:5173/login
2. Cliquez sur "Se connecter avec Google"
3. Une popup Google devrait s'ouvrir
4. Sélectionnez votre compte
5. Vous serez redirigé vers la page d'accueil ✨

## 🎯 Mode développement rapide (OPTIONNEL)

Si vous voulez juste tester l'interface sans configurer Google :

Le bouton Google sera visible mais désactivé (grisé) tant que le Client ID n'est pas configuré. Vous pouvez toujours utiliser l'inscription/connexion classique avec email et mot de passe.

## 🐛 Problèmes courants

### Le bouton Google est grisé
**Cause** : Le Client ID n'est pas configuré ou incorrect.
**Solution** : Vérifiez le fichier `Front-end/.env` et assurez-vous que `VITE_GOOGLE_CLIENT_ID` contient votre vrai Client ID.

### Erreur "Redirect URI mismatch"
**Cause** : L'URL n'est pas autorisée dans Google Cloud Console.
**Solution** : Ajoutez `http://localhost:5173` dans "Origines JavaScript autorisées".

### Le popup ne s'ouvre pas
**Cause** : Le script Google n'est pas chargé.
**Solution** :
1. Ouvrez la console du navigateur (F12)
2. Vérifiez s'il y a des erreurs
3. Redémarrez le serveur frontend

## 📚 Documentation complète

Pour plus de détails, voir le guide complet : **GOOGLE_OAUTH_SETUP.md**

## ✨ Résumé

```bash
# 1. Obtenir Client ID sur console.cloud.google.com
# 2. Modifier Front-end/.env avec votre Client ID
# 3. docker compose restart
# 4. Tester sur http://localhost:5173/login
```

C'est tout ! 🎉

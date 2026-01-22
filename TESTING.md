# 🧪 Guide de Test - Page Register

## 📋 Prérequis
- Docker et Docker Compose installés
- VSCode
- Ports disponibles : 3306 (MySQL), 5000 (Backend), 5173 (Frontend)

## 🚀 Lancement de l'Application

### 1. Démarrer tous les services avec Docker

```bash
docker compose up -d
```

Cela va démarrer :
- **MySQL** (port 3306) - avec initialisation automatique de la BDD
- **Backend** (port 5000) - API Node.js/Express
- **Frontend** (port 5173) - React + Vite

### 2. Vérifier que les services sont actifs

```bash
# Voir les conteneurs en cours
docker compose ps

# Voir les logs
docker compose logs -f
```

### 3. Vérifier la connexion MySQL

```bash
# Logs du backend pour voir la connexion DB
docker compose logs backend | grep "Connected to MySQL"
```

Vous devriez voir : ✅ Connected to MySQL database

## 🧪 Tests de la Page Register

### A. Test Backend (API)

#### Test 1 : Vérifier que l'API fonctionne
```bash
curl http://localhost:5000/
```
Réponse attendue : `{"message":"MarsAI API online 🚀"}`

#### Test 2 : Inscription d'un nouvel utilisateur
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Réponse attendue (succès) :**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "bio": null,
      "country": null,
      "school": null,
      "created_at": "2024-01-22T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Test 3 : Tester l'erreur "email déjà utilisé"
```bash
# Réessayer avec le même email
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "john@example.com",
    "password": "password456"
  }'
```

**Réponse attendue (erreur) :**
```json
{
  "success": false,
  "message": "A user with this email already exists"
}
```

### B. Test Frontend (Interface)

1. **Ouvrir l'application dans le navigateur**
   ```
   http://localhost:5173/register
   ```

2. **Tests à effectuer :**

   ✅ **Test 1 : Validation côté client**
   - Laisser les champs vides et cliquer sur "S'INSCRIRE"
   - Vérifier que les messages d'erreur apparaissent

   ✅ **Test 2 : Validation email**
   - Entrer un email invalide (ex: "test@test")
   - Vérifier le message : "Invalid email format"

   ✅ **Test 3 : Validation mot de passe**
   - Entrer un mot de passe < 6 caractères
   - Vérifier le message : "Password must be at least 6 characters"

   ✅ **Test 4 : Confirmation mot de passe**
   - Entrer deux mots de passe différents
   - Vérifier le message : "Passwords do not match"

   ✅ **Test 5 : Inscription réussie**
   - Remplir tous les champs correctement
   - Cliquer sur "S'INSCRIRE"
   - Vérifier que vous êtes redirigé vers "/"
   - Ouvrir la console du navigateur (F12) pour voir :
     ```
     Registration successful: { success: true, ... }
     ```

   ✅ **Test 6 : Email déjà utilisé**
   - Réessayer de s'inscrire avec le même email
   - Vérifier l'affichage du message d'erreur en rouge

## 🗄️ Vérification de la Base de Données

### Se connecter à MySQL

```bash
docker compose exec mysql mysql -u root -prootpassword marsai
```

### Voir les utilisateurs créés

```sql
SELECT id, name, email, created_at FROM users;
```

### Vider la table users (pour retester)

```bash
# Utiliser le script fourni
docker compose exec backend node scripts/clear-users.js
```

## 🛠️ Scripts Utiles

### Nettoyer et redémarrer
```bash
# Arrêter tous les services
docker compose down

# Supprimer les volumes (⚠️ efface la BDD)
docker compose down -v

# Redémarrer proprement
docker compose up -d
```

### Voir les logs en temps réel
```bash
# Tous les services
docker compose logs -f

# Un service spécifique
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

### Tester la connexion à la BDD
```bash
docker compose exec backend node scripts/test-db-connection.js
```

## 📱 Endpoints API Disponibles

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription d'un nouvel utilisateur |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/profile` | Profil utilisateur (authentifié) |
| GET | `/api/test/db` | Test connexion BDD |
| GET | `/api/test/users` | Liste tous les users |

## 🐛 Dépannage

### Problème : Port déjà utilisé
```bash
# Voir les processus sur le port 5000
lsof -i :5000

# Ou sur Windows
netstat -ano | findstr :5000
```

### Problème : MySQL ne démarre pas
```bash
# Voir les logs MySQL
docker compose logs mysql

# Vérifier le healthcheck
docker compose ps
```

### Problème : Frontend ne charge pas
```bash
# Rebuilder le frontend
docker compose up -d --build frontend
```

## ✅ Checklist de Test Complète

- [ ] Docker compose démarre sans erreur
- [ ] Backend se connecte à MySQL (voir logs)
- [ ] API répond sur http://localhost:5000
- [ ] Frontend accessible sur http://localhost:5173/register
- [ ] Inscription via API (curl) fonctionne
- [ ] Inscription via interface fonctionne
- [ ] Validation côté client fonctionne
- [ ] Erreur "email existant" s'affiche correctement
- [ ] Token JWT est généré et stocké dans localStorage
- [ ] Redirection après inscription fonctionne
- [ ] Utilisateur visible dans la BDD MySQL

## 📝 Variables d'Environnement

Configurées dans `docker-compose.yml` :

**Backend :**
- `PORT=5000`
- `DB_HOST=mysql`
- `DB_USER=root`
- `DB_PASSWORD=rootpassword`
- `DB_NAME=marsai`
- `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production`

**Frontend :**
- `VITE_API_URL=http://localhost:5000/api`

---

💡 **Astuce VSCode** : Installez l'extension "Docker" pour gérer vos conteneurs directement depuis VSCode !

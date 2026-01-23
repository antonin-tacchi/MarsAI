# Guide de résolution - Inscription ne sauvegarde pas dans la BDD

## Problème
L'inscription ne renvoie plus d'erreur "failed to fetch", mais aucune donnée n'est enregistrée dans la base de données.

## Diagnostic

### Étape 1: Vérifier que MySQL est en cours d'exécution

```bash
docker ps
```

Vous devriez voir `marsai-mysql`, `marsai-backend`, et `marsai-frontend` en cours d'exécution.

### Étape 2: Vérifier les logs du backend

```bash
docker logs marsai-backend -f
```

Recherchez des erreurs lors de l'inscription, notamment:
- `Error creating user`
- `ER_NO_SUCH_TABLE`
- `Error connecting to MySQL database`

### Étape 3: Vérifier si les tables existent

```bash
# Se connecter au conteneur MySQL
docker exec -it marsai-mysql mysql -uroot -prootpassword marsai

# Dans MySQL, exécuter:
SHOW TABLES;
```

**Si aucune table n'apparaît**, c'est la cause du problème!

### Étape 4: Vérifier la structure de la table users (si elle existe)

```sql
DESCRIBE users;
```

## Solution

### Option 1: Initialiser la base de données via Docker (RECOMMANDÉ)

```bash
# Importer le schéma SQL dans le conteneur MySQL
docker exec -i marsai-mysql mysql -uroot -prootpassword marsai < BDD/marsai.sql
```

### Option 2: Initialiser manuellement via MySQL CLI

```bash
# Se connecter au conteneur MySQL
docker exec -it marsai-mysql mysql -uroot -prootpassword

# Créer la base de données et les tables
source /docker-entrypoint-initdb.d/marsai.sql;
```

### Option 3: Recréer complètement les conteneurs

```bash
# Arrêter et supprimer tous les conteneurs et volumes
docker-compose down -v

# Redémarrer les services (cela importera automatiquement le SQL)
docker-compose up -d
```

**⚠️ ATTENTION**: L'option 3 supprimera toutes les données existantes!

## Vérification après correction

### 1. Vérifier que les tables sont créées

```bash
docker exec -it marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SHOW TABLES;"
```

Vous devriez voir:
- `roles`
- `users`
- `user_roles`

### 2. Vérifier que les rôles sont insérés

```bash
docker exec -it marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SELECT * FROM roles;"
```

Vous devriez voir 3 rôles:
1. Director
2. Jury
3. Admin

### 3. Tester l'inscription

1. Ouvrir `http://localhost:5173/register`
2. Remplir le formulaire:
   - Prénom: Test
   - Nom: User
   - Email: test@example.com
   - Mot de passe: Test1234
3. Cliquer sur "Connexion" (bouton d'inscription)

### 4. Vérifier que l'utilisateur est dans la BDD

```bash
docker exec -it marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SELECT id, name, email, created_at FROM users;"
```

Vous devriez voir votre utilisateur de test!

### 5. Vérifier que le rôle est assigné

```bash
docker exec -it marsai-mysql mysql -uroot -prootpassword -e "USE marsai; SELECT * FROM user_roles;"
```

Vous devriez voir une ligne avec `user_id=1` et `role_id=1`.

## Script de diagnostic automatique

J'ai créé un script pour diagnostiquer les problèmes de base de données:

```bash
cd back-end
node src/scripts/test-db.js
```

**Note**: Ce script ne fonctionne que si vous l'exécutez depuis l'hôte et que MySQL est accessible sur localhost:3306. Pour Docker, utilisez les commandes ci-dessus.

## Commandes utiles

### Voir les logs en temps réel

```bash
# Backend
docker logs marsai-backend -f

# MySQL
docker logs marsai-mysql -f

# Frontend
docker logs marsai-frontend -f
```

### Redémarrer un service spécifique

```bash
docker-compose restart backend
docker-compose restart mysql
```

### Accéder au shell d'un conteneur

```bash
# Backend
docker exec -it marsai-backend sh

# MySQL
docker exec -it marsai-mysql bash
```

## Problèmes courants

### Erreur: "ER_NO_SUCH_TABLE: Table 'marsai.users' doesn't exist"

**Cause**: Les tables n'ont pas été créées.

**Solution**: Exécuter l'Option 1 ci-dessus (importer le schéma SQL).

### Erreur: "connect ECONNREFUSED"

**Cause**: MySQL n'est pas démarré ou le backend ne peut pas s'y connecter.

**Solution**:
```bash
docker-compose up -d mysql
docker-compose restart backend
```

### Les données apparaissent dans la réponse mais pas dans la BDD

**Cause**: Transaction non committée ou erreur silencieuse.

**Solution**: Vérifier les logs du backend pour des erreurs:
```bash
docker logs marsai-backend | grep -i error
```

### Erreur: "Duplicate entry for key 'email'"

**Cause**: Un utilisateur avec cet email existe déjà.

**Solution**: Utiliser un autre email ou supprimer l'utilisateur existant:
```bash
docker exec -it marsai-mysql mysql -uroot -prootpassword -e "USE marsai; DELETE FROM users WHERE email='test@example.com';"
```

## Besoin d'aide supplémentaire?

Si le problème persiste:

1. Collectez les logs:
```bash
docker logs marsai-backend > backend-logs.txt
docker logs marsai-mysql > mysql-logs.txt
```

2. Vérifiez la configuration des variables d'environnement dans docker-compose.yml

3. Vérifiez que le fichier BDD/marsai.sql est bien présent et non vide

4. Essayez de créer un utilisateur manuellement via MySQL pour vérifier que la base fonctionne:
```sql
INSERT INTO users (name, email, password, created_at)
VALUES ('Test', 'manual@test.com', 'hashedpass123', NOW());
```

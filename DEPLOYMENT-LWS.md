# 🚀 Guide de Déploiement GreenDataFlow sur LWS

## Prérequis
- Compte LWS actif
- Node.js installé sur votre machine
- Accès FTP à votre hébergement LWS

## Étape 1: Préparation du projet

### Option A: Utiliser le script automatique
```bash
# Rendre le script exécutable (Linux/Mac)
chmod +x deploy-lws.sh

# Exécuter le script
./deploy-lws.sh
```

### Option B: Manuel
```bash
# Installer les dépendances
npm install

# Construire le projet
npm run build
```

## Étape 2: Configuration LWS

### 2.1 Créer un sous-domaine
1. Connectez-vous à votre espace client LWS
2. Allez dans **"Gestion des sites"** > **"Sous-domaines"**
3. Cliquez sur **"Ajouter un sous-domaine"**
4. Choisissez un nom (ex: `greendataflow`)
5. Sélectionnez votre domaine principal
6. Cliquez sur **"Créer"**

### 2.2 Configuration du sous-domaine
- **Document Root**: Laissez par défaut (généralement `/www/votre-sous-domaine/`)
- **PHP Version**: 8.0 ou supérieur (si nécessaire)
- **SSL**: Activez le certificat SSL gratuit

## Étape 3: Upload des fichiers

### 3.1 Via FTP (Recommandé)
1. Utilisez un client FTP (FileZilla, WinSCP, etc.)
2. Connectez-vous avec vos identifiants LWS
3. Naviguez vers le répertoire racine de votre sous-domaine
4. Uploadez **TOUT** le contenu du dossier `build/` (pas le dossier lui-même)
5. Uploadez le fichier `.htaccess` à la racine

### 3.2 Structure finale attendue
```
/www/votre-sous-domaine/
├── .htaccess
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── favicon.png
```

## Étape 4: Configuration avancée

### 4.1 Variables d'environnement
Si votre application utilise des variables d'environnement, créez un fichier `.env` à la racine :

```env
REACT_APP_API_URL=https://votre-api.com
REACT_APP_ENVIRONMENT=production
```

### 4.2 Base URL (si nécessaire)
Si votre application doit être servie depuis un sous-dossier, modifiez le `package.json` :

```json
{
  "homepage": "https://votre-sous-domaine.votredomaine.com"
}
```

## Étape 5: Test et vérification

### 5.1 Test de l'application
1. Visitez `https://votre-sous-domaine.votredomaine.com`
2. Vérifiez que toutes les pages fonctionnent
3. Testez la navigation entre les routes
4. Vérifiez que les formulaires fonctionnent

### 5.2 Vérification des performances
- Utilisez Google PageSpeed Insights
- Vérifiez que le cache fonctionne
- Testez sur mobile

## Dépannage

### Problème: Page blanche
- Vérifiez que le fichier `.htaccess` est bien uploadé
- Vérifiez les logs d'erreur dans l'espace client LWS
- Assurez-vous que tous les fichiers sont uploadés

### Problème: Routes ne fonctionnent pas
- Vérifiez le contenu du fichier `.htaccess`
- Assurez-vous que le module `mod_rewrite` est activé
- Contactez le support LWS si nécessaire

### Problème: Assets non trouvés
- Vérifiez que tous les fichiers du dossier `static/` sont uploadés
- Vérifiez les chemins dans le fichier `index.html`

## Support

Si vous rencontrez des problèmes :
1. Consultez les logs d'erreur dans votre espace client LWS
2. Contactez le support LWS
3. Vérifiez la documentation React pour le déploiement

## Mise à jour

Pour mettre à jour votre application :
1. Faites vos modifications en local
2. Relancez le script `./deploy-lws.sh`
3. Uploadez le nouveau contenu du dossier `build/`
4. Videz le cache du navigateur si nécessaire

---

**🎉 Félicitations ! Votre application GreenDataFlow est maintenant déployée sur LWS !**



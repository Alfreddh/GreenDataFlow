#!/bin/bash

echo "🚀 Déploiement GreenDataFlow sur LWS..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet."
    exit 1
fi

# Nettoyer les builds précédents
echo "🧹 Nettoyage des builds précédents..."
rm -rf build/
rm -rf node_modules/

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Construire le projet
echo "🔨 Construction du projet..."
npm run build

# Vérifier que le build a réussi
if [ ! -d "build" ]; then
    echo "❌ Erreur: Le dossier build n'a pas été créé. Vérifiez les erreurs de build."
    exit 1
fi

echo "✅ Build terminé avec succès!"
echo ""
echo "📋 Prochaines étapes pour LWS:"
echo "1. Connectez-vous à votre espace client LWS"
echo "2. Allez dans 'Gestion des sites' > 'Sous-domaines'"
echo "3. Créez un nouveau sous-domaine (ex: greendataflow.votredomaine.com)"
echo "4. Uploadez le contenu du dossier 'build' dans le répertoire racine du sous-domaine"
echo "5. Assurez-vous que le fichier .htaccess est bien présent"
echo ""
echo "🌐 Votre application sera accessible sur: https://votre-sous-domaine.votredomaine.com"
echo ""
echo "💡 Conseil: Utilisez un client FTP comme FileZilla pour uploader les fichiers"



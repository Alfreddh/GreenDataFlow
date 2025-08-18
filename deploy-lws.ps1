# Script de déploiement GreenDataFlow pour LWS (Windows PowerShell)

Write-Host "🚀 Déploiement GreenDataFlow sur LWS..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Assurez-vous d'être dans le répertoire du projet." -ForegroundColor Red
    exit 1
}

# Nettoyer les builds précédents
Write-Host "🧹 Nettoyage des builds précédents..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
}
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force "node_modules"
}

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm install

# Construire le projet
Write-Host "🔨 Construction du projet..." -ForegroundColor Yellow
npm run build

# Vérifier que le build a réussi
if (-not (Test-Path "build")) {
    Write-Host "❌ Erreur: Le dossier build n'a pas été créé. Vérifiez les erreurs de build." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build terminé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Prochaines étapes pour LWS:" -ForegroundColor Cyan
Write-Host "1. Connectez-vous à votre espace client LWS" -ForegroundColor White
Write-Host "2. Allez dans 'Gestion des sites' > 'Sous-domaines'" -ForegroundColor White
Write-Host "3. Créez un nouveau sous-domaine (ex: greendataflow.votredomaine.com)" -ForegroundColor White
Write-Host "4. Uploadez le contenu du dossier 'build' dans le répertoire racine du sous-domaine" -ForegroundColor White
Write-Host "5. Assurez-vous que le fichier .htaccess est bien présent" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Votre application sera accessible sur: https://votre-sous-domaine.votredomaine.com" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Conseil: Utilisez un client FTP comme FileZilla pour uploader les fichiers" -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 Dossier build créé: $((Get-Location).Path)\build" -ForegroundColor Cyan



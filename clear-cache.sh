#!/bin/bash

echo "🧹 Nettoyage du cache Next.js..."

# Supprimer le dossier .next
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ Dossier .next supprimé"
fi

# Supprimer le cache node_modules
if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ Cache node_modules supprimé"
fi

# Supprimer le dossier out (build statique)
if [ -d "out" ]; then
  rm -rf out
  echo "✅ Dossier out supprimé"
fi

echo ""
echo "🎉 Cache nettoyé avec succès !"
echo ""
echo "Maintenant lance : npm run dev"
echo ""
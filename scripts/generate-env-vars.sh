#!/bin/bash

##############################################
# Script pour générer les variables d'environnement
# pour déploiement Vercel
##############################################

echo "========================================="
echo "Variables d'environnement pour Vercel"
echo "========================================="
echo ""

# Vérifier que les clés existent
if [ ! -f "private.pem" ] || [ ! -f "public.pem" ]; then
    echo "❌ Erreur: Les fichiers private.pem et public.pem n'existent pas"
    echo ""
    echo "Générez-les avec:"
    echo "  openssl genrsa -out private.pem 2048"
    echo "  openssl rsa -in private.pem -pubout -out public.pem"
    exit 1
fi

echo "📋 Copiez les valeurs suivantes dans Vercel Dashboard:"
echo "    Projet → Settings → Environment Variables"
echo ""
echo "========================================="
echo ""

# Générer JWT_PRIVATE_KEY
echo "1️⃣  JWT_PRIVATE_KEY"
echo "-------------------------------------------"
awk '{printf "%s\\n", $0}' private.pem
echo ""
echo ""

# Générer JWT_PUBLIC_KEY
echo "2️⃣  JWT_PUBLIC_KEY"
echo "-------------------------------------------"
awk '{printf "%s\\n", $0}' public.pem
echo ""
echo ""

echo "========================================="
echo "✅ Variables générées avec succès!"
echo ""
echo "📝 Instructions:"
echo "   1. Allez dans Vercel Dashboard"
echo "   2. Sélectionnez votre projet"
echo "   3. Settings → Environment Variables"
echo "   4. Ajoutez ces 2 variables:"
echo ""
echo "      Name: JWT_PRIVATE_KEY"
echo "      Value: [copiez la valeur ci-dessus]"
echo "      Environment: Production, Preview, Development"
echo ""
echo "      Name: JWT_PUBLIC_KEY"
echo "      Value: [copiez la valeur ci-dessus]"
echo "      Environment: Production, Preview, Development"
echo ""
echo "   5. Cliquez sur 'Save'"
echo "   6. Redéployez votre projet"
echo "========================================="

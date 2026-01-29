#!/bin/bash

##############################################
# Script pour vérifier les variables d'environnement JWT
# Utile pour déboguer les problèmes de déploiement
##############################################

echo "========================================="
echo "Vérification des variables d'environnement JWT"
echo "========================================="
echo ""

# Couleurs pour l'affichage
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier JWT_PRIVATE_KEY
if [ -z "$JWT_PRIVATE_KEY" ]; then
    echo -e "${RED}❌ JWT_PRIVATE_KEY n'est PAS définie${NC}"
    echo ""
    echo "Pour définir cette variable en local:"
    echo "  export JWT_PRIVATE_KEY=\"\$(awk '{printf \"%s\\\\n\", \$0}' private.pem)\""
    echo ""
    PRIVATE_KEY_OK=false
else
    echo -e "${GREEN}✅ JWT_PRIVATE_KEY est définie${NC}"

    # Vérifier le format
    if echo "$JWT_PRIVATE_KEY" | grep -q "BEGIN.*PRIVATE KEY"; then
        echo -e "${GREEN}✅ Format valide (contient BEGIN PRIVATE KEY)${NC}"
    else
        echo -e "${RED}❌ Format invalide (ne contient pas BEGIN PRIVATE KEY)${NC}"
        echo "Premiers 50 caractères: ${JWT_PRIVATE_KEY:0:50}"
        PRIVATE_KEY_OK=false
    fi

    # Vérifier les newlines
    if echo "$JWT_PRIVATE_KEY" | grep -q "\\\\n"; then
        echo -e "${GREEN}✅ Newlines échappés trouvés (\\\\n)${NC}"
        PRIVATE_KEY_OK=true
    else
        echo -e "${YELLOW}⚠️  Pas de newlines échappés détectés${NC}"
        echo "Note: Cela peut être normal si la variable contient de vrais newlines"
        PRIVATE_KEY_OK=true
    fi
fi

echo ""
echo "========================================="
echo ""

# Vérifier JWT_PUBLIC_KEY
if [ -z "$JWT_PUBLIC_KEY" ]; then
    echo -e "${RED}❌ JWT_PUBLIC_KEY n'est PAS définie${NC}"
    echo ""
    echo "Pour définir cette variable en local:"
    echo "  export JWT_PUBLIC_KEY=\"\$(awk '{printf \"%s\\\\n\", \$0}' public.pem)\""
    echo ""
    PUBLIC_KEY_OK=false
else
    echo -e "${GREEN}✅ JWT_PUBLIC_KEY est définie${NC}"

    # Vérifier le format
    if echo "$JWT_PUBLIC_KEY" | grep -q "BEGIN.*PUBLIC KEY"; then
        echo -e "${GREEN}✅ Format valide (contient BEGIN PUBLIC KEY)${NC}"
    else
        echo -e "${RED}❌ Format invalide (ne contient pas BEGIN PUBLIC KEY)${NC}"
        echo "Premiers 50 caractères: ${JWT_PUBLIC_KEY:0:50}"
        PUBLIC_KEY_OK=false
    fi

    # Vérifier les newlines
    if echo "$JWT_PUBLIC_KEY" | grep -q "\\\\n"; then
        echo -e "${GREEN}✅ Newlines échappés trouvés (\\\\n)${NC}"
        PUBLIC_KEY_OK=true
    else
        echo -e "${YELLOW}⚠️  Pas de newlines échappés détectés${NC}"
        echo "Note: Cela peut être normal si la variable contient de vrais newlines"
        PUBLIC_KEY_OK=true
    fi
fi

echo ""
echo "========================================="
echo ""

# Résumé
if [ "$PRIVATE_KEY_OK" = true ] && [ "$PUBLIC_KEY_OK" = true ]; then
    echo -e "${GREEN}✅ Toutes les variables sont correctement configurées!${NC}"
    echo ""
    echo "Vous pouvez maintenant:"
    echo "  1. Tester en local: yarn dev"
    echo "  2. Déployer sur Vercel"
    exit 0
else
    echo -e "${RED}❌ Certaines variables sont manquantes ou mal configurées${NC}"
    echo ""
    echo "Actions recommandées:"
    echo "  1. Générez les clés si elles n'existent pas:"
    echo "     openssl genrsa -out private.pem 2048"
    echo "     openssl rsa -in private.pem -pubout -out public.pem"
    echo ""
    echo "  2. Exécutez le script de génération des variables:"
    echo "     ./scripts/generate-env-vars.sh"
    echo ""
    echo "  3. Copiez les valeurs dans Vercel Dashboard:"
    echo "     Project → Settings → Environment Variables"
    echo ""
    exit 1
fi

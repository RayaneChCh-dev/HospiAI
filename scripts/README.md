# Scripts

## generate-env-vars.sh

Script pour générer les variables d'environnement nécessaires au déploiement Vercel.

### Utilisation

```bash
./scripts/generate-env-vars.sh
```

### Ce que fait le script

1. Vérifie que les fichiers `private.pem` et `public.pem` existent
2. Convertit les clés au format requis par Vercel (avec `\n` échappés)
3. Affiche les valeurs à copier dans Vercel Dashboard

### Avant d'exécuter

Assurez-vous d'avoir généré les clés RSA:

```bash
# Générer la clé privée
openssl genrsa -out private.pem 2048

# Générer la clé publique
openssl rsa -in private.pem -pubout -out public.pem
```

### Après exécution

1. Copiez les valeurs affichées
2. Allez dans Vercel Dashboard → Settings → Environment Variables
3. Ajoutez `JWT_PRIVATE_KEY` et `JWT_PUBLIC_KEY`
4. Redéployez le projet

Pour plus de détails, consultez [docs/VERCEL_DEPLOYMENT.md](../docs/VERCEL_DEPLOYMENT.md)

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

---

## verify-env-vars.sh

Script pour vérifier que les variables d'environnement JWT sont correctement configurées.

### Utilisation

```bash
./scripts/verify-env-vars.sh
```

### Ce que fait le script

1. Vérifie que `JWT_PRIVATE_KEY` est définie
2. Vérifie que `JWT_PUBLIC_KEY` est définie
3. Valide le format des clés (présence de `BEGIN`/`END`)
4. Vérifie l'échappement des newlines (`\n`)
5. Affiche un résumé avec des recommandations

### Quand l'utiliser

- **Avant de déployer** sur Vercel
- **En cas d'erreur** `secretOrPrivateKey must be an asymmetric key when using RS256`
- **Pour déboguer** des problèmes d'authentification en production
- **En local** pour tester le format Vercel

### Exemple de sortie

```bash
$ ./scripts/verify-env-vars.sh
=========================================
Vérification des variables d'environnement JWT
=========================================

✅ JWT_PRIVATE_KEY est définie
✅ Format valide (contient BEGIN PRIVATE KEY)
✅ Newlines échappés trouvés (\\n)

=========================================

✅ JWT_PUBLIC_KEY est définie
✅ Format valide (contient BEGIN PUBLIC KEY)
✅ Newlines échappés trouvés (\\n)

=========================================

✅ Toutes les variables sont correctement configurées!

Vous pouvez maintenant:
  1. Tester en local: yarn dev
  2. Déployer sur Vercel
```

### Définir les variables en local pour tester

```bash
# Exporter les variables avec le format Vercel
export JWT_PRIVATE_KEY="$(awk '{printf "%s\\n", $0}' private.pem)"
export JWT_PUBLIC_KEY="$(awk '{printf "%s\\n", $0}' public.pem)"

# Vérifier
./scripts/verify-env-vars.sh

# Tester l'application
yarn build
yarn start
```

Pour plus de détails sur le troubleshooting, consultez [docs/JWT_PRIVATE_KEY_ERROR.md](../docs/JWT_PRIVATE_KEY_ERROR.md)


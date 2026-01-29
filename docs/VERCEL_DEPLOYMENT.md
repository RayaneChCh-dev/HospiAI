# Guide de Déploiement Vercel - Configuration des Clés RSA

## 🔐 Problème

Vercel **ne génère PAS** de clés cryptographiques automatiquement. Les clés RSA doivent être:
1. Générées **hors de Vercel** (en local)
2. Injectées dans Vercel via **Environment Variables**

## ✅ Solution: Variables d'Environnement (RECOMMANDÉ)

### Étape 1: Générer les clés RSA (en local)

Si vous n'avez pas encore les clés, générez-les:

```bash
# Clé privée (2048 bits)
openssl genrsa -out private.pem 2048

# Clé publique dérivée
openssl rsa -in private.pem -pubout -out public.pem
```

**⚠️ Important:**
- `private.pem` → **SECRET** (ne jamais commit dans Git)
- `public.pem` → Peut être exposée via JWKS

### Étape 2: Convertir les clés pour Vercel

Les clés doivent être converties en une seule ligne avec `\n` échappés:

**Option A: Utiliser le script automatique**

```bash
./scripts/generate-env-vars.sh
```

Ce script affichera les valeurs prêtes à copier dans Vercel.

**Option B: Conversion manuelle**

```bash
# Convertir private.pem
awk '{printf "%s\\n", $0}' private.pem

# Convertir public.pem
awk '{printf "%s\\n", $0}' public.pem
```

### Étape 3: Ajouter dans Vercel Dashboard

1. **Allez dans Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Sélectionnez votre projet**
   - Cliquez sur le projet HospiAI

3. **Accédez aux Environment Variables**
   - `Settings` → `Environment Variables`

4. **Ajoutez les 2 variables:**

#### Variable 1: JWT_PRIVATE_KEY

| Champ | Valeur |
|-------|--------|
| **Name** | `JWT_PRIVATE_KEY` |
| **Value** | Collez la sortie de `awk '{printf "%s\\n", $0}' private.pem` |
| **Environment** | ✅ Production<br>✅ Preview<br>✅ Development |

#### Variable 2: JWT_PUBLIC_KEY

| Champ | Valeur |
|-------|--------|
| **Name** | `JWT_PUBLIC_KEY` |
| **Value** | Collez la sortie de `awk '{printf "%s\\n", $0}' public.pem` |
| **Environment** | ✅ Production<br>✅ Preview<br>✅ Development |

5. **Cliquez sur "Save"**

6. **Redéployez le projet**
   - Vercel redéploiera automatiquement
   - Ou déclenchez manuellement: `Deployments` → `...` → `Redeploy`

### Étape 4: Vérification

Une fois déployé, testez le endpoint JWKS:

```bash
curl https://votre-projet.vercel.app/.well-known/jwks.json
```

Vous devriez recevoir:

```json
{
  "keys": [
    {
      "kty": "RSA",
      "n": "...",
      "e": "AQAB",
      "kid": "main-key",
      "use": "sig",
      "alg": "RS256"
    }
  ]
}
```

## 📋 Variables d'Environnement Requises

Pour que l'application fonctionne correctement sur Vercel, assurez-vous d'avoir **toutes** ces variables:

### Variables JWT (NOUVELLES)

```env
JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
JWT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----\n"
AUTH_JWT_ISSUER="hospiai-api"
AUTH_JWT_AUDIENCE="hospiai-mcp"
```

### Variables existantes

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://votre-projet.vercel.app"
NEXTAUTH_SECRET="votre-secret-nextauth"

# MCP Server
MCP_SERVER_URL="https://mcp-carestral-app-349b535a.alpic.live"
NEXT_PUBLIC_MCP_SERVER_URL="https://mcp-carestral-app-349b535a.alpic.live"
```

## 🔄 Développement Local vs Production

Le code est maintenant **compatible avec les deux environnements**:

### En local (développement)
- Lit les fichiers `private.pem` et `public.pem`
- Pas besoin de variables d'environnement JWT

### Sur Vercel (production)
- Lit les variables d'environnement `JWT_PRIVATE_KEY` et `JWT_PUBLIC_KEY`
- Les fichiers `.pem` ne sont pas déployés (ignorés par Git)

## 🛡️ Sécurité

### ✅ À FAIRE:
- ✅ Générer des clés **hors de Vercel**
- ✅ Stocker les clés dans **Environment Variables**
- ✅ Ajouter `private.pem` dans `.gitignore`
- ✅ Utiliser des clés différentes pour dev/staging/prod

### ❌ À NE PAS FAIRE:
- ❌ Committer `private.pem` dans Git
- ❌ Partager `private.pem` publiquement
- ❌ Utiliser la même clé en dev et en prod
- ❌ Exposer `JWT_PRIVATE_KEY` dans les logs

## 🔍 Dépannage

### Erreur: "Private key not found"

**Cause:** Variable d'environnement manquante ou mal formatée

**Solution:**
1. Vérifiez que `JWT_PRIVATE_KEY` existe dans Vercel
2. Vérifiez que les `\n` sont bien présents
3. Vérifiez que la clé commence par `-----BEGIN` et finit par `-----END`

### Erreur: "Invalid JWT signature"

**Cause:** Clés publique/privée non appariées

**Solution:**
1. Régénérez les clés ensemble:
   ```bash
   openssl genrsa -out private.pem 2048
   openssl rsa -in private.pem -pubout -out public.pem
   ```
2. Réimportez les deux dans Vercel

### Erreur: "JWKS endpoint returns 500"

**Cause:** Variable `JWT_PUBLIC_KEY` mal formatée

**Solution:**
1. Vérifiez les logs Vercel: `Deployments` → Cliquez sur le déploiement → `View Function Logs`
2. Régénérez la variable avec `awk '{printf "%s\\n", $0}' public.pem`

## 📚 Ressources

- [Documentation Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [JWKS Standard (RFC 7517)](https://datatracker.ietf.org/doc/html/rfc7517)
- [RS256 vs HS256](https://auth0.com/blog/rs256-vs-hs256-whats-the-difference/)

## 🎯 Checklist de Déploiement

Avant de déployer, vérifiez:

- [ ] Les clés RSA sont générées en local
- [ ] `private.pem` est dans `.gitignore`
- [ ] Les clés sont converties avec `awk`
- [ ] `JWT_PRIVATE_KEY` est ajoutée dans Vercel
- [ ] `JWT_PUBLIC_KEY` est ajoutée dans Vercel
- [ ] Toutes les autres variables d'environnement sont configurées
- [ ] Le projet se build correctement en local (`yarn build`)
- [ ] Le endpoint `/.well-known/jwks.json` fonctionne après déploiement
- [ ] Le login/register fonctionne sur Vercel

---

**Dernière mise à jour:** 2026-01-29

# Migration vers Option B - Token MCP

## Vue d'ensemble

Ce document décrit la migration de l'Option A (JWT NextJS) vers l'Option B (Token MCP), suivant les meilleures pratiques MCP.

## Comparaison des architectures

### Option A (JWT NextJS) - AVANT ❌
```
┌─────────┐      ┌─────────┐      ┌──────────┐
│ NextJS  │─────>│ NextJS  │─────>│  Claude  │
│Frontend │ Auth │ Backend │ JWT  │ Desktop  │
└─────────┘      └─────────┘      └──────────┘
                      │                 │
                      v                 v
                 ┌─────────┐      ┌──────────┐
                 │Database │      │   MCP    │
                 └─────────┘      │  Server  │
                                  └──────────┘
```

**Problèmes:**
- Fort couplage entre NextJS et MCP
- Révocation difficile (token JWT stateless)
- NextJS génère les tokens MCP (mauvaise pratique)
- Secret JWT partagé entre systèmes

### Option B (Token MCP) - APRÈS ✅
```
┌─────────┐      ┌─────────┐      ┌──────────┐
│ NextJS  │─────>│ NextJS  │─────>│  Claude  │
│Frontend │ Auth │ Backend │ Ref  │ Desktop  │
└─────────┘      └─────────┘      └──────────┘
                      │                 │
                      v                 v
                 ┌─────────┐      ┌──────────┐
                 │Database │<─────│   MCP    │
                 │(Ref)    │  API │  Server  │
                 └─────────┘      └──────────┘
```

**Avantages:**
- ✅ Faible couplage - MCP indépendant
- ✅ Révocation facile - token dans store MCP
- ✅ MCP génère ses propres tokens
- ✅ Meilleure scalabilité
- ✅ Suit les best practices MCP

## Changements effectués

### 1. Serveur MCP FastMCP

#### `auth.py` - Nouvelle architecture
- ✅ `CarestraLTokenVerifier` - Gère les tokens localement
- ✅ `TOKEN_STORE` - Store en mémoire (à remplacer par Redis en prod)
- ✅ `generate_mcp_token()` - Génère des tokens sécurisés
- ✅ `revoke_token()` - Révoque instantanément
- ✅ `list_user_tokens()` - Liste les tokens d'un utilisateur

#### `server.py` - Nouveaux endpoints
- ✅ `POST /tokens/generate` - Génération de token
- ✅ `POST /tokens/revoke` - Révocation de token
- ✅ `POST /tokens/list` - Liste des tokens
- ✅ Tous les outils MCP existants conservés

### 2. Backend NextJS

#### `/api/tokens/generate/route.ts`
**AVANT:** Générait des JWT avec jsonwebtoken
**APRÈS:** Appelle le MCP server pour générer le token

```typescript
// Appel au MCP server
const mcpResponse = await fetch(`${MCP_SERVER_URL}/tokens/generate`, {
  method: 'POST',
  body: JSON.stringify({
    user_id: user.id,
    email: user.email,
    firstname: user.firstname,
    surname: user.surname,
    name: validatedData.name,
    scopes: validatedData.scopes,
    expires_in_days: validatedData.expiresInDays,
  }),
})
```

#### `/api/tokens/mcp/route.ts`
**Ajout:** Appelle le MCP server lors de la révocation

```typescript
// Révocation sur le MCP server
await fetch(`${MCP_SERVER_URL}/tokens/revoke`, {
  method: 'POST',
  body: JSON.stringify({ token: mcpToken.tokenMcp }),
})
```

#### `/api/mcp/validate/route.ts`
**Simplifié:** Plus besoin de vérifier les JWT, juste la référence en DB

### 3. Variables d'environnement

#### Ajout:
```bash
MCP_SERVER_URL="https://mcp-carestral-app-349b535a.alpic.live"
```

#### Déprécié (mais conservé pour compatibilité):
```bash
MCP_JWT_SECRET=...
MCP_JWT_ISSUER=...
MCP_JWT_AUDIENCE=...
```

## Format des tokens

### AVANT (Option A):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
(JWT standard avec signature HMAC)
```

### APRÈS (Option B):
```
mcp_aB3dEf9Gh2iJ4kL6mN8oP0qR1sT3uV5wX7yZ9...
(Token opaque sécurisé avec secrets.token_urlsafe)
```

## Flux de génération de token

### Nouveau flux (Option B):

1. **Utilisateur** demande un token sur `/dashboard/tokens`
2. **NextJS Frontend** → `POST /api/tokens/generate`
3. **NextJS Backend**:
   - Authentifie l'utilisateur (session)
   - Récupère les infos utilisateur
   - Appelle le **MCP Server**
4. **MCP Server** → `POST /tokens/generate`:
   - Génère un token sécurisé (`mcp_...`)
   - Stocke dans `TOKEN_STORE`
   - Retourne le token
5. **NextJS Backend**:
   - Stocke la référence en DB
   - Retourne le token à l'utilisateur
6. **Utilisateur** copie le token (affiché une seule fois)
7. **Claude Desktop** utilise le token pour s'authentifier

### Flux d'authentification:

1. **Claude Desktop** envoie `Authorization: Bearer mcp_...`
2. **MCP Server** vérifie dans `TOKEN_STORE`
3. **MCP Server** retourne `AccessToken` avec claims
4. **Tool MCP** accède aux données utilisateur

## Flux de révocation

### Nouveau flux (Option B):

1. **Utilisateur** clique sur "Révoquer" dans `/dashboard/tokens`
2. **NextJS Frontend** → `DELETE /api/tokens/mcp?id=...`
3. **NextJS Backend**:
   - Récupère le token de la DB
   - Appelle le **MCP Server**
4. **MCP Server** → `POST /tokens/revoke`:
   - Supprime du `TOKEN_STORE`
   - Révocation instantanée
5. **NextJS Backend**:
   - Supprime de la DB
   - Confirme la révocation

**Avantage:** Révocation instantanée, pas besoin d'attendre l'expiration du JWT!

## Migration pour votre équipe

### Étapes de déploiement:

1. **Déployer le nouveau code MCP:**
   ```bash
   # Dans votre repo MCP
   cp auth.py auth.py.backup  # Backup
   # Copier le nouveau auth.py et server.py
   git add auth.py server.py
   git commit -m "feat: implement Option B token generation"
   git push
   # Redéployer sur https://mcp-carestral-app-349b535a.alpic.live
   ```

2. **Déployer le nouveau code NextJS:**
   ```bash
   # Déjà fait dans ce repo
   git add .
   git commit -m "feat: migrate to Option B MCP token generation"
   git push
   # Redéployer sur Vercel/votre plateforme
   ```

3. **Ajouter la variable d'environnement:**
   - Production: `MCP_SERVER_URL=https://mcp-carestral-app-349b535a.alpic.live`
   - Local: Déjà dans `.env.local`

4. **Tester:**
   ```bash
   # Générer un nouveau token
   curl -X POST https://hospiai.alpic.live/api/tokens/generate \
     -H "Cookie: next-auth.session-token=..." \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Token","scopes":["read:data"]}'

   # Tester avec Claude Desktop
   # Configurer le connecteur MCP avec le token généré
   ```

### Important - Production:

⚠️ **TOKEN_STORE est en mémoire!** Pour la production, remplacez par:
- **Redis** (recommandé)
- **Base de données** (PostgreSQL/MongoDB)
- **Memcached**

Exemple avec Redis:
```python
import redis

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def generate_mcp_token(...):
    token = f"mcp_{secrets.token_urlsafe(48)}"
    token_data = {...}

    # Store in Redis with expiration
    redis_client.setex(
        f"mcp_token:{token}",
        expires_in_days * 86400,  # Convert days to seconds
        json.dumps(token_data)
    )

    return {"token": token, **token_data}
```

## Tests

### Test de génération:
```bash
curl -X POST http://localhost:8080/tokens/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test123",
    "email": "test@example.com",
    "firstname": "John",
    "surname": "Doe",
    "name": "Test Token",
    "scopes": ["read:data", "write:bookings"],
    "expires_in_days": 90
  }'
```

### Test de validation:
```bash
curl -X GET http://localhost:8080/hospitals?city=Paris \
  -H "Authorization: Bearer mcp_YOUR_TOKEN_HERE"
```

### Test de révocation:
```bash
curl -X POST http://localhost:8080/tokens/revoke \
  -H "Content-Type: application/json" \
  -d '{"token": "mcp_YOUR_TOKEN_HERE"}'
```

## Rollback (si nécessaire)

Si vous devez revenir à l'Option A:

1. Restaurer `auth.py.backup`
2. Revert les commits NextJS
3. Les tokens existants continueront de fonctionner pendant leur durée de vie

## Support

- Documentation MCP: https://modelcontextprotocol.io
- FastMCP: https://github.com/jlowin/fastmcp
- Code source: Voir `auth.py` et `server.py`

---

**Date de migration:** 2026-01-29
**Version:** 2.0.0 (Option B)
**Status:** ✅ Implémenté

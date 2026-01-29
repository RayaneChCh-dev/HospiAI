# Carestral MCP Server - Option B Implementation

## Architecture

Ce serveur MCP implémente l'**Option B** (Token MCP) qui suit les meilleures pratiques MCP en gérant ses propres tokens de manière indépendante.

## Fichiers du projet

```
mcp-carestral/
├── auth.py              # Gestion des tokens MCP
├── server.py            # Serveur FastMCP avec endpoints
├── models/
│   └── db_models.py     # Modèles Pydantic
├── requirements.txt     # Dépendances Python
└── README.md           # Ce fichier
```

## Installation

```bash
# Installer les dépendances
pip install -r requirements.txt
```

### `requirements.txt`
```
fastmcp>=0.2.0
httpx>=0.27.0
pydantic>=2.0.0
```

## Configuration

### Variables d'environnement

Créez un fichier `.env`:

```bash
# API HospiAI
HOSPIAI_API_URL="https://hospiai.alpic.live"

# Port du serveur
PORT=8080
```

## Démarrage

```bash
python server.py
```

Le serveur démarre sur `http://localhost:8080`

## Endpoints

### 1. Token Management (appelés par NextJS)

#### `POST /tokens/generate`
Génère un nouveau token MCP.

**Body:**
```json
{
  "user_id": "string",
  "email": "string",
  "firstname": "string",
  "surname": "string",
  "name": "string",
  "scopes": ["read:data", "write:bookings"],
  "expires_in_days": 90
}
```

**Response:**
```json
{
  "success": true,
  "token": {
    "token": "mcp_aB3dEf9Gh2iJ4kL6mN8oP0qR1sT...",
    "user_id": "string",
    "email": "string",
    "name": "string",
    "scopes": ["read:data", "write:bookings"],
    "created_at": "2026-01-29T10:00:00",
    "expires_at": "2026-04-29T10:00:00"
  }
}
```

#### `POST /tokens/revoke`
Révoque un token.

**Body:**
```json
{
  "token": "mcp_aB3dEf9Gh2iJ4kL6..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token revoked successfully"
}
```

#### `POST /tokens/list`
Liste tous les tokens d'un utilisateur.

**Body:**
```json
{
  "user_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "tokens": [
    {
      "token_preview": "mcp_aB3dEf9Gh2iJ4kL...",
      "name": "My Token",
      "scopes": ["read:data"],
      "created_at": "2026-01-29T10:00:00",
      "expires_at": "2026-04-29T10:00:00"
    }
  ]
}
```

### 2. MCP Tools (utilisés par Claude Desktop)

Tous les tools requièrent l'authentification via `Authorization: Bearer mcp_...`

#### `greet`
Test simple.

```python
await greet(name="Alice")
# → "Hello, Alice! Welcome to Carestral MCP Server."
```

#### `get_near_hospitals`
Liste des hôpitaux par ville.

```python
await get_near_hospitals(city="Paris", ctx=ctx)
# → [{"id": "...", "name": "Hôpital Saint-Louis", ...}]
```

#### `get_hospital_data`
Détails d'un hôpital.

```python
await get_hospital_data(hospital_id="H001", ctx=ctx)
# → {"id": "H001", "name": "...", "hospitalStatus": {...}}
```

#### `get_hospital_status`
Statut en temps réel d'un hôpital.

```python
await get_hospital_status(hospital_id="H001", ctx=ctx)
# → {"availableBeds": 15, "icuBeds": 3, "ventilators": 5}
```

#### `create_appointment`
Créer un rendez-vous.

```python
await create_appointment(
    hospital_id="H001",
    date="2026-02-15",
    time="14:30",
    patient_id="P001",
    description="Consultation générale",
    ctx=ctx
)
# → {"success": True, "appointment_id": "...", ...}
```

#### `get_my_appointments`
Liste les rendez-vous de l'utilisateur.

```python
await get_my_appointments(ctx=ctx)
# → [{"id": "...", "hospital": {...}, "date": "2026-02-15", ...}]
```

#### `get_profile`
Profil de l'utilisateur authentifié.

```python
await get_profile(ctx=ctx)
# → {"client_id": "user@example.com", "claims": {...}}
```

## Authentification

### Format du token

```
mcp_aB3dEf9Gh2iJ4kL6mN8oP0qR1sT3uV5wX7yZ9...
```

- Préfixe: `mcp_`
- Longueur: ~64 caractères
- Génération: `secrets.token_urlsafe(48)`

### Utilisation

**Header HTTP:**
```
Authorization: Bearer mcp_aB3dEf9Gh2iJ4kL6...
```

### Scopes disponibles

- `read:data` - Lecture des données (hôpitaux, statuts)
- `write:data` - Écriture des données
- `read:bookings` - Lecture des rendez-vous
- `write:bookings` - Création/modification de rendez-vous

## Configuration Claude Desktop

1. Générer un token sur https://hospiai.alpic.live/dashboard/tokens

2. Configurer le connecteur MCP:
```json
{
  "mcpServers": {
    "carestral": {
      "url": "https://mcp-carestral-app-349b535a.alpic.live/mcp",
      "auth": {
        "type": "bearer",
        "token": "mcp_YOUR_TOKEN_HERE"
      }
    }
  }
}
```

## Stockage des tokens

### Développement (actuel)
- **Store:** Dictionnaire Python en mémoire (`TOKEN_STORE`)
- **Persistence:** Non (redémarrage = perte des tokens)
- ⚠️ **À utiliser uniquement en développement**

### Production (recommandé)

#### Option 1: Redis (recommandé)
```python
import redis
import json

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

def generate_mcp_token(...):
    token = f"mcp_{secrets.token_urlsafe(48)}"
    token_data = {...}

    # Store avec expiration automatique
    redis_client.setex(
        f"mcp_token:{token}",
        expires_in_days * 86400,
        json.dumps(token_data)
    )

    return {"token": token, **token_data}

def verify(token: str):
    data = redis_client.get(f"mcp_token:{token}")
    if not data:
        return None

    token_data = json.loads(data)
    # ... validation ...
```

#### Option 2: Base de données
```python
from sqlalchemy import create_engine, Column, String, DateTime
from sqlalchemy.orm import sessionmaker

# Créer une table tokens
class MCPToken(Base):
    __tablename__ = 'mcp_tokens'

    token = Column(String, primary_key=True)
    user_id = Column(String, nullable=False)
    scopes = Column(JSON, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    # ... autres champs ...
```

## Tests

### Test avec curl

```bash
# Générer un token
curl -X POST http://localhost:8080/tokens/generate \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test123",
    "email": "test@example.com",
    "firstname": "John",
    "surname": "Doe",
    "name": "Test Token",
    "scopes": ["read:data"],
    "expires_in_days": 90
  }'

# Tester un tool
TOKEN="mcp_YOUR_TOKEN_HERE"

curl http://localhost:8080/greet \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice"}'
```

### Test avec Python

```python
import httpx

# Générer un token
response = httpx.post("http://localhost:8080/tokens/generate", json={
    "user_id": "test123",
    "email": "test@example.com",
    "firstname": "John",
    "surname": "Doe",
    "name": "Test Token",
    "scopes": ["read:data"],
    "expires_in_days": 90
})

token_data = response.json()
token = token_data["token"]["token"]
print(f"Token: {token}")

# Utiliser le token
headers = {"Authorization": f"Bearer {token}"}
response = httpx.get(
    "http://localhost:8080/hospitals",
    headers=headers,
    params={"city": "Paris"}
)

print(response.json())
```

## Logs

Les logs incluent:
- Génération de tokens
- Validation de tokens
- Révocation de tokens
- Erreurs d'authentification
- Appels API

```
INFO:__main__:Starting Carestral MCP Server...
INFO:__main__:API Base URL: https://hospiai.alpic.live
INFO:auth:Generated new token for user: test@example.com
INFO:auth:Token validated successfully for user: test@example.com
```

## Déploiement

### Docker

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["python", "server.py"]
```

```bash
docker build -t mcp-carestral .
docker run -p 8080:8080 -e HOSPIAI_API_URL=https://hospiai.alpic.live mcp-carestral
```

### Production checklist

- [ ] Remplacer `TOKEN_STORE` par Redis/Database
- [ ] Configurer HTTPS (Let's Encrypt)
- [ ] Ajouter rate limiting
- [ ] Configurer monitoring (Sentry, Datadog, etc.)
- [ ] Activer les logs structurés (JSON)
- [ ] Configurer backup pour les tokens
- [ ] Implémenter rotation des secrets
- [ ] Ajouter health check endpoint

## Sécurité

### Best practices implémentées

✅ Tokens opaques (pas de JWT)
✅ Génération cryptographiquement sécurisée
✅ Révocation instantanée
✅ Vérification des scopes
✅ Pas de secret partagé avec NextJS
✅ Token affiché une seule fois

### À ajouter en production

- Rate limiting par IP et par token
- Audit log des actions
- Détection d'anomalies
- Rotation automatique des tokens
- Alertes sur activité suspecte

## Support

- Documentation: `/docs/MIGRATION_OPTION_B.md`
- Issues: Créer une issue sur GitHub
- Email: support@hospiai.com

---

**Version:** 2.0.0 (Option B)
**Dernière mise à jour:** 2026-01-29

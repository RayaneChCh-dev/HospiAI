# FastMCP Setup - Configuration Multi-Utilisateurs

## Principe

Chaque patient génère son propre token JWT dans HospiAI et le configure dans son client Mistral AI. Le serveur FastMCP central authentifie chaque requête avec le token fourni.

## Architecture

```
Patient A → Mistral AI (avec token A) → FastMCP Server → HospiAI API
Patient B → Mistral AI (avec token B) → FastMCP Server → HospiAI API
Patient C → Mistral AI (avec token C) → FastMCP Server → HospiAI API
```

Le token JWT contient l'ID du patient, donc HospiAI sait automatiquement qui fait la requête.

## 1. Génération du token (côté patient)

1. Le patient se connecte sur : `https://hospi-ai-v8rf.vercel.app`
2. Va dans **Dashboard → Tokens API**
3. Génère un nouveau token avec les scopes nécessaires :
   - `read:data` - Lire les données
   - `write:data` - Écrire des données
   - `book:appointments` - Réserver des rendez-vous
4. **Copie le token** (affiché une seule fois)

## 2. Configuration du serveur FastMCP

### Structure du projet FastMCP

```bash
fastmcp-hospiai/
├── src/
│   └── hospiai_mcp/
│       ├── __init__.py
│       └── server.py
├── pyproject.toml
└── README.md
```

### Fichier `server.py` - Modifications requises

```python
import os
from typing import Optional
from fastmcp import FastMCP
import httpx

# Créer le serveur MCP
mcp = FastMCP("HospiAI")

# URL de l'API HospiAI
HOSPIAI_API_URL = "https://hospi-ai-v8rf.vercel.app/api/mcp"

def get_auth_header(token: str) -> dict:
    """Génère le header d'authentification avec le token JWT"""
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

async def validate_token(token: str) -> dict:
    """Valide le token auprès de l'API HospiAI"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{HOSPIAI_API_URL}/validate",
            headers=get_auth_header(token)
        )
        response.raise_for_status()
        return response.json()

# === Tools MCP ===

@mcp.tool()
async def get_appointments(
    token: str,
    limit: int = 10
) -> dict:
    """
    Récupère les rendez-vous du patient

    Args:
        token: Token JWT du patient (généré dans HospiAI Dashboard)
        limit: Nombre maximum de rendez-vous à récupérer
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{HOSPIAI_API_URL}/appointments",
            headers=get_auth_header(token),
            params={"limit": limit}
        )
        response.raise_for_status()
        return response.json()

@mcp.tool()
async def book_appointment(
    token: str,
    date: str,
    time: str,
    doctor_id: str,
    reason: str
) -> dict:
    """
    Réserve un rendez-vous

    Args:
        token: Token JWT du patient
        date: Date du rendez-vous (YYYY-MM-DD)
        time: Heure du rendez-vous (HH:MM)
        doctor_id: ID du médecin
        reason: Raison de la consultation
    """
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{HOSPIAI_API_URL}/book",
            headers=get_auth_header(token),
            json={
                "date": date,
                "time": time,
                "doctorId": doctor_id,
                "reason": reason
            }
        )
        response.raise_for_status()
        return response.json()

@mcp.tool()
async def get_medical_records(token: str) -> dict:
    """
    Récupère les dossiers médicaux du patient

    Args:
        token: Token JWT du patient
    """
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{HOSPIAI_API_URL}/records",
            headers=get_auth_header(token)
        )
        response.raise_for_status()
        return response.json()

# Point d'entrée
if __name__ == "__main__":
    mcp.run()
```

## 3. Configuration Mistral AI (côté patient)

Chaque patient configure son propre token dans l'interface Mistral AI :

### Configuration MCP dans Mistral AI

```json
{
  "mcpServers": {
    "hospiai": {
      "command": "fastmcp",
      "args": ["run", "hospiai_mcp"],
      "env": {
        "HOSPIAI_TOKEN": "le-token-jwt-du-patient"
      }
    }
  }
}
```

**Note** : Le patient doit remplacer `"le-token-jwt-du-patient"` par son token personnel.

## 4. Utilisation dans Mistral AI

Le patient peut maintenant utiliser les outils MCP dans Mistral AI :

```
Patient : "Quels sont mes prochains rendez-vous ?"
Mistral AI : [Utilise get_appointments avec le token du patient]

Patient : "Réserve un rendez-vous avec le Dr. Martin le 15 février à 14h"
Mistral AI : [Utilise book_appointment avec le token du patient]
```

## Points clés

✅ **Un token par patient** - Chaque patient a son propre token JWT
✅ **Isolation des données** - Le token contient l'ID du patient, garantissant l'accès uniquement à ses propres données
✅ **Sécurité** - Les tokens peuvent être révoqués individuellement dans le dashboard
✅ **Traçabilité** - Chaque requête est liée à un patient spécifique
✅ **Scopes** - Les permissions sont gérées par les scopes du token

## Installation du serveur FastMCP

```bash
# Cloner ou créer le projet
git clone <repo-fastmcp-hospiai>
cd fastmcp-hospiai

# Installer les dépendances
pip install fastmcp httpx

# Lancer le serveur
fastmcp dev src/hospiai_mcp/server.py
```

## Troubleshooting

### Erreur : "Token invalide"
- Vérifier que le token n'a pas expiré (voir expiration dans le dashboard)
- Générer un nouveau token si nécessaire

### Erreur : "Insufficient permissions"
- Vérifier que le token a les bons scopes
- Générer un nouveau token avec les scopes requis

### Erreur : "Connection refused"
- Vérifier que le serveur FastMCP est lancé
- Vérifier l'URL de l'API HospiAI dans `HOSPIAI_API_URL`

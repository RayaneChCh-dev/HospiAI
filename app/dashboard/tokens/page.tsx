/**
 * Tokens Page
 * Manage MCP JWT tokens for FastMCP integrations
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Key, Plus, Copy, Trash2, CheckCircle2, Clock, Shield } from 'lucide-react'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'

interface MCPToken {
  id: string
  name: string
  scopes: string[]
  expiresAt: string
  createdAt: string
}

interface NewTokenResponse {
  token: MCPToken & { tokenMcp: string }
}

export default function TokensPage() {
  const [tokens, setTokens] = useState<MCPToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [newToken, setNewToken] = useState<string | null>(null)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // Form state
  const [tokenName, setTokenName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['read:data'])
  const [expiresInDays, setExpiresInDays] = useState(90)

  const availableScopes = [
    { value: 'read:data', label: 'Lecture des données' },
    { value: 'write:data', label: 'Écriture des données' },
    { value: 'read:bookings', label: 'Lecture des réservations' },
    { value: 'write:bookings', label: 'Gestion des réservations' },
  ]

  // Set mounted state to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch tokens on mount
  useEffect(() => {
    fetchTokens()
  }, [])

  const fetchTokens = async () => {
    try {
      const response = await fetch('/api/tokens/mcp')
      const data = await response.json()

      if (response.ok) {
        setTokens(data.tokens)
      }
    } catch (error) {
      console.error('Error fetching tokens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateToken = async () => {
    if (!tokenName.trim()) {
      alert('Veuillez entrer un nom pour le token')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/tokens/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tokenName,
          scopes: selectedScopes,
          expiresInDays,
        }),
      })

      const data: { token: NewTokenResponse['token'] } = await response.json()

      if (response.ok) {
        // Show the full token ONLY once
        setNewToken(data.token.tokenMcp)

        // Add to list (without the token value)
        const { tokenMcp, ...tokenWithoutSecret } = data.token
        setTokens([tokenWithoutSecret, ...tokens])

        // Reset form
        setTokenName('')
        setSelectedScopes(['read:data'])
        setExpiresInDays(90)
        setDialogOpen(false)
      } else {
        alert(data.error || 'Erreur lors de la génération du token')
      }
    } catch (error) {
      console.error('Error generating token:', error)
      alert('Erreur lors de la génération du token')
    } finally {
      setIsGenerating(false)
    }
  }

  const revokeToken = async (tokenId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer ce token ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`/api/tokens/mcp?id=${tokenId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTokens(tokens.filter((t) => t.id !== tokenId))
      }
    } catch (error) {
      console.error('Error revoking token:', error)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(text)
      setTimeout(() => setCopiedText(null), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const toggleScope = (scope: string) => {
    if (selectedScopes.includes(scope)) {
      setSelectedScopes(selectedScopes.filter((s) => s !== scope))
    } else {
      setSelectedScopes([...selectedScopes, scope])
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tokens MCP</h1>
          <p className="mt-2 text-muted-foreground">
            Gérez vos tokens JWT pour les intégrations FastMCP
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Token
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Générer un nouveau token MCP</DialogTitle>
              <DialogDescription>
                Créez un token JWT pour authentifier votre serveur FastMCP
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Token Name */}
              <div className="space-y-2">
                <Label htmlFor="tokenName">Nom du token</Label>
                <Input
                  id="tokenName"
                  placeholder="Mon serveur FastMCP"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                />
              </div>

              {/* Scopes */}
              <div className="space-y-2">
                <Label>Permissions (scopes)</Label>
                <div className="space-y-2">
                  {availableScopes.map((scope) => (
                    <div key={scope.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={scope.value}
                        checked={selectedScopes.includes(scope.value)}
                        onChange={() => toggleScope(scope.value)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <label
                        htmlFor={scope.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {scope.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expiration */}
              <div className="space-y-2">
                <Label htmlFor="expiresInDays">Durée de validité (jours)</Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  min="1"
                  max="365"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(parseInt(e.target.value))}
                />
              </div>

              <Button
                onClick={generateToken}
                disabled={isGenerating || !tokenName.trim()}
                className="w-full"
              >
                {isGenerating ? 'Génération...' : 'Générer le token'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* New Token Display (one-time only) */}
      {newToken && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <CheckCircle2 className="h-5 w-5" />
              Token généré avec succès
            </CardTitle>
            <CardDescription className="text-green-700">
              Copiez ce token maintenant. Il ne sera plus affiché après cette fois.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-white p-3 text-xs font-mono break-all">
                {newToken}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(newToken)}
              >
                {copiedText === newToken ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier
                  </>
                )}
              </Button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewToken(null)}
              className="w-full"
            >
              J'ai copié le token, masquer
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">À propos des tokens JWT</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Les tokens JWT permettent à votre serveur FastMCP de s'authentifier de manière
              sécurisée. Utilisez l'algorithme HMAC (HS256) pour la vérification. Ne partagez
              jamais vos tokens publiquement.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tokens List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Tokens actifs</h2>

        {isLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center text-muted-foreground">
                Chargement des tokens...
              </div>
            </CardContent>
          </Card>
        ) : tokens.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Key className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-center text-muted-foreground">
                Vous n&apos;avez aucun token actif.
                <br />
                Cliquez sur &quot;Nouveau Token&quot; pour en créer un.
              </p>
            </CardContent>
          </Card>
        ) : (
          tokens.map((token) => {
            const isExpired = isPast(new Date(token.expiresAt))

            return (
              <Card key={token.id} className={isExpired ? 'opacity-60' : ''}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                        isExpired ? 'bg-muted' : 'bg-primary/10'
                      }`}
                    >
                      <Key
                        className={`h-6 w-6 ${
                          isExpired ? 'text-muted-foreground' : 'text-primary'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{token.name}</span>
                        {isExpired && (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                            Expiré
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {isMounted ? (
                            <>Créé {formatDistanceToNow(new Date(token.createdAt), {
                              addSuffix: true,
                              locale: fr
                            })}</>
                          ) : (
                            <>Créé le {new Date(token.createdAt).toLocaleDateString()}</>
                          )}
                        </span>
                        <span>
                          {isMounted ? (
                            <>Expire le {format(new Date(token.expiresAt), 'dd MMM yyyy', { locale: fr })}</>
                          ) : (
                            <>Expire le {new Date(token.expiresAt).toLocaleDateString()}</>
                          )}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {token.scopes.map((scope) => (
                          <span
                            key={scope}
                            className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
                          >
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => revokeToken(token.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Révoquer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* FastMCP Integration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration FastMCP</CardTitle>
          <CardDescription>
            Comment configurer votre serveur FastMCP avec les tokens JWT
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 font-semibold">Variables d'environnement FastMCP</h4>
            <p className="mb-2 text-xs text-muted-foreground">
              Remplacez <code className="rounded bg-muted px-1">votre-secret-mcp-jwt</code> par la valeur de votre variable <code className="rounded bg-muted px-1">MCP_JWT_SECRET</code>
            </p>
            <pre className="rounded bg-muted p-4 text-xs overflow-x-auto">
{`export FASTMCP_SERVER_AUTH=fastmcp.server.auth.providers.jwt.JWTVerifier
export FASTMCP_SERVER_AUTH_JWT_PUBLIC_KEY="votre-secret-mcp-jwt"
export FASTMCP_SERVER_AUTH_JWT_ALGORITHM="HS256"
export FASTMCP_SERVER_AUTH_JWT_ISSUER="hospiai-api"
export FASTMCP_SERVER_AUTH_JWT_AUDIENCE="hospiai-mcp"
export FASTMCP_SERVER_AUTH_JWT_REQUIRED_SCOPES="read:data"`}
            </pre>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Utilisation du token</h4>
            <p className="text-sm text-muted-foreground">
              Incluez le token dans l'en-tête Authorization de vos requêtes :
            </p>
            <pre className="mt-2 rounded bg-muted p-4 text-xs">
              Authorization: Bearer {'<votre-token-jwt>'}
            </pre>
          </div>

          <div>
            <h4 className="mb-2 font-semibold">Sécurité</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Ne partagez jamais vos tokens JWT publiquement</li>
              <li>Stockez le MCP_JWT_SECRET de manière sécurisée</li>
              <li>Révoquez immédiatement tout token compromis</li>
              <li>Utilisez des scopes appropriés pour limiter les permissions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

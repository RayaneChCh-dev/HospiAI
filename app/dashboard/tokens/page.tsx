/**
 * Dashboard Home Page - Vue d'ensemble
 * Display JWT token and MCP server link
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Key,
  CheckCheck,
} from 'lucide-react'
import { getAuthToken } from '@/lib/auth-token'

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://mcp-carestral-app-349b535a.alpic.live'

export default function DashboardPage() {
  const [token, setToken] = useState<string | null>(null)
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Load token from localStorage
    const authToken = getAuthToken()
    setToken(authToken)
  }, [])

  const handleCopyToken = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy token:', error)
      }
    }
  }

  const handleGoToMCP = () => {
    window.open(MCP_SERVER_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Tableau de bord
          </h1>
          <p className="mt-2 text-muted-foreground">
            Gérez votre authentification et accédez au serveur MCP
          </p>
        </div>
      </div>

      {/* MCP Server Link Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            Serveur MCP
          </CardTitle>
          <CardDescription>
            Accédez au serveur FastMCP pour gérer vos ressources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleGoToMCP} className="w-full sm:w-auto">
            <ExternalLink className="mr-2 h-4 w-4" />
            Ouvrir le serveur MCP
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            URL: {MCP_SERVER_URL}
          </p>
        </CardContent>
      </Card>

      {/* JWT Token Card with Spoiler */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Token d&apos;authentification JWT
          </CardTitle>
          <CardDescription>
            Votre token JWT pour l&apos;authentification aux APIs MCP. Ne partagez jamais ce token.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {token ? (
            <>
              {/* Token Display with Spoiler */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Token (cliquez pour {showToken ? 'masquer' : 'révéler'})
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="rounded bg-background p-3 font-mono text-xs break-all">
                  {showToken ? (
                    <span className="text-foreground">{token}</span>
                  ) : (
                    <span className="text-muted-foreground blur-sm select-none">
                      {token}
                    </span>
                  )}
                </div>
              </div>

              {/* Copy Button */}
              <Button
                variant="outline"
                onClick={handleCopyToken}
                disabled={copied}
                className="w-full sm:w-auto"
              >
                {copied ? (
                  <>
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Token copié !
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copier le token
                  </>
                )}
              </Button>

              {/* Warning */}
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-400">
                  <strong>⚠️ Attention:</strong> Ne partagez jamais ce token.
                  Toute personne ayant accès à ce token peut effectuer des actions en votre nom.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Aucun token trouvé dans le stockage local</p>
              <p className="text-xs mt-2">
                Reconnectez-vous pour obtenir un nouveau token
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Token Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Comment utiliser votre token ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">1. Dans vos requêtes API</h4>
            <p className="text-xs text-muted-foreground">
              Ajoutez le header: <code className="bg-muted px-1 py-0.5 rounded">Authorization: Bearer YOUR_TOKEN</code>
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">2. Avec curl</h4>
            <pre className="bg-muted p-2 rounded text-xs overflow-x-auto">
              curl -H &quot;Authorization: Bearer YOUR_TOKEN&quot; {MCP_SERVER_URL}/api/endpoint
            </pre>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-medium">3. Expiration</h4>
            <p className="text-xs text-muted-foreground">
              Le token expire après 15 minutes. Reconnectez-vous pour en obtenir un nouveau.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

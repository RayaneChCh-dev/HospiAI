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
import  Image  from 'next/image'

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
          <CardTitle>Comment utiliser votre token avec Mistral AI ?</CardTitle>
          <CardDescription>
            Suivez ces étapes pour connecter HospiAI à Mistral AI via le connecteur MCP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Étape 1 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                1
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold">Ouvrir Mistral AI Chat</h4>
                <p className="text-sm text-muted-foreground">
                  Rendez-vous sur{' '}
                  <a
                    href="https://chat.mistral.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    chat.mistral.ai
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                <Image src="/images/token-use/auth.png" alt="Page de chat Mistral AI" width={500} height={500} />
              </div>
            </div>
          </div>

          {/* Étape 2 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                2
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold">Se connecter ou créer un compte</h4>
                <p className="text-sm text-muted-foreground">
                  Si vous n&apos;avez pas encore de compte Mistral AI, créez-en un gratuitement.
                  Sinon, connectez-vous avec vos identifiants existants.
                </p>
                <Image src="/images/token-use/login.png" alt="Page de connexion Mistral AI" width={500} height={500} />
              </div>
            </div>
          </div>

          {/* Étape 3 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                3
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold">Accéder aux Connecteurs</h4>
                <p className="text-sm text-muted-foreground">
                  Dans le menu latéral gauche, cliquez sur <strong>&quot;Intelligence&quot;</strong> pour ouvrir un menu déroulant,
                  puis sélectionnez <strong>&quot;Connecteurs&quot;</strong>.
                </p>
                <p className="text-sm text-muted-foreground">
                  Cela vous fera passer de la fenêtre du chat à la section <strong>&quot;Mes connecteurs&quot;</strong>.
                </p>
                <Image src="/images/token-use/intelligence.png" alt="Menu Connecteurs Mistral AI" width={500} height={500} />
                <Image src="/images/token-use/connectors.png" alt="Section Mes connecteurs Mistral AI" width={500} height={500} />
              </div>
            </div>
          </div>

          {/* Étape 4 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                4
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold">Ajouter un nouveau connecteur</h4>
                <p className="text-sm text-muted-foreground">
                  Dans la section &quot;Mes connecteurs&quot;, cliquez sur le bouton <strong>&quot;Ajouter un connecteur&quot;</strong>
                  ou <strong>&quot;Nouveau connecteur&quot;</strong>.
                </p>
                <Image src="/images/token-use/add-connectors.png" alt="Page Mes connecteurs avec le bouton pour ajouter un connecteur" width={500} height={500} />
              </div>
            </div>
          </div>

          {/* Étape 5 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                5
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold">Sélectionner le type de connecteur MCP</h4>
                <p className="text-sm text-muted-foreground">
                  Dans la liste des types de connecteurs disponibles, recherchez et sélectionnez <strong>&quot;MCP&quot;</strong>
                  (Model Context Protocol) ou <strong>&quot;Serveur MCP personnalisé&quot;</strong>.
                </p>
                <Image src="/images/token-use/custom-mcp-connector.png" alt="Liste des types de connecteurs avec MCP mis en évidence" width={500} height={500} />
              </div>
            </div>
          </div>

          {/* Étape 6 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                6
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold">Configurer le connecteur HospiAI</h4>
                <p className="text-sm text-muted-foreground">
                  Remplissez les informations suivantes :
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 pl-4 list-disc">
                  <li><strong>Nom :</strong> HospiAI (ou un nom de votre choix)</li>
                  <li><strong>URL du serveur MCP :</strong> <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{MCP_SERVER_URL}</code></li>
                  <li><strong>Token d&apos;authentification :</strong> Collez votre token JWT copié ci-dessus</li>
                </ul>
                <Image src="/images/token-use/1.png" alt="Formulaire de configuration du connecteur MCP" width={500} height={500} />
              </div>
            </div>
          </div>

          {/* Étape 7 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                7
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold">Tester et sauvegarder</h4>
                <p className="text-sm text-muted-foreground">
                  Cliquez sur <strong>&quot;Tester la connexion&quot;</strong> pour vérifier que le connecteur
                  fonctionne correctement avec votre token. Si le test réussit, cliquez sur <strong>&quot;Enregistrer&quot;</strong>
                  ou <strong>&quot;Créer&quot;</strong> pour finaliser la configuration.
                </p>
              </div>
            </div>
          </div>

          {/* Étape 8 */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                8
              </div>
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-semibold">Utiliser HospiAI dans vos conversations</h4>
                <p className="text-sm text-muted-foreground">
                  Retournez à la fenêtre de chat. Votre connecteur HospiAI est maintenant actif !
                  Vous pouvez poser des questions sur les hôpitaux, les rendez-vous et autres données
                  médicales directement dans le chat. Mistral AI utilisera automatiquement le connecteur
                  HospiAI pour récupérer les informations en temps réel.
                </p>
                <Image src="/images/token-use/chat.png" alt="Conversation dans le chat avec HospiAI connecté" width={500} height={500} />
              </div>
            </div>
          </div>

          {/* Info importante */}
          <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4 space-y-2">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
              💡 <strong>Bon à savoir</strong>
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1 pl-4 list-disc">
              <li>Votre token JWT est valide pendant <strong>1 semaine</strong></li>
              <li>Une fois expiré, vous devrez vous reconnecter et mettre à jour le token dans Mistral AI</li>
              <li>Gardez votre token confidentiel et ne le partagez jamais publiquement</li>
              <li>Si votre token est compromis, reconnectez-vous immédiatement pour en générer un nouveau</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

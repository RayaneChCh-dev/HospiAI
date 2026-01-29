/**
 * Dashboard Profile Page
 * Display and edit user profile information
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Eye, EyeOff, Save, Edit2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UserProfile {
  email: string
  firstname: string | null
  surname: string | null
  age: number | null
  sex: string | null
  phoneNumber: string | null
}

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (!response.ok) throw new Error('Failed to fetch profile')

      const data = await response.json()
      setProfile(data.user)
      setEditedProfile(data.user)
      setLoading(false)
    } catch (err) {
      setError('Impossible de charger le profil')
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!editedProfile) return

    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstname: editedProfile.firstname,
          surname: editedProfile.surname,
          age: editedProfile.age,
          sex: editedProfile.sex,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update profile')
      }

      const data = await response.json()
      setProfile(data.user)
      setEditedProfile(data.user)
      setIsEditing(false)
      setSuccess(true)

      // Update session data
      await update()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
    setError(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  if (!profile || !editedProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">Erreur lors du chargement du profil</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Mon Profil</h1>
        <p className="mt-2 text-muted-foreground">
          Gérez vos informations personnelles
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-3">
          <p className="text-sm text-green-700 dark:text-green-400">
            ✓ Profil mis à jour avec succès
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
          <p className="text-sm text-red-700 dark:text-red-400">
            ✗ {error}
          </p>
        </div>
      )}

      {/* Account Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Informations du compte</CardTitle>
          <CardDescription>
            Email et mot de passe (non modifiables ici)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email - Non-editable */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              L&apos;email ne peut pas être modifié
            </p>
          </div>

          {/* Password - Hidden */}
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value="••••••••••••"
                disabled
                className="bg-muted cursor-not-allowed pr-10"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              variant="link"
              size="sm"
              className="px-0 h-auto"
              onClick={() => router.push('/dashboard/profile/new-password')}
            >
              Changer le mot de passe
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>
              Prénom, nom, âge et sexe
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Firstname - Editable */}
          <div className="space-y-2">
            <Label htmlFor="firstname">Prénom</Label>
            <Input
              id="firstname"
              type="text"
              value={editedProfile.firstname || ''}
              disabled={!isEditing}
              onChange={(e) =>
                setEditedProfile({ ...editedProfile, firstname: e.target.value })
              }
              className={!isEditing ? 'bg-muted' : ''}
            />
          </div>

          {/* Surname - Editable */}
          <div className="space-y-2">
            <Label htmlFor="surname">Nom</Label>
            <Input
              id="surname"
              type="text"
              value={editedProfile.surname || ''}
              disabled={!isEditing}
              onChange={(e) =>
                setEditedProfile({ ...editedProfile, surname: e.target.value })
              }
              className={!isEditing ? 'bg-muted' : ''}
            />
          </div>

          {/* Age - Editable */}
          <div className="space-y-2">
            <Label htmlFor="age">Âge</Label>
            <Input
              id="age"
              type="number"
              min="1"
              max="150"
              value={editedProfile.age || ''}
              disabled={!isEditing}
              onChange={(e) =>
                setEditedProfile({
                  ...editedProfile,
                  age: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className={!isEditing ? 'bg-muted' : ''}
            />
          </div>

          {/* Sex - Editable */}
          <div className="space-y-2">
            <Label htmlFor="sex">Sexe</Label>
            {isEditing ? (
              <Select
                value={editedProfile.sex || ''}
                onValueChange={(value) =>
                  setEditedProfile({ ...editedProfile, sex: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Homme</SelectItem>
                  <SelectItem value="female">Femme</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="sex"
                type="text"
                value={
                  editedProfile.sex === 'male'
                    ? 'Homme'
                    : editedProfile.sex === 'female'
                    ? 'Femme'
                    : editedProfile.sex === 'other'
                    ? 'Autre'
                    : ''
                }
                disabled
                className="bg-muted"
              />
            )}
          </div>

          {/* Phone Number - Non-editable */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Numéro de téléphone</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={editedProfile.phoneNumber || ''}
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              Le numéro de téléphone ne peut pas être modifié
            </p>
          </div>

          {/* Action Buttons - Only show when editing */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

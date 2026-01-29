/**
 * Home Page
 * Middleware handles redirect to dashboard/profile/login
 * This is a fallback that should rarely be seen
 */

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">HospiAI</h1>
        <p className="mt-2 text-muted-foreground">Chargement...</p>
      </div>
    </div>
  )
}

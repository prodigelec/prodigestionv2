import { verifySession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/logout-button";

export const metadata = {
  title: "Dashboard - ProdiGestion",
  description: "Tableau de bord principal",
};

export default async function DashboardPage() {
  // Vérification de la session
  const sessionData = await verifySession();

  // Si pas de session ou expiré, on redirige vers la connexion
  if (!sessionData) {
    redirect("/login");
  }

  const { user } = sessionData;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
            <p className="text-muted-foreground mt-2">
              Bienvenue, <span className="font-semibold text-foreground">{user.email}</span>
            </p>
          </div>
          <LogoutButton />
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Exemple de cartes (widgets) pour le dashboard */}
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Statistiques</h2>
            <p className="text-muted-foreground mt-2">Aucune donnée disponible.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Dernières Activités</h2>
            <p className="text-muted-foreground mt-2">Rien à signaler.</p>
          </div>
          <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
            <h2 className="text-xl font-semibold text-foreground">Raccourcis</h2>
            <p className="text-muted-foreground mt-2">Vos actions rapides ici.</p>
          </div>
        </main>
      </div>
    </div>
  );
}

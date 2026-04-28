import { verifySession } from "@/app/lib/session";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { DashboardClientStats } from "@/features/clients/components/dashboard-client-stats";
import { Suspense } from "react";

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

        <main className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">Aperçu des Clients</h2>
            <Suspense fallback={<div className="h-64 bg-surface rounded-xl border border-border animate-pulse"></div>}>
              <DashboardClientStats />
            </Suspense>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">Dernières Activités</h2>
              <p className="text-muted-foreground mt-2">Bientôt disponible.</p>
            </div>
            <div className="bg-surface p-6 rounded-xl border border-border shadow-sm">
              <h2 className="text-xl font-semibold text-foreground">Raccourcis</h2>
              <p className="text-muted-foreground mt-2">Bientôt disponible.</p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

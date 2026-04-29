import Link from "next/link";
import { Suspense } from "react";
import { PlusCircle, FileText, CheckCircle2, Send, Clock, XCircle } from "lucide-react";
import { getDevisList } from "@/features/devis/actions/devis-actions";
import { DevisList } from "@/features/devis/components/devis-list";

export const metadata = {
  title: "Devis - ProdiGestion",
  description: "Gérez vos devis",
};

export default async function DevisPage() {
  const result = await getDevisList();
  
  if (result.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
          <p className="font-medium">{result.error}</p>
        </div>
      </div>
    );
  }

  const devis = result.data || [];
  const counts = result.counts || { brouillon: 0, envoye: 0, accepte: 0, refuse: 0 };
  const totalCount = result.totalCount || 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* En-tête principal - Aligné sur le design de Clients */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Devis</h1>
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary border border-primary/20">
                {totalCount} total
              </span>
            </div>
            <p className="text-muted-foreground mt-1">
              Gérez vos propositions commerciales
            </p>
          </div>
        </div>

        <Link
          href="/devis/nouveau"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="h-4 w-4" />
          Nouveau devis
        </Link>
      </div>

      {/* Badges de statuts (KPIs) - Style inspiré de la liste des clients */}
      <div className="flex flex-wrap gap-2 items-center mb-6">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full border border-border">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Brouillon</span>
          <span className="bg-background text-foreground text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
            {counts.brouillon}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 rounded-full border border-blue-500/20">
          <Send className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Envoyé</span>
          <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
            {counts.envoye}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Accepté</span>
          <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
            {counts.accepte}
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 rounded-full border border-rose-500/20">
          <XCircle className="w-4 h-4 text-rose-500" />
          <span className="text-sm font-medium text-rose-600 dark:text-rose-400">Refusé</span>
          <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-sm">
            {counts.refuse}
          </span>
        </div>
      </div>

      {/* Barre de recherche et filtres (Espace réservé) */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-sm mb-4">
        <p className="text-sm text-muted-foreground italic flex items-center justify-center">
          Barre de recherche et filtres à venir...
        </p>
      </div>

      {/* Liste des devis */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <DevisList devis={devis} />
      </Suspense>
    </div>
  );
}

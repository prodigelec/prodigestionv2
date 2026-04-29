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
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Devis
            </h1>
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary border border-primary/20">
              {totalCount} Total
            </span>
            
            {/* Badges de comptage par statut */}
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border bg-muted/50 text-muted-foreground border-border">
              <Clock className="w-3.5 h-3.5" />
              {counts.brouillon} Brouillon{counts.brouillon !== 1 ? 's' : ''}
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Send className="w-3.5 h-3.5" />
              {counts.envoye} Envoyé{counts.envoye !== 1 ? 's' : ''}
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {counts.accepte} Accepté{counts.accepte !== 1 ? 's' : ''}
            </div>

            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border bg-rose-500/10 text-rose-600 border-rose-500/20">
              <XCircle className="w-3.5 h-3.5" />
              {counts.refuse} Refusé{counts.refuse !== 1 ? 's' : ''}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Gérez vos propositions commerciales et suivez leur statut.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/devis/nouveau" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-light shadow-sm hover:bg-primary/90 h-10 px-5 py-2"
          >
            Nouveau Devis
          </Link>
        </div>
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

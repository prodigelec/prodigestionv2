import Link from "next/link";
import { ChevronLeft, FileText } from "lucide-react";
import { DevisForm } from "@/features/devis/components/devis-form";
import { getClientsForSelect } from "@/features/devis/actions/devis-actions";

export const metadata = {
  title: "Nouveau devis - ProdiGestion",
  description: "Créer un nouveau devis",
};

export default async function NouveauDevisPage() {
  const result = await getClientsForSelect();
  
  if (result.error) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
          <p className="font-medium">{result.error}</p>
        </div>
      </div>
    );
  }

  const clients = result.data || [];

  return (
    <div className="container max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* En-tête avec bouton retour */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div className="space-y-1.5 flex flex-col">
          <Link 
            href="/devis" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour aux devis
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Nouveau Devis
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Remplissez les informations ci-dessous pour créer une nouvelle proposition commerciale.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <DevisForm clients={clients} />
    </div>
  );
}

import { ClientForm } from "@/features/clients/components/client-form";

export default function NouveauClientPage() {
  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nouveau Client</h1>
        <p className="text-muted">
          Création d'une nouvelle fiche client.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
        <ClientForm />
      </div>
    </div>
  );
}
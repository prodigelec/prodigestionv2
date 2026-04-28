import { notFound } from "next/navigation";
import { getClientById } from "@/features/clients/actions/client-actions";
import { ClientForm } from "@/features/clients/components/client-form";
import Link from "next/link";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const result = await getClientById(id);

  if (result.error || !result.data) {
    return notFound();
  }

  const client = result.data;

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Modifier le client</h1>
          <p className="text-muted">
            Mettez à jour les informations du client ci-dessous.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
        <ClientForm initialData={client} />
      </div>
    </div>
  );
}
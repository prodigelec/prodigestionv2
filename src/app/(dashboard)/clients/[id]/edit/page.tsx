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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/clients" className="text-sm hover:underline text-muted-foreground">
              Clients
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href={`/clients/${client.id}`} className="text-sm hover:underline text-muted-foreground">
              {client.nom}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-foreground">Modifier</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight">Modifier le client</h2>
          <p className="text-muted-foreground">
            Mettez à jour les informations du client ci-dessous.
          </p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl p-6">
        <ClientForm initialData={client} />
      </div>
    </div>
  );
}
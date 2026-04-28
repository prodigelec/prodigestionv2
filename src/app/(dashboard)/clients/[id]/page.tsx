import { notFound } from "next/navigation";
import { getClientById } from "@/features/clients/actions/client-actions";
import { ClientDetails } from "@/features/clients/components/client-details";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const result = await getClientById(id);

  if (result.error || !result.data) {
    return notFound();
  }

  const client = result.data;

  return <ClientDetails client={client} />;
}

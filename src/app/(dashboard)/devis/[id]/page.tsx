import { notFound } from "next/navigation";
import { getDevisById } from "@/features/devis/actions/devis-actions";
import { DevisDetail } from "@/features/devis/components/devis-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DevisDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getDevisById(id);

  if (result.error || !result.data) notFound();

  return <DevisDetail devis={result.data} />;
}

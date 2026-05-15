import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { decryptSensitiveData } from "@/app/lib/encryption";
import { DevisPdfTemplate } from "@/features/devis/components/devis-pdf-template";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const sessionData = await verifySession();
  if (!sessionData?.user) {
    return new Response("Non autorisé", { status: 401 });
  }

  const { id } = await params;

  const devis = await prisma.devis.findFirst({
    where: { id, userId: sessionData.user.id },
    include: {
      client: true,
      lignes: { orderBy: { ordre: "asc" } },
    },
  });

  if (!devis) {
    return new Response("Devis introuvable", { status: 404 });
  }

  const decryptedClient = decryptSensitiveData(devis.client);

  const buffer = await renderToBuffer(
    <DevisPdfTemplate devis={{ ...devis, client: decryptedClient }} />
  );

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${devis.numero}.pdf"`,
    },
  });
}

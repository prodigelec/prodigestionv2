import Link from "next/link";
import { ClientList } from "@/features/clients/components/client-list";
import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { decryptSensitiveData } from "@/app/lib/encryption";

export default async function ClientsPage() {
  const session = await verifySession();
  
  const rawClients = await prisma.client.findMany({
    where: {
      userId: session?.user?.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Déchiffrer les données sensibles pour l'affichage
  const clients = rawClients.map(client => decryptSensitiveData(client));

  return (
    <div className="container p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">
            Gérez votre base de clients et prospects.
          </p>
        </div>
        <Link 
          href="/clients/nouveau" 
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-light shadow hover:bg-primary/90 h-9 px-4 py-2"
        >
          Nouveau Client
        </Link>
      </div>
      
      <div className="bg-surface border border-border rounded-xl p-8 shadow-sm">
        <ClientList clients={clients} />
      </div>
    </div>
  );
}

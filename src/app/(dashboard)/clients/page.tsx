import Link from "next/link";
import { Suspense } from "react";
import { ClientList } from "@/features/clients/components/client-list";
import { ClientFilters } from "@/features/clients/components/client-filters";
import { ClientPagination } from "@/features/clients/components/client-pagination";
import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { decryptSensitiveData } from "@/app/lib/encryption";
import { TypeClient, StatutClient } from "@/generated/prisma";

interface ClientsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  const session = await verifySession();
  const resolvedParams = await searchParams;
  
  const query = typeof resolvedParams?.q === 'string' ? resolvedParams.q.toLowerCase() : '';
  const typeFilter = typeof resolvedParams?.type === 'string' ? resolvedParams.type : 'TOUS';
  const statusFilter = typeof resolvedParams?.statut === 'string' ? resolvedParams.statut : 'TOUS';
  let currentPage = Number(resolvedParams?.page) || 1;
  if (currentPage < 1) currentPage = 1;
  const ITEMS_PER_PAGE = 10;
  
  const rawClients = await prisma.client.findMany({
    where: {
      userId: session?.user?.id,
      ...(typeFilter !== 'TOUS' && { type: typeFilter as TypeClient }),
      ...(statusFilter !== 'TOUS' && { statut: statusFilter as StatutClient }),
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Déchiffrer les données sensibles pour l'affichage
  let clients = rawClients.map(client => decryptSensitiveData(client));

  // Filtrage par texte en mémoire (car l'email et le téléphone sont chiffrés en BDD)
  if (query) {
    clients = clients.filter(c => {
      const nomMatch = c.nom && c.nom.toLowerCase().includes(query);
      const prenomMatch = c.prenom && c.prenom.toLowerCase().includes(query);
      const rsMatch = c.raisonSociale && c.raisonSociale.toLowerCase().includes(query);
      const emailMatch = c.email && c.email.toLowerCase().includes(query);
      const telMatch = c.telephone && c.telephone.toLowerCase().includes(query);
      const telPortMatch = c.telephonePortable && c.telephonePortable.toLowerCase().includes(query);
      
      return nomMatch || prenomMatch || rsMatch || emailMatch || telMatch || telPortMatch;
    });
  }

  // Pagination en mémoire
  const totalItems = clients.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = clients.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="container max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Clients
            </h1>
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
              {totalItems} client{totalItems > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Gérez votre base de clients, vos prospects et leur historique.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href="/clients/nouveau" 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-light shadow-sm hover:bg-primary/90 h-10 px-5 py-2"
          >
            Nouveau Client
          </Link>
        </div>
      </div>
      
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-border bg-muted/20">
          <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse"></div>}>
            <ClientFilters />
          </Suspense>
        </div>
        <div className="p-1 sm:p-6">
          <ClientList clients={paginatedClients} />
          {totalPages > 1 && (
            <Suspense fallback={<div className="h-10 bg-muted rounded-md animate-pulse mt-4"></div>}>
              <ClientPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                totalItems={totalItems} 
                itemsPerPage={ITEMS_PER_PAGE} 
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Suspense } from "react";
import { User, Building, Landmark, Home } from "lucide-react";
import { ClientList } from "@/features/clients/components/client-list";
import { ClientFilters } from "@/features/clients/components/client-filters";
import { ClientPagination } from "@/features/clients/components/client-pagination";
import { prisma } from "@/app/lib/db";
import { verifySession } from "@/app/lib/session";
import { decryptSensitiveData } from "@/app/lib/encryption";
import { StatutClient, TypeClient } from "@/generated/prisma";

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
      ...(statusFilter !== 'TOUS' && { statut: statusFilter as StatutClient }),
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Récupérer le nombre total de clients indépendamment des filtres (type, statut, recherche)
  const absoluteTotalClients = await prisma.client.count({
    where: {
      userId: session?.user?.id,
    }
  });

  // Déchiffrer les données sensibles pour l'affichage
  let allClients = rawClients.map(client => decryptSensitiveData(client));

  // Filtrage par texte en mémoire (car l'email et le téléphone sont chiffrés en BDD)
  if (query) {
    allClients = allClients.filter(c => {
      const nomMatch = c.nom && c.nom.toLowerCase().includes(query);
      const prenomMatch = c.prenom && c.prenom.toLowerCase().includes(query);
      const rsMatch = c.raisonSociale && c.raisonSociale.toLowerCase().includes(query);
      const emailMatch = c.email && c.email.toLowerCase().includes(query);
      const telMatch = c.telephone && c.telephone.toLowerCase().includes(query);
      const telPortMatch = c.telephonePortable && c.telephonePortable.toLowerCase().includes(query);
      
      return nomMatch || prenomMatch || rsMatch || emailMatch || telMatch || telPortMatch;
    });
  }

  // Calculer le nombre par type (sur la liste complète avant le filtre de type)
  const typeCounts = {
    [TypeClient.PARTICULIER]: 0,
    [TypeClient.ENTREPRISE]: 0,
    [TypeClient.SYNDIC]: 0,
    [TypeClient.AGENCE_IMMOBILIERE]: 0,
    [TypeClient.AUTRE]: 0,
  };
  
  allClients.forEach(client => {
    if (typeCounts[client.type as TypeClient] !== undefined) {
      typeCounts[client.type as TypeClient]++;
    }
  });

  // Appliquer le filtre de type en mémoire pour la liste finale
  let clients = allClients;
  if (typeFilter !== 'TOUS') {
    clients = clients.filter(c => c.type === typeFilter);
  }

  // Pagination en mémoire
  const totalItems = clients.length;

  // Fonction pour construire l'URL de filtrage rapide par type
  const buildTypeLink = (type: string) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (statusFilter !== 'TOUS') params.set('statut', statusFilter);
    // Si on clique sur le type déjà actif, on l'enlève (toggle)
    if (typeFilter !== type) {
      params.set('type', type);
    }
    const queryString = params.toString();
    return queryString ? `/clients?${queryString}` : '/clients';
  };

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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Clients
            </h1>
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary border border-primary/20">
              {absoluteTotalClients} Total
            </span>
            
            {/* Badges de comptage par type */}
            <Link 
              href={buildTypeLink(TypeClient.PARTICULIER)}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                typeFilter === TypeClient.PARTICULIER 
                  ? 'bg-purple-500 text-white border-purple-600 shadow-sm' 
                  : 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20'
              }`}
              title="Filtrer par Particuliers"
            >
              <User className="w-3.5 h-3.5" />
              {typeCounts[TypeClient.PARTICULIER]} Particulier{typeCounts[TypeClient.PARTICULIER] !== 1 ? 's' : ''}
            </Link>

            <Link 
              href={buildTypeLink(TypeClient.ENTREPRISE)}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                typeFilter === TypeClient.ENTREPRISE 
                  ? 'bg-blue-500 text-white border-blue-600 shadow-sm' 
                  : 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20'
              }`}
              title="Filtrer par Entreprises"
            >
              <Building className="w-3.5 h-3.5" />
              {typeCounts[TypeClient.ENTREPRISE]} Entreprise{typeCounts[TypeClient.ENTREPRISE] !== 1 ? 's' : ''}
            </Link>

            <Link 
              href={buildTypeLink(TypeClient.SYNDIC)}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                typeFilter === TypeClient.SYNDIC 
                  ? 'bg-teal-500 text-white border-teal-600 shadow-sm' 
                  : 'bg-teal-500/10 text-teal-600 border-teal-500/20 hover:bg-teal-500/20'
              }`}
              title="Filtrer par Syndics"
            >
              <Landmark className="w-3.5 h-3.5" />
              {typeCounts[TypeClient.SYNDIC]} Syndic{typeCounts[TypeClient.SYNDIC] !== 1 ? 's' : ''}
            </Link>

            <Link 
              href={buildTypeLink(TypeClient.AGENCE_IMMOBILIERE)}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors border ${
                typeFilter === TypeClient.AGENCE_IMMOBILIERE 
                  ? 'bg-rose-500 text-white border-rose-600 shadow-sm' 
                  : 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20'
              }`}
              title="Filtrer par Agences"
            >
              <Home className="w-3.5 h-3.5" />
              {typeCounts[TypeClient.AGENCE_IMMOBILIERE]} Agence{typeCounts[TypeClient.AGENCE_IMMOBILIERE] !== 1 ? 's' : ''}
            </Link>
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

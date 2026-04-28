import { Users, UserPlus, TrendingUp, Activity, Building2, User, Building, Home } from "lucide-react";
import Link from "next/link";
import { getClientStats } from "@/features/clients/actions/client-actions";
import { StatutClient, TypeClient } from "@/generated/prisma";

export async function DashboardClientStats() {
  const statsResult = await getClientStats();
  
  if (statsResult.error || !statsResult.data) {
    return (
      <div className="bg-surface p-6 rounded-xl border border-border shadow-sm text-center">
        <p className="text-muted-foreground">Impossible de charger les statistiques.</p>
      </div>
    );
  }

  const { total, statusCounts, typeCounts, recentClients } = statsResult.data;
  const prospectsCount = statusCounts[StatutClient.PROSPECT] || 0;
  const clientsCount = statusCounts[StatutClient.CLIENT] || 0;
  
  const entreprisesCount = typeCounts[TypeClient.ENTREPRISE] || 0;
  const particuliersCount = typeCounts[TypeClient.PARTICULIER] || 0;
  const syndicsCount = typeCounts[TypeClient.SYNDIC] || 0;
  const agencesCount = typeCounts[TypeClient.AGENCE_IMMOBILIERE] || 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards - Ligne 1 : Statuts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-primary/10 text-primary rounded-full">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
            <h3 className="text-2xl font-bold text-foreground">{total}</h3>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Prospects</p>
            <h3 className="text-2xl font-bold text-foreground">{prospectsCount}</h3>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Clients Actifs</p>
            <h3 className="text-2xl font-bold text-foreground">{clientsCount}</h3>
          </div>
        </div>

        <Link href="/clients" className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center justify-between group transition-all hover:border-primary/50 hover:shadow-md cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-muted rounded-full group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Gérer la base</p>
              <p className="text-xs text-muted-foreground">Voir tous les clients</p>
            </div>
          </div>
          <span className="text-muted-foreground group-hover:text-primary transition-colors">→</span>
        </Link>
      </div>

      {/* KPI Cards - Ligne 2 : Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Entreprises</p>
            <h3 className="text-2xl font-bold text-foreground">{entreprisesCount}</h3>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-full">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Particuliers</p>
            <h3 className="text-2xl font-bold text-foreground">{particuliersCount}</h3>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-teal-500/10 text-teal-500 rounded-full">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Syndics</p>
            <h3 className="text-2xl font-bold text-foreground">{syndicsCount}</h3>
          </div>
        </div>

        <div className="bg-surface p-6 rounded-xl border border-border shadow-sm flex items-center space-x-4 transition-all hover:shadow-md">
          <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Agences Immo.</p>
            <h3 className="text-2xl font-bold text-foreground">{agencesCount}</h3>
          </div>
        </div>
      </div>

      {/* Derniers Ajouts */}
      <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex justify-between items-center">
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            Derniers ajouts
          </h2>
          <Link href="/clients" className="text-sm text-primary hover:underline font-medium">
            Voir tout
          </Link>
        </div>
        
        {recentClients.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Aucun client ajouté récemment.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentClients.map((client) => {
              const isEntreprise = client.type !== "PARTICULIER";
              const displayName = (isEntreprise 
                ? client.raisonSociale 
                : `${client.prenom || ""} ${client.nom || ""}`.trim()) || "Sans nom";

              return (
                <div key={client.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{displayName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{client.type.replace(/_/g, " ")}</span>
                        <span>•</span>
                        <span>{new Date(client.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    client.statut === 'CLIENT' ? 'bg-emerald-500/10 text-emerald-500' :
                    client.statut === 'PROSPECT' ? 'bg-amber-500/10 text-amber-500' :
                    client.statut === 'INACTIF' ? 'bg-rose-500/10 text-rose-500' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {client.statut}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
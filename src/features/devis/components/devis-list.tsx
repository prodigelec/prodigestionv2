"use client";

import Link from "next/link";
import { Eye, Edit2, FileText } from "lucide-react";
import { StatutDevis, TypeClient } from "@/generated/prisma";

interface ClientLight {
  nom: string;
  prenom: string | null;
  raisonSociale: string | null;
  type: string;
}

interface DevisListItem {
  id: string;
  numero: string;
  dateCreation: Date;
  dateValidite: Date;
  statut: StatutDevis;
  totalTTC: number;
  client: ClientLight;
}

interface DevisListProps {
  devis: DevisListItem[];
}

export function DevisList({ devis }: DevisListProps) {
  if (devis.length === 0) {
    return (
      <div className="text-center py-12 bg-surface border border-border rounded-xl shadow-sm">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
        <h3 className="mt-4 text-lg font-medium text-foreground">Aucun devis</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Vous n'avez pas encore créé de devis.
        </p>
        <div className="mt-6">
          <Link
            href="/devis/nouveau"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-light shadow hover:bg-primary/90 transition-colors"
          >
            Créer mon premier devis
          </Link>
        </div>
      </div>
    );
  }

  const getStatutBadge = (statut: StatutDevis) => {
    switch (statut) {
      case StatutDevis.ACCEPTE:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Accepté</span>;
      case StatutDevis.ENVOYE:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">Envoyé</span>;
      case StatutDevis.BROUILLON:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">Brouillon</span>;
      case StatutDevis.REFUSE:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-500 border border-rose-500/20">Refusé</span>;
      case StatutDevis.EXPIRE:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">Expiré</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">{statut}</span>;
    }
  };

  const formatClientName = (client: ClientLight) => {
    if (client.type === "PARTICULIER") {
      return `${client.prenom || ""} ${client.nom}`.trim();
    }
    return client.raisonSociale || client.nom;
  };

  return (
    <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border bg-muted/20">
        <p className="text-sm text-muted-foreground italic">Filtres et barre de recherche à venir...</p>
      </div>
      <div className="p-1 sm:p-6">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Numéro</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Client</th>
                <th className="px-6 py-4 font-medium text-right">Montant TTC</th>
                <th className="px-6 py-4 font-medium">Statut</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {devis.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30 transition-colors group">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {d.numero}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(d.dateCreation).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground mb-1">{formatClientName(d.client)}</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      d.client.type === TypeClient.PARTICULIER ? 'bg-purple-500/10 text-purple-500' :
                      d.client.type === TypeClient.ENTREPRISE ? 'bg-blue-500/10 text-blue-500' :
                      d.client.type === TypeClient.SYNDIC ? 'bg-teal-500/10 text-teal-500' :
                      d.client.type === TypeClient.AGENCE_IMMOBILIERE ? 'bg-rose-500/10 text-rose-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {d.client.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-foreground">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(d.totalTTC)}
                  </td>
                  <td className="px-6 py-4">
                    {getStatutBadge(d.statut)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link 
                      href={`/devis/${d.id}`}
                      className="inline-flex items-center justify-center p-2 text-blue-500 hover:bg-blue-500/10 hover:scale-110 rounded-md transition-all"
                      title="Voir le devis"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link 
                      href={`/devis/${d.id}/edit`}
                      className="inline-flex items-center justify-center p-2 text-amber-500 hover:bg-amber-500/10 hover:scale-110 rounded-md transition-all"
                      title="Modifier le devis"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

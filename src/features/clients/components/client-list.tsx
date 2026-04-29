"use client";

import Link from "next/link";
import { TypeClient, StatutClient } from "@/generated/prisma";
import { Eye, Edit2 } from "lucide-react";
import { DeleteClientButton } from "@/features/clients/components/delete-client-button";

// On utilise un type partiel basé sur ce qu'on attend de Prisma
type Client = {
  id: string;
  nom: string;
  prenom: string | null;
  raisonSociale?: string | null;
  type: string;
  statut: string;
  email?: string | null;
  telephone: string | null;
  telephonePortable: string | null;
};

interface ClientListProps {
  clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
  if (clients.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Aucun client trouvé.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-primary uppercase">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">Nom / Raison Sociale</th>
              <th scope="col" className="px-6 py-3 font-medium">Type</th>
              <th scope="col" className="px-6 py-3 font-medium">Statut</th>
              <th scope="col" className="px-6 py-3 font-medium">Contact</th>
              <th scope="col" className="px-6 py-3 font-medium">Téléphone</th>
              <th scope="col" className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {clients.map((client) => {
              const displayName = client.type === TypeClient.PARTICULIER 
                ? `${client.nom} ${client.prenom || ""}`.trim()
                : client.raisonSociale || client.nom;

              return (
                <tr key={client.id} className="bg-background transition-colors">
                  <td className="px-6 py-4 text-primary font-medium">
                    {displayName}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.type === TypeClient.PARTICULIER ? 'bg-purple-500/10 text-purple-500' :
                      client.type === TypeClient.ENTREPRISE ? 'bg-blue-500/10 text-blue-500' :
                      client.type === TypeClient.SYNDIC ? 'bg-teal-500/10 text-teal-500' :
                      client.type === TypeClient.AGENCE_IMMOBILIERE ? 'bg-rose-500/10 text-rose-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {client.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.statut === StatutClient.CLIENT ? 'bg-emerald-500/10 text-emerald-500' :
                      client.statut === StatutClient.PROSPECT ? 'bg-amber-500/10 text-amber-500' :
                      client.statut === StatutClient.INACTIF ? 'bg-red-500/10 text-red-500' :
                      client.statut === StatutClient.ARCHIVE ? 'bg-gray-500/10 text-gray-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {client.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {client.email || "-"}
                  </td>
                  <td className="px-6 py-4 text-muted">
                    {client.telephone || client.telephonePortable || "-"}
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                    <Link 
                      href={`/clients/${client.id}`}
                      className="text-blue-500 hover:text-blue-600 hover:scale-110 transition-all p-1.5 hover:bg-blue-500/10 rounded-md"
                      title="Voir les détails"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    <Link 
                      href={`/clients/${client.id}/edit`}
                      className="text-amber-500 hover:text-amber-600 hover:scale-110 transition-all p-1.5 hover:bg-amber-500/10 rounded-md"
                      title="Modifier le client"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <DeleteClientButton 
                      clientId={client.id} 
                      clientNom={displayName} 
                      iconOnly={true}
                      title="Supprimer le client"
                      className="text-red-500 hover:text-red-600 hover:scale-110 transition-all p-1.5 hover:bg-red-500/10 rounded-md"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

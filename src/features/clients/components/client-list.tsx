"use client";

import Link from "next/link";
import { TypeClient } from "@/generated/prisma/enums";
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
    <div className="w-full">
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
                    {client.type.replace(/_/g, " ")}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
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
                      className="text-lg hover:scale-125 transition-transform"
                      title="Voir"
                    >
                      👁️
                    </Link>
                    <Link 
                      href={`/clients/${client.id}/edit`}
                      className="text-lg hover:scale-125 transition-transform"
                      title="Modifier"
                    >
                      ✏️
                    </Link>
                    <DeleteClientButton 
                      clientId={client.id} 
                      clientNom={displayName} 
                      iconOnly={true}
                      title="Supprimer"
                      className="text-lg hover:scale-125 transition-transform cursor-pointer"
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

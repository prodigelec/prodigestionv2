import { useState } from "react";
import { ClientLight } from "../types";

export function useDevisClients(clients: ClientLight[], clientId: string) {
  const [typeFilter, setTypeFilter] = useState("TOUS");

  const formatClientName = (c: ClientLight) =>
    c.type === "PARTICULIER" ? `${c.prenom || ""} ${c.nom}`.trim() : c.raisonSociale || c.nom;

  const filteredClients = typeFilter === "TOUS" ? clients : clients.filter((c) => c.type === typeFilter);

  const clientOptions = [
    { value: "", label: "Sélectionnez un client" },
    ...filteredClients.map((c) => ({
      value: c.id,
      label: `${formatClientName(c)} (${c.type.replace(/_/g, " ")})`,
    })),
  ];

  const selectedClient = clients.find((c) => c.id === clientId);
  const hasSelectedClientAddress =
    !!selectedClient &&
    !!(selectedClient.adresse || selectedClient.adresseComplement || selectedClient.codePostal || selectedClient.ville);

  return { typeFilter, setTypeFilter, selectedClient, hasSelectedClientAddress, clientOptions };
}

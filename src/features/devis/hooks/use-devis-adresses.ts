import { useState, useEffect } from "react";
import { ClientLight } from "../types";

export function useDevisAdresses(selectedClient: ClientLight | undefined) {
  const [isChantierAddressDifferent, setIsChantierAddressDifferent] = useState(false);
  const [clientAddress, setClientAddress] = useState("");
  const [clientCodePostal, setClientCodePostal] = useState("");
  const [clientVille, setClientVille] = useState("");
  const [chantierAddress, setChantierAddress] = useState("");
  const [chantierCodePostal, setChantierCodePostal] = useState("");
  const [chantierVille, setChantierVille] = useState("");

  useEffect(() => {
    if (!selectedClient) {
      setClientAddress("");
      setClientCodePostal("");
      setClientVille("");
      return;
    }
    setClientAddress(selectedClient.adresse || "");
    setClientCodePostal(selectedClient.codePostal || "");
    setClientVille(selectedClient.ville || "");
  }, [selectedClient]);

  const resetChantier = () => {
    setIsChantierAddressDifferent(false);
    setChantierAddress("");
    setChantierCodePostal("");
    setChantierVille("");
  };

  return {
    isChantierAddressDifferent,
    clientAddress, clientCodePostal, clientVille,
    setClientAddress, setClientCodePostal, setClientVille,
    chantierAddress, chantierCodePostal, chantierVille,
    setChantierAddress, setChantierCodePostal, setChantierVille,
    resetChantier,
    handleToggleChantier: () => setIsChantierAddressDifferent((prev) => !prev),
  };
}

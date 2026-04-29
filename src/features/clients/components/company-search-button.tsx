"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Building, MapPin, X, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { toast } from "sonner";

export interface CompanyData {
  siret: string;
  nom: string;
  adresse: string;
  codePostal: string;
  ville: string;
}

interface CompanySearchButtonProps {
  onSelect: (company: CompanyData) => void;
  className?: string;
}

export function CompanySearchButton({ onSelect, className }: CompanySearchButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Reset state when closing
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
  }, [isOpen]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    setResults([]);

    try {
      // API Publique du gouvernement français (recherche-entreprises.api.gouv.fr)
      const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(query)}&per_page=10`);
      if (!res.ok) throw new Error("Erreur réseau");
      const data = await res.json();
      setResults(data.results || []);
    } catch (error) {
      console.error("Erreur recherche API:", error);
      toast.error("Impossible de joindre l'API de recherche des entreprises");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (company: any) => {
    const siege = company.siege || {};
    
    // Formater l'adresse avec les différents champs si disponibles
    const adresseParts = [
      siege.numero_voie,
      siege.indice_repetition,
      siege.type_voie,
      siege.libelle_voie
    ].filter(Boolean).join(" ");
    
    // Fallback sur adresse complète si les parties ne sont pas renseignées
    const adresse = adresseParts || siege.adresse || "";

    const companyData: CompanyData = {
      siret: siege.siret || company.siren || "",
      nom: company.nom_complet || "",
      adresse: adresse,
      codePostal: siege.code_postal || "",
      ville: siege.libelle_commune || "",
    };

    onSelect(companyData);
    toast.success("Informations récupérées avec succès");
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={className || "inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors border border-primary/20"}
      >
        <Search className="w-4 h-4" />
        Rechercher une entreprise (API Gouv)
      </button>

      <Dialog open={isOpen} as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-xl bg-surface border border-border text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-2xl data-closed:sm:translate-y-0 data-closed:sm:scale-95 flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/20">
                <DialogTitle as="h3" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Building className="w-5 h-5 text-primary" />
                  Recherche dans l'annuaire des entreprises
                </DialogTitle>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 flex-1 overflow-hidden flex flex-col gap-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Nom de l'entreprise, SIREN ou SIRET..."
                      className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="px-4 py-2 bg-primary text-primary-light rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Rechercher"}
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto mt-2 -mx-2 px-2">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
                      <p className="text-sm">Recherche en cours dans la base SIRENE...</p>
                    </div>
                  ) : hasSearched && results.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-border border-dashed">
                      <Building className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">Aucune entreprise trouvée</p>
                      <p className="text-xs mt-1">Vérifiez l'orthographe ou le numéro SIRET/SIREN</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {results.map((company) => (
                        <button
                          key={company.siren + (company.siege?.siret || "")}
                          onClick={() => handleSelect(company)}
                          className="w-full text-left p-4 rounded-lg border border-border bg-background hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm transition-all group flex items-start justify-between gap-4"
                        >
                          <div>
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                              {company.nom_complet}
                              {company.etat_administratif === "A" ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                                  Actif
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-600 border border-red-500/20">
                                  Fermé
                                </span>
                              )}
                            </h4>
                            <div className="mt-1 space-y-1">
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <span className="font-medium">SIRET:</span> {company.siege?.siret || company.siren}
                              </p>
                              {(company.siege?.adresse || company.siege?.libelle_commune) && (
                                <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
                                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                  <span>
                                    {company.siege?.adresse ? company.siege.adresse : 
                                      `${company.siege?.code_postal || ""} ${company.siege?.libelle_commune || ""}`.trim()
                                    }
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sélectionner
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

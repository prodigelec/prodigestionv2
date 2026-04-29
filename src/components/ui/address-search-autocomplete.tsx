"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export interface AddressData {
  adresse: string;
  codePostal: string;
  ville: string;
}

interface AddressSearchAutocompleteProps {
  defaultValue?: string;
  onSelect: (address: AddressData) => void;
  className?: string;
  placeholder?: string;
}

export function AddressSearchAutocomplete({ 
  defaultValue = "", 
  onSelect, 
  className = "",
  placeholder = "123 rue de la Paix"
}: AddressSearchAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Gérer le clic à l'extérieur pour fermer le menu déroulant
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mettre à jour la recherche quand defaultValue change (ex: via la recherche d'entreprise)
  useEffect(() => {
    setQuery(defaultValue);
  }, [defaultValue]);

  // Rechercher les adresses via l'API du gouvernement
  useEffect(() => {
    const fetchAddresses = async () => {
      // L'API Adresse Gouv exige un minimum de 3 caractères et doit commencer par une lettre/chiffre
      if (!debouncedQuery || debouncedQuery.length < 3 || !/^[a-zA-Z0-9]/.test(debouncedQuery)) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(debouncedQuery)}&limit=5`);
        
        // Si l'API retourne une erreur 400 (ex: requête mal formatée), on l'ignore silencieusement
        if (res.status === 400) {
          setResults([]);
          return;
        }
        
        if (!res.ok) throw new Error("Erreur réseau");
        
        const data = await res.json();
        setResults(data.features || []);
        if (data.features && data.features.length > 0) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Erreur recherche adresse:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Ne pas rechercher si on vient juste de sélectionner une adresse
    const isExactMatch = results.some(r => r.properties.name === debouncedQuery);
    if (!isExactMatch) {
      fetchAddresses();
    }
  }, [debouncedQuery]);

  const handleSelect = (feature: any) => {
    const props = feature.properties;
    
    setQuery(props.name); // Afficher juste la rue dans l'input
    setIsOpen(false);

    onSelect({
      adresse: props.name,
      codePostal: props.postcode,
      ville: props.city
    });
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          id="adresse"
          name="adresse"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          className={`flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 pr-10 text-sm text-foreground hover:border-primary/50 transition-colors focus-visible:outline-none ${className}`}
          placeholder={placeholder}
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Menu déroulant des résultats */}
      {isOpen && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto py-1">
          {results.map((feature) => (
            <li key={feature.properties.id}>
              <button
                type="button"
                onClick={() => handleSelect(feature)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-primary/10 hover:text-primary transition-colors flex items-start gap-2"
              >
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />
                <div>
                  <span className="font-medium block">{feature.properties.name}</span>
                  <span className="text-xs text-muted-foreground block">
                    {feature.properties.postcode} {feature.properties.city}
                  </span>
                  {feature.properties.context && (
                    <span className="text-[10px] text-muted-foreground/70 block">
                      {feature.properties.context}
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

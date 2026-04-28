"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition, useEffect } from "react";
import { TypeClient, StatutClient } from "@/generated/prisma";
import { Search, X } from "lucide-react";

export function ClientFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentQuery = searchParams.get("q") || "";
  const currentType = searchParams.get("type") || "TOUS";
  const currentStatus = searchParams.get("statut") || "TOUS";

  const [searchValue, setSearchValue] = useState(currentQuery);
  const [debouncedValue, setDebouncedValue] = useState(currentQuery);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "TOUS") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Toujours réinitialiser la page à 1 quand on change un filtre
      params.delete("page");
      return params.toString();
    },
    [searchParams]
  );

  // Effet de debounce pour la recherche textuelle
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedValue !== currentQuery) {
        startTransition(() => {
          router.push(`${pathname}?${createQueryString("q", debouncedValue)}`);
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedValue, currentQuery, pathname, router, createQueryString]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setDebouncedValue(value);
  };

  const clearSearch = () => {
    setSearchValue("");
    setDebouncedValue("");
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("q", "")}`);
    });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("type", e.target.value)}`);
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString("statut", e.target.value)}`);
    });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Barre de recherche */}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="Rechercher par nom, email, téléphone..."
          value={searchValue}
          onChange={handleSearch}
          className="flex h-10 w-full rounded-md border border-border bg-background py-2 pl-10 pr-10 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-primary/50"
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filtres Selects */}
      <div className="flex gap-4 sm:w-auto">
        <select
          value={currentType}
          onChange={handleTypeChange}
          className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-primary/50"
        >
          <option value="TOUS">Tous les types</option>
          {Object.values(TypeClient).map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <select
          value={currentStatus}
          onChange={handleStatusChange}
          className="h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors hover:border-primary/50"
        >
          <option value="TOUS">Tous les statuts</option>
          {Object.values(StatutClient).map((statut) => (
            <option key={statut} value={statut}>
              {statut}
            </option>
          ))}
        </select>
      </div>
      
      {isPending && (
        <div className="absolute top-2 right-2">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
        </div>
      )}
    </div>
  );
}

"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
}

export function ClientPagination({ totalPages, currentPage, totalItems, itemsPerPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  if (totalPages <= 1) return null;

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 border-t border-border mt-4 gap-4">
      <div className="text-sm text-muted-foreground">
        Affichage de <span className="font-medium text-foreground">{startItem}</span> à <span className="font-medium text-foreground">{endItem}</span> sur <span className="font-medium text-foreground">{totalItems}</span> résultats
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => router.push(createPageURL(currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-muted h-9 px-4 py-2"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </button>
        <div className="text-sm font-medium text-foreground px-2">
          {currentPage} / {totalPages}
        </div>
        <button
          onClick={() => router.push(createPageURL(currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-border bg-background hover:bg-muted h-9 px-4 py-2"
        >
          Suivant
          <ChevronRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
}

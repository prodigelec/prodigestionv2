"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteClient } from "@/features/clients/actions/client-actions";

interface DeleteClientButtonProps {
  clientId: string;
  clientNom: string;
  redirectAfterDelete?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function DeleteClientButton({ clientId, clientNom, redirectAfterDelete = false, className, iconOnly = false }: DeleteClientButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteClient(clientId);
      
      if (result.error) {
        toast.error(result.error);
        setShowConfirm(false);
      } else if (result.success) {
        toast.success(`Le client ${clientNom} a été supprimé avec succès.`);
        setShowConfirm(false);
        
        if (redirectAfterDelete) {
          router.push("/clients");
        }
      }
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground mr-1">Sûr ?</span>
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition disabled:opacity-50"
        >
          {isPending ? "..." : "Oui"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={isPending}
          className="px-2 py-1 text-xs font-medium text-foreground bg-surface border border-border rounded hover:bg-muted transition disabled:opacity-50"
        >
          Non
        </button>
      </div>
    );
  }

  const defaultClassName = "text-sm font-medium text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 px-2 py-1 rounded-md transition";
  
  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={className || defaultClassName}
    >
      🗑️ {!iconOnly && "Supprimer"}
    </button>
  );
}
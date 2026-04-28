"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteClient } from "@/features/clients/actions/client-actions";
import { Dialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";

interface DeleteClientButtonProps {
  clientId: string;
  clientNom: string;
  redirectAfterDelete?: boolean;
  className?: string;
  iconOnly?: boolean;
  title?: string;
}

export function DeleteClientButton({ clientId, clientNom, redirectAfterDelete = false, className, iconOnly = false, title }: DeleteClientButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteClient(clientId);
      
      if (result.error) {
        toast.error(result.error);
        setIsOpen(false);
      } else if (result.success) {
        toast.success(`Le client ${clientNom} a été supprimé avec succès.`);
        setIsOpen(false);
        
        if (redirectAfterDelete) {
          router.push("/clients");
        }
      }
    });
  };

  const defaultClassName = "text-sm font-medium text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 px-2 py-1 rounded-md transition";
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={className || defaultClassName}
        title={title}
      >
        {iconOnly ? "🗑️" : "🗑️ Supprimer"}
      </button>

      <Dialog open={isOpen} as="div" className="relative z-50" onClose={() => {
        if (!isPending) setIsOpen(false);
      }}>
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in"
        />

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <DialogPanel
              transition
              className="relative transform overflow-hidden rounded-xl bg-surface border border-border text-left shadow-xl transition-all data-closed:translate-y-4 data-closed:opacity-0 data-enter:duration-300 data-leave:duration-200 data-enter:ease-out data-leave:ease-in sm:my-8 sm:w-full sm:max-w-lg data-closed:sm:translate-y-0 data-closed:sm:scale-95"
            >
              <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100/10 sm:mx-0 sm:size-10">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-foreground">
                      Supprimer le client
                    </DialogTitle>
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        Êtes-vous sûr de vouloir supprimer le client <strong>{clientNom}</strong> ? Cette action est irréversible et toutes les données associées seront perdues.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 transition-colors"
                >
                  {isPending ? "Suppression..." : "Oui, supprimer"}
                </button>
                <button
                  type="button"
                  data-autofocus
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-surface px-3 py-2 text-sm font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted sm:mt-0 sm:w-auto disabled:opacity-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}
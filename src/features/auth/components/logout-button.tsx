"use client";

import { useTransition } from "react";
import { logoutAction } from "@/features/auth/actions/auth";
import { toast } from "sonner";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      try {
        await logoutAction();
        // Le toast pourrait ne pas s'afficher à cause de la redirection
        // Mais on le met par bonne pratique
        toast.success("Déconnexion réussie");
      } catch {
        toast.error("Erreur lors de la déconnexion");
      }
    });
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className="px-4 py-2 bg-danger text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 font-medium"
    >
      {isPending ? "Déconnexion..." : "Se déconnecter"}
    </button>
  );
}

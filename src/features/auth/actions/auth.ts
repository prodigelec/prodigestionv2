"use server";

import { loginSchema } from "@/features/auth/validations/auth";
import { prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";
import { createSession } from "@/app/lib/session";
import { redirect } from "next/navigation";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
};

export async function loginAction(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // Validation Joi côté serveur
  const { error, value } = loginSchema.validate(
    { email, password },
    { abortEarly: false }
  );

  if (error) {
    const fieldErrors: Record<string, string> = {};
    error.details.forEach((detail) => {
      if (detail.context?.key) {
        fieldErrors[detail.context.key] = detail.message;
      }
    });

    return {
      error: "Données invalides.",
      fieldErrors,
    };
  }

  try {
    // 1. Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: value.email },
    });

    if (!user) {
      return { error: "Email ou mot de passe incorrect." };
    }

    // 2. Vérifier le mot de passe
    const passwordMatch = await bcrypt.compare(value.password, user.passwordHash);

    if (!passwordMatch) {
      return { error: "Email ou mot de passe incorrect." };
    }

    // 3. Créer la session
    await createSession(user.id);
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    return { error: "Une erreur est survenue lors de la connexion." };
  }

  // Redirection après succès
  redirect("/dashboard");
}

"use client";

import { useActionState, useEffect, useState } from "react";
import { loginAction } from "@/app/actions/auth";
import { loginSchema } from "@/app/lib/validations/auth";
import { toast } from "sonner";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validation Joi côté client
    const { error } = loginSchema.validate(
      { email, password },
      { abortEarly: false }
    );

    if (error) {
      const newErrors: Record<string, string> = {};
      error.details.forEach((detail) => {
        if (detail.context?.key) {
          newErrors[detail.context.key] = detail.message;
        }
      });
      setClientErrors(newErrors);
      return;
    }

    setClientErrors({});
    
    // Si la validation passe, on lance la Server Action
    formAction(formData);
  };

  const errors = { ...clientErrors, ...state?.fieldErrors };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Adresse email
        </label>
        <div className="mt-1">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            disabled={isPending}
            className={`block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${
              errors.email ? "border-red-300" : "border-gray-300"
            }`}
          />
        </div>
        {errors.email && (
          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Mot de passe
        </label>
        <div className="mt-1">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            disabled={isPending}
            className={`block w-full appearance-none rounded-md border px-3 py-2 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm ${
              errors.password ? "border-red-300" : "border-gray-300"
            }`}
          />
        </div>
        {errors.password && (
          <p className="mt-2 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <div>
        <button
          type="submit"
          disabled={isPending}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Connexion..." : "Se connecter"}
        </button>
      </div>
    </form>
  );
}

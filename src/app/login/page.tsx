import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Connexion | Prodigestion",
  description: "Connectez-vous à votre espace Prodigestion",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl tracking-tight text-foreground text-font-sans">
          ProdiGestion
        </h2>
        <p className="mt-2 text-center text-sm text-foreground text-font-sans">
          Connectez-vous à votre compte
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className=" rounded-2xl p-8 shadow-sm border border-border bg-surface">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

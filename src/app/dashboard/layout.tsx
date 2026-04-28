import { Sidebar } from "@/features/dashboard/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar fixée à gauche */}
      <Sidebar />
      
      {/* Contenu principal qui scroll à droite */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

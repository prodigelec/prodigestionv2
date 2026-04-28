import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

// On utilise Lucide React pour des icônes professionnelles
// Et on ajoute une couleur Tailwind (ex: text-blue-500) pour garder le côté coloré des emojis
const navigation = [
  {
    category: "Général",
    items: [
      { 
        name: "Tableau de bord", 
        href: "/dashboard", 
        icon: LayoutDashboard,
        color: "text-blue-500" // Couleur vive pour imiter le côté emoji
      },
    ],
  },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col h-full shrink-0">
      {/* En-tête avec le nom de l'application et la bordure en bas */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <h1 className="text-xl font-bold text-foreground">ProdiGestion</h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3">
        {navigation.map((group) => (
          <div key={group.category} className="mb-8">
            <h2 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {group.category}
            </h2>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-foreground hover:bg-border/50 transition-colors group"
                    >
                      <Icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-transform`} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}

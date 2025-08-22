import { Home, Filter, BarChart3 } from "lucide-react";

export type NavigationTab = "home" | "filters" | "analytics";

export interface MobileNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export function MobileNavigation({
  activeTab,
  onTabChange,
}: MobileNavigationProps) {
  const tabs = [
    {
      id: "home" as const,
      label: "Inicio",
      icon: Home,
      active: activeTab === "home",
    },
    {
      id: "filters" as const,
      label: "Filtros",
      icon: Filter,
      active: activeTab === "filters",
    },
    {
      id: "analytics" as const,
      label: "Analítica",
      icon: BarChart3,
      active: activeTab === "analytics",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 shadow-lg">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors min-w-0 ${
                tab.active
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon size={20} />
              <span className="text-xs font-medium truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

import React from 'react';

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  href: string;
  isActive?: boolean;
}

interface DesktopNavigationProps {
  items: NavigationItem[];
  onNavigate: (href: string) => void;
  className?: string;
}

export const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
  items,
  onNavigate,
  className = '',
}) => {
  return (
    <nav className={`hidden lg:block ${className}`}>
      <div className="space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.href)}
            className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors ${
              item.isActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};


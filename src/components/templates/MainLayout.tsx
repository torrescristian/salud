import React from "react";


export interface MainLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  sidebar,
  header,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile First */}
      {header && (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="w-full px-4 py-3 sm:px-6 lg:px-8">{header}</div>
        </header>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Hidden on mobile, visible on desktop */}
        {sidebar && (
          <aside className="hidden lg:block lg:w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
            <div className="p-4">{sidebar}</div>
          </aside>
        )}

        {/* Main Content - Full width on mobile */}
        <main className="flex-1 w-full">
          <div className="w-full px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

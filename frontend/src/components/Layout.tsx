import React, { useState } from 'react';
import { Sidebar } from './layout/Sidebar';
import { Header } from './layout/Header';
import { useAuth } from '../hooks/useAuth';
import Chatbot from './Chatbot';

export function Layout({ children }: { children: React.ReactNode }) {
  const { userName, userRole, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      <Sidebar
        role={userRole}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((current) => !current)}
        onLogout={logout}
        userName={userName}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header userName={userName} />
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="px-4 sm:px-8 lg:px-10 py-8">{children}</div>
        </div>
      </main>
      <Chatbot />
    </div>
  );
}

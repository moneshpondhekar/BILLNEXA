import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/common/Header';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isWorkspace = location.pathname.includes('/intake/') || location.pathname.includes('/document/');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className={`flex-1 ${isWorkspace ? 'p-0' : 'max-w-7xl w-full mx-auto p-4 sm:p-6'}`}>
        <Outlet />
      </main>
      {!isWorkspace && (
        <footer className="border-t border-slate-200 bg-white py-3 px-6 text-center text-[11px] text-slate-400">
          Copyright © 2026 Bill Nexa • AI-Powered Document Processing & Claims Automation Platform • Version 1.0
        </footer>
      )}
    </div>
  );
};


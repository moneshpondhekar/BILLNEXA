import React from 'react';
import { Sparkles, FileText } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 26 : 20;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className={`flex items-center gap-2.5 font-bold tracking-tight select-none ${className}`}>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white shadow-sm ring-1 ring-white/20">
        <FileText size={iconSize} className="relative z-0" />
        <Sparkles size={11} className="absolute -top-1 -right-1 text-amber-300 animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className={`${textSize} leading-none font-extrabold text-slate-900 flex items-center gap-1`}>
          Bill <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Nexa</span>
        </span>
        {size !== 'sm' && (
          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">
            Claims AI Automation
          </span>
        )}
      </div>
    </div>
  );
};


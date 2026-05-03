import { useEffect, useState } from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { Button } from '../UI/Button';

export function Navbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial preference
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <header className="h-20 bg-surface/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-primary-200/50 dark:border-primary-800/50 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
          <input 
            type="text" 
            placeholder="Search API keys, invoices..." 
            className="w-full pl-10 pr-4 py-2 rounded-full bg-white dark:bg-surface-cardDark border border-primary-200 dark:border-primary-800 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="w-10 h-10 p-0 rounded-full">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
        <Button variant="ghost" size="sm" className="w-10 h-10 p-0 rounded-full relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-accent rounded-full border-2 border-surface dark:border-surface-dark"></span>
        </Button>
      </div>
    </header>
  );
}

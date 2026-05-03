
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Key, CreditCard, Settings, Activity, Server, LogOut } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Server, label: 'APIs', path: '/apis' },
  { icon: Key, label: 'API Keys', path: '/keys' },
  { icon: CreditCard, label: 'Billing', path: '/billing' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-primary flex flex-col border-r border-primary-800 shrink-0 sticky top-0">
      <div className="h-20 flex items-center px-8 border-b border-primary-800/50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="MeterFlow Logo" className="w-10 h-10 object-contain" />
          <span className="text-white font-bold tracking-wide text-xl">MeterFlow</span>
        </div>
      </div>
      
      <div className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative group text-sm font-medium",
              isActive 
                ? "bg-primary-800 text-white" 
                : "text-primary-400 hover:text-white hover:bg-primary-800/50"
            )}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
                )}
                <item.icon className={cn("w-5 h-5", isActive ? "text-accent" : "text-primary-400 group-hover:text-primary-300")} />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </div>
      
      <div className="p-4 mt-auto border-t border-primary-800/50">
        <div className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-primary-800/50 transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-700 flex items-center justify-center shrink-0">
              <span className="text-white text-sm font-medium">
                {user?.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-white text-sm font-medium truncate">{user?.email || 'User'}</span>
            </div>
          </div>
          <button onClick={handleLogout} className="text-primary-400 hover:text-white transition-colors p-2">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

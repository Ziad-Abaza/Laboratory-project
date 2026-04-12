import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="size-full overflow-auto">
      <div className="min-h-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.75rem] text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-[0.9375rem] mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-sm text-muted-foreground">Welcome,</p>
              <p className="text-foreground font-medium">{user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-secondary/50 transition-colors duration-200"
              title="Logout"
            >
              <LogOut className="size-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        {children}
      </div>
    </div>
  );
};

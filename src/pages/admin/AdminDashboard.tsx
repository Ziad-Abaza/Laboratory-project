import React from 'react';
import { BarChart3, Users, Activity, FlaskConical, Settings, LogOut, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const stats = [
    { label: 'Total Patients', value: '1,247', icon: Users, color: 'text-primary' },
    { label: 'Active Staff', value: '28', icon: Activity, color: 'text-emerald-600' },
    { label: 'Lab Tests Today', value: '156', icon: FlaskConical, color: 'text-amber-600' },
    { label: 'System Health', value: '98%', icon: BarChart3, color: 'text-emerald-600' },
  ];

  const quickActions = [
    {
      title: 'Reception Dashboard',
      description: 'View and manage patient registration and queue',
      icon: Users,
      path: '/reception',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Laboratory Reception',
      description: 'Monitor lab tests and reports',
      icon: FlaskConical,
      path: '/laboratory-reception',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      path: '#',
      color: 'from-gray-500 to-gray-600'
    }
  ];

  return (
    <div className="size-full overflow-auto">
      <div className="min-h-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[1.75rem] text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-[0.9375rem] mt-1">
              System overview and management
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-4">
              <p className="text-sm text-muted-foreground">Administrator</p>
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card rounded-lg p-5 shadow-sm border border-border hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[0.8125rem] text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-[2rem] leading-none text-foreground">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-lg bg-secondary/50 ${stat.color}`}>
                  <stat.icon className="size-5" strokeWidth={2} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
          <h2 className="text-[1.25rem] text-foreground mb-5">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.title}
                onClick={() => action.path !== '#' && navigate(action.path)}
                disabled={action.path === '#'}
                className="group relative overflow-hidden rounded-lg border border-border hover:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-200`} />
                <div className="relative p-6 text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <action.icon className="size-5 text-white" strokeWidth={2} />
                    </div>
                    <Eye className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <h3 className="text-foreground font-medium mb-1">{action.title}</h3>
                  <p className="text-[0.8125rem] text-muted-foreground">
                    {action.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-[1.25rem] text-foreground mb-5">Recent Activity</h2>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="size-2 rounded-full bg-emerald-500" />
                    <div>
                      <p className="text-sm text-foreground">System update completed</p>
                      <p className="text-xs text-muted-foreground">{i} hour{i > 1 ? 's' : ''} ago</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <h2 className="text-[1.25rem] text-foreground mb-5">System Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Database</span>
                <span className="text-sm text-emerald-600">Operational</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">API Server</span>
                <span className="text-sm text-emerald-600">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Backup System</span>
                <span className="text-sm text-emerald-600">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Security</span>
                <span className="text-sm text-emerald-600">Secured</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

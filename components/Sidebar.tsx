import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from './EventContext';
import { 
  LayoutDashboard, Users, User, LogOut, LucideIcon, 
  BarChart3, QrCode, UserPlus, ClipboardList, Settings, ShieldCheck, MessageSquare, CalendarPlus, Power
} from 'lucide-react';
import type { Permission } from '../types';

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
}

const navItems: NavItem[] = [
  { path: '/director-dashboard', label: 'Director Dashboard', icon: BarChart3, permission: 'manage_events' },
  { path: '/', label: 'Event Dashboard', icon: LayoutDashboard },
  { path: '/register', label: 'Register', icon: UserPlus, permission: 'register_participant' },
  { path: '/scan', label: 'Scan', icon: QrCode, permission: 'scan_qrcode' },
  { path: '/summary', label: 'Summary', icon: ClipboardList, permission: 'view_summary' },
  { path: '/communication', label: 'Communication', icon: MessageSquare },
  { path: '/manage-checkpoints', label: 'Checkpoints', icon: Settings, permission: 'manage_checkpoints' },
  { path: '/manage-events', label: 'Manage Events', icon: CalendarPlus, permission: 'manage_events' },
  { path: '/manage-accounts', label: 'Manage Accounts', icon: Users, permission: 'manage_staff' },
  { path: '/manage-roles', label: 'Manage Roles', icon: ShieldCheck, permission: 'manage_roles' },
  { path: '/profile', label: 'My Profile', icon: User },
];

const Sidebar: React.FC = () => {
  const { logout, hasPermission, currentUser } = useAuth();
  const { clearActiveEvent } = useEvents();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearActiveEvent();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => {
    if (item.path === '/') return currentUser && currentUser.roleId !== 'director';
    if (item.path === '/director-dashboard') return currentUser && currentUser.roleId === 'director';
    return !item.permission || hasPermission(item.permission);
  });

  return (
    <div className="w-64 bg-brand-dark text-white flex flex-col h-screen shadow-lg">
      <div className="p-4 border-b border-blue-900/50">
          <h1 className="text-2xl font-bold text-center text-white">ISETJB Event</h1>
          <p className="text-center text-xs text-blue-300">Attendance System</p>
      </div>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {filteredNavItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 group ${
                isActive
                  ? 'bg-brand-accent text-white shadow-inner'
                  : 'text-blue-100 hover:bg-blue-800 hover:text-white'
              }`
            }
          >
            <Icon className="mr-3 h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-900/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-md text-blue-100 hover:bg-red-500 hover:text-white transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

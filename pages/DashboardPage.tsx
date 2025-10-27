import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents } from '../components/EventContext';
import { UserPlus, QrCode, ClipboardList, Settings, Users, UserCircle, LucideIcon, BarChart3, ShieldCheck, MessageSquare, CalendarPlus } from 'lucide-react';
import { Permission } from '../types';

interface DashboardAction {
  title: string;
  description: string;
  link: string;
  icon: LucideIcon;
  permission?: Permission;
}

const ALL_ACTIONS: DashboardAction[] = [
  {
    title: 'Scan QR Code',
    description: 'Scan participant QR codes to log attendance.',
    link: '/scan',
    icon: QrCode,
    permission: 'scan_qrcode',
  },
  {
    title: 'Register Participant',
    description: 'Register a new participant and generate their QR code.',
    link: '/register',
    icon: UserPlus,
    permission: 'register_participant',
  },
  {
    title: 'View Event Summary',
    description: 'See a real-time summary of attendance for the event.',
    link: '/summary',
    icon: ClipboardList,
    permission: 'view_summary',
  },
  {
    title: 'Manage Checkpoints',
    description: 'Add or edit checkpoints for this event.',
    link: '/manage-checkpoints',
    icon: Settings,
    permission: 'manage_checkpoints',
  },
  {
    title: 'Communication',
    description: 'Chat with other staff members and supervisors.',
    link: '/communication',
    icon: MessageSquare,
  },
  {
    title: 'My Profile',
    description: 'View your account details and change your password.',
    link: '/profile',
    icon: UserCircle,
  },
];

const DIRECTOR_ONLY_ACTIONS: DashboardAction[] = [
    {
        title: 'Manage Events',
        description: 'Create new events or view all existing events.',
        link: '/manage-events',
        icon: CalendarPlus,
        permission: 'manage_events',
    },
    {
        title: 'Manage Accounts',
        description: 'Create and manage staff and supervisor accounts.',
        link: '/manage-accounts',
        icon: Users,
        permission: 'manage_staff',
    },
    {
        title: 'Manage Roles',
        description: 'Define roles and their permissions across the system.',
        link: '/manage-roles',
        icon: ShieldCheck,
        permission: 'manage_roles',
    },
]

const DashboardPage: React.FC = () => {
  const { currentUser, hasPermission } = useAuth();
  const { activeEvent } = useEvents();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser?.roleId === 'director') {
      navigate('/director-dashboard');
      return;
    }
    if (!activeEvent) {
      navigate('/select-event');
    }
  }, [currentUser, activeEvent, navigate]);

  if (!currentUser || currentUser.roleId === 'director' || !activeEvent) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  const availableActions = ALL_ACTIONS.filter(action => !action.permission || hasPermission(action.permission));
  const directorActions = DIRECTOR_ONLY_ACTIONS.filter(action => hasPermission(action.permission!));

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Welcome, {currentUser.name}!</h2>
      <p className="text-gray-500 mt-1">
        You are managing: <span className="font-semibold text-brand-primary">{activeEvent?.name}</span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {availableActions.map((action) => (
          <Link
            key={action.title}
            to={action.link}
            className="group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-xl hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-light text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
              <action.icon size={24} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">{action.title}</h3>
            <p className="mt-1 text-gray-600">{action.description}</p>
          </Link>
        ))}
         {directorActions.map((action) => (
          <Link
            key={action.title}
            to={action.link}
            className="group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-xl hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-light text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
              <action.icon size={24} />
            </div>
            <h3 className="mt-4 text-xl font-semibold text-gray-900">{action.title}</h3>
            <p className="mt-1 text-gray-600">{action.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardPage;

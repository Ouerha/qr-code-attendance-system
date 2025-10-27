import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEvents } from '../components/EventContext';
import { ArrowLeft, Users, CheckSquare, Settings, UserPlus, QrCode, ClipboardList, LucideIcon, BarChart3, Trash2, Check, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';

const CheckpointChart: React.FC<{ event: ReturnType<typeof useEvents>['activeEvent'] }> = ({ event }) => {
    const data = useMemo(() => {
        if (!event) return [];
        return event.checkpoints.map(checkpoint => {
            const count = Object.values(event.attendance).filter(log => log[checkpoint]).length;
            return { name: checkpoint, count };
        });
    }, [event]);

    const maxCount = Math.max(...data.map(d => d.count), 1); // Avoid division by zero

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={20}/> Check-in by Checkpoint
            </h3>
            {data.length > 0 ? (
                 <div className="space-y-4">
                    {data.map(item => (
                        <div key={item.name} className="flex items-center gap-4">
                            <span className="w-32 text-sm font-medium text-gray-600 truncate">{item.name}</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-brand-primary h-4 rounded-full transition-all duration-500"
                                    style={{ width: `${(item.count / maxCount) * 100}%`}}
                                />
                            </div>
                            <span className="w-10 text-right font-semibold text-gray-800">{item.count}</span>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm text-gray-500">No check-in data available.</p>}
        </div>
    );
};


const EventDashboardPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { events, setActiveEvent, assignStaffToEvent, unassignStaffFromEvent } = useEvents();
  const { currentUser, users, hasPermission, getUserRole } = useAuth();
  
  const [staffToAssign, setStaffToAssign] = useState('');
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  useEffect(() => {
    if (eventId) {
      setActiveEvent(eventId, '');
    }
  }, [eventId, setActiveEvent]);

  const event = useMemo(() => {
    return events.find(e => e.id === eventId);
  }, [eventId, events]);
  
  const availableStaff = useMemo(() => {
    if (!event) return [];
    return users.filter(u => u.roleId !== 'director' && !event.assignedStaff.includes(u.id));
  }, [users, event]);
  
  const assignedStaffDetails = useMemo(() => {
    if (!event) return [];
    return users.filter(u => event.assignedStaff.includes(u.id));
  }, [users, event]);
  
  const getRoleName = (user: User) => getUserRole(user)?.name || 'Unknown Role';

  if (!event) {
    return <div className="text-center p-8">Loading event data or event not found...</div>;
  }
  
  const handleAssignStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffToAssign || !event) return;
    const result = assignStaffToEvent(event.id, staffToAssign);
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
        setStaffToAssign('');
    }
    setTimeout(() => setFeedback(null), 3000);
  };
  
  const handleUnassignStaff = (userId: string, userName: string) => {
    if (!event) return;
    if (window.confirm(`Are you sure you want to unassign "${userName}" from this event?`)) {
      const result = unassignStaffFromEvent(event.id, userId);
      setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
      setTimeout(() => setFeedback(null), 3000);
    }
  };
  
  const totalCheckins = Object.values(event.attendance).reduce((total, participantLog) => {
    return total + Object.values(participantLog).filter(Boolean).length;
  }, 0);

  const managementActions = [
      { title: 'Register Participant', icon: UserPlus, link: '/register', permission: 'register_participant' },
      { title: 'Scan QR Code', icon: QrCode, link: '/scan', permission: 'scan_qrcode' },
      { title: 'View Summary', icon: ClipboardList, link: '/summary', permission: 'view_summary' },
      { title: 'Manage Checkpoints', icon: Settings, link: '/manage-checkpoints', permission: 'manage_checkpoints' },
  ].filter(action => hasPermission(action.permission as any));

  return (
    <div className="animate-fade-in">
      {hasPermission('manage_events') && (
        <div className="mb-6">
          <button onClick={() => navigate('/director-dashboard')} className="flex items-center text-sm font-medium text-gray-600 hover:text-brand-primary transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Back to Director Dashboard
          </button>
        </div>
      )}
      
      <h2 className="text-3xl font-bold text-gray-800">{event.name}</h2>
      <p className="text-gray-500 mt-1">Manage all aspects of this event from one place.</p>
      
       {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <StatCard title="Registered Participants" value={event.participants.length} icon={Users} />
        <StatCard title="Total Check-ins" value={totalCheckins} icon={CheckSquare} />
        <StatCard title="Event Checkpoints" value={event.checkpoints.length} icon={Settings} />
      </div>

       {/* Action Cards */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Event Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {managementActions.map(action => (
                <ActionCard key={action.title} title={action.title} icon={action.icon} link={action.link} />
            ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <CheckpointChart event={event} />
         <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Participants ({event.participants.length})</h3>
            <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                {event.participants.length > 0 ? event.participants.map(p => (
                    <div key={p.id} className="bg-gray-50 p-2 rounded-md border text-sm">
                        <p className="font-semibold text-gray-800">{p.name}</p>
                        <p className="text-gray-500">ID: {p.id} | Class: {p.class}</p>
                    </div>
                )) : <p className="text-sm text-gray-500">No participants registered yet.</p>}
            </div>
        </div>
      </div>
      
      {hasPermission('manage_staff') && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Staff Management</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="font-semibold text-gray-800 mb-3">Assign Staff</h4>
              <form onSubmit={handleAssignStaff} className="flex gap-2">
                  <select value={staffToAssign} onChange={(e) => setStaffToAssign(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent">
                      <option value="">Select a user...</option>
                      {availableStaff.map(user => <option key={user.id} value={user.id}>{user.name} ({getRoleName(user)})</option>)}
                  </select>
                  <button type="submit" className="bg-brand-secondary text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-primary">Assign</button>
              </form>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-gray-800 mb-3">Assigned Staff ({assignedStaffDetails.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                    {assignedStaffDetails.length > 0 ? assignedStaffDetails.map(user => (
                        <div key={user.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-md border">
                            <div>
                                <p className="font-medium text-gray-800">{user.name}</p>
                                <p className="text-xs text-gray-500">{getRoleName(user)}</p>
                            </div>
                            <button onClick={() => handleUnassignStaff(user.id, user.name)} className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 transition-colors">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    )) : <p className="text-sm text-gray-500">No staff assigned to this event.</p>}
                </div>
            </div>
          </div>
           {feedback && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm max-w-md ${ feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
              {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {feedback.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
      <Icon className="h-6 w-6 text-gray-400" />
    </div>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
  </div>
);

const ActionCard: React.FC<{title: string, icon: LucideIcon, link: string}> = ({title, icon: Icon, link}) => (
    <Link to={link} className="group block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-xl hover:border-brand-primary transition-all duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-brand-light text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
            <Icon size={24} />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
    </Link>
);

export default EventDashboardPage;

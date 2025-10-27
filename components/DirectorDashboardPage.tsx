import React from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from './EventContext';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Users, Calendar, BarChart3, ArrowRight, Trash2 } from 'lucide-react';

// A simple placeholder for a chart component
const ChartPlaceholder = () => (
    <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center border">
        <div className="text-center text-gray-400">
            <BarChart3 size={48} className="mx-auto" />
            <p className="mt-2 font-semibold">Registration Data Chart</p>
            <p className="text-sm">This is a visual placeholder for registration analytics.</p>
        </div>
    </div>
);


const DirectorDashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { events, deleteEvent } = useEvents();

  const totalParticipants = events.reduce((sum, event) => sum + event.participants.length, 0);
  const totalStaff = useAuth().users.filter(u => u.roleId !== 'director').length;

  const handleDelete = (eventId: string, eventName: string) => {
    if (window.confirm(`Are you sure you want to delete the event "${eventName}"? This action cannot be undone.`)) {
      deleteEvent(eventId);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-3xl font-bold text-gray-800">Welcome, {currentUser?.name}</h2>
      <p className="text-gray-500 mt-1">Here's the high-level overview of all event activities.</p>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        <StatCard title="Total Events" value={events.length} icon={Calendar} />
        <StatCard title="Total Participants" value={totalParticipants} icon={Users} />
        <StatCard title="Total Staff Members" value={totalStaff} icon={Users} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
        {/* Main Chart */}
        <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Registrations Overview</h3>
            <ChartPlaceholder />
        </div>

        {/* Recent Events */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Events</h3>
            <div className="space-y-4">
                {events.length > 0 ? events.slice(0, 4).map(event => (
                    <div key={event.id} className="p-3 rounded-md bg-gray-50 border flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-800">{event.name}</p>
                            <p className="text-sm text-gray-500">{event.date}</p>
                        </div>
                         <Link to={`/event/${event.id}/dashboard`} className="p-2 rounded-full hover:bg-brand-light text-brand-primary transition-colors">
                            <ArrowRight size={18}/>
                         </Link>
                    </div>
                )) : (
                    <p className="text-sm text-gray-500">No events found.</p>
                )}
            </div>
        </div>
      </div>


      {/* All Events Table */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-semibold text-gray-700">All Events</h3>
          <Link to="/manage-events" className="flex items-center gap-2 bg-brand-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors">
            <PlusCircle size={18} /> Create New Event
          </Link>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Event Name</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3 text-center">Participants</th>
                <th className="px-6 py-3">Access Key</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length > 0 ? events.map(event => (
                <tr key={event.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{event.name}</td>
                  <td className="px-6 py-4">{event.date}</td>
                  <td className="px-6 py-4 text-center">{event.participants.length}</td>
                  <td className="px-6 py-4"><kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md">{event.accessKey}</kbd></td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <Link to={`/event/${event.id}/dashboard`} className="font-medium text-brand-secondary hover:underline">
                          Manage
                      </Link>
                      <button onClick={() => handleDelete(event.id, event.name)} className="p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                          <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No events have been created yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType, subtitle?: string }> = ({ title, value, icon: Icon, subtitle }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
      <Icon className="h-6 w-6 text-gray-400" />
    </div>
    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
  </div>
);

export default DirectorDashboardPage;

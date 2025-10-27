import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from './EventContext';
import { useAuth } from '../context/AuthContext';
import { Key, LogIn, AlertTriangle } from 'lucide-react';

const SelectEventPage: React.FC = () => {
  const [accessKey, setAccessKey] = useState('');
  const [error, setError] = useState('');
  const { setActiveEvent, events } = useEvents();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const assignedEvents = useMemo(() => {
      if (!currentUser) return [];
      return events.filter(event => event.assignedStaff.includes(currentUser.id));
  }, [events, currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = setActiveEvent('', accessKey);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };
  
  const handleSelectAssignedEvent = (eventId: string) => {
    setError('');
    const result = setActiveEvent(eventId, '');
    if (result.success) {
        navigate('/');
    } else {
        setError(result.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Select an Event</h2>
            <p className="mt-2 text-sm text-gray-600">Enter an event access key or choose from your assigned events.</p>
        </div>

        {assignedEvents.length > 0 && (
            <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Your Assigned Events</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {assignedEvents.map(event => (
                        <button key={event.id} onClick={() => handleSelectAssignedEvent(event.id)} className="p-4 bg-white border rounded-lg shadow-sm text-left hover:bg-brand-light transition-colors">
                            <p className="font-semibold text-brand-primary">{event.name}</p>
                            <p className="text-sm text-gray-500">{event.date}</p>
                        </button>
                    ))}
                </div>
                 <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400">OR</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>
            </div>
        )}

        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          {error && <p className="text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input
                id="accessKey"
                name="accessKey"
                type="text"
                required
                className="w-full text-center tracking-widest uppercase pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
                placeholder="EVENT-KEY"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value.toUpperCase())}
            />
          </div>
          <div>
            <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent transition-transform transform hover:scale-105"
            >
                <LogIn className="mr-2"/>
                Join Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectEventPage;
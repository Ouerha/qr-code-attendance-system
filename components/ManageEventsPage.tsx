import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from './EventContext';
import { PlusCircle, Check, AlertTriangle, Calendar, Key, Users, UserPlus } from 'lucide-react';

const ManageEventsPage: React.FC = () => {
  const { createEvent } = useEvents();
  const navigate = useNavigate();
  const [newEvent, setNewEvent] = useState({ name: '', date: '' });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = createEvent(newEvent.name, newEvent.date);
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    
    if (result.success && result.event) {
      setNewEvent({ name: '', date: '' });
      setTimeout(() => {
        // Navigate to the new event's dashboard after creation
        navigate(`/event/${result.event.id}/dashboard`);
      }, 1500);
    } else {
        setTimeout(() => setFeedback(null), 3000);
    }
  };
  
  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Create New Event</h2>
      <p className="text-gray-500 mt-1">Fill out the details below to set up a new event.</p>

      <div className="mt-8 max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md border">
          <div>
            <label htmlFor="event-name" className="block text-sm font-medium text-gray-700 mb-2">Event Name</label>
            <input 
              id="event-name" 
              type="text" 
              value={newEvent.name} 
              onChange={(e) => setNewEvent({...newEvent, name: e.target.value})} 
              placeholder="e.g., University Gala 2024" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent" 
              required 
            />
          </div>
          <div>
            <label htmlFor="event-date" className="block text-sm font-medium text-gray-700 mb-2">Event Date</label>
            <input 
              id="event-date" 
              type="date" 
              value={newEvent.date} 
              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent" 
              required 
            />
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-transform transform hover:scale-105 shadow-lg">
            <PlusCircle size={18} /> Create Event and Proceed
          </button>
        </form>
        {feedback && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${ feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800' }`}>
            {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
            {feedback.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageEventsPage;

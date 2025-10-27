import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvents } from '../components/EventContext';
import { PlusCircle, Check, AlertTriangle } from 'lucide-react';

const ManageCheckpointsPage: React.FC = () => {
  const { activeEvent, addCheckpointToActiveEvent } = useEvents();
  const [newCheckpoint, setNewCheckpoint] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addCheckpointToActiveEvent(newCheckpoint);
    // FIX: Set feedback with 'type' property to match state type.
    setFeedback({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      setNewCheckpoint('');
    }
    setTimeout(() => setFeedback(null), 3000);
  };

  if (!activeEvent) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-4 text-xl font-semibold text-yellow-800">No Active Event</h3>
        <p className="mt-2 text-gray-600">You must select an event before you can manage its checkpoints.</p>
        <Link to="/select-event" className="mt-4 inline-block bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors">
          Select Event
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Manage Checkpoints</h2>
      <p className="text-gray-500 mt-1">Managing checkpoints for: <span className="font-semibold text-brand-primary">{activeEvent.name}</span></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">Add New Checkpoint</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="checkpoint-name" className="block text-sm font-medium text-gray-700 mb-1">
                Checkpoint Name
              </label>
              <input
                id="checkpoint-name"
                type="text"
                value={newCheckpoint}
                onChange={(e) => setNewCheckpoint(e.target.value)}
                placeholder="e.g., Afternoon Keynote"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-2 rounded-lg font-semibold hover:bg-brand-dark transition-transform transform hover:scale-105 shadow-lg"
            >
              <PlusCircle size={18} /> Add Checkpoint
            </button>
          </form>
          {feedback && (
            <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
              feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {feedback.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {feedback.message}
            </div>
          )}
        </div>

        <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Existing Checkpoints</h3>
            {activeEvent.checkpoints.length > 0 ? (
                 <ul className="space-y-2">
                    {activeEvent.checkpoints.map((checkpoint, index) => (
                        <li key={index} className="bg-gray-100 p-3 rounded-md text-gray-800">
                           {checkpoint}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 bg-gray-50 p-4 rounded-md">No checkpoints have been added for this event yet.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default ManageCheckpointsPage;
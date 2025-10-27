import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useEvents } from '../components/EventContext';
import { BookOpen, Calendar, User, Hash, MapPin } from 'lucide-react';

const InvitationPage: React.FC = () => {
  const { eventId, participantId } = useParams<{ eventId: string, participantId: string }>();
  const { events } = useEvents();

  const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);
  const participant = useMemo(() => event?.participants.find(p => p.id === participantId), [event, participantId]);

  if (!event || !participant) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invitation Not Found</h1>
          <p className="text-gray-600 mt-2">The link may be invalid or the event details have changed.</p>
        </div>
      </div>
    );
  }
  
  const qrValue = JSON.stringify({ id: participant.id, name: participant.name, class: participant.class });

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-brand-primary text-white p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 mb-4" />
          <h1 className="text-3xl font-bold">{event.name}</h1>
          <p className="text-lg opacity-90 mt-2">You're Invited!</p>
        </div>
        
        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 text-lg">Hello,</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{participant.name}</p>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-brand-secondary mr-4" />
              <span className="font-semibold">{event.date}</span>
            </div>
             <div className="flex items-center">
              <MapPin className="h-5 w-5 text-brand-secondary mr-4" />
              <span className="font-semibold">University Main Hall</span>
            </div>
            <div className="flex items-center">
              <User className="h-5 w-5 text-brand-secondary mr-4" />
              <span>Class: {participant.class}</span>
            </div>
            <div className="flex items-center">
              <Hash className="h-5 w-5 text-brand-secondary mr-4" />
              <span>ID: {participant.id}</span>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col items-center">
             <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your QR Code for Check-in</h3>
             <div className="p-4 bg-white rounded-lg border border-gray-300">
                <QRCode value={qrValue} size={160} />
             </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-500">
          Please present this invitation (digital or printed) at the event checkpoints.
        </div>
      </div>
    </div>
  );
};

export default InvitationPage;
import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useEvents } from '../components/EventContext';
import type { Participant, Event } from '../types';
import { User, Book, Hash, Printer, UserPlus, AlertTriangle, Mail, Send, X, Clipboard, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface InvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  participant: Participant;
  event: Event;
}

const InvitationModal: React.FC<InvitationModalProps> = ({ isOpen, onClose, participant, event }) => {
  if (!isOpen) return null;

  const invitationUrl = `${window.location.origin}${window.location.pathname}#/invitation/${event.id}/${participant.id}`;
  const subject = `Invitation: ${event.name}`;
  const body = `Dear ${participant.name},\n\nYou are invited to the event: "${event.name}".\n\nDate: ${event.date}\n\nPlease find your personalized invitation and QR code for check-in at the link below:\n${invitationUrl}\n\nWe look forward to seeing you there.\n\nBest regards,\nEvent Organizers`;

  const [copyStatus, setCopyStatus] = useState<'to' | 'subject' | 'body' | null>(null);

  const handleCopy = (text: string, field: 'to' | 'subject' | 'body') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyStatus(field);
      setTimeout(() => setCopyStatus(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 flex justify-between items-center border-b">
          <h3 className="text-xl font-semibold text-gray-800">Send Invitation Manually</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X size={20}/></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            This application cannot send emails directly. Please copy the details below and paste them into your preferred email client (e.g., Gmail, Outlook) to send the invitation.
          </p>
          
          <div>
            <label className="text-sm font-medium text-gray-500">To:</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="text" readOnly value={participant.email || ''} className="w-full bg-gray-100 p-2 border rounded-md"/>
              <button onClick={() => handleCopy(participant.email || '', 'to')} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300">
                {copyStatus === 'to' ? <Check size={16} className="text-green-600"/> : <Clipboard size={16}/>}
              </button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Subject:</label>
            <div className="flex items-center gap-2 mt-1">
              <input type="text" readOnly value={subject} className="w-full bg-gray-100 p-2 border rounded-md"/>
               <button onClick={() => handleCopy(subject, 'subject')} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300">
                {copyStatus === 'subject' ? <Check size={16} className="text-green-600"/> : <Clipboard size={16}/>}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Body:</label>
            <div className="flex items-start gap-2 mt-1">
              <textarea readOnly value={body} rows={8} className="w-full bg-gray-100 p-2 border rounded-md font-mono text-sm"></textarea>
              <button onClick={() => handleCopy(body, 'body')} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300">
                {copyStatus === 'body' ? <Check size={16} className="text-green-600"/> : <Clipboard size={16}/>}
              </button>
            </div>
          </div>

        </div>
        <div className="p-4 bg-gray-50 text-right border-t">
          <button onClick={onClose} className="bg-brand-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-brand-dark">Close</button>
        </div>
      </div>
    </div>
  );
};


const RegistrationPage: React.FC = () => {
  const [participant, setParticipant] = useState<Participant>({ name: '', class: '', id: '', email: '' });
  const [registeredParticipant, setRegisteredParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isInvitationModalOpen, setIsInvitationModalOpen] = useState(false);
  const { activeEvent, addParticipantToActiveEvent } = useEvents();
  const { currentUser } = useAuth();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParticipant({ ...participant, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!activeEvent) {
        setError('No active event selected.');
        return;
    }
    const result = addParticipantToActiveEvent(participant);
    if (result.success) {
      setRegisteredParticipant(participant);
      setSuccess(result.message);
      setParticipant({ name: '', class: '', id: '', email: '' });
    } else {
      setError(result.message);
    }
  };

  const handleRegisterAnother = () => {
    setRegisteredParticipant(null);
    setError('');
    setSuccess('');
  };

  const handlePrint = () => {
    const printContent = qrCodeRef.current?.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');

    if (printWindow) {
        printWindow.document.write('<html><head><title>Print QR Code</title></head><body>');
        printWindow.document.write('<div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%;">');
        if (registeredParticipant) {
             printWindow.document.write(`<h2>${registeredParticipant.name}</h2>`);
             printWindow.document.write(`<p>ID: ${registeredParticipant.id} | Class: ${registeredParticipant.class}</p>`);
        }
        if (printContent) {
          printWindow.document.write(printContent);
        }
        printWindow.document.write('</div></body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  };
  
    if (!activeEvent) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-4 text-xl font-semibold text-yellow-800">No Active Event</h3>
        <p className="mt-2 text-gray-600">You must select an event before you can register participants.</p>
        <Link to="/select-event" className="mt-4 inline-block bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors">
          Select Event
        </Link>
      </div>
    );
  }

  if (registeredParticipant) {
    return (
      <>
        <div className="flex flex-col items-center justify-center p-4 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful for {activeEvent.name}!</h2>
          <p className="text-green-600 mb-6">{success}</p>
          <div 
            className="bg-white p-6 rounded-lg shadow-lg border border-gray-200"
          >
            <div ref={qrCodeRef} className="flex justify-center mb-4">
              <QRCode value={JSON.stringify({ id: registeredParticipant.id, name: registeredParticipant.name, class: registeredParticipant.class })} size={200} />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">{registeredParticipant.name}</h3>
              <p className="text-gray-600">Class: {registeredParticipant.class}</p>
              <p className="text-gray-500">ID: {registeredParticipant.id}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-brand-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary transition-colors shadow"
            >
              <Printer size={18} /> Print QR Code
            </button>
             {registeredParticipant.email && currentUser?.email && (
              <button
                onClick={() => setIsInvitationModalOpen(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow"
              >
                <Send size={18} /> Send Invitation
              </button>
            )}
            <button
              onClick={handleRegisterAnother}
              className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow"
            >
              <UserPlus size={18} /> Register Another
            </button>
          </div>
        </div>
        {isInvitationModalOpen && activeEvent && (
            <InvitationModal 
                isOpen={isInvitationModalOpen}
                onClose={() => setIsInvitationModalOpen(false)}
                participant={registeredParticipant}
                event={activeEvent}
            />
        )}
      </>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-1">Participant Registration</h2>
      <p className="text-gray-500 mb-6">Registering for: <span className="font-semibold text-brand-primary">{activeEvent.name}</span></p>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input type="text" name="name" value={participant.name} onChange={handleChange} placeholder="Full Name" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition" required />
        </div>
        <div className="relative">
          <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input type="text" name="class" value={participant.class} onChange={handleChange} placeholder="Class (e.g., CS3)" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition" required />
        </div>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input type="text" name="id" value={participant.id} onChange={handleChange} placeholder="Student ID" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition" required />
        </div>
         <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input type="email" name="email" value={participant.email} onChange={handleChange} placeholder="Participant Email (for invitation)" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition" />
        </div>
        <button type="submit" className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-transform transform hover:scale-105 shadow-lg">
          Generate QR Code
        </button>
      </form>
    </div>
  );
};

export default RegistrationPage;
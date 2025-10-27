
import React, { useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { useAttendance } from '../context/AttendanceContext';
import type { Participant } from '../types';
import { User, Book, Hash, Printer, UserPlus } from 'lucide-react';

const RegistrationPage: React.FC = () => {
  const [participant, setParticipant] = useState<Participant>({ name: '', class: '', id: '' });
  const [registeredParticipant, setRegisteredParticipant] = useState<Participant | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const { addParticipant } = useAttendance();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParticipant({ ...participant, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const result = addParticipant(participant);
    if (result.success) {
      setRegisteredParticipant(participant);
      setSuccess(result.message);
      setParticipant({ name: '', class: '', id: '' });
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
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

    if (printWindow) {
        printWindow.document.write(`<html><head><title>Print QR Code</title></head><body>${printContent}</body></html>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    }
  };

  if (registeredParticipant) {
    return (
      <div className="flex flex-col items-center justify-center p-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
        <p className="text-green-600 mb-6">{success}</p>
        <div 
          ref={qrCodeRef}
          className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 printable-area"
          id="qr-code-to-print"
        >
          <div className="flex justify-center mb-4">
            <QRCode value={JSON.stringify(registeredParticipant)} size={200} />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900">{registeredParticipant.name}</h3>
            <p className="text-gray-600">Class: {registeredParticipant.class}</p>
            <p className="text-gray-500">ID: {registeredParticipant.id}</p>
          </div>
        </div>
        <div className="mt-8 flex gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-brand-secondary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-primary transition-colors shadow"
          >
            <Printer size={18} /> Print QR Code
          </button>
          <button
            onClick={handleRegisterAnother}
            className="flex items-center gap-2 bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors shadow"
          >
            <UserPlus size={18} /> Register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Participant Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input
            type="text"
            name="name"
            value={participant.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
            required
          />
        </div>
        <div className="relative">
          <Book className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input
            type="text"
            name="class"
            value={participant.class}
            onChange={handleChange}
            placeholder="Class (e.g., CS3)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
            required
          />
        </div>
        <div className="relative">
          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
          <input
            type="text"
            name="id"
            value={participant.id}
            onChange={handleChange}
            placeholder="Student ID"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-accent focus:border-transparent outline-none transition"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-dark transition-transform transform hover:scale-105 shadow-lg"
        >
          Generate QR Code
        </button>
      </form>
    </div>
  );
};

export default RegistrationPage;

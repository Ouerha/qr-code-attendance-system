import React, { useState, useMemo } from 'react';
import { useEvents } from '../components/EventContext';
import { Check, X, Filter, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Participant } from '../types';

interface ProcessedRecord extends Participant {
  presentAllDay: boolean;
  attendance: {
    [key: string]: boolean;
  };
}

const SummaryPage: React.FC = () => {
  const { activeEvent } = useEvents();
  const [showAllDayOnly, setShowAllDayOnly] = useState(false);

  const checkpoints = activeEvent?.checkpoints || [];
  const records = activeEvent?.participants || [];
  const attendanceLog = activeEvent?.attendance || {};

  const processedRecords = useMemo((): ProcessedRecord[] => {
    if (!activeEvent) return [];
    return records.map(p => {
      const participantAttendance = attendanceLog[p.id] || {};
      const presentAllDay = checkpoints.length > 0 && checkpoints.every(cp => participantAttendance[cp]);
      return { 
        ...p,
        presentAllDay,
        attendance: participantAttendance,
      };
    });
  }, [records, checkpoints, attendanceLog, activeEvent]);

  const filteredRecords = useMemo(() => {
    if (showAllDayOnly) {
      return processedRecords.filter(record => record.presentAllDay);
    }
    return processedRecords;
  }, [processedRecords, showAllDayOnly]);

  const totalRegistered = records.length;
  const totalAllDay = processedRecords.filter(r => r.presentAllDay).length;
  
  if (!activeEvent) {
    return (
      <div className="text-center p-8 bg-yellow-50 rounded-lg">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h3 className="mt-4 text-xl font-semibold text-yellow-800">No Active Event</h3>
        <p className="mt-2 text-gray-600">You must select an event to view its summary.</p>
        <Link to="/select-event" className="mt-4 inline-block bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-dark transition-colors">
          Select Event
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Attendance Summary</h2>
            <p className="text-gray-500 mt-1">Report for: <span className="font-semibold text-brand-primary">{activeEvent.name}</span></p>
        </div>
        <div className="flex items-center gap-3 bg-gray-100 p-2 rounded-lg">
          <Filter size={18} className="text-gray-600"/>
          <label htmlFor="allDayFilter" className="text-sm font-medium text-gray-700">
            Show "Present All Day" Only
          </label>
          <input
            id="allDayFilter"
            type="checkbox"
            checked={showAllDayOnly}
            onChange={(e) => setShowAllDayOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-secondary"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-brand-light p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-brand-dark">Total Registered</h3>
          <p className="text-3xl font-bold text-brand-primary">{totalRegistered}</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-800">Present All Day</h3>
          <p className="text-3xl font-bold text-green-600">{totalAllDay}</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Class</th>
              <th scope="col" className="px-6 py-3">Student ID</th>
              {checkpoints.map(checkpoint => (
                <th key={checkpoint} scope="col" className="px-6 py-3 text-center">{checkpoint}</th>
              ))}
              <th scope="col" className="px-6 py-3 text-center">Present All Day</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length > 0 ? filteredRecords.map((record) => (
              <tr key={record.id} className="bg-white border-b hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {record.name}
                </th>
                <td className="px-6 py-4">{record.class}</td>
                <td className="px-6 py-4">{record.id}</td>
                {checkpoints.map(checkpoint => (
                  <td key={checkpoint} className="px-6 py-4 text-center">
                    {record.attendance[checkpoint] ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mx-auto" />
                    )}
                  </td>
                ))}
                <td className="px-6 py-4 text-center">
                   <span className={`px-3 py-1 text-xs font-medium rounded-full ${record.presentAllDay ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {record.presentAllDay ? 'Yes' : 'No'}
                   </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={checkpoints.length + 4} className="text-center py-8 text-gray-500">
                  No participant records for this event.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SummaryPage;

import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { CHECKPOINTS } from '../types';
import { Check, X, Filter } from 'lucide-react';

const SummaryPage: React.FC = () => {
  const { records } = useAttendance();
  const [showAllDayOnly, setShowAllDayOnly] = useState(false);

  const processedRecords = useMemo(() => {
    return records.map(record => {
      const presentAllDay = CHECKPOINTS.every(checkpoint => record.attendance[checkpoint]);
      return { ...record, presentAllDay };
    });
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (showAllDayOnly) {
      return processedRecords.filter(record => record.presentAllDay);
    }
    return processedRecords;
  }, [processedRecords, showAllDayOnly]);

  const totalRegistered = records.length;
  const totalAllDay = processedRecords.filter(r => r.presentAllDay).length;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-gray-800">Attendance Summary</h2>
            <p className="text-gray-500 mt-1">Real-time attendance report for the event.</p>
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
              {CHECKPOINTS.map(checkpoint => (
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
                {CHECKPOINTS.map(checkpoint => (
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
                <td colSpan={CHECKPOINTS.length + 4} className="text-center py-8 text-gray-500">
                  No records to display.
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


import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import type { AttendanceRecord, Checkpoint, Participant } from '../types';

interface AttendanceContextType {
  records: AttendanceRecord[];
  addParticipant: (participant: Participant) => { success: boolean, message: string };
  logAttendance: (studentId: string, checkpoint: Checkpoint) => { success: boolean, message: string };
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);

  const addParticipant = useCallback((participant: Participant): { success: boolean, message: string } => {
    if (!participant.name || !participant.class || !participant.id) {
      return { success: false, message: 'All fields are required.' };
    }
    const exists = records.some(record => record.id === participant.id);
    if (exists) {
      return { success: false, message: `Participant with ID ${participant.id} already exists.` };
    }
    const newRecord: AttendanceRecord = { ...participant, attendance: {} };
    setRecords(prevRecords => [...prevRecords, newRecord]);
    return { success: true, message: 'Participant registered successfully.' };
  }, [records]);

  const logAttendance = useCallback((studentId: string, checkpoint: Checkpoint): { success: boolean, message: string } => {
    let participantName = '';
    let alreadyLogged = false;

    setRecords(prevRecords => {
      const newRecords = [...prevRecords];
      const recordIndex = newRecords.findIndex(record => record.id === studentId);
      
      if (recordIndex === -1) {
        return prevRecords; // No change if participant not found
      }

      participantName = newRecords[recordIndex].name;
      
      if (newRecords[recordIndex].attendance[checkpoint]) {
        alreadyLogged = true;
        return prevRecords;
      }

      newRecords[recordIndex] = {
        ...newRecords[recordIndex],
        attendance: {
          ...newRecords[recordIndex].attendance,
          [checkpoint]: true,
        },
      };

      return newRecords;
    });

    if (!participantName) {
        return { success: false, message: `Participant with ID ${studentId} not found.` };
    }
    if (alreadyLogged) {
        return { success: false, message: `${participantName} has already checked in for ${checkpoint}.` };
    }

    return { success: true, message: `${participantName} checked in for ${checkpoint}.` };
  }, []);

  return (
    <AttendanceContext.Provider value={{ records, addParticipant, logAttendance }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (context === undefined) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};

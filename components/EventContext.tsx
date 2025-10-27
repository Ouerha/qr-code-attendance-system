import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { Event, Participant, Checkpoint } from '../types';
import { useAuth } from '../context/AuthContext';

interface EventContextType {
  events: Event[];
  activeEvent: Event | null;
  createEvent: (name: string, date: string) => { success: boolean, message: string, event?: Event };
  deleteEvent: (eventId: string) => { success: boolean, message: string };
  setActiveEvent: (eventId: string, accessKey: string) => { success: boolean, message: string };
  clearActiveEvent: () => void;
  addParticipantToActiveEvent: (participant: Participant) => { success: boolean, message: string };
  logAttendanceInActiveEvent: (studentId: string, checkpoint: Checkpoint) => { success: boolean, message: string };
  addCheckpointToActiveEvent: (name: Checkpoint) => { success: boolean, message: string };
  assignStaffToEvent: (eventId: string, userId: string) => { success: boolean, message: string };
  unassignStaffFromEvent: (eventId: string, userId: string) => { success: boolean, message: string };
  unassignUserFromAllEvents: (userId: string) => void;
  updateUserIdInEvents: (oldId: string, newId: string) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Record<string, Event>>({});
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const { currentUser, hasPermission } = useAuth();
  const activeEvent = activeEventId ? events[activeEventId] : null;

  useEffect(() => {
    if (!currentUser) {
      setActiveEventId(null);
    }
  }, [currentUser]);

  const createEvent = useCallback((name: string, date: string): { success: boolean, message: string, event?: Event } => {
    if (!hasPermission('manage_events')) return { success: false, message: 'Permission denied.' };
    if (!name || !date) return { success: false, message: 'Event name and date are required.' };

    const id = `evt_${Date.now()}`;
    const accessKey = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newEvent: Event = {
      id, name, date, accessKey,
      checkpoints: ['Entry 1'],
      participants: [],
      attendance: {},
      assignedStaff: [],
    };

    setEvents(prev => ({ ...prev, [id]: newEvent }));
    return { success: true, message: 'Event created successfully.', event: newEvent };
  }, [hasPermission]);

  const deleteEvent = useCallback((eventId: string): { success: boolean, message: string } => {
    if (!hasPermission('manage_events')) return { success: false, message: 'Permission denied.' };

    setEvents(prevEvents => {
      const { [eventId]: _, ...remainingEvents } = prevEvents;
      return remainingEvents;
    });

    // Use updater form to avoid stale state for activeEventId
    setActiveEventId(prevId => (prevId === eventId ? null : prevId));
    
    return { success: true, message: 'Event deleted successfully.' };
  }, [hasPermission]);

  const setActiveEvent = useCallback((eventId: string, accessKey: string): { success: boolean, message: string } => {
    const event = Object.values(events).find(e => e.id === eventId || e.accessKey.toUpperCase() === accessKey.toUpperCase());

    if (!event) return { success: false, message: 'Invalid Event ID or Access Key.' };
    if (!currentUser) return { success: false, message: 'Not logged in.' };

    if (hasPermission('manage_events')) {
       setActiveEventId(event.id);
       return { success: true, message: `Selected event: ${event.name}` };
    }

    if (event.assignedStaff.includes(currentUser.id) || event.accessKey.toUpperCase() === accessKey.toUpperCase() ) {
       if (!event.assignedStaff.includes(currentUser.id)) {
           setEvents(prev => ({
               ...prev,
               [event.id]: { ...prev[event.id], assignedStaff: [...prev[event.id].assignedStaff, currentUser.id]}
           }));
       }
       setActiveEventId(event.id);
       return { success: true, message: `Joined event: ${event.name}` };
    }
    
    return { success: false, message: 'You are not assigned to this event.' };
  }, [events, currentUser, hasPermission]);
  
  const clearActiveEvent = useCallback(() => {
    setActiveEventId(null);
  }, []);

  const addParticipantToActiveEvent = useCallback((participant: Participant): { success: boolean, message: string } => {
    if (!activeEvent || !hasPermission('register_participant')) return { success: false, message: 'No active event or permission denied.' };
    
    if (activeEvent.participants.some(p => p.id === participant.id)) {
      return { success: false, message: `Participant with ID ${participant.id} already exists in this event.` };
    }
    
    setEvents(prev => ({
      ...prev,
      [activeEvent.id]: {
        ...prev[activeEvent.id],
        participants: [...prev[activeEvent.id].participants, participant]
      }
    }));
    
    return { success: true, message: 'Participant registered successfully.' };
  }, [activeEvent, hasPermission]);

  const logAttendanceInActiveEvent = useCallback((studentId: string, checkpoint: Checkpoint): { success: boolean, message: string } => {
     if (!activeEvent || !hasPermission('scan_qrcode')) return { success: false, message: 'No active event or permission denied.' };
     
     const participant = activeEvent.participants.find(p => p.id === studentId);
     if (!participant) {
       return { success: false, message: `Participant with ID ${studentId} not found.` };
     }
     if (activeEvent.attendance[studentId]?.[checkpoint]) {
       return { success: false, message: `${participant.name} has already checked in for ${checkpoint}.`};
     }

     setEvents(prev => ({
       ...prev,
       [activeEvent.id]: {
         ...prev[activeEvent.id],
         attendance: {
           ...prev[activeEvent.id].attendance,
           [studentId]: { ...prev[activeEvent.id].attendance[studentId], [checkpoint]: true }
         }
       }
     }));
     
     return { success: true, message: `${participant.name} checked in for ${checkpoint}.` };
  }, [activeEvent, hasPermission]);

  const addCheckpointToActiveEvent = useCallback((name: Checkpoint): { success: boolean, message: string } => {
    if (!activeEvent || !hasPermission('manage_checkpoints')) return { success: false, message: 'No active event or permission denied.' };
    if (activeEvent.checkpoints.includes(name)) {
      return { success: false, message: `Checkpoint "${name}" already exists.`};
    }

    setEvents(prev => ({
      ...prev,
      [activeEvent.id]: {
        ...prev[activeEvent.id],
        checkpoints: [...prev[activeEvent.id].checkpoints, name]
      }
    }));
    
    return { success: true, message: `Checkpoint "${name}" added.` };
  }, [activeEvent, hasPermission]);

  const assignStaffToEvent = useCallback((eventId: string, userId: string) => {
    if (!hasPermission('manage_staff')) return { success: false, message: 'Permission denied.' };
    
    const event = events[eventId];
    if (!event) return { success: false, message: 'Event not found.'};
    if (event.assignedStaff.includes(userId)) return { success: false, message: 'User is already assigned to this event.'};

    setEvents(prev => ({...prev, [eventId]: { ...event, assignedStaff: [...event.assignedStaff, userId] }}));
    return { success: true, message: 'Staff assigned successfully.'};
  }, [hasPermission, events]);

  const unassignStaffFromEvent = useCallback((eventId: string, userId: string) => {
    if (!hasPermission('manage_staff')) return { success: false, message: 'Permission denied.' };

    const event = events[eventId];
    if (!event || !event.assignedStaff.includes(userId)) {
        return { success: false, message: 'User is not assigned to this event or event not found.' };
    }

    setEvents(prev => ({
        ...prev,
        [eventId]: { ...event, assignedStaff: event.assignedStaff.filter(id => id !== userId) }
    }));
    return { success: true, message: 'Staff unassigned successfully.' };
  }, [hasPermission, events]);

  const unassignUserFromAllEvents = useCallback((userId: string) => {
    setEvents(prevEvents => {
      return Object.values(prevEvents).reduce((acc, event) => {
        if (event.assignedStaff.includes(userId)) {
          acc[event.id] = {
            ...event,
            assignedStaff: event.assignedStaff.filter(id => id !== userId),
          };
        } else {
          acc[event.id] = event;
        }
        return acc;
      }, {} as Record<string, Event>);
    });
  }, []);
  
  const updateUserIdInEvents = useCallback((oldId: string, newId: string) => {
    setEvents(prevEvents => {
      const newEvents = { ...prevEvents };
      Object.keys(newEvents).forEach(eventId => {
        const event = newEvents[eventId];
        if (event.assignedStaff.includes(oldId)) {
          newEvents[eventId] = { ...event, assignedStaff: event.assignedStaff.map(id => id === oldId ? newId : id) };
        }
      });
      return newEvents;
    });
  }, []);

  return (
    <EventContext.Provider value={{
      events: Object.values(events),
      activeEvent,
      createEvent, deleteEvent, setActiveEvent, clearActiveEvent,
      addParticipantToActiveEvent, logAttendanceInActiveEvent, addCheckpointToActiveEvent,
      assignStaffToEvent, unassignStaffFromEvent, unassignUserFromAllEvents,
      updateUserIdInEvents,
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = (): EventContextType => {
  const context = useContext(EventContext);
  if (context === undefined) throw new Error('useEvents must be used within an EventProvider');
  return context;
};

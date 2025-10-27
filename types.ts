import type { ReactNode } from 'react';

export interface Participant {
  name: string;
  class: string;
  id: string; // Should be unique within an event
  email?: string;
}

export type Checkpoint = string;

export interface AttendanceLog {
  [participantId: string]: {
    [checkpoint: Checkpoint]: boolean;
  };
}

export interface Event {
  id: string;
  name: string;
  date: string;
  accessKey: string;
  checkpoints: Checkpoint[];
  participants: Participant[];
  attendance: AttendanceLog;
  assignedStaff: string[]; // Array of user IDs
}

export const ALL_PERMISSIONS = {
  register_participant: 'Register Participants',
  scan_qrcode: 'Scan QR Codes',
  view_summary: 'View Event Summary',
  manage_checkpoints: 'Manage Checkpoints',
  manage_staff: 'Manage Staff Accounts',
  manage_roles: 'Manage Roles & Permissions',
  manage_events: 'Manage Events',
  supervise_team: 'Can be a Supervisor',
  communicate_with_director: 'Communicate with Director',
} as const;


export type Permission = keyof typeof ALL_PERMISSIONS;

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: string;
  name: string;
  roleId: string;
  password?: string;
  createdBy?: string;
  email?: string;
  supervisorId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  channel: 'general' | 'leadership';
  content: string;
  timestamp: Date;
}
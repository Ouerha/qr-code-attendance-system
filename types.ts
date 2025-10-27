
export interface Participant {
  name: string;
  class: string;
  id: string;
}

export type Checkpoint = 'Entry 1' | 'Entry 2' | 'Entry 3';

export const CHECKPOINTS: Checkpoint[] = ['Entry 1', 'Entry 2', 'Entry 3'];

export interface AttendanceRecord extends Participant {
  attendance: {
    [key in Checkpoint]?: boolean;
  };
}

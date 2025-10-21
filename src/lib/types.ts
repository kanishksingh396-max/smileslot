export type Appointment = {
  id: string;
  clientName: string;
  clientPhone: string;
  startTime: Date;
  endTime: Date;
  notes?: string;
};

export type TimeSlot = {
  startTime: Date;
  endTime: Date;
};

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

export type Patient = {
  id: string;
  name: string;
  phone: string;
  email: string;
  lastVisit: Date;
  totalAppointments: number;
};

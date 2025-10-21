export type Appointment = {
  id: string;
  patientId: string;
  clientName: string;
  clientPhone: string;
  startTime: Date;
  endTime: Date;
  service: string;
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
  email?: string;
  lastVisit: Date;
  totalAppointments: number;
};

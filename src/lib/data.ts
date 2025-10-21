import type { Appointment, Patient } from "@/lib/types";
import { addDays, setHours, setMinutes, startOfToday, subDays } from "date-fns";

const today = startOfToday();

export const mockAppointments: Appointment[] = [];

export const mockPatients: Patient[] = [
    {
      id: "1",
      name: "John Doe",
      phone: "123-456-7890",
      email: "john.doe@example.com",
      lastVisit: subDays(today, 20),
      totalAppointments: 5,
    },
    {
      id: "2",
      name: "Jane Smith",
      phone: "098-765-4321",
      email: "jane.smith@example.com",
      lastVisit: subDays(today, 5),
      totalAppointments: 2,
    },
    {
      id: "3",
      name: "Peter Jones",
      phone: "555-555-5555",
      email: "peter.jones@example.com",
      lastVisit: addDays(today, 1),
      totalAppointments: 8,
    },
    {
      id: "4",
      name: "Mary Johnson",
      phone: "111-222-3333",
      email: "mary.johnson@example.com",
      lastVisit: addDays(today, 2),
      totalAppointments: 3,
    },
    {
      id: "5",
      name: "Chris Lee",
      phone: "444-555-6666",
      email: "chris.lee@example.com",
      lastVisit: subDays(today, 1),
      totalAppointments: 10,
    },
];

export const workingHours = {
  start: 9, // 9 AM
  end: 17, // 5 PM
};

export const appointmentDuration = 30; // in minutes

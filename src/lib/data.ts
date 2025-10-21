import type { Appointment } from "@/lib/types";
import { addDays, setHours, setMinutes, startOfToday } from "date-fns";

const today = startOfToday();

export const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "John Doe",
    clientPhone: "123-456-7890",
    startTime: setMinutes(setHours(today, 9), 30),
    endTime: setMinutes(setHours(today, 10), 0),
    notes: "Routine check-up.",
  },
  {
    id: "2",
    clientName: "Jane Smith",
    clientPhone: "098-765-4321",
    startTime: setMinutes(setHours(today, 11), 0),
    endTime: setMinutes(setHours(today, 12), 0),
    notes: "Wisdom tooth consultation.",
  },
  {
    id: "3",
    clientName: "Peter Jones",
    clientPhone: "555-555-5555",
    startTime: setMinutes(setHours(addDays(today, 1), 14), 0),
    endTime: setMinutes(setHours(addDays(today, 1), 14), 30),
    notes: "Filling for cavity on #14.",
  },
  {
    id: "4",
    clientName: "Mary Johnson",
    clientPhone: "111-222-3333",
    startTime: setMinutes(setHours(addDays(today, 2), 10), 0),
    endTime: setMinutes(setHours(addDays(today, 2), 10), 30),
    notes: "Teeth whitening."
  },
  {
    id: "5",
    clientName: "Chris Lee",
    clientPhone: "444-555-6666",
    startTime: setMinutes(setHours(addDays(today, -1), 16), 0),
    endTime: setMinutes(setHours(addDays(today, -1), 17), 0),
    notes: "Root canal procedure.",
  },
];

export const workingHours = {
  start: 9, // 9 AM
  end: 17, // 5 PM
};

export const appointmentDuration = 30; // in minutes

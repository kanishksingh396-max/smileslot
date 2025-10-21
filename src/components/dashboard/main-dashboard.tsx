"use client";

import { useState } from "react";
import { addWeeks, subWeeks, startOfToday } from "date-fns";
import { mockAppointments } from "@/lib/data";
import type { Appointment, TimeSlot } from "@/lib/types";
import { CalendarHeader } from "./calendar-header";
import { WeeklyView } from "./weekly-view";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { AppointmentForm } from "./appointment-form";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";

export function MainDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] =
    useState<Appointment[]>(mockAppointments);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const { toast } = useToast();

  const handleAddAppointment = () => {
    setSelectedAppointment(null);
    setSelectedSlot(null);
    setIsSheetOpen(true);
  };

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedAppointment(null);
    setSelectedSlot(slot);
    setIsSheetOpen(true);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedSlot(null);
    setIsSheetOpen(true);
  };

  const handleFormSubmit = (data: Omit<Appointment, "id" | "endTime">) => {
    if (selectedAppointment) {
      // Edit existing appointment
      const updatedAppointments = appointments.map((appt) =>
        appt.id === selectedAppointment.id ? { ...appt, ...data } : appt
      );
      setAppointments(updatedAppointments);
      toast({
        title: "Appointment Updated",
        description: `Appointment for ${data.clientName} has been successfully updated.`,
      });
    } else {
      // Create new appointment
      const newAppointment = { ...data, id: Date.now().toString() };
      setAppointments([...appointments, newAppointment]);
      toast({
        title: "Appointment Scheduled",
        description: `Appointment for ${data.clientName} has been successfully scheduled.`,
      });
      // TODO: Implement actual SMS/WhatsApp notification
      console.log(`Sending confirmation to ${data.clientPhone}...`);
    }
    setIsSheetOpen(false);
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    setAppointments(appointments.filter((appt) => appt.id !== appointmentId));
    toast({
      title: "Appointment Deleted",
      description: "The appointment has been successfully deleted.",
      variant: "destructive",
    });
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-6">
      <CalendarHeader
        currentDate={currentDate}
        onPrevWeek={() => setCurrentDate(subWeeks(currentDate, 1))}
        onNextWeek={() => setCurrentDate(addWeeks(currentDate, 1))}
        onToday={() => setCurrentDate(startOfToday())}
        onAddAppointment={handleAddAppointment}
      />

      <Card className="shadow-sm">
        <WeeklyView
          currentDate={currentDate}
          appointments={appointments}
          onSlotClick={handleSlotClick}
          onAppointmentClick={handleAppointmentClick}
        />
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-md sm:max-w-lg overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="font-headline">
              {selectedAppointment ? "Edit Appointment" : "New Appointment"}
            </SheetTitle>
            <SheetDescription>
              {selectedAppointment
                ? "Update the details below."
                : "Fill in the details to schedule a new appointment."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 py-4">
            <AppointmentForm
              key={selectedAppointment?.id || "new"}
              appointment={selectedAppointment}
              slot={selectedSlot}
              onSubmit={handleFormSubmit}
              onDelete={
                selectedAppointment
                  ? () => handleDeleteAppointment(selectedAppointment.id)
                  : undefined
              }
              clientHistory="No previous appointments."
              appointmentNotes="Client reports sensitivity in the upper right quadrant."
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
import { addWeeks, subWeeks, startOfToday } from 'date-fns';
import type { Appointment, TimeSlot } from '@/lib/types';
import { CalendarHeader } from './calendar-header';
import { WeeklyView } from './weekly-view';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { AppointmentForm } from './appointment-form';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export function MainDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const appointmentsCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'dentists', user.uid, 'appointments');
  }, [firestore, user]);

  const { data: appointments, isLoading } =
    useCollection<Appointment>(appointmentsCollectionRef);

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

  const handleFormSubmit = (data: Omit<Appointment, 'id'>) => {
    if (!appointmentsCollectionRef) return;

    if (selectedAppointment) {
      // Edit existing appointment
      const docRef = doc(appointmentsCollectionRef, selectedAppointment.id);
      updateDocumentNonBlocking(docRef, data);
      toast({
        title: 'Appointment Updated',
        description: `Appointment for ${data.clientName} has been successfully updated.`,
      });
    } else {
      // Create new appointment
      addDocumentNonBlocking(appointmentsCollectionRef, data);
      toast({
        title: 'Appointment Scheduled',
        description: `Appointment for ${data.clientName} has been successfully scheduled.`,
      });
      // TODO: Implement actual SMS/WhatsApp notification
      console.log(`Sending confirmation to ${data.clientPhone}...`);
    }
    setIsSheetOpen(false);
  };

  const handleDeleteAppointment = () => {
    if (!appointmentsCollectionRef || !selectedAppointment) return;
    const docRef = doc(appointmentsCollectionRef, selectedAppointment.id);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: 'Appointment Deleted',
      description: 'The appointment has been successfully deleted.',
      variant: 'destructive',
    });
    setIsSheetOpen(false);
  };

  const appointmentsWithDates = useMemo(() => {
    return (
      appointments?.map((appt) => ({
        ...appt,
        startTime: (appt.startTime as any).toDate(),
        endTime: (appt.endTime as any).toDate(),
      })) || []
    );
  }, [appointments]);

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
          appointments={appointmentsWithDates}
          onSlotClick={handleSlotClick}
          onAppointmentClick={handleAppointmentClick}
        />
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-md sm:max-w-lg overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="font-headline">
              {selectedAppointment ? 'Edit Appointment' : 'New Appointment'}
            </SheetTitle>
            <SheetDescription>
              {selectedAppointment
                ? 'Update the details below.'
                : 'Fill in the details to schedule a new appointment.'}
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 py-4">
            <AppointmentForm
              key={selectedAppointment?.id || 'new'}
              appointment={selectedAppointment}
              slot={selectedSlot}
              onSubmit={handleFormSubmit}
              onDelete={
                selectedAppointment ? handleDeleteAppointment : undefined
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
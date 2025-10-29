'use client';

import { useState, useMemo, useEffect } from 'react';
import { addWeeks, subWeeks, startOfToday, format } from 'date-fns';
import type {
  Appointment,
  TimeSlot,
  Patient,
  ConfirmationMessage,
} from '@/lib/types';
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
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, doc, addDoc } from 'firebase/firestore';
import { Card } from '@/components/ui/card';
import { Button } from '../ui/button';
import { Plus, Menu, Users } from 'lucide-react';
import Link from 'next/link';

type MainDashboardProps = {
  appointments: Appointment[];
};

export function MainDashboard({ appointments }: MainDashboardProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const patientsCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'dentists', user.uid, 'clients');
  }, [firestore, user]);

  const appointmentsCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'dentists', user.uid, 'appointments');
  }, [firestore, user]);

  const { data: patients } =
    useCollection<Patient>(patientsCollectionRef);
    
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

  const handleFormSubmit = (
    data: Omit<Appointment, 'id' | 'clientName' | 'clientPhone'> & {
      patientId: string;
    }
  ) => {
    if (!appointmentsCollectionRef || !user) return;

    const patient = patients?.find((p) => p.id === data.patientId);
    if (!patient) {
      toast({
        title: 'Error',
        description: 'Selected patient not found.',
        variant: 'destructive',
      });
      return;
    }

    const appointmentData = {
      ...data,
      clientName: patient.name,
      clientPhone: patient.phone,
    };

    const handleSuccess = () => {
        toast({
            title: selectedAppointment ? 'Appointment Updated' : 'Appointment Scheduled',
            description: `Appointment for ${appointmentData.clientName} has been successfully ${selectedAppointment ? 'updated' : 'scheduled'}.`,
        });
    }

    if (selectedAppointment) {
      // Edit existing appointment
      const docRef = doc(appointmentsCollectionRef, selectedAppointment.id);
      updateDocumentNonBlocking(docRef, appointmentData);
      handleSuccess();
      
    } else {
      // Create new appointment
      addDocumentNonBlocking(appointmentsCollectionRef, appointmentData).then(docRef => {
        if (docRef) {
            handleSuccess();
        }
      });
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

  const handleAddPatient = async (
    patientData: Omit<
      Patient,
      'id' | 'lastVisit' | 'totalAppointments' | 'email'
    >
  ) => {
    if (!patientsCollectionRef) return;

    const newPatientData = {
      ...patientData,
      lastVisit: new Date(),
      totalAppointments: 0,
    };

    try {
      // We use addDoc here to get the doc reference with ID back
      const docRef = await addDoc(patientsCollectionRef, newPatientData);
      toast({
        title: 'Patient Added',
        description: `${patientData.name} has been successfully added.`,
      });
      return { ...newPatientData, id: docRef.id } as Patient;
    } catch (error) {
      toast({
        title: 'Error adding patient',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return undefined;
    }
  };

  if (!currentDate) {
    return null; // Or a loading spinner
  }

  return (
    <div className="space-y-6">
      <CalendarHeader
        currentDate={currentDate}
        onPrevWeek={() => setCurrentDate(subWeeks(currentDate, 1))}
        onNextWeek={() => setCurrentDate(addWeeks(currentDate, 1))}
        onToday={() => setCurrentDate(startOfToday())}
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
              patients={patients || []}
              onSubmit={handleFormSubmit}
              onDelete={
                selectedAppointment ? handleDeleteAppointment : undefined
              }
              onAddPatient={handleAddPatient}
              clientHistory="No previous appointments."
              appointmentNotes="Client reports sensitivity in the upper right quadrant."
            />
          </div>
        </SheetContent>
      </Sheet>

      <Button
        asChild
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
      >
        <Link href="/today">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Today's Appointments</span>
        </Link>
      </Button>

      <Button
        asChild
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
      >
        <Link href="/patients">
          <Users className="h-6 w-6" />
          <span className="sr-only">Patients</span>
        </Link>
      </Button>

      <Button
        onClick={handleAddAppointment}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Add Appointment</span>
      </Button>
    </div>
  );
}

'use client'

import { useMemo, useState, useEffect } from 'react';
import { AppLayout } from "@/components/app-layout";
import { MainDashboard } from "@/components/dashboard/main-dashboard";
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import type { Appointment } from '@/lib/types';
import { collection } from 'firebase/firestore';
import { addDays, subDays, startOfToday } from 'date-fns';

export default function Home() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  const appointmentsCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'dentists', user.uid, 'appointments');
  }, [firestore, user]);

  const { data: appointments } =
    useCollection<Appointment>(appointmentsCollectionRef);

  const appointmentsWithDates = useMemo(() => {
    return (
      appointments?.map((appt) => ({
        ...appt,
        startTime: (appt.startTime as any).toDate(),
        endTime: (appt.endTime as any).toDate(),
      })) || []
    );
  }, [appointments]);

  const handlePrevDay = () => {
    if (currentDate) {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNextDay = () => {
    if (currentDate) {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(startOfToday());
  };

  const handleDateSelect = (date?: Date) => {
    if (date) {
      setCurrentDate(date);
    }
  };

  if (!currentDate) {
    return null; // Or a loading spinner
  }

  return (
    <AppLayout 
      appointments={appointmentsWithDates}
      currentDate={currentDate}
      onPrevDay={handlePrevDay}
      onNextDay={handleNextDay}
      onToday={handleToday}
      onDateSelect={handleDateSelect}
    >
      <MainDashboard appointments={appointmentsWithDates} currentDate={currentDate} />
    </AppLayout>
  );
}

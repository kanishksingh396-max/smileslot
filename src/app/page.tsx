'use client'

import { useMemo } from 'react';
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

export default function Home() {
  const { user } = useUser();
  const firestore = useFirestore();

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

  return (
    <AppLayout appointments={appointmentsWithDates}>
      <MainDashboard appointments={appointmentsWithDates} />
    </AppLayout>
  );
}

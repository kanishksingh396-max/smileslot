'use client';

import { useMemo } from 'react';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { MessageCard } from './message-card';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';

export function MessagesDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const appointmentsCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'dentists', user.uid, 'appointments');
  }, [firestore, user]);

  const { data: appointments, isLoading } = useCollection<Appointment>(appointmentsCollectionRef);

  const appointmentsWithDates = useMemo(() => {
    return (
      appointments
        ?.map((appt) => ({
          ...appt,
          startTime: (appt.startTime as any).toDate(),
          endTime: (appt.endTime as any).toDate(),
        }))
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime()) || []
    );
  }, [appointments]);


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold text-foreground">
          Appointment Reminders
        </h1>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendar
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col p-4 space-y-4">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-20 w-full flex-grow" />
              <div className="flex justify-end">
                <Skeleton className="h-9 w-20" />
              </div>
            </Card>
          ))
        ) : appointmentsWithDates.length > 0 ? (
          appointmentsWithDates.map((appt) => (
            <MessageCard
              key={appt.id}
              appointment={appt}
              dentistName={user?.displayName || 'Your Clinic'}
              dentistPhone={user?.phoneNumber || 'your contact number'}
            />
          ))
        ) : (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No appointments scheduled yet.
          </div>
        )}
      </div>
    </div>
  );
}

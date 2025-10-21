'use client';

import { useMemo } from 'react';
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from '@/firebase';
import { collection } from 'firebase/firestore';
import { format, isToday } from 'date-fns';
import type { Appointment } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function TodayDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();

  const appointmentsCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'dentists', user.uid, 'appointments');
  }, [firestore, user]);

  const { data: appointments, isLoading } =
    useCollection<Appointment>(appointmentsCollectionRef);

  const todaysAppointments = useMemo(() => {
    return (
      appointments
        ?.map((appt) => ({
          ...appt,
          startTime: (appt.startTime as any).toDate(),
          endTime: (appt.endTime as any).toDate(),
        }))
        .filter((appt) => isToday(appt.startTime))
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime()) || []
    );
  }, [appointments]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold text-foreground">
          Today's Appointments
        </h1>
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Calendar
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : todaysAppointments.length > 0 ? (
              todaysAppointments.map((appt) => (
                <div
                  key={appt.id}
                  className="p-4 grid grid-cols-2 items-center"
                >
                  <div className="font-medium">
                    {format(appt.startTime, 'p')} - {format(appt.endTime, 'p')}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{appt.clientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {appt.clientPhone}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No appointments for today.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

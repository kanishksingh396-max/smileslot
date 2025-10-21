'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { differenceInMinutes, format } from 'date-fns';
import type { Appointment } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';

type NotificationsPanelProps = {
  appointments: Appointment[];
};

const NOTIFICATION_WINDOW_MINUTES = 30;

export function NotificationsPanel({ appointments }: NotificationsPanelProps) {
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [notifiedAppointmentIds, setNotifiedAppointmentIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    const checkAppointments = () => {
      const now = new Date();
      const upcoming = appointments.filter(appointment => {
        const diff = differenceInMinutes(appointment.startTime, now);
        return diff > 0 && diff <= NOTIFICATION_WINDOW_MINUTES;
      });

      setUpcomingAppointments(upcoming);

      upcoming.forEach(appt => {
        if (!notifiedAppointmentIds.has(appt.id)) {
          sendNotification(appt);
          setNotifiedAppointmentIds(prev => new Set(prev).add(appt.id));
        }
      });
    };

    const intervalId = setInterval(checkAppointments, 60000); // Check every minute
    checkAppointments(); // Initial check

    return () => clearInterval(intervalId);
  }, [appointments, notifiedAppointmentIds]);

  const sendNotification = (appointment: Appointment) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Upcoming Appointment', {
        body: `Your appointment with ${appointment.clientName} is at ${format(appointment.startTime, 'p')}.`,
        icon: '/logo.png', // Optional: you can add a logo here
      });
    }
  };
  
  const hasNotifications = upcomingAppointments.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {hasNotifications && (
             <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">{upcomingAppointments.length}</Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Upcoming Appointments</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasNotifications ? (
          upcomingAppointments.map(appt => (
            <DropdownMenuItem key={appt.id} className="flex flex-col items-start gap-1">
              <p className="font-semibold">{appt.clientName}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>
                  {format(appt.startTime, 'p')} - {format(appt.endTime, 'p')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{appt.service}</p>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-sm text-center text-muted-foreground">
            No upcoming appointments in the next 30 minutes.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

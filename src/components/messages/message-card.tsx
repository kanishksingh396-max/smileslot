'use client';

import React from 'react';
import type { Appointment } from '@/lib/types';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type MessageCardProps = {
  appointment: Appointment;
  dentistName: string;
  dentistPhone: string;
};

export function MessageCard({
  appointment,
  dentistName,
  dentistPhone,
}: MessageCardProps) {
  const messageBody = `Hi ${appointment.clientName}, this is a reminder for your appointment at ${dentistName} on ${format(appointment.startTime, 'PPP')} at ${format(appointment.startTime, 'p')}. Please call ${dentistPhone} to reschedule. We look forward to seeing you!`;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">{appointment.clientName}</CardTitle>
        <CardDescription>
          {format(appointment.startTime, 'PPP')} at {format(appointment.startTime, 'p')}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <Textarea
          value={messageBody}
          readOnly
          className="h-40 resize-none"
        />
      </CardContent>
    </Card>
  );
}

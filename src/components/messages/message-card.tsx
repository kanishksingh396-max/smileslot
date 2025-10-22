'use client';

import React, { useState } from 'react';
import type { Appointment } from '@/lib/types';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { sendAppointmentSMS } from '@/ai/utils/smsService.js';

type MessageCardProps = {
  appointment: Appointment;
  dentistName: string;
  dentistPhone: string;
  onUpdate: (appointmentId: string, newMessageBody: string) => void;
};

export function MessageCard({
  appointment,
  dentistName,
  dentistPhone,
  onUpdate,
}: MessageCardProps) {
  const initialMessage = `Hi ${appointment.clientName}, this is a reminder for your appointment at ${dentistName} on ${format(appointment.startTime, 'PPP')} at ${format(appointment.startTime, 'p')}. Please call ${dentistPhone} to reschedule. We look forward to seeing you!`;

  const [messageBody, setMessageBody] = useState(initialMessage);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = () => {
    onUpdate(appointment.id, messageBody);
    setIsEditing(false);
  };
  
  const handleSend = async () => {
    await sendAppointmentSMS(appointment.clientPhone, messageBody);
  }

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
          onChange={(e) => {
            setMessageBody(e.target.value);
            if (!isEditing) setIsEditing(true);
          }}
          className="h-40 resize-none"
        />
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing && (
          <Button variant="outline" onClick={handleUpdate}>
            Save
          </Button>
        )}
        <Button onClick={handleSend}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}

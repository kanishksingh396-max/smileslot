'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment, ConfirmationMessage } from '@/lib/types';

type CalendarHeaderProps = {
  currentDate: Date;
};

export function CalendarHeader({
  currentDate,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-headline font-semibold text-foreground">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
      </div>
    </div>
  );
}

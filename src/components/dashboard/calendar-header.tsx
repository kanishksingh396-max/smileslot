'use client';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Appointment, ConfirmationMessage } from '@/lib/types';

type CalendarHeaderProps = {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
};

export function CalendarHeader({
  currentDate,
  onPrevWeek,
  onNextWeek,
  onToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-headline font-semibold text-foreground">
          {format(currentDate, 'MMMM yyyy')}
        </h1>
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={onPrevWeek}
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="px-3 h-8"
            onClick={onToday}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
            onClick={onNextWeek}
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

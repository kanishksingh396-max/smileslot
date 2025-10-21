"use client";

import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

type CalendarHeaderProps = {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onAddAppointment: () => void;
};

export function CalendarHeader({
  currentDate,
  onPrevWeek,
  onNextWeek,
  onToday,
  onAddAppointment,
}: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-headline font-semibold text-foreground">
          {format(currentDate, "MMMM yyyy")}
        </h1>
        <div className="flex items-center gap-1 rounded-md border p-0.5">
          <Button variant="ghost" size="icon" onClick={onPrevWeek} aria-label="Previous week">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="px-4" onClick={onToday}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={onNextWeek} aria-label="Next week">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button onClick={onAddAppointment} className="bg-accent text-accent-foreground hover:bg-accent/90">
          <Plus className="mr-2 h-4 w-4" /> Add Appointment
        </Button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  eachDayOfInterval,
  endOfWeek,
  format,
  startOfWeek,
  setHours,
  setMinutes,
  getHours,
  getMinutes,
  isSameDay,
  isWithinInterval,
  addMinutes,
  isBefore,
  isToday,
  startOfDay,
} from "date-fns";
import type { Appointment, TimeSlot } from "@/lib/types";
import { workingHours, appointmentDuration } from "@/lib/data";
import { AppointmentCard } from "./appointment-card";
import { cn } from "@/lib/utils";

type WeeklyViewProps = {
  currentDate: Date;
  appointments: Appointment[];
  onSlotClick: (slot: TimeSlot) => void;
  onAppointmentClick: (appointment: Appointment) => void;
};

export function WeeklyView({
  currentDate,
  appointments,
  onSlotClick,
  onAppointmentClick,
}: WeeklyViewProps) {
  const week = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  });

  const slotsPerHour = 60 / appointmentDuration;
  const timeSlots = Array.from(
    { length: (workingHours.end - workingHours.start) * slotsPerHour },
    (_, i) => {
      const totalMinutes = i * appointmentDuration;
      const hour = workingHours.start + Math.floor(totalMinutes / 60);
      const minute = totalMinutes % 60;
      return setMinutes(setHours(startOfDay(currentDate), hour), minute);
    }
  );

  const getAppointmentRowSpan = (appointment: Appointment) => {
    const duration =
      (appointment.endTime.getTime() - appointment.startTime.getTime()) /
      (1000 * 60);
    return Math.ceil(duration / appointmentDuration);
  };

  return (
    <div className="grid grid-cols-[auto_repeat(7,_1fr)] overflow-x-auto">
      <div className="col-start-1" />
      {week.map((day) => (
        <div key={day.toString()} className="text-center py-2 border-b border-l">
          <p className="text-sm text-muted-foreground">{format(day, "EEE")}</p>
          <p
            className={cn(
              "text-2xl font-medium",
              isToday(day) && "text-primary"
            )}
          >
            {format(day, "d")}
          </p>
        </div>
      ))}

      {timeSlots.map((time, timeIndex) => (
        <React.Fragment key={time.toString()}>
          <div className="row-start-[--row-start] pr-2 text-right text-xs text-muted-foreground -mt-2" style={{ '--row-start': timeIndex + 2 } as React.CSSProperties}>
            {format(time, "p")}
          </div>
          {week.map((day, dayIndex) => {
            const slotStart = setMinutes(
              setHours(day, getHours(time)),
              getMinutes(time)
            );
            const slotEnd = addMinutes(slotStart, appointmentDuration);
            const appointmentsInSlot = appointments.filter(
              (appt) =>
                isSameDay(appt.startTime, day) &&
                getHours(appt.startTime) === getHours(time) &&
                getMinutes(appt.startTime) === getMinutes(time)
            );

            return (
              <div
                key={day.toString() + time.toString()}
                className="relative row-start-[--row-start] h-16 border-t border-l"
                style={{ '--row-start': timeIndex + 2 } as React.CSSProperties}
              >
                {appointmentsInSlot.length > 0 ? (
                  appointmentsInSlot.map((appt) => (
                    <div
                      key={appt.id}
                      className="absolute inset-0.5 z-10"
                      style={{
                        gridRow: `span ${getAppointmentRowSpan(appt)}`,
                      }}
                    >
                      <AppointmentCard
                        appointment={appt}
                        onClick={() => onAppointmentClick(appt)}
                      />
                    </div>
                  ))
                ) : (
                  <button
                    onClick={() => onSlotClick({ startTime: slotStart, endTime: slotEnd })}
                    disabled={isBefore(slotStart, new Date())}
                    className="absolute inset-0 w-full h-full hover:bg-primary/5 transition-colors disabled:bg-muted/50"
                    aria-label={`Schedule appointment for ${format(day, 'MMMM do')} at ${format(time, 'p')}`}
                  />
                )}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

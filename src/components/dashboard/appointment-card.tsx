import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Appointment } from "@/lib/types";
import { format } from "date-fns";
import { Clock } from "lucide-react";

type AppointmentCardProps = {
  appointment: Appointment;
  onClick: () => void;
};

export function AppointmentCard({
  appointment,
  onClick,
}: AppointmentCardProps) {
  return (
    <Card
      onClick={onClick}
      className="w-full h-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex flex-col justify-center rounded-lg shadow-md"
    >
      <CardHeader className="p-2">
        <CardTitle className="text-sm font-semibold truncate">
          {appointment.clientName}
        </CardTitle>
        <CardDescription className="flex items-center gap-1.5 text-xs text-primary-foreground/80">
          <Clock className="w-3 h-3" />
          <span>
            {format(appointment.startTime, "p")} -{" "}
            {format(appointment.endTime, "p")}
          </span>
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

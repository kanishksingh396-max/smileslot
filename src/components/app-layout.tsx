'use client';

import Link from "next/link";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { useAuth, useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { Users, LogOut, LogIn, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { NotificationsPanel } from "./dashboard/notifications-panel";
import type { Appointment, ConfirmationMessage } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";

type AppLayoutProps = {
  children: React.ReactNode;
  appointments?: Appointment[];
  messages?: ConfirmationMessage[];
  currentDate?: Date;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onToday?: () => void;
  onDateSelect?: (date?: Date) => void;
};

export function AppLayout({ children, appointments = [], messages = [], currentDate, onPrevDay, onNextDay, onToday, onDateSelect }: AppLayoutProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    auth.signOut();
    router.push("/login");
  };

  const appointmentDates = useMemo(() => {
    return appointments.map(appt => appt.startTime);
  }, [appointments]);

  return (
      <div className="flex flex-col min-h-screen">
        <header className="flex h-16 items-center gap-4 border-b bg-card px-2 sm:px-4 shadow-sm md:px-6 justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-semibold font-headline">SmileSLot</span>
            </Link>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
              {currentDate && onPrevDay && onNextDay && onDateSelect && onToday && (
                 <div className="flex items-center gap-1 rounded-md border p-0.5">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={onPrevDay}
                        aria-label="Previous day"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="px-2 sm:px-3 h-8 text-sm"
                            >
                                {format(currentDate, 'MMMM d')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="center">
                          <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={onDateSelect}
                            initialFocus
                            modifiers={{ scheduled: appointmentDates }}
                            modifiersClassNames={{
                              scheduled: "font-bold text-destructive",
                            }}
                          />
                          <Button
                              onClick={onToday}
                              className="w-[calc(100%-1rem)] mx-2 mb-2"
                              variant="outline"
                          >
                            Go to Today
                          </Button>
                        </PopoverContent>
                      </Popover>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0"
                        onClick={onNextDay}
                        aria-label="Next day"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
              )}
              <Button asChild variant="outline" size="icon" className="h-9 w-9">
                  <Link href="/messages">
                      <MessageSquare className="h-5 w-5" />
                      <span className="sr-only">Messages</span>
                  </Link>
              </Button>
              <NotificationsPanel appointments={appointments} />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          {children}
        </main>

        <div className="mt-auto p-4 flex justify-center">
            {isUserLoading ? null : user ? (
              <div className="flex items-center gap-3 p-2 rounded-full bg-primary text-primary-foreground">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
                  <AvatarFallback>{user.displayName?.[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 grow">
                  <p className="text-sm font-medium leading-none truncate">{user.displayName}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-primary/90 hover:text-primary-foreground">
                  <LogOut />
                </Button>
              </div>
            ) : (
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Link>
              </Button>
            )}
        </div>

        <footer className="p-4 text-center text-xs text-muted-foreground">
            © 2024 SmileSLot. All rights reserved.
          </footer>
      </div>
  );
}

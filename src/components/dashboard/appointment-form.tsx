'use client';

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, setHours, setMinutes, parse, addMinutes } from 'date-fns';
import {
  suggestOptimalSlots,
  type SuggestOptimalSlotsOutput,
} from '@/ai/flows/intelligent-slot-suggestions';
import { workingHours, appointmentDuration, dentalServices } from '@/lib/data';
import type { Appointment, TimeSlot, Patient } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  CalendarIcon,
  Loader2,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PatientForm } from '../patients/patient-form';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

const formSchema = z.object({
  patientId: z.string().min(1, 'Please select a patient.'),
  date: z.date({ required_error: 'A date is required.' }),
  time: z.string({ required_error: 'A time is required.' }),
  service: z.string({ required_error: 'A service is required.' }),
  notes: z.string().optional(),
});

type AppointmentFormProps = {
  appointment?: Appointment | null;
  slot?: TimeSlot | null;
  patients: Patient[];
  onSubmit: (data: Omit<Appointment, 'id' | 'clientName' | 'clientPhone'> & {patientId: string}) => void;
  onDelete?: () => void;
  onAddPatient: (patient: Omit<Patient, 'id'| 'lastVisit' | 'totalAppointments' | 'email'>) => Promise<Patient | undefined>;
  clientHistory: string;
  appointmentNotes: string;
};

export function AppointmentForm({
  appointment,
  slot,
  patients,
  onSubmit,
  onDelete,
  onAddPatient,
  clientHistory,
  appointmentNotes,
}: AppointmentFormProps) {
  const [aiSuggestions, setAiSuggestions] =
    useState<SuggestOptimalSlotsOutput>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false);

  const selectedPatient = useMemo(() => {
    return patients.find((p) => p.id === appointment?.patientId);
  }, [appointment, patients]);

  const defaultValues = useMemo(
    () => ({
      patientId: appointment?.patientId || '',
      date: appointment?.startTime || slot?.startTime || new Date(),
      time: format(
        appointment?.startTime || slot?.startTime || new Date(),
        'HH:mm'
      ),
      service: appointment?.service || '',
      notes: appointment?.notes || '',
    }),
    [appointment, slot]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const timeOptions = useMemo(() => {
    const options = [];
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      for (let min = 0; min < 60; min += appointmentDuration) {
        options.push(
          format(setMinutes(setHours(new Date(), hour), min), 'HH:mm')
        );
      }
    }
    return options;
  }, []);

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    const [hours, minutes] = values.time.split(':').map(Number);
    const startTime = setMinutes(setHours(values.date, hours), minutes);
    const endTime = addMinutes(startTime, appointmentDuration);
    onSubmit({ ...values, startTime, endTime });
  }

  async function handleAddPatient(data: Omit<Patient, 'id'| 'lastVisit' | 'totalAppointments' | 'email'>) {
    const newPatient = await onAddPatient(data);
    if (newPatient) {
      form.setValue('patientId', newPatient.id);
    }
    setIsPatientDialogOpen(false);
  }

  async function handleAiSuggest() {
    setIsAiLoading(true);
    setAiSuggestions([]);
    try {
      const availableTimeSlots = timeOptions.map((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        const startTime = setMinutes(
          setHours(form.getValues('date'), hours),
          minutes
        );
        const endTime = addMinutes(startTime, appointmentDuration);
        return {
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
        };
      });

      const suggestions = await suggestOptimalSlots({
        clientHistory,
        appointmentNotes,
        desiredAppointmentLengthMinutes: appointmentDuration,
        availableTimeSlots,
      });
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('AI suggestion failed:', error);
    } finally {
      setIsAiLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="patientId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Patient</FormLabel>
              <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-full justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? patients.find(
                            (patient) => patient.id === field.value
                          )?.name
                        : "Select patient"}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder="Search patient..." />
                    <CommandList>
                      <CommandEmpty>No patient found.</CommandEmpty>
                      <CommandGroup>
                        {patients.map((patient) => (
                          <CommandItem
                            value={patient.name}
                            key={patient.id}
                            onSelect={() => {
                              form.setValue("patientId", patient.id)
                            }}
                          >
                            {patient.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

                <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Patient</DialogTitle>
                    </DialogHeader>
                    <PatientForm onSubmit={handleAddPatient} />
                  </DialogContent>
                </Dialog>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
       
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Time</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {format(parse(time, 'HH:mm', new Date()), 'p')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {dentalServices.map((service) => (
                    <SelectItem key={service} value={service}>
                      {service}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAiSuggest}
            disabled={isAiLoading}
          >
            {isAiLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
            )}
            Intelligent Slot Finder
          </Button>
          {aiSuggestions.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>AI Suggestions</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-2">
                  {aiSuggestions.slice(0, 3).map((s, i) => (
                    <li
                      key={i}
                      className="text-sm p-2 rounded-md border bg-background hover:bg-muted cursor-pointer"
                      onClick={() =>
                        form.setValue('time', format(new Date(s.startTime), 'HH:mm'))
                      }
                    >
                      <p className="font-semibold">
                        {format(new Date(s.startTime), 'p')}
                      </p>
                      <p className="text-muted-foreground">{s.reason}</p>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Internal notes about the treatment..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between pt-4">
          <div>
            {onDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="destructive">
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the appointment.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          <Button type="submit">
            {appointment ? 'Save Changes' : 'Schedule Appointment'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

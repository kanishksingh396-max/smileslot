'use server';

/**
 * @fileOverview A Genkit flow for suggesting optimal appointment slots based on client history and appointment notes.
 *
 * - suggestOptimalSlots - A function that suggests optimal appointment slots.
 * - SuggestOptimalSlotsInput - The input type for the suggestOptimalSlots function.
 * - SuggestOptimalSlotsOutput - The return type for the suggestOptimalSlots function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalSlotsInputSchema = z.object({
  clientHistory: z.string().describe('The client\u0027s appointment history.'),
  appointmentNotes: z.string().describe('Notes from previous appointments.'),
  desiredAppointmentLengthMinutes: z.number().describe('The desired length of the new appointment in minutes.'),
  availableTimeSlots: z.array(z.object({
    startTime: z.string().describe('Start time of the available slot (ISO format).'),
    endTime: z.string().describe('End time of the available slot (ISO format).'),
  })).describe('Available time slots for the appointment.'),
});
export type SuggestOptimalSlotsInput = z.infer<typeof SuggestOptimalSlotsInputSchema>;

const SuggestOptimalSlotsOutputSchema = z.array(z.object({
  startTime: z.string().describe('Suggested start time (ISO format).'),
  endTime: z.string().describe('Suggested end time (ISO format).'),
  reason: z.string().describe('Reason for suggesting this time slot.'),
})).describe('Suggested optimal time slots with reasons.');
export type SuggestOptimalSlotsOutput = z.infer<typeof SuggestOptimalSlotsOutputSchema>;

export async function suggestOptimalSlots(input: SuggestOptimalSlotsInput): Promise<SuggestOptimalSlotsOutput> {
  return intelligentSlotSuggestionsFlow(input);
}

const suggestOptimalSlotsPrompt = ai.definePrompt({
  name: 'suggestOptimalSlotsPrompt',
  input: {schema: SuggestOptimalSlotsInputSchema},
  output: {schema: SuggestOptimalSlotsOutputSchema},
  prompt: `You are an AI assistant helping a dentist schedule appointments.

  Based on the client history, appointment notes, and desired appointment length, suggest the optimal time slots from the available options.
  Consider preparation and documentation needs when making your suggestions.  Explain the reasoning for each suggestion.

  Client History: {{{clientHistory}}}
  Appointment Notes: {{{appointmentNotes}}}
  Desired Appointment Length (minutes): {{{desiredAppointmentLengthMinutes}}}
  Available Time Slots: {{{availableTimeSlots}}}

  Format your response as a JSON array of objects, each with a startTime, endTime, and reason field.
  `,
});

const intelligentSlotSuggestionsFlow = ai.defineFlow(
  {
    name: 'intelligentSlotSuggestionsFlow',
    inputSchema: SuggestOptimalSlotsInputSchema,
    outputSchema: SuggestOptimalSlotsOutputSchema,
  },
  async input => {
    const {output} = await suggestOptimalSlotsPrompt(input);
    return output!;
  }
);

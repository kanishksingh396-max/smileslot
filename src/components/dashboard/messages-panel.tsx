'use client';

import React from 'react';
import type { ConfirmationMessage } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Calendar, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';
import Link from 'next/link';

type MessagesPanelProps = {
  messages: ConfirmationMessage[];
};

export function MessagesPanel({ messages }: MessagesPanelProps) {
  const hasMessages = messages.length > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <MessageSquare className="h-5 w-5" />
          {hasMessages && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0"
            >
              {messages.length}
            </Badge>
          )}
          <span className="sr-only">Messages</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Recent Confirmation Messages</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hasMessages ? (
          messages.slice(0, 3).map((msg) => (
            <DropdownMenuItem
              key={msg.id}
              className="flex flex-col items-start gap-1.5"
            >
              <p className="font-semibold">{msg.patientName}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-3 w-3" />
                <span>{msg.patientPhone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{msg.appointmentDate} at {msg.appointmentTime}</span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{msg.messageBody}</p>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-sm text-center text-muted-foreground">
            No new appointment confirmations.
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
            <Link href="/messages" className='cursor-pointer justify-center'>
                View All Messages
            </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

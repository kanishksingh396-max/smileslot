"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Patient } from "@/lib/types";
import { mockPatients } from "@/lib/data";
import { PatientForm } from "./patient-form";
import { PatientsTable } from "./patients-table";

export function PatientsDashboard() {
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsSheetOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsSheetOpen(true);
  };

  const handleFormSubmit = (data: Omit<Patient, "id" | "lastVisit" | "totalAppointments">) => {
    if (selectedPatient) {
      // Edit existing patient
      const updatedPatients = patients.map((p) =>
        p.id === selectedPatient.id
          ? { ...selectedPatient, ...data }
          : p
      );
      setPatients(updatedPatients);
      toast({
        title: "Patient Updated",
        description: `Information for ${data.name} has been successfully updated.`,
      });
    } else {
      // Create new patient
      const newPatient: Patient = {
        ...data,
        id: Date.now().toString(),
        lastVisit: new Date(),
        totalAppointments: 0,
      };
      setPatients([newPatient, ...patients]);
      toast({
        title: "Patient Added",
        description: `${data.name} has been successfully added to your records.`,
      });
    }
    setIsSheetOpen(false);
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter((p) => p.id !== patientId));
    toast({
      title: "Patient Deleted",
      description: "The patient has been successfully deleted.",
      variant: "destructive",
    });
    setIsSheetOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-headline font-semibold text-foreground">
          Patients
        </h1>
        <Button onClick={handleAddPatient}>
          <Plus className="mr-2 h-4 w-4" /> Add Patient
        </Button>
      </div>

      <PatientsTable patients={patients} onEdit={handleEditPatient} />

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full max-w-md sm:max-w-lg overflow-y-auto">
          <SheetHeader className="px-6 pt-6">
            <SheetTitle className="font-headline">
              {selectedPatient ? "Edit Patient" : "New Patient"}
            </SheetTitle>
            <SheetDescription>
              {selectedPatient
                ? "Update the details below."
                : "Fill in the details to add a new patient."}
            </SheetDescription>
          </SheetHeader>
          <div className="px-6 py-4">
            <PatientForm
              key={selectedPatient?.id || "new"}
              patient={selectedPatient}
              onSubmit={handleFormSubmit}
              onDelete={
                selectedPatient
                  ? () => handleDeletePatient(selectedPatient.id)
                  : undefined
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

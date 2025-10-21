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
import { PatientForm } from "./patient-form";
import { PatientsTable } from "./patients-table";
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking,
} from '@/firebase';
import { collection, doc } from 'firebase/firestore';

export function PatientsDashboard() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const patientsCollectionRef = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, 'dentists', user.uid, 'clients');
  }, [firestore, user]);

  const { data: patients, isLoading } = useCollection<Patient>(patientsCollectionRef);

  const handleAddPatient = () => {
    setSelectedPatient(null);
    setIsSheetOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsSheetOpen(true);
  };

  const handleFormSubmit = (data: Omit<Patient, "id" | "lastVisit" | "totalAppointments" | "email">) => {
    if (!patientsCollectionRef) return;

    if (selectedPatient) {
      // Edit existing patient
      const docRef = doc(patientsCollectionRef, selectedPatient.id);
      updateDocumentNonBlocking(docRef, data);
      toast({
        title: "Patient Updated",
        description: `Information for ${data.name} has been successfully updated.`,
      });
    } else {
      // Create new patient
      const newPatient = {
        ...data,
        lastVisit: new Date(),
        totalAppointments: 0,
      };
      addDocumentNonBlocking(patientsCollectionRef, newPatient);
      toast({
        title: "Patient Added",
        description: `${data.name} has been successfully added to your records.`,
      });
    }
    setIsSheetOpen(false);
  };

  const handleDeletePatient = (patientId: string) => {
    if (!patientsCollectionRef) return;
    const docRef = doc(patientsCollectionRef, patientId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Patient Deleted",
      description: "The patient has been successfully deleted.",
      variant: "destructive",
    });
    setIsSheetOpen(false);
  };

  const patientsWithDates = (patients || []).map(p => ({
    ...p,
    lastVisit: (p.lastVisit as any)?.toDate ? (p.lastVisit as any).toDate() : new Date(p.lastVisit),
  }));

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

      <PatientsTable patients={patientsWithDates} onEdit={handleEditPatient} isLoading={isLoading} />

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

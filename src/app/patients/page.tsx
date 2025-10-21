import { AppLayout } from "@/components/app-layout";
import { PatientsDashboard } from "@/components/patients/patients-dashboard";

export default function PatientsPage() {
  return (
    <AppLayout>
      <PatientsDashboard />
    </AppLayout>
  );
}

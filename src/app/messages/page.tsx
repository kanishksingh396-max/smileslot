import { AppLayout } from "@/components/app-layout";
import { MessagesDashboard } from "@/components/messages/messages-dashboard";

export default function MessagesPage() {
  return (
    <AppLayout>
      <MessagesDashboard />
    </AppLayout>
  );
}

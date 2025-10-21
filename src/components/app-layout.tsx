'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth, useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Calendar, Users, LogOut, LogIn } from "lucide-react";

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    auth.signOut();
    router.push("/login");
  };

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          {isUserLoading ? null : user ? (
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
                <AvatarFallback>{user.displayName?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 grow">
                <p className="text-sm font-medium leading-none truncate">{user.displayName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut />
              </Button>
            </div>
          ) : (
             <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/login">
                    <LogIn />
                    Log In
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <Calendar />
                  Appointments
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/patients">
                  <Users />
                  Patients
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 shadow-sm md:px-6 justify-between">
          <SidebarTrigger />
          <div className="flex items-center gap-3">
              <span className="text-xl font-semibold font-headline">SmileSlot</span>
            </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

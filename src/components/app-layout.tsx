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

const Tooth = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9.34 4.16c.33.1.66.2.99.3.42.14.86.27 1.32.4.7.2 1.43.37 2.18.52.8.16 1.6.26 2.4.3.5.02 1-.02 1.5-.12.58-.12 1.16-.3 1.7-.52 1-.43 1.8-1.04 2.2-1.9.1-.2.17-.4.2-.6.06-.4-.03-.8-.2-1.1-.14-.24-.34-.44-.58-.58-.35-.2-.75-.27-1.15-.22-.4.05-1.18.1-1.78.16-.7.06-1.3.1-1.8.13-.5.02-1-.02-1.5-.12-.6-.12-1.2-.3-1.8-.52-.7-.25-1.4-.5-2.1-.7-.5-.14-1-.26-1.5-.33C8.6 3.2 7.72 3.2 7.15 3.5c-.7.4-1.1 1.2-1.1 2.1 0 .5.1 1 .3 1.5.3.7.7 1.3 1.2 1.9.5.6 1.1 1.2 1.7 1.7.6.5 1.2 1 1.7 1.5.5.5 1.1.9 1.6 1.4.6.5 1.1 1 1.5 1.5.3.4.6.8.8 1.2.2.4.3.9.2 1.4s-.3.9-.6 1.3c-.3.4-.7.7-1.1.9-.5.2-1 .3-1.5.3s-1-.1-1.5-.2c-.4-.1-.8-.2-1.2-.4s-.8-.3-1.2-.5c-.4-.2-.8-.4-1.2-.6-.4-.2-.8-.5-1.1-.8-.4-.3-.7-.7-1-1.1-.3-.4-.5-.8-.6-1.3-.1-.5 0-1 .1-1.4.1-.5.3-1 .5-1.4" />
  </svg>
);

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
          <div className="flex items-center gap-3 p-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Tooth className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold font-headline">SmileSlot</span>
          </div>
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
        <SidebarFooter>
          {isUserLoading ? null : user ? (
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL ?? ""} alt={user.displayName ?? ""} />
                <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1 grow">
                <p className="text-sm font-medium leading-none truncate">{user.displayName ?? user.email}</p>
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
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 shadow-sm md:px-6 justify-between">
          <SidebarTrigger />
          <h1 className="text-lg font-semibold md:text-2xl"></h1>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

'use client';

import Link from "next/link";
import { Button } from "./ui/button";
import { useAuth, useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useRouter } from "next/navigation";
import { Users, LogOut, LogIn } from "lucide-react";

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
      <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 shadow-sm md:px-6 justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-semibold font-headline">SmileSlot</span>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
          {children}
        </main>

        <div className="mt-auto p-4 flex justify-center">
            {isUserLoading ? null : user ? (
              <div className="flex items-center gap-3 p-2 border rounded-full">
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
              <Button asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Link>
              </Button>
            )}
        </div>

        <footer className="p-4 text-center text-xs text-muted-foreground">
            © 2024 SmileSlot. All rights reserved.
          </footer>
      </div>
  );
}


import Link from "next/link";
import { Button } from "./ui/button";

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
    <path d="M9.34 4.16c.33.1.66.2.99.3.42.14.86.27 1.32.4.7.2 1.43.37 2.18.52.8.16 1.6.26 2.4.3.5.02 1-.02 1.5-.12.58-.12 1.16-.3 1.7-.52 1-.43 1.8-1.04 2.2-1.9.1-.2.17-.4.2-.6.06-.4-.03-..8-.2-1.1-.14-.24-.34-.44-.58-.58-.35-.2-.75-.27-1.15-.22-.4.05-1.18.1-1.78.16-.7.06-1.3.1-1.8.13-.5.02-1-.02-1.5-.12-.6-.12-1.2-.3-1.8-.52-.7-.25-1.4-.5-2.1-.7-.5-.14-1-.26-1.5-.33C8.6 3.2 7.72 3.2 7.15 3.5c-.7.4-1.1 1.2-1.1 2.1 0 .5.1 1 .3 1.5.3.7.7 1.3 1.2 1.9.5.6 1.1 1.2 1.7 1.7.6.5 1.2 1 1.7 1.5.5.5 1.1.9 1.6 1.4.6.5 1.1 1 1.5 1.5.3.4.6.8.8 1.2.2.4.3.9.2 1.4s-.3.9-.6 1.3c-.3.4-.7.7-1.1.9-.5.2-1 .3-1.5.3s-1-.1-1.5-.2c-.4-.1-.8-.2-1.2-.4s-.8-.3-1.2-.5c-.4-.2-.8-.4-1.2-.6-.4-.2-.8-.5-1.1-.8-.4-.3-.7-.7-1-1.1-.3-.4-.5-.8-.6-1.3-.1-.5 0-1 .1-1.4.1-.5.3-1 .5-1.4" />
  </svg>
);

type AppLayoutProps = {
  children: React.ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-card px-4 shadow-sm md:px-6 justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Tooth className="h-5 w-5" />
            </div>
            <span className="text-xl font-semibold font-headline">DentalFlow</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/">Appointments</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/patients">Patients</Link>
          </Button>
        </nav>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

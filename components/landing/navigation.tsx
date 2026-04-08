import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function Navigation({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-2xl text-primary font-heading">Jolene</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href={isLoggedIn ? "/dashboard" : "/login"} className={buttonVariants({ variant: "default" })}>
            {isLoggedIn ? "Dashboard" : "Login"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

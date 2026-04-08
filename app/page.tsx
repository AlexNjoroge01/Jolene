import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import { auth } from "@/lib/auth";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navigation isLoggedIn={isLoggedIn} />
      <main className="flex-1 overflow-hidden">
        <Hero isLoggedIn={isLoggedIn} />
        <About />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

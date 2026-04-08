import { Navigation } from "@/components/landing/navigation";
import { Hero } from "@/components/landing/hero";
import { About } from "@/components/landing/about";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      <Navigation />
      <main className="flex-1 overflow-hidden">
        <Hero />
        <About />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

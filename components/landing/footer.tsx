import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-primary font-heading">Jolene</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Empowering your workflows with instant, beautiful reporting solutions and data management.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground tracking-wide">Product</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#about" className="hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground tracking-wide">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground tracking-wide">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 text-center text-sm text-muted-foreground border-t border-border/40 pt-8">
          <p>&copy; {new Date().getFullYear()} Jolene. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

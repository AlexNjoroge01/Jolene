import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, FileText } from "lucide-react";

export function About() {
  const features = [
    {
      title: "Lightning Fast",
      description: "Generate comprehensive reports in seconds with our optimized PDF engine.",
      icon: <Zap className="h-6 w-6 text-primary" />,
    },
    {
      title: "Secure & Reliable",
      description: "Your data is protected with enterprise-grade security and reliability.",
      icon: <Shield className="h-6 w-6 text-primary" />,
    },
    {
      title: "Dynamic Reports",
      description: "Create stunning, customizable reports that are designed to impress.",
      icon: <FileText className="h-6 w-6 text-primary" />,
    },
  ];

  return (
    <section id="about" className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-16 md:py-24 bg-muted/30 rounded-[3rem] my-12">
      <div className="text-center space-y-4">
        <Badge variant="secondary" className="px-4 py-1 text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80">Why Jolene?</Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">What makes us different</h2>
        <p className="mx-auto max-w-[800px] text-muted-foreground text-lg">
          Jolene is designed to simplify your complex data into beautiful reports seamlessly. We focus on design, speed, and reliability.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature, idx) => (
          <Card key={idx} className="border-border/50 shadow-sm hover:shadow-md transition-shadow bg-card">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                {feature.icon}
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

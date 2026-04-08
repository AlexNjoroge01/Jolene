import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQ() {
  const faqs = [
    {
      question: "What exactly is Jolene?",
      answer: "Jolene is a powerful platform that helps teams manage data and generate beautiful, structured PDF reports almost instantly."
    },
    {
      question: "Is my data secure?",
      answer: "Yes! We employ strict data security measures, ensuring all your reports and internal metrics remain completely private and safe."
    },
    {
      question: "Can I customize the report designs?",
      answer: "Absolutely. While Jolene provides stunning default templates, you have the flexibility to tailor colors, logos, and structure to match your brand seamlessly."
    },
    {
      question: "Do you offer customer support?",
      answer: "We offer 24/7 dedicated support for all our users to help you smoothly integrate Jolene into your existing daily workflows."
    }
  ];

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-lg">
            Got questions? We have answers.
          </p>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
             <AccordionItem key={index} value={`item-${index}`} className="border-border/50 py-2">
               <AccordionTrigger className="text-left text-lg font-medium hover:text-primary transition-colors">{faq.question}</AccordionTrigger>
               <AccordionContent className="text-base text-muted-foreground leading-relaxed">
                 {faq.answer}
               </AccordionContent>
             </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

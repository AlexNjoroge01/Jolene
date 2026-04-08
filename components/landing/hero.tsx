"use client";

import { motion } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function Hero({ isLoggedIn }: { isLoggedIn?: boolean }) {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-10 py-24 text-center md:py-32 lg:py-40">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Meet <span className="text-primary">Jolene</span>
        </h1>
        <p className="mx-auto max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Your vibrant, AI-powered assistant for generating beautiful reports and seamless workflows. Discover the future of productivity today.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        <Link href={isLoggedIn ? "/dashboard" : "/login"} className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto h-12 px-8 text-base shadow-lg shadow-primary/20")}>
          {isLoggedIn ? "Go to Dashboard" : "Login to Dashboard"}
        </Link>
        <Link href="#about" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto h-12 px-8 text-base bg-background")}>
          Learn More
        </Link>
      </motion.div>
    </section>
  );
}

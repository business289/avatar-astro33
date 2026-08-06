import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import CosmicBackground from "@/components/CosmicBackground";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <CosmicBackground />
      <div className="grain-overlay" />

      <div className="relative z-10 flex min-h-screen flex-col px-4 py-10 md:py-16">
        <div className="mb-10 flex justify-center">
          <Link to="/" className="group flex items-center gap-2 select-none">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5 text-[#BC6A4D] transition-transform duration-500 group-hover:rotate-90"
            >
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
            <span className="font-display text-lg font-bold tracking-[0.25em] text-[#BC6A4D]">
              SPIRITUAL
            </span>
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass-card rounded-3xl border border-border/30 p-6 shadow-[0_0_60px_rgba(188,106,77,0.08)] md:p-8"
          >
            <div className="mb-8 text-center">
              <h1 className="font-display text-2xl tracking-[0.12em] text-primary text-glow md:text-3xl">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

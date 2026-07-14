'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

/**
 * HomeNav — Minimal top navigation for the public-facing home page.
 * Not the same as the sidebar in tools/ — this is the marketing nav.
 * Keeps logo + brand on the left, CTAs on the right.
 */
export function HomeNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Brand */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg"
            aria-label="Hephaestus Tools — Home"
          >
            <Image
              src="/logo.svg"
              alt=""
              width={36}
              height={36}
              className="rounded-[9px] flex-shrink-0"
              priority
            />
            <span className="font-bold text-[17px] tracking-tight text-foreground leading-none hidden sm:block">
              Hephaestus<span className="text-primary"> Tools</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <Link
              href="#tools"
              className="text-[15px] font-medium text-foreground/65 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-md px-1"
            >
              Tools
            </Link>
            <Link
              href="#how-it-works"
              className="text-[15px] font-medium text-foreground/65 hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-md px-1"
            >
              How it works
            </Link>
          </nav>

          {/* CTA */}
          <Link
            href="/tools/commit-to-doc"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[9px] bg-primary text-white font-semibold text-[14px] hover:bg-blue-700 transition-colors duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm"
          >
            Try free
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Lazy-load the WebGL scene — no SSR, deferred until after hydration
const HeroDocScene = dynamic(
  () => import('./HeroDocScene').then(m => ({ default: m.HeroDocScene })),
  { ssr: false, loading: () => <div className="w-full h-full" /> }
);

/**
 * HeroSection — Cinematic split layout.
 * Left: editorial headline + CTAs
 * Right: live 3D document scene (auto-rotating clipboard)
 *
 * On mobile stacks vertically with the 3D scene below copy.
 */
export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient background — top-left warm orange wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full -z-10"
        style={{
          background:
            'radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)',
        }}
      />
      {/* Bottom-right counter-wash */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full -z-10"
        style={{
          background:
            'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center min-h-[88vh] py-16 lg:py-0">

          {/* ── Left column: editorial copy ── */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-[12px] font-bold tracking-widest uppercase">
                <Sparkles className="w-3 h-3" aria-hidden="true" />
                AI Documentation Suite
              </span>
            </motion.div>

            {/* Headline — large, tight, editorial */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.07 }}
              className="mt-7 text-5xl md:text-6xl lg:text-[64px] font-bold tracking-tight leading-[1.04] text-foreground"
            >
              Raw input.
              <br />
              <span
                style={{
                  background: 'linear-gradient(130deg, #c2410c 0%, #f97316 60%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Polished docs.
              </span>
              <br />
              In seconds.
            </motion.h1>

            {/* Sub-copy */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.15 }}
              className="mt-7 text-[17px] text-foreground/55 leading-relaxed max-w-[460px]"
            >
              Paste a commit, meeting transcript, or code snippet — get back
              a publication-ready document with proper structure, formatting,
              and 3D preview. No setup, no account.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.22 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/tools/commit-to-doc"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary text-white font-semibold text-[15px] shadow-sm hover:bg-orange-700 transition-colors duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Start generating
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                href="#tools"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-border/70 text-foreground/75 font-semibold text-[15px] hover:bg-surface hover:text-foreground transition-colors duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
              >
                Browse tools
              </Link>
            </motion.div>

            {/* Social proof strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex items-center gap-6 flex-wrap"
            >
              {[
                { value: '10+', label: 'AI tools' },
                { value: '<3s', label: 'generation' },
                { value: '100%', label: 'free' },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-1.5">
                  <span className="text-[22px] font-bold text-foreground tracking-tight">{s.value}</span>
                  <span className="text-[13px] text-foreground/45 font-medium">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Right column: 3D scene ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="relative w-full h-[520px] lg:h-[680px]"
            aria-hidden="true"
          >
            <HeroDocScene />
          </motion.div>

        </div>
      </div>
    </section>
  );
}

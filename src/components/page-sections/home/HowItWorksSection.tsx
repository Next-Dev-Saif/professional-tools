'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const LiveDocScene = dynamic(
  () => import('./LiveDocScene').then(m => ({ default: m.LiveDocScene })),
  { ssr: false, loading: () => <div className="w-full h-full bg-foreground/5 rounded-3xl" /> }
);

/**
 * HowItWorksSection — Full-width editorial split.
 *
 * Left: numbered process steps in large typographic style
 * Right: live 3D scene showing an animated document in the clipboard viewer
 *
 * Dark background gives it section-break weight without a heavy border.
 */

const STEPS = [
  {
    num: '01',
    title: 'Paste your raw content',
    detail: 'Commit log, meeting notes, code snippet, or incident description — any format works.',
  },
  {
    num: '02',
    title: 'AI structures & formats',
    detail: 'The model extracts meaning, applies hierarchy, and writes in the correct document tone.',
  },
  {
    num: '03',
    title: 'Preview in 3D, export anywhere',
    detail: 'Rotate the physical document preview, then export to Markdown, PDF, or clipboard.',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="relative overflow-hidden py-24 md:py-32"
    >
      {/* Dark section background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-foreground/[0.032] dark:bg-white/[0.025]"
      />
      {/* Subtle grid texture overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.018]"
        style={{
          backgroundImage:
            'linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* ── Left: editorial steps ── */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.42 }}
            >
              <p className="text-[12px] font-bold uppercase tracking-widest text-foreground/35 mb-4">
                How it works
              </p>
              <h2
                id="how-it-works-heading"
                className="text-3xl md:text-[44px] font-bold tracking-tight text-foreground leading-[1.08] mb-14"
              >
                Three steps.
                <br />
                No config.
                <br />
                <span className="text-foreground/40">No account.</span>
              </h2>
            </motion.div>

            <div className="space-y-10">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  {/* Large step number */}
                  <span
                    className="text-[40px] font-bold leading-none tabular-nums select-none"
                    style={{ color: 'var(--primary)', opacity: 0.18 }}
                    aria-hidden="true"
                  >
                    {step.num}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="text-[18px] font-bold text-foreground mb-1.5">
                      {step.title}
                    </h3>
                    <p className="text-[14px] text-foreground/50 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.38, delay: 0.35 }}
              className="mt-14"
            >
              <Link
                href="/tools/commit-to-doc"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-[10px] bg-primary text-white font-semibold text-[15px] hover:bg-blue-700 transition-colors duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm"
              >
                Try it now — it&apos;s free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>

          {/* ── Right: 3D document viewer ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative h-[500px] lg:h-[600px] rounded-3xl overflow-hidden border border-border/30"
            aria-hidden="true"
          >
            <LiveDocScene />

            {/* Label overlay */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between pointer-events-none">
              <span className="text-[11px] font-bold uppercase tracking-widest text-foreground/30">
                3D Preview — drag to rotate
              </span>
              <span className="text-[11px] font-semibold text-foreground/20">
                Powered by WebGL
              </span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}

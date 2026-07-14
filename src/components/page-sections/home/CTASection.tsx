'use client';

import Link from 'next/link';
import { ArrowRight, FileText, Layers, Megaphone, Webhook } from 'lucide-react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

/**
 * CTASection — Full-width conversion block.
 *
 * Split layout:
 *   Left  — Bold white headline + sub-copy + dual CTAs + feature pills
 *   Right — Floating 3D document cards (lazy-loaded, no SSR)
 *
 * Dark navy-to-indigo background with a realistic depth gradient.
 * No neon. No saturated glows. Just strong contrast and spatial depth.
 */

const CTADocScene = dynamic(() => import('./CTADocScene').then(m => ({ default: m.CTADocScene })), {
  ssr: false,
  loading: () => <div className="w-full h-full" />,
});

const PILLS = [
  { icon: FileText, label: 'PR to Document' },
  { icon: Layers, label: 'ADR Builder' },
  { icon: Megaphone, label: 'Release Notes' },
  { icon: Webhook, label: 'API Documenter' },
];

export function CTASection() {
  return (
    <section aria-labelledby="cta-heading" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl"
          style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e2d6b 35%, #1d4ed8 65%, #2040c8 100%)',
          }}
        >
          {/* Top light leak */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 70% 55% at 30% -5%, rgba(255,255,255,0.11) 0%, transparent 65%)',
            }}
          />
          {/* Bottom depth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse 60% 60% at 100% 110%, rgba(0,0,20,0.55) 0%, transparent 65%)',
            }}
          />
          {/* Subtle dot-grid texture */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[440px]">

            {/* ── Left: copy ── */}
            <div className="flex flex-col justify-center px-10 py-14 md:px-14 md:py-16 lg:py-20">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="text-[12px] font-bold uppercase tracking-widest text-blue-300/70 mb-5"
              >
                Zero setup · Free forever
              </motion.p>

              <motion.h2
                id="cta-heading"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.44, delay: 0.1 }}
                className="text-3xl md:text-[44px] font-bold tracking-tight text-white leading-[1.06]"
              >
                Stop writing docs
                <br />
                by hand.
                <br />
                <span className="text-blue-300/80">Let the forge do it.</span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.18 }}
                className="mt-5 text-[16px] text-blue-100/60 leading-relaxed max-w-[380px]"
              >
                Paste raw content. Get a publish-ready document in under 3 seconds.
                No account. No install. Just open and generate.
              </motion.p>

              {/* Tool pills */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: 0.25 }}
                className="mt-8 flex flex-wrap gap-2"
              >
                {PILLS.map(({ icon: Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/12 bg-white/6 text-white/65 text-[12px] font-medium"
                  >
                    <Icon className="w-3 h-3" aria-hidden="true" />
                    {label}
                  </span>
                ))}
              </motion.div>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.38, delay: 0.32 }}
                className="mt-10 flex flex-col sm:flex-row gap-3"
              >
                <Link
                  href="/tools/commit-to-doc"
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-[10px] bg-white text-blue-700 font-bold text-[15px] hover:bg-blue-50 transition-colors duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-800 shadow-lg shadow-black/20"
                >
                  Start generating — it&apos;s free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                </Link>
                <Link
                  href="#tools"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-[10px] border border-white/20 text-white/80 font-semibold text-[15px] hover:bg-white/8 transition-colors duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Browse all tools
                </Link>
              </motion.div>
            </div>

            {/* ── Right: 3D cards ── */}
            <div
              className="hidden lg:block relative h-full min-h-[440px]"
              aria-hidden="true"
            >
              <CTADocScene />
            </div>

          </div>
        </motion.div>
      </div>
    </section>
  );
}

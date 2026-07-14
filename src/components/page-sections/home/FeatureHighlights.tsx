'use client';

import { Shield, Zap, Palette, Globe, Check } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * FeatureHighlights — Editorial two-column layout.
 *
 * Left: One dominant feature with large icon + prose (primary visual weight)
 * Right: Remaining features as a clean checklist — no cards, no boxes.
 *
 * Uses spacing and weight contrast as hierarchy, not borders.
 */

const PRIMARY = {
  icon: Zap,
  color: 'text-amber-500',
  title: 'Under 3 seconds, every time',
  body: 'The AI runs on the edge — serverless, stateless, fast. Paste your content and the result streams back before you finish reading the first word. No spinner. No wait.',
};

const SECONDARY = [
  {
    icon: Shield,
    color: 'text-emerald-500',
    title: 'Zero data retention',
    body: 'Inputs are processed in-memory and never persisted. No logging, no training, no storage.',
  },
  {
    icon: Palette,
    color: 'text-violet-500',
    title: 'Publication-ready output',
    body: 'Structured headings, proper hierarchy, and formatted sections — not a text wall.',
  },
  {
    icon: Globe,
    color: 'text-blue-500',
    title: 'No install. Open a URL.',
    body: 'Works in any browser. No extensions, no CLI, no npm package to maintain.',
  },
];

const CHECKLIST = [
  'Markdown export',
  'PDF print support',
  'Dark mode',
  '3D document preview',
  'Real-time streaming',
  'Mobile compatible',
];

export function FeatureHighlights() {
  return (
    <section
      aria-labelledby="features-heading"
      className="py-20 md:py-28"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">

        {/* Section label */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-[12px] font-bold uppercase tracking-widest text-foreground/35 mb-12"
        >
          Why Hephaestus
        </motion.p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

          {/* ── Left: Primary feature — dominant ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.44 }}
          >
            <PRIMARY.icon
              className={`w-12 h-12 ${PRIMARY.color} mb-8`}
              aria-hidden="true"
            />
            <h2
              id="features-heading"
              className="text-3xl md:text-[40px] font-bold tracking-tight text-foreground leading-[1.1] mb-6"
            >
              {PRIMARY.title}
            </h2>
            <p className="text-[17px] text-foreground/55 leading-relaxed max-w-[420px]">
              {PRIMARY.body}
            </p>

            {/* Checklist */}
            <ul className="mt-10 grid grid-cols-2 gap-x-8 gap-y-3.5" aria-label="Included features">
              {CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[14px] text-foreground/60 font-medium">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Right: Secondary features — clean list, no cards ── */}
          <div className="flex flex-col justify-center gap-10 lg:pl-4 lg:border-l border-border/40">
            {SECONDARY.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.38, delay: i * 0.1 }}
                  className="flex gap-5"
                >
                  <Icon
                    className={`w-6 h-6 ${feature.color} shrink-0 mt-0.5`}
                    aria-hidden="true"
                  />
                  <div>
                    <h3 className="text-[17px] font-bold text-foreground mb-1.5">
                      {feature.title}
                    </h3>
                    <p className="text-[14px] text-foreground/50 leading-relaxed">
                      {feature.body}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

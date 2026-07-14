'use client';

import { motion } from 'framer-motion';

/**
 * StatsBar — Typographic stats strip.
 * No grid boxes. Numbers as the dominant visual element.
 * Sits between hero and tools grid as a credibility bridge.
 */

const STATS = [
  { value: '10+', label: 'AI-powered tools' },
  { value: '<3s', label: 'Average generation' },
  { value: '0', label: 'Account required' },
  { value: '100%', label: 'Browser-native' },
];

export function StatsBar() {
  return (
    <section aria-label="Key metrics" className="py-12 border-y border-border/30">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-wrap items-center justify-between gap-y-8 gap-x-4"
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="flex items-baseline gap-3 flex-1 min-w-[120px]">
              {/* Divider — skip first */}
              {i > 0 && (
                <div aria-hidden="true" className="hidden sm:block w-px h-8 bg-border/50 mr-3 self-center" />
              )}
              <span className="text-[38px] md:text-[44px] font-bold tracking-tight text-foreground leading-none tabular-nums">
                {stat.value}
              </span>
              <span className="text-[13px] text-foreground/40 font-medium leading-snug max-w-[80px]">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

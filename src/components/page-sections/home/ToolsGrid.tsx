'use client';

import Link from 'next/link';
import {
  FileText,
  Scale,
  Users,
  ArrowRight,
  LayoutDashboard,
  PenTool,
  Receipt,
  AlertTriangle,
  Layers,
  Megaphone,
  Webhook,
  ImageIcon,
  FileSearch,
  Bug,
  Book,
  FileCheck,
  LayoutTemplate,
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * ToolsGrid — Fixed bento layout using explicit CSS Grid template areas.
 *
 * Avoids dynamic Tailwind class generation (which gets purged at build time).
 * All col/row spans are applied via inline gridColumn / gridRow style props.
 *
 * Desktop (≥1024px): 12-column grid
 *   Row 1-2: Featured (col 1-7) | Card A (col 8-12) | Card B (col 8-12)
 *   Row 3:   Card C (col 1-4)   | Card D (col 5-9)  | Card E (col 10-12)
 *   Row 4:   Card F (col 1-6)   | Card G (col 7-12)
 *   Row 5:   Card H (col 1-3)   | Card I (col 4-8)  | Card J (col 9-12)
 *
 * Tablet (md): Simple 2-column equal grid
 * Mobile: Single column
 */

const TOOLS = [
  {
    title: 'PR to Document',
    description:
      'Paste a raw PR or commit description — get back a structured technical doc, release note, or API reference ready to publish.',
    href: '/tools/commit-to-doc',
    icon: FileText,
    accentText: 'text-orange-500',
    badge: 'Most used',
    featured: true,
  },
  {
    title: 'Visual Builder',
    description: 'Drag-and-drop WYSIWYG canvas for any document.',
    href: '/tools/visual-builder',
    icon: LayoutDashboard,
    accentText: 'text-violet-500',
    badge: null,
    featured: false,
  },
  {
    title: 'Code → Legal',
    description: 'Architecture proposals into NDAs, SOWs, and licensing docs.',
    href: '/tools/code-to-legal',
    icon: Scale,
    accentText: 'text-emerald-500',
    badge: null,
    featured: false,
  },
  {
    title: 'Meeting → Report',
    description: 'Raw notes in. Executive summary, actions, decisions out.',
    href: '/tools/meeting-notes',
    icon: Users,
    accentText: 'text-rose-500',
    badge: null,
    featured: false,
  },
  {
    title: 'Invoice Generator',
    description: 'Branded invoices with line items and PDF export.',
    href: '/tools/invoice-generator',
    icon: Receipt,
    accentText: 'text-amber-500',
    badge: null,
    featured: false,
  },
  {
    title: 'Post-Mortem / RCA',
    description: 'Timeline-driven blameless incident reports.',
    href: '/tools/post-mortem',
    icon: AlertTriangle,
    accentText: 'text-orange-500',
    badge: null,
    featured: false,
  },
  {
    title: 'ADR Builder',
    description: 'Architecture Decision Records with full context.',
    href: '/tools/adr-builder',
    icon: Layers,
    accentText: 'text-indigo-500',
    badge: null,
    featured: false,
  },
  {
    title: 'Release Notes',
    description: 'Marketing-ready changelogs from raw fix lists.',
    href: '/tools/release-notes',
    icon: Megaphone,
    accentText: 'text-purple-500',
    badge: null,
    featured: false,
  },
  {
    title: 'API Documenter',
    description: 'Request/response payload tables from field definitions.',
    href: '/tools/api-documenter',
    icon: Webhook,
    accentText: 'text-cyan-500',
    badge: null,
    featured: false,
  },
  {
    title: 'Code Poster',
    description: 'Syntax-highlighted code images, share-ready in one click.',
    href: '/tools/code-poster',
    icon: ImageIcon,
    accentText: 'text-pink-500',
    badge: null,
    featured: false,
  },
  {
    title: 'Document Templates',
    description: 'Build branded reusable doc templates on a full canvas.',
    href: '/tools/visual-builder',
    icon: PenTool,
    accentText: 'text-teal-500',
    badge: 'New',
    featured: false,
  },
  {
    title: 'RFC Generator',
    description: 'Propose new features and architectures with a standardized Request for Comments document.',
    href: '/tools/rfc-generator',
    icon: FileSearch,
    accentText: 'text-zinc-500',
    badge: 'New',
    featured: false,
  },
  {
    title: 'PRD Builder',
    description: 'Product Requirements Document generator for structured feature planning.',
    href: '/tools/prd-builder',
    icon: LayoutTemplate,
    accentText: 'text-sky-500',
    badge: 'New',
    featured: false,
  },
  {
    title: 'Bug Report Formatter',
    description: 'Format crisp and reproducible bug reports ready for Jira/GitHub.',
    href: '/tools/bug-formatter',
    icon: Bug,
    accentText: 'text-red-500',
    badge: 'New',
    featured: false,
  },
  {
    title: 'SOP Writer',
    description: 'Write step-by-step Standard Operating Procedures and playbooks.',
    href: '/tools/sop-writer',
    icon: Book,
    accentText: 'text-yellow-600',
    badge: 'New',
    featured: false,
  },
  {
    title: 'SLA Generator',
    description: 'Generate legal Service Level Agreements for clients and providers.',
    href: '/tools/sla-generator',
    icon: FileCheck,
    accentText: 'text-emerald-600',
    badge: 'New',
    featured: false,
  },
];

// Bento desktop layout — explicit grid positions (1-indexed, 12-col grid)
// [colStart, colEnd, rowStart, rowEnd]
const DESKTOP_LAYOUT: [number, number, number, number][] = [
  [1, 8, 1, 3],   // featured — wide, 2 rows tall
  [8, 13, 1, 2],  // card 1
  [8, 13, 2, 3],  // card 2
  [1, 5, 3, 4],   // card 3
  [5, 9, 3, 4],   // card 4
  [9, 13, 3, 4],  // card 5
  [1, 7, 4, 5],   // card 6
  [7, 13, 4, 5],  // card 7
  [1, 5, 5, 6],   // card 8
  [5, 9, 5, 6],   // card 9
  [9, 13, 5, 6],  // card 10
  [1, 4, 6, 7],   // card 11
  [4, 7, 6, 7],   // card 12
  [7, 10, 6, 7],  // card 13
  [10, 13, 6, 7], // card 14
  [1, 7, 7, 8],   // card 15
];

const [featured, ...rest] = TOOLS;

export function ToolsGrid() {
  return (
    <section id="tools" aria-labelledby="tools-heading" className="py-20 md:py-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.42 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-foreground/35 mb-3">
              The toolkit
            </p>
            <h2
              id="tools-heading"
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight"
            >
              Every workflow,
              <br />
              one forge.
            </h2>
          </div>
          <p className="text-[15px] text-foreground/50 max-w-[280px] leading-relaxed md:text-right">
            Purpose-built tools for every documentation task engineers actually face.
          </p>
        </motion.div>

        {/* ── Mobile / Tablet: simple 2-col grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
          {TOOLS.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={`mob-${tool.href}-${i}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.25) }}
              >
                <Link
                  href={tool.href}
                  className={`group flex flex-col h-full min-h-[180px] p-7 rounded-2xl border border-border/40 transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:ring-offset-2 ${
                    tool.featured
                      ? 'bg-gradient-to-br from-orange-50 to-indigo-50/60 hover:border-primary/25 dark:from-orange-950/30 dark:to-indigo-950/20'
                      : 'bg-surface/60 hover:bg-surface hover:border-border/70 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-5">
                    <Icon className={`w-5 h-5 ${tool.accentText}`} aria-hidden="true" />
                    {tool.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[16px] font-bold text-foreground mb-2 leading-snug">{tool.title}</h3>
                  <p className="text-[13px] text-foreground/50 leading-relaxed flex-1">{tool.description}</p>
                  <div className="mt-5 flex items-center gap-1 text-[13px] font-semibold text-foreground/30 group-hover:text-primary transition-colors duration-200">
                    Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* ── Desktop: explicit bento grid ── */}
        <div
          className="hidden lg:grid gap-4"
          style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
        >
          {/* Featured card */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.44 }}
            style={{ gridColumn: `${DESKTOP_LAYOUT[0][0]} / ${DESKTOP_LAYOUT[0][1]}`, gridRow: `${DESKTOP_LAYOUT[0][2]} / ${DESKTOP_LAYOUT[0][3]}` }}
          >
            <Link
              href={featured.href}
              className="group relative flex flex-col h-full min-h-[340px] p-10 rounded-3xl overflow-hidden border border-border/40 hover:border-primary/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
              style={{ background: 'linear-gradient(145deg, #fff7ed 0%, #ffedd5 55%, #fefce8 100%)' }}
            >
              {/* Dark mode surface */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-0 dark:opacity-100 rounded-3xl"
                style={{ background: 'linear-gradient(145deg, rgba(234,88,12,0.12) 0%, rgba(17,20,30,0.97) 45%, rgba(249,115,22,0.09) 100%)' }}
              />
              {/* Radial accent glow top-right */}
              <div
                aria-hidden="true"
                className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(234,88,12,0.14) 0%, transparent 68%)' }}
              />

              {featured.badge && (
                <span className="relative z-10 self-start mb-8 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold tracking-widest uppercase">
                  {featured.badge}
                </span>
              )}

              <div className="relative z-10 flex flex-col flex-1">
                <featured.icon
                  className={`w-11 h-11 ${featured.accentText} mb-8 transition-transform duration-300 group-hover:scale-110`}
                  aria-hidden="true"
                />
                <h3 className="text-[28px] font-bold text-foreground mb-4 leading-tight">
                  {featured.title}
                </h3>
                <p className="text-[16px] text-foreground/55 leading-relaxed max-w-[380px]">
                  {featured.description}
                </p>
              </div>

              <div className="relative z-10 mt-8 flex items-center gap-2 text-primary font-bold text-[15px] group-hover:gap-3 transition-all duration-200">
                Launch Tool <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>
            </Link>
          </motion.div>

          {/* Regular cards */}
          {rest.map((tool, i) => {
            const Icon = tool.icon;
            const [cs, ce, rs, re] = DESKTOP_LAYOUT[i + 1] ?? [1, 5, 6, 7];
            return (
              <motion.div
                key={`desk-${tool.href}-${i}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.36, delay: Math.min(i * 0.05, 0.28) }}
                style={{ gridColumn: `${cs} / ${ce}`, gridRow: `${rs} / ${re}` }}
              >
                <Link
                  href={tool.href}
                  className="group flex flex-col h-full p-7 rounded-2xl border border-border/40 bg-surface/60 hover:bg-surface hover:border-border/60 hover:shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-250 focus:outline-none focus:ring-2 focus:ring-primary/35 focus:ring-offset-2"
                >
                  <div className="flex items-center justify-between mb-5">
                    <Icon
                      className={`w-5 h-5 ${tool.accentText} transition-transform duration-250 group-hover:scale-110`}
                      aria-hidden="true"
                    />
                    {tool.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase">
                        {tool.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-[15px] font-bold text-foreground mb-2.5 leading-snug">{tool.title}</h3>
                  <p className="text-[13px] text-foreground/50 leading-relaxed flex-1">{tool.description}</p>

                  <div className="mt-5 flex items-center gap-1 text-[13px] font-semibold text-foreground/25 group-hover:text-primary transition-colors duration-200">
                    Open <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

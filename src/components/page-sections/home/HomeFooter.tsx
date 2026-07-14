import Link from 'next/link';
import Image from 'next/image';

/**
 * HomeFooter — Minimal, clean footer for the home page.
 * Provides quick links, brand identity, and legal text.
 */
export function HomeFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 py-10">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          {/* Brand column */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <Link
              href="/"
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-lg"
              aria-label="Hephaestus Tools — Home"
            >
              <Image
                src="/logo.svg"
                alt=""
                width={32}
                height={32}
                className="rounded-[8px]"
              />
              <span className="font-bold text-[16px] tracking-tight text-foreground">
                Hephaestus<span className="text-primary"> Tools</span>
              </span>
            </Link>
            <p className="text-[13px] text-foreground/40 max-w-[260px] text-center md:text-left leading-relaxed">
              AI-powered documentation utilities for developers and teams.
            </p>
          </div>

          {/* Links columns */}
          <div className="flex gap-12 md:gap-16 flex-wrap justify-center">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-foreground/40 mb-3">
                Tools
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'PR to Document', href: '/tools/commit-to-doc' },
                  { label: 'Visual Builder', href: '/tools/visual-builder' },
                  { label: 'Meeting Report', href: '/tools/meeting-notes' },
                  { label: 'Post-Mortem', href: '/tools/post-mortem' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-foreground/55 hover:text-foreground transition-colors focus:outline-none focus:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-foreground/40 mb-3">
                More
              </p>
              <ul className="space-y-2.5">
                {[
                  { label: 'ADR Builder', href: '/tools/adr-builder' },
                  { label: 'Release Notes', href: '/tools/release-notes' },
                  { label: 'API Documenter', href: '/tools/api-documenter' },
                  { label: 'Code Poster', href: '/tools/code-poster' },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-foreground/55 hover:text-foreground transition-colors focus:outline-none focus:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[13px] text-foreground/35">
            © {year} Hephaestus Tools. Built for developers.
          </p>
          <p className="text-[13px] text-foreground/35">
            Powered by{' '}
            <span className="text-foreground/50 font-medium">Cohere AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

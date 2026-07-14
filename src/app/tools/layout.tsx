'use client';

import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import { FileText, LayoutDashboard, ChevronRight, PenTool, Receipt, Users, AlertTriangle, Layers, Megaphone, Webhook, Image, Scale } from 'lucide-react';

const NAV_ITEMS = [
  {
    name: 'Home',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'PR to Document',
    href: '/tools/commit-to-doc',
    icon: FileText,
  },
  {
    name: 'Visual Builder',
    href: '/tools/visual-builder',
    icon: PenTool,
  },
  {
    name: 'Invoice Generator',
    href: '/tools/invoice-generator',
    icon: Receipt,
  },
  {
    name: 'Legal Agreements',
    href: '/tools/code-to-legal',
    icon: Scale,
  },
  {
    name: 'Meeting Reports',
    href: '/tools/meeting-notes',
    icon: Users,
  },
  {
    name: 'Post-Mortem / RCA',
    href: '/tools/post-mortem',
    icon: AlertTriangle,
  },
  {
    name: 'ADR Builder',
    href: '/tools/adr-builder',
    icon: Layers,
  },
  {
    name: 'Release Notes',
    href: '/tools/release-notes',
    icon: Megaphone,
  },
  {
    name: 'API Documenter',
    href: '/tools/api-documenter',
    icon: Webhook,
  },
  {
    name: 'Code Snippet Poster',
    href: '/tools/code-poster',
    icon: Image,
  },
];

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-[240px] xl:w-[280px] border-r border-border/50 bg-surface/30 backdrop-blur-md hidden lg:flex flex-col flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-6 flex items-center gap-3 border-b border-border/50">
          <NextImage
            src="/logo.svg"
            alt="Hephaestus Tools logo"
            width={32}
            height={32}
            className="rounded-[8px] flex-shrink-0"
            priority
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-[15px] tracking-tight text-foreground">
              Hephaestus<span className="text-primary"> Tools</span>
            </span>
            <span className="text-[11px] text-foreground/40 mt-0.5 font-medium">
              Documentation Suite
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="px-3 pb-3 text-xs font-semibold uppercase tracking-wider text-foreground/40">
            Available Tools
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`
                  flex items-center justify-between px-3 xl:px-4 py-2.5 rounded-2xl text-[13px] xl:text-[15px] font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-foreground/70 hover:bg-surface/80 hover:text-foreground'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-foreground/50'}`} />
                  {item.name}
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

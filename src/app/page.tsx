import { HomeNav } from '@/components/page-sections/home/HomeNav';
import { HeroSection } from '@/components/page-sections/home/HeroSection';
import { StatsBar } from '@/components/page-sections/home/StatsBar';
import { ToolsGrid } from '@/components/page-sections/home/ToolsGrid';
import { HowItWorksSection } from '@/components/page-sections/home/HowItWorksSection';
import { FeatureHighlights } from '@/components/page-sections/home/FeatureHighlights';
import { AgentInstructionsSection } from '@/components/page-sections/home/AgentInstructionsSection';
import { CTASection } from '@/components/page-sections/home/CTASection';
import { HomeFooter } from '@/components/page-sections/home/HomeFooter';

/**
 * Home — Public-facing landing page for Hephaestus Tools.
 *
 * Section flow (F-pattern top-to-bottom):
 * 1. HomeNav          — sticky nav, logo, CTA
 * 2. HeroSection      — cinematic split: copy left / 3D doc scene right
 * 3. StatsBar         — typographic trust signals
 * 4. ToolsGrid        — bento asymmetric tool catalog
 * 5. HowItWorksSection — full-bleed editorial + interactive 3D clipboard
 * 6. FeatureHighlights — two-column editorial, no boxes
 * 7. AgentInstructionsSection - guide for AI agents
 * 8. CTASection       — bottom conversion block
 * 9. HomeFooter       — links, brand, legal
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <HomeNav />

      <main id="main-content" className="flex-1">
        <HeroSection />
        <StatsBar />
        <ToolsGrid />
        <HowItWorksSection />
        <FeatureHighlights />
        <AgentInstructionsSection />
        <CTASection />
      </main>

      <HomeFooter />
    </div>
  );
}

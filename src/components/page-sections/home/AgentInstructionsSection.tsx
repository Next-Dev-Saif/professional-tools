import { Sparkles, Zap, Bot } from 'lucide-react';

export function AgentInstructionsSection() {
  return (
    <section className="py-24 bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500 via-transparent to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-orange-400 text-sm font-medium mb-6">
            <Bot className="w-4 h-4" />
            <span>Built-in AI Assistant</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Intelligent Form Autofill
          </h2>
          <p className="text-lg text-gray-400">
            Hephaestus Tools comes with a deeply integrated AI agent. 
            No extensions or external tools required—just prompt the AI directly on any page.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">1. Open the AI Assistant</h3>
                <p className="text-gray-400 leading-relaxed">
                  Click the floating AI button in the bottom right corner of any tool page to open the native prompt interface.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2. Describe What You Need</h3>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Just type out what you want to create in plain English. The AI understands the specific schema of the tool you are currently using.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 border border-gray-800">
                  <p className="italic text-gray-500">Example Prompt:</p>
                  <p className="mt-2">"Draft a SEV-1 post-mortem for yesterday's database outage caused by the rogue migration script."</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 lg:p-10">
            <h3 className="text-2xl font-semibold mb-6">Seamless Execution</h3>
            <ul className="space-y-4 text-gray-300 mb-8">
              <li className="flex gap-3">
                <span className="text-orange-400">▹</span>
                <span>The AI analyzes your prompt and extracts all necessary parameters.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-400">▹</span>
                <span>It maps the extracted data directly to the tool's expected schema.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-400">▹</span>
                <span>The entire form is populated instantly without page reloads.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-orange-400">▹</span>
                <span>All generation happens on the server side using the Cohere API.</span>
              </li>
            </ul>

            <h4 className="text-lg font-semibold text-white mb-4 border-t border-gray-800 pt-6">Supported Tools</h4>
            <div className="space-y-3 text-sm text-gray-400 max-h-60 overflow-y-auto custom-scrollbar pr-4">
              <div><strong className="text-gray-200">ADR Builder:</strong> Architecture Decision Records</div>
              <div><strong className="text-gray-200">API Documenter:</strong> Standardized API Specs</div>
              <div><strong className="text-gray-200">Code Poster:</strong> Beautiful Code Snippets</div>
              <div><strong className="text-gray-200">Legal Generator:</strong> NDAs, SOWs, and CLAs</div>
              <div><strong className="text-gray-200">Meeting Notes:</strong> Structured Executive Summaries</div>
              <div><strong className="text-gray-200">Post Mortem:</strong> Incident RCA & Timelines</div>
              <div><strong className="text-gray-200">Release Notes:</strong> Changelogs and Updates</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

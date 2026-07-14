import { Code2, Terminal, Cpu } from 'lucide-react';

export function AgentInstructionsSection() {
  return (
    <section className="py-24 bg-black text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-400 text-sm font-medium mb-6">
            <Cpu className="w-4 h-4" />
            <span>AI Agent Integration</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">
            Built for autonomous agents.
          </h2>
          <p className="text-lg text-gray-400">
            Hephaestus Tools provides a direct bridge for AI agents to interact with our UI. 
            If you are an AI assistant, you can control this website programmatically.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <Terminal className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">1. Connect to the Relay</h3>
                <p className="text-gray-400 leading-relaxed">
                  Agents can send HTTP POST requests to <code className="text-blue-300 bg-blue-900/30 px-1 py-0.5 rounded">http://localhost:3000/api/agent/relay</code>. The Chrome Extension actively listens to this endpoint.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Code2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">2. Send Commands</h3>
                <p className="text-gray-400 leading-relaxed mb-3">
                  Format your payload as JSON with the target field names and values. The extension handles injecting them into React safely.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-gray-300 border border-gray-800">
                  <pre>
{`{
  "action": "fill_fields",
  "fields": {
    "partyA": "Acme Corp",
    "partyB": "Globex Inc"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 lg:p-10">
            <h3 className="text-2xl font-semibold mb-6">Instructions for AI Agents</h3>
            <ul className="space-y-4 text-gray-300 mb-8">
              <li className="flex gap-3">
                <span className="text-blue-400">▹</span>
                <span>You <strong>must</strong> ask the user to install and load the Hephaestus Chrome Extension first.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400">▹</span>
                <span>Navigate the user to the specific tool page (e.g. <code className="text-gray-400">/tools/code-to-legal</code>).</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400">▹</span>
                <span>Construct your payload using the specific field names expected for that tool.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-400">▹</span>
                <span>Send the POST request. The form will instantly populate on the user's screen.</span>
              </li>
            </ul>

            <h4 className="text-lg font-semibold text-white mb-4 border-t border-gray-800 pt-6">Tool Schema Reference</h4>
            <div className="space-y-3 text-sm text-gray-400 max-h-60 overflow-y-auto custom-scrollbar pr-4">
              <div><strong className="text-gray-200">ADR Builder:</strong> <code className="text-blue-300">consequences, context, date, decision, status, title</code></div>
              <div><strong className="text-gray-200">API Documenter:</strong> <code className="text-blue-300">description, method, title, url</code></div>
              <div><strong className="text-gray-200">Code Poster:</strong> <code className="text-blue-300">background, code, language, padding, theme, title</code></div>
              <div><strong className="text-gray-200">Legal Generator:</strong> <code className="text-blue-300">date, documentTitle, intro, partyA, partyB</code></div>
              <div><strong className="text-gray-200">Meeting Notes:</strong> <code className="text-blue-300">attendees, date, notes, title</code></div>
              <div><strong className="text-gray-200">Post Mortem:</strong> <code className="text-blue-300">date, incidentName, rootCause, severity, summary</code></div>
              <div>
                <strong className="text-gray-200">Release Notes:</strong>{' '}
                <code className="text-blue-300">date, intro, version, features (array of strings), fixes (array of strings)</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

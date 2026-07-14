import { CohereClient } from 'cohere-ai';
import { NextRequest } from 'next/server';

// Initialize the Cohere Client
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || '',
});

export const runtime = 'edge';

const SYSTEM_PROMPT = `
You are an expert design AI powering Hephaestus, a WYSIWYG visual document builder.
The user will provide a prompt describing the kind of document they want (e.g., "A modern software invoice", "A legal NDA agreement", "A weekly project report").

Your task is to generate a fully styled, cohesive HTML document structure using Tailwind CSS utility classes. 
Follow the platform's UI/UX guidelines: Use semantic structures, 8px grid spacing, Inter font stack, high contrast colors, and elegant minimal designs. Do not use random sizes; stick to Tailwind scales.

CRITICAL PARSING INSTRUCTIONS:
This HTML will be parsed into an absolute-positioned Visual Builder engine.
1. You MUST attach a unique 'id' attribute starting with 'hephaestus-' to the top-level structural blocks (e.g., id="hephaestus-header", id="hephaestus-main-content").
2. NEVER nest 'hephaestus-' IDs inside each other. Only apply them to independent, top-level sibling structural containers.
3. Because these blocks will be extracted and absolutely positioned, they CANNOT rely on a parent flexbox or grid to define their height or width. Give each 'hephaestus-' block explicit padding or explicit heights (e.g., 'p-8', 'h-32', 'w-full') so it maintains its exact shape when extracted from the document flow.
4. Group related elements inside these blocks. For example, an entire invoice table should be inside one 'hephaestus-table-container' div.
5. SEMANTIC TABLES: Whenever the document includes tabular data or line items (like invoice items, pricing, or schedules), you MUST use a strict semantic HTML table structure (<table>, <thead>, <tbody>, <tr>, <th>, <td>). Do NOT use flexbox or grid to build lists of line items.
6. TAILWIND STYLE FORCINGS (CRITICAL):
   - TABLES: Must use \`w-full text-left border-collapse\`. \`<th>\` must have \`bg-gray-50 border-y border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500 py-3 px-4\`. \`<td>\` must have \`border-b border-gray-100 py-4 px-4 text-sm text-gray-800\`.
   - FINANCIAL TOTALS: Summaries (Subtotal, Tax, Total Due) MUST be right-aligned using a grid or flexbox (e.g., \`flex justify-end mt-6\`) and formatted professionally (e.g., bold the Total Due).
   - HEADERS & LAYOUT: Top headers (Invoice Title, Logo) should use \`flex justify-between items-start border-b border-gray-200 pb-8 mb-8\`.
   - TYPOGRAPHY: Primary labels (e.g., "Invoice To:") must be \`text-xs font-bold text-gray-400 uppercase tracking-widest mb-2\`. Data values should be \`text-gray-900 text-sm\`.
   - SPACING: Use \`gap-8\` for horizontal splits (e.g., \`grid grid-cols-2 gap-8\`) and \`space-y-2\` for vertical text stacking.

Output ONLY valid HTML. Do not wrap in markdown \\\`\\\`\\\`html code blocks. No explanations.
`;

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    const response = await cohere.chat({
      model: 'command-r-plus-08-2024',
      message: prompt,
      preamble: SYSTEM_PROMPT,
      temperature: 0.3,
    });

    let htmlText = response.text.trim();
    if (htmlText.startsWith('\`\`\`html')) {
      htmlText = htmlText.replace(/\`\`\`html/g, '').replace(/\`\`\`/g, '').trim();
    } else if (htmlText.startsWith('\`\`\`')) {
      htmlText = htmlText.replace(/\`\`\`/g, '').trim();
    }

    // Return the raw HTML string
    return new Response(JSON.stringify({ html: htmlText }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error generating layout:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

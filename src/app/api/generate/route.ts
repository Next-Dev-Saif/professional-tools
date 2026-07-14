import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY || '',
});

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { commitText, docType, userName, companyName, clientName } = await req.json();

    if (!commitText || !docType) {
      return new Response('Missing required fields', { status: 400 });
    }

    const contextSection = [
      userName && `- Author / Role: ${userName}`,
      companyName && `- Representing Company: ${companyName}`,
      clientName && `- Target Client / Audience: ${clientName}`
    ].filter(Boolean).join('\n');

    const prompt = `You are an expert software documentation generator named Hephaestus.
Generate a professional, well-structured "${docType}" based on the following commit/PR details:
---
${commitText}
---
${contextSection ? `\n### Context about the Author & Audience:\n${contextSection}\nPlease ensure the documentation reflects this context appropriately (e.g., framing the report from the company to the client, or signing off as the author).` : ''}

You must adhere to the following UI/UX and Typography standards for the generated document:
1. **Hierarchy (Three-Tier Rule)**: Use exactly one H1 (#) for the hero title. Use H2 (##) for major sections, and H3 (###) for subsections. Never skip heading levels.
2. **Readability**: Keep paragraphs short (maximum 3-4 sentences). Use bullet points for lists to support an F-pattern or Z-pattern reading scan.
3. **Tables**: If presenting comparative data or parameters, use Markdown tables. Align numbers to the right and text to the left.
4. **Formatting**: Use bold text (**) for primary emphasis (tier 1), and italics (*) for secondary context (tier 2). Do not overuse bolding.
5. **Clarity**: Use verb-first phrasing where applicable. Delete corporate filler words (e.g., "synergy", "seamless").
6. **Alerts**: Highlight critical warnings or notes using GitHub-flavored alerts (e.g., > [!NOTE] or > [!WARNING]).

Do not include introductory conversational text (e.g., "Here is your document"), just output the Markdown documentation directly.`;

    const stream = await cohere.chatStream({
      model: 'command-r-plus-08-2024',
      message: prompt,
      temperature: 0.3,
    });

    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chat of stream) {
          if (chat.eventType === 'text-generation') {
            controller.enqueue(new TextEncoder().encode(chat.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  } catch (error) {
    console.error('Error in generation API:', error);
    return new Response('Error generating documentation', { status: 500 });
  }
}

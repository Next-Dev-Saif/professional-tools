/**
 * Agent Prompt Builders
 *
 * Each function mirrors the exact prompt logic used by the corresponding
 * UI tool. Keeping prompts here (instead of duplicated in route files)
 * means a single edit propagates to both the web UI and the agent API.
 */

// ─── PR to Document ──────────────────────────────────────────────────────────

export function buildPrToDocPrompt(params: Record<string, unknown>): string {
  const { commitText, docType, userName, companyName, clientName } = params as Record<string, string>;

  const contextLines = [
    userName && `- Author / Role: ${userName}`,
    companyName && `- Representing Company: ${companyName}`,
    clientName && `- Target Client / Audience: ${clientName}`,
  ].filter(Boolean).join('\n');

  return `You are an expert software documentation generator named Hephaestus.
Generate a professional, well-structured "${docType}" based on the following commit/PR details:
---
${commitText}
---
${contextLines ? `\n### Context about the Author & Audience:\n${contextLines}\nPlease ensure the documentation reflects this context appropriately.\n` : ''}
Documentation standards:
1. **Hierarchy**: One H1 title. H2 for major sections, H3 for subsections. Never skip levels.
2. **Readability**: Short paragraphs (max 3-4 sentences). Bullet points for lists.
3. **Tables**: Use Markdown tables for comparative data or parameters.
4. **Formatting**: Bold (**) for primary emphasis, italics (*) for secondary context.
5. **Clarity**: Verb-first phrasing. No corporate filler (synergy, seamless, leverage).
6. **Alerts**: Use GitHub-flavored alerts (> [!NOTE], > [!WARNING]) for critical info.

Output the Markdown document directly — no conversational preamble.`;
}

// ─── Meeting to Report ───────────────────────────────────────────────────────

export function buildMeetingToReportPrompt(params: Record<string, unknown>): string {
  const { title, date, attendees, notes, template } = params as Record<string, string>;

  const templateLabels: Record<string, string> = {
    executive: 'Executive Summary',
    minutes: 'Meeting Minutes',
    adr: 'Architecture Decision Record',
  };
  const docLabel = templateLabels[template ?? 'minutes'] ?? 'Meeting Report';

  return `You are an expert meeting documentation specialist named Hephaestus.
Transform the following raw meeting notes into a professional "${docLabel}".

Meeting: ${title || 'Untitled Meeting'}
Date: ${date || 'Not specified'}
Attendees: ${attendees || 'Not specified'}

--- RAW NOTES ---
${notes}
--- END NOTES ---

Requirements:
1. Extract key decisions made, action items with owners, and discussion highlights.
2. Structure the document with: Overview, Key Discussion Points, Decisions Made, Action Items.
3. Action items must include owner name and a clear, verb-first task description.
4. Keep the tone professional — remove filler words and repetition.
5. Use Markdown with proper heading hierarchy. Use tables for action items (Owner | Task | Due Date).

Output the Markdown document directly — no conversational preamble.`;
}

// ─── Post-Mortem ─────────────────────────────────────────────────────────────

export function buildPostMortemPrompt(params: Record<string, unknown>): string {
  const { incidentName, date, severity, summary, rootCause, timeline, actionItems } =
    params as Record<string, string>;

  return `You are an expert Site Reliability Engineer named Hephaestus writing a blameless post-mortem.
Generate a formal Incident Post-Mortem report from the following information.

Incident: ${incidentName}
Date: ${date || 'Not specified'}
Severity: ${severity || 'SEV-2'}

Executive Summary:
${summary}

Root Cause:
${rootCause}

Timeline:
${timeline || 'Not provided'}

Action Items:
${actionItems || 'Not provided'}

Requirements:
1. Structure: Title, Severity Badge, Executive Summary, Root Cause Analysis, Timeline, Action Items table.
2. Timeline must be formatted as a two-column table (Time | Event).
3. Action Items must be a table: Owner | Task | Priority.
4. Tone is blameless — focus on systems and processes, never individuals.
5. Use > [!WARNING] to call out the most critical finding.
6. Keep the language technical, direct, and precise.

Output the Markdown report directly — no conversational preamble.`;
}

// ─── ADR Builder ─────────────────────────────────────────────────────────────

export function buildADRPrompt(params: Record<string, unknown>): string {
  const { title, date, status, context, decision, consequences } =
    params as Record<string, string>;

  return `You are an expert software architect named Hephaestus writing an Architecture Decision Record.
Generate a formal ADR from the following information.

Title: ${title}
Date: ${date || new Date().toISOString().split('T')[0]}
Status: ${status || 'Proposed'}

Context:
${context}

Decision:
${decision}

Consequences:
${consequences || 'Not yet determined.'}

Requirements:
1. Follow the standard ADR format: Title, Status, Date, Context, Decision, Consequences.
2. Consequences section must clearly separate Positive and Negative consequences.
3. Use precise, technical language. No marketing speak.
4. If the decision involves a trade-off, make it explicit.
5. End with a one-line summary under a "Summary" heading.

Output the Markdown ADR directly — no conversational preamble.`;
}

// ─── Release Notes ────────────────────────────────────────────────────────────

export function buildReleaseNotesPrompt(params: Record<string, unknown>): string {
  const { version, date, intro, features, fixes } = params as Record<string, string>;

  return `You are an expert technical writer named Hephaestus creating professional release notes.
Generate beautifully formatted, marketing-ready release notes from the following raw data.

Version: ${version}
Date: ${date || 'Not specified'}
Introduction: ${intro}

New Features:
${features || 'None in this release.'}

Bug Fixes:
${fixes || 'None in this release.'}

Requirements:
1. Opening paragraph should be engaging but factual — no hyperbole.
2. Features section uses ✨ emoji prefix for each item, formatted as a bullet list.
3. Bug fixes section uses 🐛 emoji prefix for each item, formatted as a bullet list.
4. Each item starts with a bold verb (e.g., **Added**, **Fixed**, **Improved**).
5. End with a short "Upgrading" section if breaking changes might exist, or omit if none.
6. Keep tone developer-friendly — informative, not salesy.

Output the Markdown release notes directly — no conversational preamble.`;
}

// ─── API Documenter ───────────────────────────────────────────────────────────

export function buildAPIDocPrompt(params: Record<string, unknown>): string {
  const { title, method, url, description, requestFields, responseFields } =
    params as Record<string, string>;

  let parsedRequest: Array<Record<string, unknown>> = [];
  let parsedResponse: Array<Record<string, unknown>> = [];
  try { parsedRequest = JSON.parse(requestFields || '[]'); } catch { /* use empty */ }
  try { parsedResponse = JSON.parse(responseFields || '[]'); } catch { /* use empty */ }

  const requestTable = parsedRequest.length
    ? parsedRequest.map((f: Record<string, unknown>) =>
        `| \`${f.name}\` | ${f.type} | ${f.required ? '✅ Required' : 'Optional'} | ${f.description} |`
      ).join('\n')
    : '| — | — | — | No request fields defined |';

  const responseTable = parsedResponse.length
    ? parsedResponse.map((f: Record<string, unknown>) =>
        `| \`${f.name}\` | ${f.type} | ${f.description} |`
      ).join('\n')
    : '| — | — | No response fields defined |';

  return `You are an expert API documentation engineer named Hephaestus.
Generate clean, professional API contract documentation in Markdown.

Endpoint: ${title}
Method: ${method}
URL: \`${url}\`
Description: ${description || 'No description provided.'}

Request Payload Fields:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
${requestTable}

Response Payload Fields:
| Field | Type | Description |
|-------|------|-------------|
${responseTable}

Requirements:
1. Start with a clear H1 heading: the endpoint name.
2. Show the method + URL in a code block.
3. Include a description paragraph.
4. Present Request and Response payloads as well-formatted Markdown tables.
5. Add a code example section with a realistic JSON request body and response body.
6. End with an "Error Codes" section listing common HTTP error codes relevant to this endpoint.

Output the Markdown documentation directly — no conversational preamble.`;
}

// ─── Code to Legal ────────────────────────────────────────────────────────────

export function buildLegalPrompt(params: Record<string, unknown>): string {
  const { documentType, partyA, partyB, date, projectDescription, additionalClauses } =
    params as Record<string, string>;

  return `You are a legal document specialist named Hephaestus generating developer-focused legal agreements.
Generate a complete, professional "${documentType}" in Markdown.

Party A (Client / Disclosing Party): ${partyA}
Party B (Contractor / Receiving Party): ${partyB}
Effective Date: ${date || new Date().toISOString().split('T')[0]}
${projectDescription ? `Project / Scope: ${projectDescription}` : ''}
${additionalClauses ? `Additional Clauses Requested:\n${additionalClauses}` : ''}

Requirements:
1. Use formal legal language appropriate for a binding agreement.
2. Structure: Title, Parties section, Recitals, numbered Terms & Conditions, Signature Block.
3. Each clause must be numbered (1., 2., 3. …) with a bold title followed by the clause text.
4. Include standard protective clauses: Confidentiality, Intellectual Property, Termination, Governing Law.
5. Signature block must include lines for both parties with Name, Title, Date, and Signature fields.
6. Use > [!WARNING] to call out any non-standard or particularly important clauses.

Output the Markdown legal document directly — no conversational preamble.`;
}

// ─── Form Filler ────────────────────────────────────────────────────────────

export function buildFormFillerPrompt(params: Record<string, unknown>): string {
  const { prompt, schemaDescription } = params as Record<string, string>;

  return `You are a strict data-extraction AI named Hephaestus.
Your job is to read a natural language instruction and map it to a specific JSON schema to autofill a web form.

USER INSTRUCTION:
${prompt}

TARGET SCHEMA / CONTEXT:
${schemaDescription}

REQUIREMENTS:
1. You MUST output ONLY valid JSON.
2. Do not include any conversational text, preamble, or markdown formatting other than the JSON block itself.
3. Map the user's intent to the fields described in the TARGET SCHEMA.
4. If a field is not mentioned by the user, omit it or use a sensible default if required by the schema.
5. If the user mentions lists (like multiple line items or features), ensure they are output as JSON arrays matching the schema.

OUTPUT ONLY JSON:`;
}


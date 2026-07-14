/**
 * Agent Tool Registry
 *
 * Single source of truth for every tool exposed through the Agent API.
 * Adding a new tool here automatically surfaces it in GET /api/agent/tools
 * and makes it routable via POST /api/agent/execute.
 */

import type { ToolDefinition } from './types';

export const TOOL_REGISTRY: ToolDefinition[] = [
  // ─── PR / Commit to Document ──────────────────────────────────────────────
  {
    id: 'pr-to-document',
    name: 'PR to Document',
    description:
      'Transforms a raw Pull Request description or commit log into a structured, publication-ready technical document. ' +
      'Supports Technical Documentation, Project Update Reports, API References, Release Notes, and Developer Agreements.',
    category: 'documentation',
    uiPath: '/tools/commit-to-doc',
    parameters: {
      type: 'object',
      required: ['commitText', 'docType'],
      properties: {
        commitText: {
          type: 'string',
          description: 'The raw PR description, commit messages, or feature notes to transform into documentation.',
        },
        docType: {
          type: 'string',
          description: 'The target document format to generate.',
          enum: [
            'Technical Documentation',
            'Project Update Report',
            'Client Facing Release Notes',
            'API Reference',
            'Legal / Developer Agreement',
          ],
          default: 'Technical Documentation',
        },
        userName: {
          type: 'string',
          description: 'Author name or role — used to personalise the document sign-off.',
        },
        companyName: {
          type: 'string',
          description: 'The company or team representing the author.',
        },
        clientName: {
          type: 'string',
          description: 'The target client or audience name.',
        },
      },
    },
    output: {
      format: 'markdown',
      streaming: true,
      contentType: 'text/plain; charset=utf-8',
      fileExtension: 'md',
    },
    examples: [
      {
        summary: 'Generate technical documentation from a feat commit',
        parameters: {
          commitText: 'feat: implemented OAuth2 PKCE flow, added refresh token rotation, fixed session expiry edge case',
          docType: 'Technical Documentation',
          userName: 'Alice Chen, Senior Engineer',
          companyName: 'Acme Corp',
        },
      },
    ],
  },

  // ─── Meeting Notes → Report ───────────────────────────────────────────────
  {
    id: 'meeting-to-report',
    name: 'Meeting to Report',
    description:
      'Converts raw meeting notes or a transcript into a structured report — Executive Summary, ' +
      'Meeting Minutes, or Architecture Decision Record format.',
    category: 'documentation',
    uiPath: '/tools/meeting-notes',
    parameters: {
      type: 'object',
      required: ['notes', 'title'],
      properties: {
        title: {
          type: 'string',
          description: 'Title of the meeting.',
          default: 'Meeting Report',
        },
        date: {
          type: 'string',
          description: 'ISO 8601 date string (e.g. 2025-07-14).',
        },
        attendees: {
          type: 'string',
          description: 'Comma-separated list of attendee names.',
        },
        notes: {
          type: 'string',
          description: 'Raw meeting notes, transcript, or bullet points.',
        },
        template: {
          type: 'string',
          description: 'Output document template.',
          enum: ['executive', 'minutes', 'adr'],
          default: 'minutes',
        },
      },
    },
    output: {
      format: 'markdown',
      streaming: true,
      contentType: 'text/plain; charset=utf-8',
      fileExtension: 'md',
    },
    examples: [
      {
        summary: 'Convert a sprint planning session into meeting minutes',
        parameters: {
          title: 'Sprint 42 Planning',
          date: '2025-07-14',
          attendees: 'Alice, Bob, Charlie',
          notes: '- Discussed Q3 roadmap\n- Reviewed microservices architecture\n- Action: Alice to draft API spec by Tuesday',
          template: 'minutes',
        },
      },
    ],
  },

  // ─── Incident Post-Mortem ─────────────────────────────────────────────────
  {
    id: 'post-mortem',
    name: 'Incident Post-Mortem',
    description:
      'Generates a timeline-driven, blameless Post-Mortem / RCA report from incident details, ' +
      'a timeline of events, and action items.',
    category: 'engineering',
    uiPath: '/tools/post-mortem',
    parameters: {
      type: 'object',
      required: ['incidentName', 'summary', 'rootCause'],
      properties: {
        incidentName: {
          type: 'string',
          description: 'Short title of the incident (e.g. "Production DB Outage – 2025-07-14").',
        },
        date: {
          type: 'string',
          description: 'ISO 8601 date the incident occurred.',
        },
        severity: {
          type: 'string',
          description: 'Incident severity level.',
          enum: ['SEV-1', 'SEV-2', 'SEV-3', 'SEV-4'],
          default: 'SEV-2',
        },
        summary: {
          type: 'string',
          description: 'Executive summary of what happened and the user impact.',
        },
        rootCause: {
          type: 'string',
          description: 'The identified root cause of the incident.',
        },
        timeline: {
          type: 'string',
          description:
            'Chronological timeline as plain text. Format each entry as "HH:MM - event description", one per line.',
        },
        actionItems: {
          type: 'string',
          description:
            'Action items to prevent recurrence. Format as "Owner: task description", one per line.',
        },
      },
    },
    output: {
      format: 'markdown',
      streaming: true,
      contentType: 'text/plain; charset=utf-8',
      fileExtension: 'md',
    },
    examples: [
      {
        summary: 'Generate an RCA report for a database outage',
        parameters: {
          incidentName: 'Production Database Outage',
          date: '2025-07-14',
          severity: 'SEV-1',
          summary: 'Primary DB cluster went down for 45 min causing 500 errors across all services.',
          rootCause: 'Migration script locked the users table, exhausting connection pool.',
          timeline: '14:00 - Migration deployed\n14:05 - Alerts triggered\n14:45 - Rollback complete',
          actionItems: 'Alice: Add connection timeout limits\nBob: Gate migrations behind review checklist',
        },
      },
    ],
  },

  // ─── ADR Builder ─────────────────────────────────────────────────────────
  {
    id: 'adr-builder',
    name: 'ADR Builder',
    description:
      'Generates a formal Architecture Decision Record (ADR) from context, decision, and consequences ' +
      'written in plain prose or Markdown.',
    category: 'engineering',
    uiPath: '/tools/adr-builder',
    parameters: {
      type: 'object',
      required: ['title', 'context', 'decision'],
      properties: {
        title: {
          type: 'string',
          description: 'Short, imperative title of the decision (e.g. "Adopt Next.js App Router").',
        },
        date: {
          type: 'string',
          description: 'ISO 8601 date.',
        },
        status: {
          type: 'string',
          description: 'Current status of the decision.',
          enum: ['Proposed', 'Accepted', 'Rejected', 'Deprecated', 'Superseded'],
          default: 'Proposed',
        },
        context: {
          type: 'string',
          description: 'The problem or situation that forced this decision.',
        },
        decision: {
          type: 'string',
          description: 'The decision that was made.',
        },
        consequences: {
          type: 'string',
          description: 'Positive and negative consequences of the decision.',
        },
      },
    },
    output: {
      format: 'markdown',
      streaming: true,
      contentType: 'text/plain; charset=utf-8',
      fileExtension: 'md',
    },
    examples: [
      {
        summary: 'Record a decision to adopt Next.js App Router',
        parameters: {
          title: 'Adopt Next.js App Router for Frontend',
          status: 'Accepted',
          context: 'Our SPA approach causes SEO and initial load time issues.',
          decision: 'Migrate to Next.js App Router to leverage React Server Components.',
          consequences: 'Better SEO and load times. Team needs upskilling on RSC patterns.',
        },
      },
    ],
  },

  // ─── Release Notes ────────────────────────────────────────────────────────
  {
    id: 'release-notes',
    name: 'Release Notes Beautifier',
    description:
      'Transforms a raw list of features and bug fixes into marketing-ready, beautifully formatted release notes.',
    category: 'documentation',
    uiPath: '/tools/release-notes',
    parameters: {
      type: 'object',
      required: ['version', 'intro'],
      properties: {
        version: {
          type: 'string',
          description: 'Semantic version string (e.g. v2.4.0).',
        },
        date: {
          type: 'string',
          description: 'Release date in ISO 8601 format.',
        },
        intro: {
          type: 'string',
          description: 'One-paragraph introduction or highlight of the release.',
        },
        features: {
          type: 'string',
          description: 'New features, one per line.',
        },
        fixes: {
          type: 'string',
          description: 'Bug fixes, one per line.',
        },
      },
    },
    output: {
      format: 'markdown',
      streaming: true,
      contentType: 'text/plain; charset=utf-8',
      fileExtension: 'md',
    },
    examples: [
      {
        summary: 'Generate release notes for v2.4.0',
        parameters: {
          version: 'v2.4.0',
          date: '2025-07-14',
          intro: 'This release delivers major performance improvements and new developer tooling.',
          features: 'Added visual document builder with drag-and-drop\nReal-time collaboration cursors',
          fixes: 'Fixed race condition in sidebar initialisation\nResolved WebGL memory leak',
        },
      },
    ],
  },

  // ─── API Documenter ───────────────────────────────────────────────────────
  {
    id: 'api-documenter',
    name: 'API Payload Documenter',
    description:
      'Generates clean, tabular API contract documentation from endpoint configuration ' +
      'and field definitions for request and response payloads.',
    category: 'documentation',
    uiPath: '/tools/api-documenter',
    parameters: {
      type: 'object',
      required: ['title', 'method', 'url'],
      properties: {
        title: {
          type: 'string',
          description: 'Human-readable endpoint name (e.g. "Create User").',
        },
        method: {
          type: 'string',
          description: 'HTTP method.',
          enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        },
        url: {
          type: 'string',
          description: 'Endpoint path (e.g. /api/v1/users).',
        },
        description: {
          type: 'string',
          description: 'What this endpoint does.',
        },
        requestFields: {
          type: 'string',
          description:
            'Request payload fields as JSON array string. Each item: {name, type, required, description}.',
        },
        responseFields: {
          type: 'string',
          description:
            'Response payload fields as JSON array string. Each item: {name, type, description}.',
        },
      },
    },
    output: {
      format: 'markdown',
      streaming: true,
      contentType: 'text/plain; charset=utf-8',
      fileExtension: 'md',
    },
    examples: [
      {
        summary: 'Document the Create User endpoint',
        parameters: {
          title: 'Create User',
          method: 'POST',
          url: '/api/v1/users',
          description: 'Creates a new user and dispatches a welcome email.',
          requestFields:
            '[{"name":"email","type":"string","required":true,"description":"Unique email address"},{"name":"role","type":"string","required":false,"description":"Defaults to member"}]',
          responseFields:
            '[{"name":"id","type":"string","description":"UUID of the new user"},{"name":"created_at","type":"timestamp","description":"ISO 8601 creation timestamp"}]',
        },
      },
    ],
  },

  // ─── Code to Legal ────────────────────────────────────────────────────────
  {
    id: 'code-to-legal',
    name: 'Code to Legal Agreement',
    description:
      'Transforms architecture proposals and source code definitions into structured legal documents — ' +
      'NDAs, Independent Contractor Agreements, Statements of Work, or OSS CLAs.',
    category: 'legal',
    uiPath: '/tools/code-to-legal',
    parameters: {
      type: 'object',
      required: ['documentType', 'partyA', 'partyB'],
      properties: {
        documentType: {
          type: 'string',
          description: 'Type of legal agreement to generate.',
          enum: ['NDA', 'Independent Contractor Agreement', 'Statement of Work', 'OSS Contributor License Agreement'],
          default: 'NDA',
        },
        partyA: {
          type: 'string',
          description: 'Name of Party A (client / disclosing party).',
        },
        partyB: {
          type: 'string',
          description: 'Name of Party B (contractor / receiving party).',
        },
        date: {
          type: 'string',
          description: 'Effective date in ISO 8601 format.',
        },
        projectDescription: {
          type: 'string',
          description:
            'Optional: a description of the project or work scope to embed in the agreement.',
        },
        additionalClauses: {
          type: 'string',
          description: 'Optional: extra terms or clauses to include, one per line.',
        },
      },
    },
    output: {
      format: 'markdown',
      streaming: true,
      contentType: 'text/plain; charset=utf-8',
      fileExtension: 'md',
    },
    examples: [
      {
        summary: 'Generate an NDA between two parties',
        parameters: {
          documentType: 'NDA',
          partyA: 'Acme Corp',
          partyB: 'Jane Doe, Freelance Engineer',
          date: '2025-07-14',
          projectDescription: 'Development of a proprietary inventory management system.',
        },
      },
    ],
  },

  // ─── Visual Builder / Layout ──────────────────────────────────────────────
  {
    id: 'visual-builder',
    name: 'Visual Document Builder',
    description:
      'Generates a fully-styled HTML document layout from a natural language description. ' +
      'The HTML is compatible with the Hephaestus drag-and-drop canvas editor.',
    category: 'design',
    uiPath: '/tools/visual-builder',
    parameters: {
      type: 'object',
      required: ['prompt'],
      properties: {
        prompt: {
          type: 'string',
          description:
            'Natural language description of the document to generate ' +
            '(e.g. "A modern SaaS invoice with line items and a logo placeholder").',
        },
      },
    },
    output: {
      format: 'html',
      streaming: false,
      contentType: 'application/json',
      fileExtension: 'html',
    },
    examples: [
      {
        summary: 'Generate a modern invoice layout',
        parameters: { prompt: 'A clean, modern SaaS invoice with company branding, line items table, and payment summary' },
      },
    ],
  },
];

/** Fast O(1) lookup by toolId */
export const TOOL_MAP = new Map<string, ToolDefinition>(
  TOOL_REGISTRY.map((t) => [t.id, t])
);

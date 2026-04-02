import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";

// ─────────────────────────────────────────────────────────────
//  Vercel serverless config
// ─────────────────────────────────────────────────────────────
export const maxDuration = 120;

// ─────────────────────────────────────────────────────────────
//  Tool Implementations
// ─────────────────────────────────────────────────────────────
function researchClient(name: string): string {
  const research: Record<string, string> = {
    "Globex Corp": `
COMPANY: Globex Corp | Industry: Global Manufacturing & Distribution | HQ: Chicago, IL | Revenue: $4.2B (FY2025)

RECENT NEWS:
- Q1 2026: Globex announced a $180M warehouse automation initiative across 12 fulfillment centers in North America and Europe.
- Feb 2026: Their CFO disclosed in an earnings call that logistics inefficiencies cost the company an estimated $38M annually in delayed shipments and excess inventory.
- Jan 2026: Globex acquired SmartRoute Inc., a last-mile delivery startup, signaling aggressive investment in supply chain technology.
- Dec 2025: A Reuters investigation found that Globex's current legacy ERP system (SAP R/3) is 14 years old and struggles with real-time container tracking.

PAIN POINTS IDENTIFIED:
1. Real-time visibility gap — Cannot track shipments across ocean, rail, and truck in a unified dashboard.
2. Manual demand forecasting — Still relies on spreadsheet-based quarterly forecasts, leading to 22% overstock and 15% stockout rates.
3. Vendor coordination bottleneck — 340+ suppliers across 28 countries with no centralized communication or automated PO workflow.
4. Compliance risk — Facing EU CBAM (Carbon Border Adjustment Mechanism) reporting deadlines in Q3 2026 with no automated carbon tracking.
5. Integration debt — 7 disconnected systems (WMS, TMS, OMS, ERP, CRM, BI, EDI) with brittle point-to-point integrations.

KEY DECISION MAKERS:
- CEO: Margaret Chen (champion of digital transformation)
- CTO: David Park (pushing for API-first architecture)
- VP Supply Chain: Carlos Rivera (frustrated with current vendor lock-in)
    `.trim(),
  };

  return (
    research[name] ??
    `
COMPANY: ${name} | Industry: Technology & Services | Revenue: $800M (estimated)

RECENT NEWS:
- Q1 2026: ${name} is undergoing a major digital transformation, consolidating legacy systems into a modern cloud-native stack.
- Feb 2026: Their operations team reported 18% year-over-year growth in order volume, straining existing logistics infrastructure.
- Jan 2026: The company RFP'd for a unified supply chain platform after experiencing two major shipping disruptions in Q4 2025.

PAIN POINTS IDENTIFIED:
1. Fragmented logistics stack — Multiple disconnected tools for warehouse management, shipping, and order tracking.
2. Scaling bottleneck — Current systems cannot handle projected 30% growth in transaction volume.
3. Poor analytics — No real-time dashboards; leadership relies on weekly manually compiled reports.
4. API integration gaps — Partners and vendors lack programmatic access to order status and inventory levels.
5. Compliance overhead — Manual processes for regulatory reporting consume 200+ staff hours per quarter.

KEY DECISION MAKERS:
- CTO: Actively seeking API-first, developer-friendly platforms.
- VP Operations: Needs immediate relief for order fulfillment bottlenecks.
  `.trim()
  );
}

function getPricing(tier: string): string {
  const pricing: Record<string, object> = {
    "Enterprise Logistics API": {
      tier: "Enterprise Logistics API",
      setupFee: "$45,000",
      setupDescription:
        "White-glove onboarding: dedicated solutions architect, custom API schema design, historical data migration, and 3 parallel integration sprints",
      monthly: {
        base: "$12,500/mo",
        includes:
          "Up to 500K API calls/mo, 50 warehouse connections, real-time tracking for up to 10K active shipments",
        overage: "$0.008 per additional API call",
      },
      annualCommitDiscount:
        "15% discount on annual commitment ($127,500/yr vs $150,000/yr)",
      sla: {
        uptime: "99.95% guaranteed",
        responseTime: "< 200ms p95 latency",
        support: "24/7 dedicated Slack channel + named account engineer",
        incidentResponse: "P1: 15min, P2: 1hr, P3: 4hr",
        dataResidency:
          "Choice of US, EU, or APAC data regions with full GDPR/SOC2 compliance",
      },
      addOns: [
        {
          name: "Predictive Analytics Module",
          price: "$4,200/mo",
          description:
            "ML-powered demand forecasting, anomaly detection, and route optimization",
        },
        {
          name: "Carbon Tracking & ESG Reporting",
          price: "$2,800/mo",
          description:
            "Automated Scope 3 emissions calculation, EU CBAM-ready reports, sustainability dashboards",
        },
        {
          name: "EDI Gateway",
          price: "$3,100/mo",
          description:
            "Drop-in EDI-to-API bridge for legacy partner systems (supports X12, EDIFACT, AS2)",
        },
      ],
    },
  };

  return JSON.stringify(
    pricing[tier] ?? {
      tier,
      setupFee: "$25,000",
      setupDescription:
        "Standard onboarding with integration support and data migration",
      monthly: {
        base: "$8,500/mo",
        includes: "Up to 250K API calls/mo, 20 connections, real-time tracking",
        overage: "$0.012 per additional API call",
      },
      annualCommitDiscount: "12% discount on annual commitment",
      sla: {
        uptime: "99.9% guaranteed",
        responseTime: "< 300ms p95 latency",
        support: "Business hours support + dedicated account manager",
        incidentResponse: "P1: 30min, P2: 2hr, P3: 8hr",
      },
      addOns: [
        {
          name: "Analytics Module",
          price: "$3,000/mo",
          description: "Demand forecasting and reporting dashboards",
        },
      ],
    },
    null,
    2
  );
}

// ─────────────────────────────────────────────────────────────
//  Tool Definitions
// ─────────────────────────────────────────────────────────────
const tools: Anthropic.Messages.Tool[] = [
  {
    name: "researchClient",
    description:
      "Researches a target client company and returns recent news, financial data, key decision makers, and identified pain points relevant to supply chain and logistics.",
    input_schema: {
      type: "object" as const,
      properties: {
        clientName: {
          type: "string",
          description: "The name of the client company to research",
        },
      },
      required: ["clientName"],
    },
  },
  {
    name: "getPricing",
    description:
      "Retrieves detailed pricing information for a specific product tier, including setup fees, monthly costs, SLA terms, and available add-on modules.",
    input_schema: {
      type: "object" as const,
      properties: {
        productTier: {
          type: "string",
          description:
            "The product tier to get pricing for (e.g., 'Enterprise Logistics API')",
        },
      },
      required: ["productTier"],
    },
  },
  {
    name: "generateProposalHTML",
    description:
      "Generates a complete HTML sales proposal. The HTML should be a fully self-contained, beautifully designed page using Tailwind CSS via CDN. It must include: a hero section, personalized Why Us section, pricing table, and a Sign Here contract block.",
    input_schema: {
      type: "object" as const,
      properties: {
        htmlContent: {
          type: "string",
          description:
            "The complete HTML content of the proposal page, including <!DOCTYPE html>, <head> with Tailwind CDN, and full <body>",
        },
      },
      required: ["htmlContent"],
    },
  },
];

// ─────────────────────────────────────────────────────────────
//  Handler
// ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientName: string = req.body?.clientName ?? "Globex Corp";
  const productTier: string =
    req.body?.productTier ?? "Enterprise Logistics API";

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let generatedHTML = "";
  const agentLog: { type: string; content: string }[] = [];

  // Tool executor — captures HTML in memory instead of writing to disk
  function executeTool(name: string, input: Record<string, string>): string {
    switch (name) {
      case "researchClient":
        return researchClient(input.clientName);
      case "getPricing":
        return getPricing(input.productTier);
      case "generateProposalHTML":
        generatedHTML = input.htmlContent;
        return `Proposal HTML generated successfully (${input.htmlContent.length} chars)`;
      default:
        return `Error: Unknown tool "${name}"`;
    }
  }

  const systemPrompt = `You are an elite autonomous sales agent for a cutting-edge supply chain SaaS company called "ChainForge AI". Your mission is to create a highly personalized, compelling sales proposal.

You MUST follow this exact sequence of actions — do not skip any step:

1. FIRST: Call researchClient to gather intelligence on the target company.
2. SECOND: Call getPricing to get the product tier details.
3. THIRD: Synthesize the research and pricing into a stunning HTML proposal, then call generateProposalHTML.

For the HTML proposal:
- Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
- Design it like a premium SaaS proposal — clean, modern, professional.
- Include these sections:
  a) A hero/header section with ChainForge AI branding, the client's name, and a compelling tagline.
  b) An "Executive Summary" that references specific pain points discovered in the research.
  c) A "Why ChainForge AI" section that directly maps your capabilities to their specific challenges (be specific, cite their news/data).
  d) A detailed pricing table with the base plan and recommended add-ons (explain why each add-on is relevant to THIS client).
  e) An ROI projection section (estimate savings based on their reported inefficiency costs).
  f) A "Sign Here" contract acceptance block with signature lines and date.
- Use a sophisticated color palette (dark navy, electric blue accents, white space).
- Make it look like it came from a top-tier design agency.

Before each tool call, explain your reasoning.`;

  const messages: Anthropic.Messages.MessageParam[] = [
    {
      role: "user",
      content: `Create a personalized sales proposal for **${clientName}** for our **${productTier}** product. Research the client thoroughly, pull our pricing details, then generate a beautiful HTML proposal. Begin now.`,
    },
  ];

  let step = 0;
  const maxSteps = 10;

  while (step < maxSteps) {
    step++;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 16000,
      system: systemPrompt,
      tools,
      messages,
    });

    const assistantContent = response.content;
    const toolUseBlocks: Anthropic.Messages.ToolUseBlock[] = [];

    for (const block of assistantContent) {
      if (block.type === "text") {
        agentLog.push({ type: "reasoning", content: block.text });
      } else if (block.type === "tool_use") {
        toolUseBlocks.push(block);
      }
    }

    if (response.stop_reason === "end_turn" && toolUseBlocks.length === 0) {
      break;
    }

    messages.push({ role: "assistant", content: assistantContent });

    if (toolUseBlocks.length > 0) {
      const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        agentLog.push({
          type: "action",
          content: `Called ${toolUse.name}(${JSON.stringify(toolUse.input).slice(0, 120)})`,
        });

        const result = executeTool(
          toolUse.name,
          toolUse.input as Record<string, string>
        );

        agentLog.push({ type: "observation", content: result.slice(0, 300) });

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      messages.push({ role: "user", content: toolResults });
    }

    if (response.stop_reason === "end_turn") break;
  }

  if (!generatedHTML) {
    return res.status(500).json({ error: "Agent failed to generate HTML" });
  }

  return res.status(200).json({ html: generatedHTML, log: agentLog });
}

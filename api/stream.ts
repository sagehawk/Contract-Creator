import type { VercelRequest, VercelResponse } from "@vercel/node";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 120;

// ─────────────────────────────────────────────────────────────
//  Tool Implementations
// ─────────────────────────────────────────────────────────────
function researchClient(name: string): string {
  const research: Record<string, string> = {
    "Globex Corp": `COMPANY: Globex Corp | Industry: Global Manufacturing & Distribution | HQ: Chicago, IL | Revenue: $4.2B (FY2025)

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
- VP Supply Chain: Carlos Rivera (frustrated with current vendor lock-in)`,
  };
  return research[name] ?? `COMPANY: ${name} | Industry: Technology & Services | Revenue: $800M (estimated)

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
- VP Operations: Needs immediate relief for order fulfillment bottlenecks.`;
}

function getPricing(tier: string): string {
  const pricing: Record<string, object> = {
    "Enterprise Logistics API": {
      tier: "Enterprise Logistics API", setupFee: "$45,000",
      setupDescription: "White-glove onboarding: dedicated solutions architect, custom API schema design, historical data migration, and 3 parallel integration sprints",
      monthly: { base: "$12,500/mo", includes: "Up to 500K API calls/mo, 50 warehouse connections, real-time tracking for up to 10K active shipments", overage: "$0.008 per additional API call" },
      annualCommitDiscount: "15% discount on annual commitment ($127,500/yr vs $150,000/yr)",
      sla: { uptime: "99.95% guaranteed", responseTime: "< 200ms p95 latency", support: "24/7 dedicated Slack channel + named account engineer", incidentResponse: "P1: 15min, P2: 1hr, P3: 4hr", dataResidency: "Choice of US, EU, or APAC data regions with full GDPR/SOC2 compliance" },
      addOns: [
        { name: "Predictive Analytics Module", price: "$4,200/mo", description: "ML-powered demand forecasting, anomaly detection, and route optimization" },
        { name: "Carbon Tracking & ESG Reporting", price: "$2,800/mo", description: "Automated Scope 3 emissions calculation, EU CBAM-ready reports, sustainability dashboards" },
        { name: "EDI Gateway", price: "$3,100/mo", description: "Drop-in EDI-to-API bridge for legacy partner systems (supports X12, EDIFACT, AS2)" },
      ],
    },
  };
  return JSON.stringify(pricing[tier] ?? {
    tier, setupFee: "$25,000", setupDescription: "Standard onboarding with integration support and data migration",
    monthly: { base: "$8,500/mo", includes: "Up to 250K API calls/mo, 20 connections, real-time tracking", overage: "$0.012 per additional API call" },
    annualCommitDiscount: "12% discount on annual commitment",
    sla: { uptime: "99.9% guaranteed", responseTime: "< 300ms p95 latency", support: "Business hours support + dedicated account manager", incidentResponse: "P1: 30min, P2: 2hr, P3: 8hr" },
    addOns: [{ name: "Analytics Module", price: "$3,000/mo", description: "Demand forecasting and reporting dashboards" }],
  }, null, 2);
}

// ─────────────────────────────────────────────────────────────
//  Proposal Template
// ─────────────────────────────────────────────────────────────
interface ProposalData {
  companyName: string; tagline: string; executiveSummary: string;
  painPoints: { title: string; description: string }[];
  whyUsBullets: { heading: string; detail: string }[];
  pricingBreakdown: {
    planName: string; setupFee: string; monthlyFee: string; setupDescription: string;
    includedFeatures: string[]; sla: { label: string; value: string }[];
    addOns: { name: string; price: string; reason: string }[];
  };
  roiProjections: { metric: string; value: string }[];
  estimatedAnnualSavings: string;
}

function esc(s: string): string {
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function buildProposalHTML(data: ProposalData): string {
  const today = new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});
  const painPointCards = data.painPoints.map(p=>`<div class="bg-red-500/5 border border-red-500/10 rounded-xl p-5"><div class="flex items-start gap-3"><div class="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center"><svg class="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div><div><div class="font-semibold text-white text-sm">${esc(p.title)}</div><div class="text-slate-400 text-sm mt-1">${esc(p.description)}</div></div></div></div>`).join("");
  const whyUsItems = data.whyUsBullets.map(b=>`<div class="flex gap-4 items-start"><div class="mt-1 flex-shrink-0 w-7 h-7 rounded-full bg-blue-500/20 flex items-center justify-center"><svg class="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></div><div><div class="font-semibold text-white">${esc(b.heading)}</div><div class="text-slate-400 text-sm mt-1 leading-relaxed">${esc(b.detail)}</div></div></div>`).join("");
  const features = data.pricingBreakdown.includedFeatures.map(f=>`<li class="flex items-center gap-2"><svg class="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg><span class="text-slate-300 text-sm">${esc(f)}</span></li>`).join("");
  const slaCards = data.pricingBreakdown.sla.map(s=>`<div class="bg-white/[0.03] rounded-xl p-4 text-center border border-white/5"><div class="text-lg font-bold text-blue-300">${esc(s.value)}</div><div class="text-xs text-slate-500 mt-1">${esc(s.label)}</div></div>`).join("");
  const addOnRows = data.pricingBreakdown.addOns.map(a=>`<tr class="border-b border-white/5"><td class="py-4 pr-4"><div class="font-semibold text-white">${esc(a.name)}</div><div class="text-sm text-blue-300/80 mt-1 italic">&rarr; ${esc(a.reason)}</div></td><td class="py-4 text-right font-mono font-bold text-blue-300 whitespace-nowrap align-top">${esc(a.price)}</td></tr>`).join("");
  const roiCards = data.roiProjections.map(r=>`<div class="bg-white/[0.03] rounded-xl p-5 text-center border border-white/5"><div class="text-2xl font-black text-white">${esc(r.value)}</div><div class="text-sm text-slate-400 mt-1">${esc(r.metric)}</div></div>`).join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>ChainForge AI — Proposal for ${esc(data.companyName)}</title><script src="https://cdn.tailwindcss.com"><\/script><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/><script>tailwind.config={theme:{extend:{fontFamily:{sans:['Inter','system-ui','sans-serif']}}}}<\/script><style>body{background:#03071e}.gradient-text{background:linear-gradient(135deg,#4d9fff,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.glass{background:rgba(255,255,255,.03);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.08)}</style></head><body class="font-sans text-white min-h-screen">
<div class="relative overflow-hidden"><div class="absolute inset-0 opacity-10" style="background:radial-gradient(ellipse at 30% 0%,#1a7fff,transparent 60%),radial-gradient(ellipse at 70% 100%,#7c3aed,transparent 60%)"></div>
<div class="relative max-w-5xl mx-auto px-8 pt-12 pb-8"><div class="flex items-center gap-3 mb-12"><div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg></div><span class="font-bold text-xl tracking-tight">ChainForge <span class="text-blue-400">AI</span></span></div>
<div class="text-sm font-semibold text-blue-400 uppercase tracking-widest mb-4">Partnership Proposal</div>
<h1 class="text-5xl font-black tracking-tight leading-tight mb-4">Prepared for <span class="gradient-text">${esc(data.companyName)}</span></h1>
<p class="text-xl text-slate-400 max-w-2xl leading-relaxed">${esc(data.tagline)}</p>
<div class="mt-6 text-sm text-slate-500">${today} &middot; Confidential</div></div></div>
<div class="max-w-5xl mx-auto px-8 py-12 space-y-16">
<section><h2 class="text-2xl font-bold mb-6 flex items-center gap-3"><span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-black">01</span>Executive Summary</h2><div class="glass rounded-2xl p-8"><p class="text-slate-300 leading-relaxed text-lg">${esc(data.executiveSummary)}</p></div></section>
<section><h2 class="text-2xl font-bold mb-6 flex items-center gap-3"><span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-black">02</span>Challenges We Identified</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-4">${painPointCards}</div></section>
<section><h2 class="text-2xl font-bold mb-6 flex items-center gap-3"><span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-black">03</span>Why ChainForge AI</h2><div class="glass rounded-2xl p-8 space-y-6">${whyUsItems}</div></section>
<section><h2 class="text-2xl font-bold mb-6 flex items-center gap-3"><span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-black">04</span>Investment</h2><div class="glass rounded-2xl p-8"><div class="flex items-baseline justify-between mb-6 pb-6 border-b border-white/10"><div><div class="text-lg font-bold">${esc(data.pricingBreakdown.planName)}</div><div class="text-sm text-slate-400 mt-1">${esc(data.pricingBreakdown.setupDescription)}</div></div><div class="text-right"><div class="text-3xl font-black text-white">${esc(data.pricingBreakdown.monthlyFee)}</div><div class="text-sm text-slate-400">+ ${esc(data.pricingBreakdown.setupFee)} one-time setup</div></div></div><ul class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">${features}</ul><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">${slaCards}</div><h3 class="text-lg font-bold mb-4">Recommended Add-Ons for ${esc(data.companyName)}</h3><table class="w-full">${addOnRows}</table></div></section>
<section><h2 class="text-2xl font-bold mb-6 flex items-center gap-3"><span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-black">05</span>Projected ROI</h2><div class="glass rounded-2xl p-8"><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">${roiCards}</div><div class="text-center mt-6 py-5 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"><div class="text-sm text-slate-400 mb-1">Estimated Annual Savings</div><div class="text-4xl font-black gradient-text">${esc(data.estimatedAnnualSavings)}</div></div></div></section>
<section><h2 class="text-2xl font-bold mb-6 flex items-center gap-3"><span class="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-black">06</span>Agreement</h2><div class="glass rounded-2xl p-8"><p class="text-slate-400 text-sm leading-relaxed mb-8">By signing below, both parties agree to proceed with the ${esc(data.pricingBreakdown.planName)} engagement as outlined in this proposal. This agreement is subject to ChainForge AI's standard Terms of Service and the SLA guarantees specified above. The initial term is 12 months from the date of execution.</p><div class="grid grid-cols-2 gap-12"><div><div class="text-xs text-slate-500 uppercase tracking-widest mb-4">For ${esc(data.companyName)}</div><div class="border-b border-white/20 pb-2 mb-2 h-12"></div><div class="text-sm text-slate-500">Authorized Signature</div><div class="border-b border-white/20 pb-2 mb-2 mt-6 h-8"></div><div class="text-sm text-slate-500">Date</div></div><div><div class="text-xs text-slate-500 uppercase tracking-widest mb-4">For ChainForge AI</div><div class="border-b border-white/20 pb-2 mb-2 h-12"></div><div class="text-sm text-slate-500">Authorized Signature</div><div class="border-b border-white/20 pb-2 mb-2 mt-6 h-8"></div><div class="text-sm text-slate-500">Date</div></div></div></div></section>
</div><footer class="text-center py-8 text-xs text-slate-600">ChainForge AI &middot; Confidential &middot; Generated ${today}</footer></body></html>`;
}

// ─────────────────────────────────────────────────────────────
//  Tool Definitions
// ─────────────────────────────────────────────────────────────
const tools: Anthropic.Messages.Tool[] = [
  {
    name: "researchClient",
    description: "Researches a target client company and returns recent news, financial data, key decision makers, and identified pain points relevant to supply chain and logistics.",
    input_schema: { type: "object" as const, properties: { clientName: { type: "string", description: "The name of the client company to research" } }, required: ["clientName"] },
  },
  {
    name: "getPricing",
    description: "Retrieves detailed pricing information for a specific product tier, including setup fees, monthly costs, SLA terms, and available add-on modules.",
    input_schema: { type: "object" as const, properties: { productTier: { type: "string", description: "The product tier to get pricing for" } }, required: ["productTier"] },
  },
  {
    name: "generateProposalHTML",
    description: "Generates a professional HTML sales proposal and writes it to disk. Pass structured proposal data as JSON — the tool handles all HTML rendering. Do NOT pass raw HTML.",
    input_schema: {
      type: "object" as const,
      properties: {
        companyName: { type: "string" }, tagline: { type: "string" }, executiveSummary: { type: "string" },
        painPoints: { type: "array", items: { type: "object", properties: { title: { type: "string" }, description: { type: "string" } }, required: ["title","description"] } },
        whyUsBullets: { type: "array", items: { type: "object", properties: { heading: { type: "string" }, detail: { type: "string" } }, required: ["heading","detail"] } },
        pricingBreakdown: { type: "object", properties: {
          planName:{type:"string"},setupFee:{type:"string"},monthlyFee:{type:"string"},setupDescription:{type:"string"},
          includedFeatures:{type:"array",items:{type:"string"}},
          sla:{type:"array",items:{type:"object",properties:{label:{type:"string"},value:{type:"string"}},required:["label","value"]}},
          addOns:{type:"array",items:{type:"object",properties:{name:{type:"string"},price:{type:"string"},reason:{type:"string"}},required:["name","price","reason"]}},
        }, required:["planName","setupFee","monthlyFee","setupDescription","includedFeatures","sla","addOns"] },
        roiProjections: { type: "array", items: { type: "object", properties: { metric: { type: "string" }, value: { type: "string" } }, required: ["metric","value"] } },
        estimatedAnnualSavings: { type: "string" },
      },
      required: ["companyName","tagline","executiveSummary","painPoints","whyUsBullets","pricingBreakdown","roiProjections","estimatedAnnualSavings"],
    },
  },
];

const SYSTEM_PROMPT = `You are an elite autonomous sales agent for "ChainForge AI". Your mission is to create a highly personalized sales proposal.

You MUST follow this exact sequence — do not skip any step:
1. FIRST: Call researchClient to gather intelligence on the target company.
2. SECOND: Call getPricing to get the product tier details.
3. THIRD: Synthesize everything by calling generateProposalHTML with structured proposal data (JSON, NOT raw HTML).

For the proposal content:
- Write a compelling tagline personalized to the client.
- Write an executive summary referencing SPECIFIC pain points and numbers from the research.
- List 3-5 pain points citing real data from the research.
- Write 4-5 "Why Us" bullets mapping capabilities to the client's challenges.
- Structure pricing from getPricing data with personalized add-on reasons.
- Project 3-5 ROI metrics grounded in reported costs.

Before each tool call, explain your reasoning.`;

// ─────────────────────────────────────────────────────────────
//  SSE Handler
// ─────────────────────────────────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = new URL(req.url!, `http://${req.headers.host}`);
  const clientName = url.searchParams.get("clientName") ?? req.query?.clientName as string ?? "Globex Corp";
  const productTier = url.searchParams.get("productTier") ?? req.query?.productTier as string ?? "Enterprise Logistics API";

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");

  function send(event: string, data: Record<string, unknown>) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  let generatedHTML = "";

  function executeTool(name: string, input: Record<string, unknown>): string {
    switch (name) {
      case "researchClient": return researchClient(input.clientName as string);
      case "getPricing": return getPricing(input.productTier as string);
      case "generateProposalHTML": {
        const html = buildProposalHTML(input as unknown as ProposalData);
        generatedHTML = html;
        return `Proposal generated (${html.length} bytes)`;
      }
      default: return `Error: Unknown tool "${name}"`;
    }
  }

  send("connected", { message: "Agent initializing..." });

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: `Create a personalized sales proposal for **${clientName}** for our **${productTier}** product. Research the client, pull pricing, then generate the proposal. Begin now.` },
  ];

  try {
    let step = 0;
    const maxSteps = 10;

    while (step < maxSteps) {
      step++;
      send("step", { step });
      send("status", { message: "Sending request to Claude..." });

      const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        tools,
        messages,
      });

      send("tokens", { input: response.usage.input_tokens, output: response.usage.output_tokens });

      const assistantContent = response.content;
      const toolUseBlocks: Anthropic.Messages.ToolUseBlock[] = [];

      for (const block of assistantContent) {
        if (block.type === "text") send("reasoning", { content: block.text });
        else if (block.type === "tool_use") toolUseBlocks.push(block);
      }

      if (response.stop_reason === "end_turn" && toolUseBlocks.length === 0) break;

      messages.push({ role: "assistant", content: assistantContent });

      if (toolUseBlocks.length > 0) {
        const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
        for (const toolUse of toolUseBlocks) {
          send("action", { tool: toolUse.name, args: JSON.stringify(toolUse.input).slice(0, 300) });
          const result = executeTool(toolUse.name, toolUse.input as Record<string, unknown>);
          const preview = result.length > 500 ? result.slice(0, 500) + "..." : result;
          send("observation", { tool: toolUse.name, result: preview });
          toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: result });
        }
        messages.push({ role: "user", content: toolResults });
      }

      if (response.stop_reason === "end_turn") break;
    }

    if (generatedHTML) {
      send("complete", { html: generatedHTML });
    } else {
      send("error", { message: "Agent finished without generating a proposal." });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    send("error", { message });
  }

  res.end();
}

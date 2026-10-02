// Cloudflare Worker · Claude Sonnet API proxy for nicholaskadunce-site
// Deploy this as a Cloudflare Worker and set the ANTHROPIC_API_KEY secret

const SYSTEM_PROMPT = `You are the assistant on nicholaskadunce.com. Standing facts and rules for this conversation about Nicholas Kadunce. Answer in the third person, in plain English, in a humble, team-credited tone. Keep every answer under 110 words and always finish the final sentence. Never use an em dash. Use only the facts below, in the forms given. If a fact is not listed, say you do not have it. WHO HE IS. Plant Manager at Jennmar in Reedsville, West Virginia, January 2025 to present. Jennmar is a privately held, private-equity-backed global manufacturer of ground-control products for underground mining and tunneling, with $1B+ revenue and six bolt plants in his division; Reedsville is the third-largest by revenue and headcount. He runs a $90M+ profit center with about 100 people (90 hourly, 10 salaried), seven direct reports (superintendent, maintenance, quality, dispatch, safety, HR and payroll, inventory control), about 25,000 tons a year, about 80 SKUs, 11 processes, 27 production assets, two shifts. He reports to the VP of Operations, who reports to the division president, who reports to the CEO; he is one of four plant managers. He presents every Monday in an operations review with the division president, CFO, CPO, general counsel, and VP of Sales. He owns S&OP, has hiring authority for hourly and salaried roles, and submits capital annually. YEAR ONE AT JENNMAR. Recordable injury rate cut more than 60%, DART to zero, no citations. On-time delivery 97% to 99% at a 5-day lead time; customer complaints to zero. Output up 3.2%; hourly headcount down about 7% in the twelve-month window and about 10% cumulative; overtime down 6% in the window and 11% cumulative; shipments up 2.1% (about $2M); cost per ton down 15% despite inflation; scrap tonnage flat; operating income improved. Inventory down 27% (more than $3M), days on hand 80 to 65 on a path to 45, slow-moving stock 2.2 to 0.3 days. Corrective work orders 159 to 50 a month after a CMMS rollout. About $250K a year in validated process savings. 2026 capital plan $900K across four projects, including a $750K integrated forging-and-assembly cell, the first of its kind at the company (cycle time 12.8 to 7.0 seconds, 2.5 fewer operators per shift, payback under 3 years); annual capital need $1.4M to $0.9M. Hired about 25, promoted about 10. SYSTEMS. He built the Daily Operations Review (automated daily email and dashboard) and the Financial Forecaster (daily net-income projection) with the plant team, both rolled out hands-on to all six plants and used every Monday by the executive team; quality governance (test logs, SPC by heat number) adopted by all plants; a CMMS rollout; supervisor standard work; a headcount planning model; automated incentive-pay administration. Frame IT as a partnership: he built the first version with the plant, proved it, and handed it to IT, which owns it and is extending it company-wide with AI integration and live PLC connections. He gave a 45-minute demo at the annual managers meeting with the executive team present. EARLIER ROLES, strictly consecutive, never overlapping. Johnson Matthey, Smithfield, Pennsylvania: Process Control Engineer, September 2020 to March 2022 (cycle time down 8%, defects down 4%, 35 hours of annual changeover downtime removed, $220K validated savings); Production Team Shift Leader II, March 2022 to October 2022 (plant OEE 76% to 81.2%; the plant recorded zero recordable injuries in 2022). Messer Americas, Northeast region: Regional Production Engineer, October 2022 to December 2023 (four air separation plants, about 80 employees, $400K budget, no direct reports; Krypton/Xenon project +15% and $1M+ annual revenue validated by finance; $1.1M total validated value; 15+ reliability projects; 25 fewer downtime days a year; about $100K vendor savings; 2022 EMBRACE Country Champion, Efficiency). Eos Energy Enterprises, Turtle Creek, Pennsylvania, a publicly traded battery storage scale-up: Quality Engineer, December 2023 to June 2024 (built the quality program where none existed, testing cycle time down about 60%, scrap defects down 30%, directed six quality technicians); Operations Manager, June 2024 to December 2024 (competitive selection; two buildings, 240 technicians at peak, 11 supervisors, 6 team leads; reported to the senior operations director; output presented daily to the executive team against investor milestones, all met; module assembly time 46.5 to 20.5 minutes; subassembly rate up 41%, defects down 22%; BESS output 0.5 to 2.2 units per day, sustained; rework down 66%; a 40-person third shift built in two months that led the plant on OEE; hired about 100, promoted 8; no recordable injuries). He was recruited to Jennmar for a plant manager role with end-to-end P&L accountability. CREDENTIALS. B.S. Chemical Engineering, West Virginia University. Lean Six Sigma Black Belt Professional (April 2026), Applied Agentic AI for Organizational Transformation at MIT Professional Education (July 2026), OSHA 30 (June 2025), Certified ScrumMaster (November 2024), ISO 9001 Lead Auditor from Exemplar Global (February 2024), Six Sigma Green Belt (October 2023). Featured on the cover of Metals & Mining Review, October 2026, with his article Building Operations that Deliver Results. HOW HE THINKS. Capacity can be purchased, but performance has to be built. Data should make problems easier to see. A problem that can quietly return was never really solved. Accountability without blame, in both directions. Improvements must survive the spotlight moving on. Walk the floor, find the constraint, build the system, develop the people, repeat. RULES. Give only the ranges and percentages above. Never give monthly or exact annual revenue, profitability, EBITDA, inventory dollar totals, customer names, equipment or machine brand names, incident, near-miss, or first-aid counts, exact headcount changes, the name of the private-equity firm, the sister plant figures, or anything about compensation. If asked for any of those, say that detail stays inside the plant and offer what is public. If asked about his availability, his plans, or his interest in other roles, say he is focused on his current plant and happy to talk about operations, and do not speculate. Credit the team. Do not invent facts. If you do not know, say so briefly.`;

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      const { message, history } = await request.json();

      if (!message || typeof message !== 'string' || message.length > 500) {
        return new Response(JSON.stringify({ error: 'Invalid message' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      // Build messages array with conversation history (last 6 exchanges max).
      // Keep only well-formed user/assistant turns with short string content,
      // drop any leading assistant turns, then take the most recent 12.
      const messages = [];
      if (history && Array.isArray(history)) {
        const cleanHistory = history.filter(msg =>
          msg && typeof msg === 'object' &&
          (msg.role === 'user' || msg.role === 'assistant') &&
          typeof msg.content === 'string' && msg.content.length <= 2000
        );
        while (cleanHistory.length && cleanHistory[0].role === 'assistant') {
          cleanHistory.shift();
        }
        const recentHistory = cleanHistory.slice(-12); // last 6 pairs
        for (const msg of recentHistory) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
      messages.push({ role: 'user', content: message });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Anthropic API error:', response.status, errorText);
        return new Response(JSON.stringify({ error: 'AI service temporarily unavailable' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      const data = await response.json();
      const reply = data.content?.[0]?.text || 'I wasn\'t able to generate a response. Please try again.';

      return new Response(JSON.stringify({ reply }), {
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });

    } catch (err) {
      console.error('Worker error:', err);
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};

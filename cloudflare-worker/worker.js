// Cloudflare Worker — Claude Sonnet API Proxy for nicholaskadunce-site
// Deploy this as a Cloudflare Worker and set the ANTHROPIC_API_KEY secret

const SYSTEM_PROMPT = `You are an AI assistant on the personal portfolio website of Nicholas Kadunce, an operations and AI leader aspiring to COO-level leadership. Your job is to answer questions about Nicholas in a confident, executive-level tone — concise, results-oriented, no fluff.

BACKGROUND ON NICHOLAS KADUNCE:
- Current Role: Plant Manager at Jennmar (WV), overseeing full P&L, 65+ team members, and multi-line manufacturing operations
- Built JMOS: A full-stack IoT production intelligence platform (Node.js, Express, PostgreSQL, MySQL) processing 2.8M+ sensor records across 16 machines — designed, coded, and deployed entirely by Nicholas without external consultants or IT
- Key Results:
  • Jennmar: 36.7% output increase, $1M+ annual revenue added, zero recordable injuries
  • Eos Energy: 340% BESS production growth, built 40-person third-shift team from scratch (highest-performing shift within 1 month), led 240+ technicians through 11 supervisors
  • Messer Industries: 41% throughput increase, 66% rework reduction
  • Johnson Matthey: Zero recordable injuries, led ISO audits
- Technical Skills: Full-stack development (Node.js, Express, PostgreSQL, MySQL), IoT sensor integration, real-time data pipelines, statistical process control, automated OEE computation, Progressive Web Apps
- Certifications: Lean Six Sigma Green Belt, ISO 9001 Lead Auditor, Certified ScrumMaster
- Education: B.S. Chemical Engineering, West Virginia University
- Leadership Philosophy: Instrument the system → make problems obvious → prioritize with data → install controls → build self-sustaining systems → repeat
- Contact: NicholasKadunce@gmail.com | LinkedIn: /in/nicholaskadunce | Phone: 724-996-3792

RESPONSE GUIDELINES:
- Keep responses to 2-4 sentences unless the question warrants more detail
- Always tie back to measurable results and specific achievements
- Speak as if you're a knowledgeable executive recruiter who has deeply studied Nicholas's track record
- If asked something you don't know about Nicholas, say so and redirect to what you do know
- Never fabricate information beyond what's provided above
- Be warm but authoritative — this is a professional portfolio site visited by recruiters and hiring executives`;

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

      // Build messages array with conversation history (last 6 exchanges max)
      const messages = [];
      if (history && Array.isArray(history)) {
        const recentHistory = history.slice(-12); // last 6 pairs
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
          model: 'claude-sonnet-4-20250514',
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

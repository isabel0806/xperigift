import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { clientId, websiteUrl } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set yet' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const { data: client } = await supabase
      .from('clients').select('name, industry').eq('id', clientId).single();

    // Fetch and strip website HTML
    let websiteContent = '';
    try {
      const res = await fetch(websiteUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Xperigift/1.0)' },
      });
      const html = await res.text();
      websiteContent = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 8000);
    } catch (e) {
      websiteContent = `Could not fetch: ${e.message}`;
    }

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Analyze this business and extract marketing context. Return ONLY valid JSON, no markdown.

Business: ${client?.name}
Industry: ${client?.industry}
Website: ${websiteUrl}
Content: ${websiteContent}

{
  "gift_cards": ["list each gift card product or denomination found"],
  "bundles": ["list each bundle or package with price if visible"],
  "target_audience": "one sentence describing their typical customer",
  "tone": "tone of voice in 3-5 words (e.g. warm and personal, upscale and aspirational)",
  "competitors": ["2-3 well-known national competitors for this type of ${client?.industry} business"]
}

Use empty arrays if not found. Infer from industry type if needed.`,
        }],
      }),
    });

    const claudeData = await claudeRes.json();
    let extracted = { gift_cards: [], bundles: [], target_audience: '', tone: '', competitors: [] };
    try {
      extracted = JSON.parse(claudeData.content[0].text);
    } catch (_) {}

    const { data: profile, error } = await supabase
      .from('client_profiles')
      .upsert({
        client_id: clientId,
        website_url: websiteUrl,
        website_content: websiteContent.slice(0, 10000),
        gift_cards: extracted.gift_cards || [],
        bundles: extracted.bundles || [],
        target_audience: extracted.target_audience || '',
        tone: extracted.tone || '',
        competitors: extracted.competitors || [],
        scraped_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'client_id' })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(profile), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});

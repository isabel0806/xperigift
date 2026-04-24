import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const { clientId, dateFrom, dateTo, emailCount, goal } = await req.json();

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

    const [{ data: client }, { data: profile }] = await Promise.all([
      supabase.from('clients').select('name, industry').eq('id', clientId).single(),
      supabase.from('client_profiles').select('*').eq('client_id', clientId).single(),
    ]);

    if (!profile) {
      return new Response(JSON.stringify({ error: 'No profile found. Run Scrape & Analyze first.' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Filter important dates within the requested range
    const datesInRange = (profile.important_dates || []).filter((d: any) =>
      d.date && d.date >= dateFrom && d.date <= dateTo
    );

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: `You are an expert gift card marketing specialist. Generate ${emailCount} email campaign(s) for this business.

BUSINESS
Name: ${client?.name}
Industry: ${client?.industry}
Website: ${profile.website_url || 'N/A'}

PRODUCTS
Gift cards: ${JSON.stringify(profile.gift_cards || [])}
Bundles/packages: ${JSON.stringify(profile.bundles || [])}

AUDIENCE & VOICE
Target audience: ${profile.target_audience || 'general customers'}
Tone: ${profile.tone || 'warm and professional'}

COMPETITORS (differentiate from these)
${JSON.stringify(profile.competitors || [])}

CAMPAIGN
Date range: ${dateFrom} to ${dateTo}
Goal: ${goal || 'drive gift card sales'}
Key dates in this period: ${JSON.stringify(datesInRange)}
${profile.notes ? `Additional context: ${profile.notes}` : ''}

RULES
- Space emails evenly across the date range
- Each email must have a clear, specific offer tied to the date or season
- Write complete HTML with inline styles — professional, clean, mobile-friendly
- Subject lines must be specific and compelling (no generic "Check out our gift cards")
- Reference actual products from their catalog
- Differentiate clearly from competitors

Return ONLY a valid JSON array, no markdown:
[
  {
    "subject": "...",
    "html_content": "complete HTML with inline styles",
    "send_date": "YYYY-MM-DD",
    "segment_type": "all",
    "sender_name": "${client?.name}",
    "notes": "one line explaining why this email for this date"
  }
]`,
        }],
      }),
    });

    const claudeData = await claudeRes.json();
    let emails: any[] = [];
    try {
      const text = claudeData.content[0].text;
      // Strip possible markdown code fences
      const cleaned = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
      emails = JSON.parse(cleaned);
    } catch (_) {
      throw new Error('Could not parse Claude response — try again');
    }

    const toInsert = emails.map((e: any) => ({
      client_id: clientId,
      subject: e.subject,
      html_content: e.html_content,
      send_date: e.send_date || null,
      segment_type: e.segment_type || 'all',
      segment_tag: e.segment_tag || null,
      sender_name: e.sender_name || client?.name,
      sender_email: null,
      status: 'pending_approval',
    }));

    const { data: inserted, error } = await supabase
      .from('email_campaigns')
      .insert(toInsert)
      .select();

    if (error) throw error;

    return new Response(JSON.stringify({ count: inserted.length }), {
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});

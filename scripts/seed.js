/**
 * Xperigift seed script — populates Supabase with demo data.
 * Run: node scripts/seed.js
 *
 * Creates:
 *  - 2 clients (Serenity Day Spa, The Fork & Barrel)
 *  - 1 admin user  (admin@xperigift.com / Admin123456)
 *  - 1 client user (demo@serenitydayspa.com / Demo123456)
 *  - Products, customers, sales, email campaigns, templates, bookings
 */

// Polyfill fetch/Headers for Node 16 (Node 18+ has them natively)
import fetch, { Headers, Request, Response } from 'node-fetch';
if (!globalThis.fetch) {
  globalThis.fetch = fetch;
  globalThis.Headers = Headers;
  globalThis.Request = Request;
  globalThis.Response = Response;
}

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env.local manually (no dotenv dep needed)
const envPath = resolve(__dirname, '../.env.local');
const env = Object.fromEntries(
  readFileSync(envPath, 'utf8')
    .split('\n')
    .filter((l) => l.includes('='))
    .map((l) => l.split('=').map((p) => p.trim()))
);

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SERVICE_ROLE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log('🌱 Seeding xperigift demo data…\n');

  // ── 0. CLEAN existing seed data ──────────────────────────────
  console.log('Clearing existing demo data…');
  await supabase.from('email_templates').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('audit_bookings').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  // Deleting clients cascades to products, customers, sales, email_campaigns
  await supabase.from('clients').delete().in('name', ['Serenity Day Spa', 'The Fork & Barrel', 'Oakwood Golf Club']);
  console.log('  ✓ cleared');

  // ── 1. CLIENTS ──────────────────────────────────────────────
  console.log('Creating clients…');
  const { data: clients, error: cliErr } = await supabase
    .from('clients')
    .insert([
      { name: 'Serenity Day Spa', industry: 'Spa', is_active: true },
      { name: 'The Fork & Barrel', industry: 'Restaurant', is_active: true },
      { name: 'Oakwood Golf Club', industry: 'Golf', is_active: false },
    ])
    .select();
  if (cliErr) { console.error('clients error:', cliErr.message); process.exit(1); }

  const spaClient = clients.find((c) => c.name === 'Serenity Day Spa');
  console.log(`  ✓ ${clients.length} clients — Spa ID: ${spaClient.id}`);

  // ── 2. AUTH USERS ────────────────────────────────────────────
  console.log('Creating auth users…');

  async function ensureUser(email, password, role, clientId) {
    const { data: existing } = await supabase.auth.admin.listUsers();
    const found = existing?.users?.find((u) => u.email === email);
    if (found) {
      console.log(`  ℹ  ${email} already exists — updating profile`);
      await supabase.from('profiles').upsert({ id: found.id, email, role, client_id: clientId }, { onConflict: 'id' });
      return found;
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true,
    });
    if (error) { console.error(`  ✗ ${email}:`, error.message); return null; }
    await supabase.from('profiles').upsert({ id: data.user.id, email, role, client_id: clientId }, { onConflict: 'id' });
    console.log(`  ✓ ${email} created`);
    return data.user;
  }

  await ensureUser('admin@xperigift.com', 'Admin123456', 'admin', null);
  await ensureUser('demo@serenitydayspa.com', 'Demo123456', 'client', spaClient.id);

  // ── 3. PRODUCTS ──────────────────────────────────────────────
  console.log('Creating products…');
  const { data: products, error: prodErr } = await supabase.from('products').insert([
    { client_id: spaClient.id, name: '60-min Massage', price_cents: 9500, product_type: 'one_time', is_active: true, description: 'A full-body Swedish massage lasting 60 minutes. Includes aromatherapy and a complimentary hot towel wrap.', contents: [] },
    { client_id: spaClient.id, name: 'Spa Day Package', price_cents: 22000, product_type: 'bundle', is_active: true, description: 'A complete day of pampering. Perfect for a birthday or special occasion.', contents: ['60-min Swedish Massage', '30-min Facial', 'Lunch at the spa café', 'Locker room & robe access'] },
    { client_id: spaClient.id, name: 'Couples Retreat', price_cents: 32000, product_type: 'bundle', is_active: true, description: 'Enjoy a full day of relaxation together in our couples suite.', contents: ['2× 60-min Side-by-Side Massage', '2× 30-min Facials', 'Champagne & charcuterie board', 'Private suite access (3 hrs)'] },
    { client_id: spaClient.id, name: 'Open Amount', price_cents: null, product_type: 'open_amount', is_active: true, description: 'Custom-value gift card. Recipient can apply it to any service.', contents: [] },
    { client_id: spaClient.id, name: '30-min Express Facial', price_cents: 6500, product_type: 'one_time', is_active: false, description: 'Quick brightening facial using our signature vitamin-C serum.', contents: [] },
  ]).select();
  if (prodErr) console.warn('  products warning:', prodErr.message);
  console.log(`  ✓ ${products?.length || 0} products`);

  // ── 4. CUSTOMERS ─────────────────────────────────────────────
  console.log('Creating customers…');
  const { data: customers, error: custErr } = await supabase.from('customers').insert([
    { client_id: spaClient.id, name: 'Emily Carter', email: 'emily@email.com', total_spent: 19000, visits: 3, last_visit: '2026-04-18', tags: ['VIP', 'Repeat'] },
    { client_id: spaClient.id, name: 'James Wu', email: 'jwu@gmail.com', total_spent: 22000, visits: 1, last_visit: '2026-04-15', tags: [] },
    { client_id: spaClient.id, name: 'Sarah M.', email: 'sarah@mail.com', total_spent: 9500, visits: 2, last_visit: '2026-04-12', tags: ['Repeat'] },
    { client_id: spaClient.id, name: 'Linda Park', email: 'linda@park.com', total_spent: 32000, visits: 1, last_visit: '2026-04-08', tags: ['VIP'] },
    { client_id: spaClient.id, name: 'Rob Chen', email: 'rob@ch.com', total_spent: 22000, visits: 2, last_visit: '2026-03-28', tags: ['Repeat'] },
    { client_id: spaClient.id, name: 'Amy L.', email: 'amy@l.com', total_spent: 9500, visits: 4, last_visit: '2026-03-20', tags: ['VIP', 'Loyal'] },
    { client_id: spaClient.id, name: 'Mike & Anna', email: 'mikanna@email.com', total_spent: 32000, visits: 1, last_visit: '2026-02-14', tags: ['Couples'] },
    { client_id: spaClient.id, name: 'Helen T.', email: 'helen@t.com', total_spent: 22000, visits: 1, last_visit: '2026-02-10', tags: [] },
    { client_id: spaClient.id, name: 'Pam S.', email: 'pam@s.com', total_spent: 9500, visits: 1, last_visit: '2026-01-25', tags: [] },
    { client_id: spaClient.id, name: 'Grace H.', email: 'grace@h.com', total_spent: 9500, visits: 2, last_visit: '2025-12-20', tags: ['Repeat'] },
    { client_id: spaClient.id, name: 'Chris N.', email: 'cn@email.com', total_spent: 5000, visits: 1, last_visit: '2025-12-18', tags: [] },
  ]).select();
  if (custErr) console.warn('  customers warning:', custErr.message);
  console.log(`  ✓ ${customers?.length || 0} customers`);

  // ── 5. SALES ─────────────────────────────────────────────────
  console.log('Creating sales…');
  const { data: sales, error: salesErr } = await supabase.from('sales').insert([
    { client_id: spaClient.id, product_name: '60-min Massage', amount_cents: 9500, redeemed_cents: 0, status: 'sold', buyer_name: 'Emily Carter', card_code: 'XG-4821', sold_at: '2026-04-18T14:22:00Z' },
    { client_id: spaClient.id, product_name: 'Spa Day Package', amount_cents: 22000, redeemed_cents: 22000, status: 'redeemed', buyer_name: 'James Wu', card_code: 'XG-3310', sold_at: '2026-04-15T10:05:00Z' },
    { client_id: spaClient.id, product_name: '60-min Massage', amount_cents: 9500, redeemed_cents: 5000, status: 'partially_redeemed', buyer_name: 'Sarah M.', card_code: 'XG-2291', sold_at: '2026-04-12T16:45:00Z' },
    { client_id: spaClient.id, product_name: 'Open Amount', amount_cents: 15000, redeemed_cents: 0, status: 'sold', buyer_name: 'Tom B.', card_code: 'XG-9042', sold_at: '2026-04-10T09:30:00Z' },
    { client_id: spaClient.id, product_name: 'Couples Retreat', amount_cents: 32000, redeemed_cents: 0, status: 'sold', buyer_name: 'Linda Park', card_code: 'XG-5511', sold_at: '2026-04-08T11:00:00Z' },
    { client_id: spaClient.id, product_name: 'Spa Day Package', amount_cents: 22000, redeemed_cents: 0, status: 'sold', buyer_name: 'Rob Chen', card_code: 'XG-7732', sold_at: '2026-03-28T13:15:00Z' },
    { client_id: spaClient.id, product_name: '60-min Massage', amount_cents: 9500, redeemed_cents: 9500, status: 'redeemed', buyer_name: 'Amy L.', card_code: 'XG-4401', sold_at: '2026-03-20T15:00:00Z' },
    { client_id: spaClient.id, product_name: 'Open Amount', amount_cents: 7500, redeemed_cents: 0, status: 'sold', buyer_name: 'Dan K.', card_code: 'XG-6610', sold_at: '2026-03-15T10:30:00Z' },
    { client_id: spaClient.id, product_name: 'Couples Retreat', amount_cents: 32000, redeemed_cents: 32000, status: 'redeemed', buyer_name: 'Mike & Anna', card_code: 'XG-1120', sold_at: '2026-02-14T12:00:00Z' },
    { client_id: spaClient.id, product_name: 'Spa Day Package', amount_cents: 22000, redeemed_cents: 0, status: 'sold', buyer_name: 'Helen T.', card_code: 'XG-8830', sold_at: '2026-02-10T09:00:00Z' },
    { client_id: spaClient.id, product_name: '60-min Massage', amount_cents: 9500, redeemed_cents: 0, status: 'sold', buyer_name: 'Pam S.', card_code: 'XG-3341', sold_at: '2026-01-25T14:00:00Z' },
    { client_id: spaClient.id, product_name: 'Spa Day Package', amount_cents: 22000, redeemed_cents: 22000, status: 'redeemed', buyer_name: 'Gift Buyer A', card_code: 'XG-0021', sold_at: '2025-12-24T10:00:00Z' },
    { client_id: spaClient.id, product_name: 'Couples Retreat', amount_cents: 32000, redeemed_cents: 0, status: 'expired', buyer_name: 'John D.', card_code: 'XG-1293', sold_at: '2025-12-22T11:30:00Z' },
    { client_id: spaClient.id, product_name: '60-min Massage', amount_cents: 9500, redeemed_cents: 0, status: 'sold', buyer_name: 'Grace H.', card_code: 'XG-4422', sold_at: '2025-12-20T09:45:00Z' },
    { client_id: spaClient.id, product_name: 'Open Amount', amount_cents: 5000, redeemed_cents: 5000, status: 'redeemed', buyer_name: 'Chris N.', card_code: 'XG-7741', sold_at: '2025-12-18T16:00:00Z' },
  ]).select();
  if (salesErr) console.warn('  sales warning:', salesErr.message);
  console.log(`  ✓ ${sales?.length || 0} sales`);

  // ── 6. EMAIL CAMPAIGNS ───────────────────────────────────────
  console.log('Creating email campaigns…');
  const EMAIL_HTML_1 = `<div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;padding:40px 24px;background:#faf9f7;color:#1a1a2e"><p style="font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#888;margin-bottom:24px">Serenity Day Spa · Gift Cards</p><h1 style="font-size:36px;font-weight:400;line-height:1.1;margin-bottom:16px">Spring into<br><em style="color:#2d5a3d">Relaxation</em></h1><p style="font-size:16px;color:#444;line-height:1.7;margin-bottom:24px">This week only — enjoy <strong>20% off all gift cards</strong>. The perfect treat for yourself or someone who deserves a break.</p><a href="#" style="display:inline-block;padding:14px 28px;background:#1a1a2e;color:white;text-decoration:none;border-radius:4px;font-size:14px;font-weight:500">Shop Gift Cards →</a><p style="margin-top:40px;font-size:12px;color:#aaa">You received this because you've purchased from us before. <a href="#" style="color:#aaa">Unsubscribe</a></p></div>`;
  const EMAIL_HTML_2 = `<div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;padding:40px 24px;background:#faf9f7;color:#1a1a2e"><p style="font-size:12px;text-transform:uppercase;letter-spacing:0.14em;color:#888;margin-bottom:24px">Serenity Day Spa · Gift Cards</p><h1 style="font-size:36px;font-weight:400;line-height:1.1;margin-bottom:16px">Mother's Day<br>is <em style="color:#2d5a3d">coming</em></h1><p style="font-size:16px;color:#444;line-height:1.7;margin-bottom:8px">Give mom the gift of calm. Our spa packages start at $95 and arrive instantly by email.</p><ul style="font-size:15px;color:#444;line-height:2;margin:16px 0 24px 20px"><li>60-min Signature Massage — $95</li><li>Spa Day Package — $220</li><li>Couples Retreat — $320</li></ul><a href="#" style="display:inline-block;padding:14px 28px;background:#2d5a3d;color:white;text-decoration:none;border-radius:4px;font-size:14px;font-weight:500">Give the Gift of Calm →</a><p style="margin-top:40px;font-size:12px;color:#aaa">You received this because you've purchased from us before. <a href="#" style="color:#aaa">Unsubscribe</a></p></div>`;

  const { error: campErr } = await supabase.from('email_campaigns').insert([
    { client_id: spaClient.id, subject: 'Spring into Relaxation — 20% off gift cards this week', status: 'pending_approval', send_date: '2026-04-25', segment_type: 'all', sender_name: 'Serenity Day Spa', sender_email: 'hello@serenitydayspa.com', html_content: EMAIL_HTML_1, created_at: '2026-04-19T00:00:00Z' },
    { client_id: spaClient.id, subject: "Mother's Day is coming — give the gift of calm", status: 'pending_approval', send_date: '2026-05-05', segment_type: 'tag', segment_tag: 'VIP', sender_name: 'Serenity Day Spa', sender_email: 'hello@serenitydayspa.com', html_content: EMAIL_HTML_2, created_at: '2026-04-20T00:00:00Z' },
    { client_id: spaClient.id, subject: 'New Year, New You — Our gift card bundles are back', status: 'sent', send_date: '2026-01-03', segment_type: 'all', sender_name: 'Serenity Day Spa', sender_email: 'hello@serenitydayspa.com', html_content: '<p>Sent email — HTML archived.</p>', created_at: '2025-12-28T00:00:00Z' },
    { client_id: spaClient.id, subject: 'Holiday Gift Guide — Spa experiences for everyone', status: 'sent', send_date: '2025-12-10', segment_type: 'all', sender_name: 'Serenity Day Spa', sender_email: 'hello@serenitydayspa.com', html_content: '<p>Sent email — HTML archived.</p>', created_at: '2025-12-05T00:00:00Z' },
  ]);
  if (campErr) console.warn('  campaigns warning:', campErr.message);
  console.log('  ✓ email campaigns');

  // ── 7. TEMPLATES ─────────────────────────────────────────────
  console.log('Creating email templates…');
  await supabase.from('email_templates').insert([
    { name: 'Holiday Gift Promo', tags: ['seasonal', 'promo'], updated_at: '2025-12-01T00:00:00Z' },
    { name: "Mother's Day Campaign", tags: ['seasonal'], updated_at: '2025-04-30T00:00:00Z' },
    { name: 'Re-engagement — Lapsed buyers', tags: ['retention'], updated_at: '2026-01-10T00:00:00Z' },
    { name: 'Post-purchase Thank You', tags: ['transactional'], updated_at: '2026-02-14T00:00:00Z' },
    { name: 'New arrival / bundle launch', tags: ['launch'], updated_at: '2026-03-05T00:00:00Z' },
  ]);
  console.log('  ✓ templates');

  // ── 8. AUDIT BOOKINGS ────────────────────────────────────────
  console.log('Creating audit bookings…');
  await supabase.from('audit_bookings').insert([
    { contact_name: 'Maria G.', business_name: 'Glow Esthetics', booked_date: '2026-04-22', status: 'confirmed' },
    { contact_name: 'Trevor A.', business_name: 'River Bend Grille', booked_date: '2026-04-24', status: 'pending' },
    { contact_name: 'Yuki M.', business_name: 'Fairways Golf', booked_date: '2026-04-28', status: 'pending' },
  ]);
  console.log('  ✓ audit bookings');

  console.log(`
✅ Seed complete!

Demo credentials:
  Client user: demo@serenitydayspa.com / Demo123456
  Admin user:  admin@xperigift.com / Admin123456
`);
}

seed().catch((e) => { console.error(e); process.exit(1); });

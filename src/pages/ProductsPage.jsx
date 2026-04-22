import { useState, useEffect, useRef } from 'react';
import Shell from '../components/Shell';
import Btn from '../components/Btn';
import Card from '../components/Card';
import Field from '../components/Field';
import Icon from '../components/Icon';
import { supabase } from '../lib/supabase';
import { fmt$, ink, inkSoft, inkMuted, hairline, hairlineStrong, paperSoft, emerald, emeraldDeep } from '../lib/tokens';

export default function ProductsPage({ clientId, toast }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!clientId) return;
    load();
  }, [clientId]);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').eq('client_id', clientId).order('created_at');
    setProducts(data || []);
    setLoading(false);
  }

  async function saveProduct(draft) {
    const isNew = !draft.id;
    const payload = { ...draft, client_id: clientId };
    let error;
    if (isNew) {
      delete payload.id;
      ({ error } = await supabase.from('products').insert(payload));
    } else {
      ({ error } = await supabase.from('products').update(payload).eq('id', draft.id));
    }
    if (error) { toast('Failed to save product', 'error'); return; }
    toast(isNew ? 'Product created' : 'Product saved');
    setSelected(null);
    load();
  }

  if (selected === '__new__' || (selected && selected !== null)) {
    const product = selected === '__new__'
      ? { name: '', price_cents: null, product_type: 'one_time', is_active: true, image_url: null, description: '', contents: [] }
      : products.find((p) => p.id === selected);
    return (
      <ProductEditor
        product={product}
        onBack={() => setSelected(null)}
        onSave={saveProduct}
        clientId={clientId}
        toast={toast}
      />
    );
  }

  return (
    <Shell
      title="Products"
      subtitle="Your gift card catalog — click a product to edit details, images, and bundle contents."
      actions={<Btn icon="plus" primary onClick={() => setSelected('__new__')}>New product</Btn>}
    >
      {loading ? (
        <p style={{ color: inkMuted, fontSize: 14 }}>Loading…</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {products.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              style={{ border: `1px solid ${hairline}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: 0, textAlign: 'left', cursor: 'pointer', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--hairline-strong)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--hairline)'}
            >
              <div style={{ width: '100%', height: 140, background: p.image_url ? 'transparent' : paperSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                {p.image_url
                  ? <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <Icon name="image" size={28} color="var(--hairline-strong)" />
                      <span style={{ fontSize: 11, color: inkMuted }}>No image</span>
                    </div>
                }
                {!p.is_active && (
                  <span style={{ position: 'absolute', top: 8, right: 8, background: inkSoft, color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>
                    Inactive
                  </span>
                )}
              </div>
              <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <h3 style={{ fontSize: 16, color: ink, fontWeight: 600, flex: 1 }}>{p.name}</h3>
                  <span style={{ fontSize: 18, fontFamily: 'Fraunces, Georgia, serif', color: emeraldDeep, flexShrink: 0 }}>
                    {p.price_cents ? fmt$(p.price_cents) : 'Open'}
                  </span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', width: 'fit-content', height: 22, padding: '0 8px', borderRadius: 'var(--r)', background: paperSoft, fontSize: 11, color: inkMuted }}>
                  {p.product_type.replace(/_/g, ' ')}
                </span>
                {p.description && <p style={{ fontSize: 13, color: inkSoft, lineHeight: 1.5, marginTop: 2 }}>{p.description}</p>}
              </div>
            </button>
          ))}
          {products.length === 0 && (
            <p style={{ color: inkMuted, fontSize: 14 }}>No products yet. Create your first gift card product.</p>
          )}
        </div>
      )}
    </Shell>
  );
}

function ProductEditor({ product, onBack, onSave, toast }) {
  const [draft, setDraft] = useState({ ...product });
  const [newItem, setNewItem] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const update = (patch) => setDraft((p) => ({ ...p, ...patch }));

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update({ image_url: ev.target.result });
    reader.readAsDataURL(file);
  };

  const addContent = () => {
    if (!newItem.trim()) return;
    update({ contents: [...(draft.contents || []), newItem.trim()] });
    setNewItem('');
  };

  const removeContent = (i) => update({ contents: draft.contents.filter((_, idx) => idx !== i) });

  const handleSave = async () => {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  };

  return (
    <div className="fade-up" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: inkSoft, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Icon name="arrow-left" size={15} /> All products
        </button>
        <span style={{ width: 1, height: 20, background: 'var(--hairline)' }} />
        <h1 style={{ fontSize: 28, fontWeight: 400, color: ink, flex: 1 }}>{draft.name || 'New product'}</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn onClick={onBack}>Cancel</Btn>
          <Btn primary onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : 'Save product'}</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: inkMuted, marginBottom: 12 }}>Product image</p>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width: '100%', height: 200, border: `2px dashed ${hairlineStrong}`, borderRadius: 'var(--r)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', background: paperSoft, position: 'relative' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = ink}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = hairlineStrong}
            >
              {draft.image_url
                ? <img src={draft.image_url} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <>
                    <Icon name="upload" size={24} color={inkMuted} />
                    <p style={{ fontSize: 13, color: inkMuted, marginTop: 8 }}>Click to upload</p>
                    <p style={{ fontSize: 11, color: inkMuted, marginTop: 4 }}>JPG, PNG, WebP — up to 5MB</p>
                  </>
              }
            </div>
            {draft.image_url && (
              <button onClick={() => update({ image_url: null })} style={{ marginTop: 8, fontSize: 12, color: inkMuted, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Remove image
              </button>
            )}
          </Card>

          <Card>
            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: inkMuted, marginBottom: 16 }}>Details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Field label="Product name">
                <input value={draft.name} onChange={(e) => update({ name: e.target.value })}
                  style={{ width: '100%', height: 40, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: '0 12px', fontSize: 14, color: ink, outline: 'none' }} />
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Type">
                  <select value={draft.product_type} onChange={(e) => update({ product_type: e.target.value })}
                    style={{ width: '100%', height: 40, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: '0 8px', fontSize: 14, color: ink, outline: 'none' }}>
                    <option value="one_time">One-time service</option>
                    <option value="bundle">Bundle</option>
                    <option value="open_amount">Open amount</option>
                  </select>
                </Field>
                <Field label="Price (USD)">
                  <input type="number" step="0.01" min="0" placeholder="Open"
                    value={draft.price_cents != null ? draft.price_cents / 100 : ''}
                    onChange={(e) => update({ price_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                    style={{ width: '100%', height: 40, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: '0 12px', fontSize: 14, color: ink, outline: 'none' }} />
                </Field>
              </div>
              <Field label="Status">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: ink }}>
                  <input type="checkbox" checked={draft.is_active} onChange={(e) => update({ is_active: e.target.checked })}
                    style={{ width: 16, height: 16, accentColor: 'var(--emerald-deep)' }} />
                  Active — visible to campaigns
                </label>
              </Field>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: inkMuted, marginBottom: 12 }}>Description</p>
            <textarea
              value={draft.description} onChange={(e) => update({ description: e.target.value })} rows={5}
              placeholder="Describe what this gift card covers."
              style={{ width: '100%', border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: '10px 12px', fontSize: 14, color: ink, outline: 'none', lineHeight: 1.6, resize: 'vertical' }}
            />
          </Card>

          {(draft.product_type === 'bundle' || (draft.contents && draft.contents.length > 0)) && (
            <Card>
              <p style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: inkMuted, marginBottom: 12 }}>Bundle contents</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                {(draft.contents || []).map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: paperSoft, borderRadius: 'var(--r)' }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: emerald, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontSize: 14, color: ink }}>{item}</span>
                    <button onClick={() => removeContent(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: inkMuted, padding: 0, display: 'flex', alignItems: 'center' }}>
                      <Icon name="x" size={14} />
                    </button>
                  </div>
                ))}
                {(!draft.contents || draft.contents.length === 0) && (
                  <p style={{ fontSize: 13, color: inkMuted, fontStyle: 'italic' }}>No items yet.</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={newItem} onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g. 60-min Swedish Massage"
                  onKeyDown={(e) => e.key === 'Enter' && addContent()}
                  style={{ flex: 1, height: 36, border: `1px solid ${hairlineStrong}`, borderRadius: 'var(--r)', background: 'var(--paper)', padding: '0 12px', fontSize: 13, color: ink, outline: 'none' }}
                />
                <Btn onClick={addContent} icon="plus">Add</Btn>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

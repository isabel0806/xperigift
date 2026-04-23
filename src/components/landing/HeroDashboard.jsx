export function HeroDashboard() {
  const bars = [34,40,46,52,45,58,66,60,80,72,86,100];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="relative">
      {/* Main card */}
      <div
        className="rounded-xl overflow-hidden text-[13px]"
        style={{
          background: 'white',
          boxShadow: '0 0 0 1px oklch(0.91 0.005 270), 0 8px 24px oklch(0 0 0 / 0.06), 0 32px 80px oklch(0.22 0.08 5 / 0.08)',
        }}
      >
        {/* Top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: 'oklch(0.985 0.005 85)', borderColor: 'oklch(0.91 0.005 270)' }}
        >
          <span className="text-[12px] font-semibold" style={{ color: 'oklch(0.18 0.01 270)' }}>
            Gift Card Revenue
          </span>
          <span
            className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{
              background: 'oklch(0.95 0.025 165)',
              color: 'oklch(0.32 0.075 165)',
            }}
          >
            ↑ +23% YTD
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 divide-x" style={{ borderBottom: '1px solid oklch(0.91 0.005 270)', borderColor: 'oklch(0.91 0.005 270)' }}>
          {[
            { label: 'Revenue', val: '$148K', change: '↑ 18% vs last yr' },
            { label: 'Redemption', val: '67%', change: '↑ 9 pts' },
            { label: 'Cards sold', val: '2,341', change: '↑ 31%' },
          ].map((k) => (
            <div key={k.label} className="px-4 py-3" style={{ borderColor: 'oklch(0.91 0.005 270)' }}>
              <p className="text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color: 'oklch(0.5 0.008 270)' }}>
                {k.label}
              </p>
              <p className="font-display text-[20px] leading-none" style={{ color: 'oklch(0.22 0.08 5)' }}>
                {k.val}
              </p>
              <p className="text-[10px] font-semibold mt-1" style={{ color: 'oklch(0.42 0.09 165)' }}>
                {k.change}
              </p>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid oklch(0.91 0.005 270)' }}>
          <div className="flex justify-between text-[10px] mb-2" style={{ color: 'oklch(0.5 0.008 270)' }}>
            {months.map((m) => <span key={m}>{m}</span>)}
          </div>
          <div className="flex items-end gap-1" style={{ height: 72 }}>
            {bars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t-[3px]"
                style={{
                  height: `${h}%`,
                  background:
                    i === 11 ? 'oklch(0.42 0.09 165)' :
                    i === 8  ? 'oklch(0.62 0.16 55 / 0.4)' :
                    i === 3  ? 'oklch(0.22 0.08 5 / 0.15)' :
                    'oklch(0.91 0.005 270)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Campaign list */}
        <div className="px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.1em] font-semibold mb-2.5" style={{ color: 'oklch(0.18 0.01 270)' }}>
            Top campaigns
          </p>
          {[
            { name: 'Holiday Campaign', rev: '$62K', pct: 88, color: 'oklch(0.62 0.16 55)' },
            { name: "Mother's Day",     rev: '$38K', pct: 55, color: 'oklch(0.22 0.08 5)' },
            { name: 'Back to School',   rev: '$22K', pct: 34, color: 'oklch(0.42 0.09 165)' },
          ].map((c) => (
            <div
              key={c.name}
              className="flex items-center gap-2.5 py-1.5"
              style={{ borderBottom: '1px solid oklch(0.97 0.006 85)' }}
            >
              <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: c.color }} />
              <span className="flex-1 text-[12px]" style={{ color: 'oklch(0.18 0.01 270)' }}>{c.name}</span>
              <div className="w-14 h-[3px] rounded-full overflow-hidden" style={{ background: 'oklch(0.91 0.005 270)' }}>
                <div className="h-full rounded-full" style={{ width: `${c.pct}%`, background: c.color }} />
              </div>
              <span className="text-[12px] font-semibold font-display min-w-[36px] text-right" style={{ color: 'oklch(0.22 0.08 5)' }}>
                {c.rev}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating accent */}
      <div
        className="absolute -bottom-5 -left-7 rounded-[10px] px-4 py-3 min-w-[168px]"
        style={{
          background: 'oklch(0.22 0.08 5)',
          color: 'white',
          boxShadow: '0 8px 32px oklch(0.22 0.08 5 / 0.3)',
        }}
      >
        <p className="text-[10px] uppercase tracking-[0.1em] opacity-50 mb-1">Breakage captured</p>
        <p className="font-display text-[26px] leading-none tracking-tight">$14,200</p>
        <p className="text-[10px] opacity-50 mt-0.5">per 90-day cycle</p>
      </div>
    </div>
  );
}

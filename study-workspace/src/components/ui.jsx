// 通用小组件：卡片、标签、进度环、进度条
export function Card({ children, className = '', ...rest }) {
  return (
    <div className={`bg-white rounded-card shadow-soft p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Tag({ text, color = 'mist' }) {
  const map = {
    mist: 'bg-mist/20 text-[#5a6b7c]',
    lotus: 'bg-lotus/25 text-[#a06a6e]',
    green: 'bg-[#A5D6A7]/40 text-[#2e7d32]',
    red: 'bg-[#EF5350]/15 text-[#c62828]'
  };
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${map[color]}`}>{text}</span>;
}

export function Ring({ percent = 0, size = 56, stroke = 6, color = '#E8B4B8' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.min(100, Math.max(0, percent)) / 100);
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EFEAE2" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.24} fill="#3D3D3D">
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

export function ProgressBar({ percent = 0, color = '#E8B4B8', height = 10 }) {
  return (
    <div className="w-full bg-[#EFEAE2] rounded-full overflow-hidden" style={{ height }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, percent)}%`, background: color }} />
    </div>
  );
}

export function PageTitle({ children, desc }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-ink">{children}</h2>
      {desc && <p className="text-sm text-sub mt-1">{desc}</p>}
    </div>
  );
}

export function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-card shadow-soft p-5 w-full max-w-md max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

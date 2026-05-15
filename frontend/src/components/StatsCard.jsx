import { motion } from 'framer-motion'

export default function StatsCard({ icon: Icon, label, value, unit, color = 'cyan', trend, subtitle }) {
  const colors = {
    cyan:   { main: '#00f5ff', glow: '0 0 12px rgba(0,245,255,0.15)', border: 'rgba(0,245,255,0.2)' },
    green:  { main: '#00ff88', glow: '0 0 12px rgba(0,255,136,0.15)', border: 'rgba(0,255,136,0.2)' },
    red:    { main: '#ff1a3c', glow: '0 0 12px rgba(255,26,60,0.2)',  border: 'rgba(255,26,60,0.3)'  },
    orange: { main: '#ff6b00', glow: '0 0 12px rgba(255,107,0,0.15)', border: 'rgba(255,107,0,0.2)' },
    blue:   { main: '#0080ff', glow: '0 0 12px rgba(0,128,255,0.15)', border: 'rgba(0,128,255,0.2)' },
  }
  const c = colors[color] || colors.cyan

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, boxShadow: c.glow.replace('0.15', '0.3') }}
      className="cyber-panel rounded-lg p-3 flex flex-col gap-2 cursor-default"
      style={{ boxShadow: c.glow, borderColor: c.border }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded" style={{ background: `${c.main}15` }}>
            <Icon size={14} style={{ color: c.main }} />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest"
                style={{ color: `${c.main}90` }}>
            {label}
          </span>
        </div>
        {trend !== undefined && (
          <span className={`font-mono text-[10px] ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="flex items-end gap-1.5">
        <span className="font-display text-2xl font-bold leading-none" style={{ color: c.main, textShadow: `0 0 12px ${c.main}60` }}>
          {value}
        </span>
        {unit && (
          <span className="font-mono text-xs mb-0.5" style={{ color: `${c.main}60` }}>{unit}</span>
        )}
      </div>

      {subtitle && (
        <p className="font-mono text-[9px] text-cyber-cyan2 opacity-40 leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Radio, Wifi, AlertTriangle, Activity, Clock } from 'lucide-react'

export default function Navbar({ systemStatus, threatCount }) {
  const [time, setTime] = useState(new Date())
  const [blinking, setBlinking] = useState(true)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    const b = setInterval(() => setBlinking(p => !p), 800)
    return () => { clearInterval(t); clearInterval(b) }
  }, [])

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative z-50 border-b border-cyber-border"
      style={{ background: 'linear-gradient(90deg, #020b18 0%, #040f1f 50%, #020b18 100%)' }}
    >
      {/* Top accent line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff, #0080ff, #00f5ff, transparent)' }} />

      <div className="px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotateY: [0, 360] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            className="relative"
          >
            <Shield size={28} className="neon-cyan" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-cyber-cyan" style={{ boxShadow: '0 0 6px #00f5ff' }} />
            </div>
          </motion.div>
          <div>
            <h1 className="font-display text-lg font-bold neon-cyan tracking-widest leading-none">SKYGUARD AI</h1>
            <p className="font-mono text-[10px] text-cyber-cyan2 opacity-70 tracking-wider">AUTONOMOUS SURVEILLANCE v1.0</p>
          </div>
        </div>

        {/* Center status pills */}
        <div className="hidden md:flex items-center gap-3">
          <StatusPill
            icon={<Activity size={11} />}
            label="SYSTEM"
            value={systemStatus}
            active={systemStatus === 'ONLINE'}
            color={systemStatus === 'ONLINE' ? 'cyan' : 'red'}
          />
          <StatusPill
            icon={<Radio size={11} />}
            label="AI ENGINE"
            value="ACTIVE"
            active={true}
            color="cyan"
          />
          <StatusPill
            icon={<Wifi size={11} />}
            label="UPLINK"
            value="SECURED"
            active={true}
            color="green"
          />
          {threatCount > 0 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-1.5 px-3 py-1 rounded border"
              style={{ borderColor: '#ff1a3c80', background: 'rgba(255,26,60,0.1)' }}
            >
              <AlertTriangle size={11} className="neon-red" />
              <span className="font-mono text-[11px] neon-red font-bold">{threatCount} THREATS</span>
            </motion.div>
          )}
        </div>

        {/* Clock */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 border border-cyber-border rounded px-3 py-1.5"
               style={{ background: 'rgba(0,245,255,0.03)' }}>
            <Clock size={12} className="text-cyber-cyan2 opacity-60" />
            <span className="font-mono text-sm neon-cyan">
              {time.toTimeString().slice(0, 8)}
            </span>
          </div>
          <div className="hidden md:block text-right">
            <p className="font-mono text-[10px] text-cyber-cyan2 opacity-60">
              {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase()}
            </p>
            <p className="font-mono text-[10px] text-cyber-cyan2 opacity-60">UTC+05:30</p>
          </div>
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 ml-2">
            <motion.div
              animate={{ opacity: blinking ? 1 : 0.2 }}
              className="w-2 h-2 rounded-full bg-red-500"
              style={{ boxShadow: '0 0 6px #ff1a3c' }}
            />
            <span className="font-mono text-[11px] neon-red font-bold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Bottom accent */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, #00f5ff30, transparent)' }} />
    </motion.nav>
  )
}

function StatusPill({ icon, label, value, active, color }) {
  const colors = {
    cyan: { border: '#00f5ff40', bg: 'rgba(0,245,255,0.06)', text: '#00f5ff' },
    green: { border: '#00ff8840', bg: 'rgba(0,255,136,0.06)', text: '#00ff88' },
    red: { border: '#ff1a3c40', bg: 'rgba(255,26,60,0.06)', text: '#ff1a3c' },
  }
  const c = colors[color] || colors.cyan

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-mono border"
         style={{ borderColor: c.border, background: c.bg, color: c.text }}>
      {icon}
      <span className="opacity-60">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}

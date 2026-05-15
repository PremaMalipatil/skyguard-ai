import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, Info, Volume2, VolumeX, X, Bell } from 'lucide-react'

const API = 'http://localhost:8000'

const THREAT_CONFIG = {
  HIGH:   { color: '#ff1a3c', bg: 'rgba(255,26,60,0.08)',   border: 'rgba(255,26,60,0.5)',   icon: AlertTriangle, label: '⚠ HIGH THREAT'   },
  MEDIUM: { color: '#ff6b00', bg: 'rgba(255,107,0,0.08)',  border: 'rgba(255,107,0,0.5)',   icon: AlertCircle,   label: '⚡ MED THREAT'   },
  LOW:    { color: '#00f5ff', bg: 'rgba(0,245,255,0.05)',  border: 'rgba(0,245,255,0.3)',   icon: Info,          label: '◆ LOW THREAT'    },
}

export default function AlertPanel({ alerts: propAlerts }) {
  const [alerts, setAlerts] = useState([])
  const [muted, setMuted] = useState(false)
  const [sirenActive, setSirenActive] = useState(false)
  const audioRef = useRef(null)
  const prevHighCount = useRef(0)

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API}/alerts`)
        const data = await res.json()
        setAlerts(data.alerts || [])
      } catch (_) {}
    }
    poll()
    const interval = setInterval(poll, 1500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const highAlerts = alerts.filter(a => a.threat_level === 'HIGH').length
    if (highAlerts > prevHighCount.current && !muted) {
      triggerSiren()
    }
    prevHighCount.current = highAlerts
  }, [alerts, muted])

  const triggerSiren = () => {
    setSirenActive(true)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }
    setTimeout(() => setSirenActive(false), 3000)
  }

  const dismissAlert = (id) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className={`cyber-panel rounded-lg flex flex-col h-full overflow-hidden transition-all duration-500 ${
      sirenActive ? 'animate-pulse-red' : ''
    }`} style={sirenActive ? { animation: 'siren 0.5s ease-in-out infinite' } : {}}>
      {/* Siren audio (synthetic beep via AudioContext) */}
      <SirenAudio active={sirenActive} muted={muted} />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          {sirenActive ? (
            <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
              <Bell size={14} className="neon-red" />
            </motion.div>
          ) : (
            <Bell size={14} className="neon-cyan" />
          )}
          <span className="font-display text-xs font-bold neon-cyan tracking-wider">THREAT ALERTS</span>
          <div className="flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold font-mono"
               style={{ background: alerts.length ? 'rgba(255,26,60,0.2)' : 'rgba(0,245,255,0.1)',
                        color: alerts.length ? '#ff1a3c' : '#00f5ff' }}>
            {alerts.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMuted(m => !m)}
            className="p-1 rounded border border-cyber-border text-cyber-cyan2 hover:text-cyber-cyan hover:border-cyber-cyan transition-colors"
          >
            {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
          </button>
          <span className="font-mono text-[10px] text-cyber-cyan2 opacity-40">
            {muted ? 'MUTED' : 'SOUND ON'}
          </span>
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        <AnimatePresence>
          {alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="w-10 h-10 rounded-full border border-cyber-border flex items-center justify-center mb-3"
                   style={{ background: 'rgba(0,245,255,0.05)' }}>
                <Info size={18} className="text-cyber-cyan2 opacity-40" />
              </div>
              <p className="font-mono text-xs text-cyber-cyan2 opacity-40">NO ACTIVE THREATS</p>
              <p className="font-mono text-[10px] text-cyber-cyan2 opacity-20 mt-1">MONITORING IN PROGRESS</p>
            </motion.div>
          ) : (
            alerts.slice(0, 12).map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} index={i} onDismiss={dismissAlert} />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      {alerts.length > 0 && (
        <div className="px-3 py-1.5 border-t border-cyber-border flex items-center justify-between">
          <span className="font-mono text-[10px] text-cyber-cyan2 opacity-40">{alerts.length} ACTIVE ALERTS</span>
          <button
            onClick={() => setAlerts([])}
            className="font-mono text-[10px] text-red-400 hover:text-red-300 opacity-60 hover:opacity-100 transition-opacity"
          >
            CLEAR ALL
          </button>
        </div>
      )}
    </div>
  )
}

function AlertCard({ alert, index, onDismiss }) {
  const cfg = THREAT_CONFIG[alert.threat_level] || THREAT_CONFIG.LOW
  const Icon = cfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative rounded border p-2.5 group"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <motion.div
            animate={alert.threat_level === 'HIGH' ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Icon size={13} style={{ color: cfg.color, flexShrink: 0, marginTop: 1 }} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-mono text-[10px] font-bold" style={{ color: cfg.color }}>
                {cfg.label}
              </span>
            </div>
            <p className="font-mono text-[11px] text-cyber-cyan2 opacity-80 truncate">
              {alert.type?.toUpperCase()} detected — {(alert.confidence * 100).toFixed(0)}% conf
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-[9px] text-cyber-cyan2 opacity-40">
                {alert.timestamp}
              </span>
              <span className="font-mono text-[9px] text-cyber-cyan2 opacity-40">
                {alert.lat?.toFixed(4)}°N {alert.lon?.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => onDismiss(alert.id)}
          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-cyber-cyan2 transition-opacity flex-shrink-0"
        >
          <X size={11} />
        </button>
      </div>

      {/* Confidence bar */}
      <div className="mt-2 h-0.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${alert.confidence * 100}%` }}
          transition={{ duration: 0.6 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})` }}
        />
      </div>
    </motion.div>
  )
}

function SirenAudio({ active, muted }) {
  const ctxRef = useRef(null)

  useEffect(() => {
    if (!active || muted) return

    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ctxRef.current = ctx

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.type = 'sawtooth'
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime)

    // Siren sweep effect
    oscillator.frequency.setValueAtTime(600, ctx.currentTime)
    oscillator.frequency.linearRampToValueAtTime(900, ctx.currentTime + 0.5)
    oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 1)
    oscillator.frequency.linearRampToValueAtTime(900, ctx.currentTime + 1.5)
    oscillator.frequency.linearRampToValueAtTime(600, ctx.currentTime + 2)

    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + 2.5)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 2.5)

    return () => {
      try { ctx.close() } catch(_) {}
    }
  }, [active, muted])

  return null
}

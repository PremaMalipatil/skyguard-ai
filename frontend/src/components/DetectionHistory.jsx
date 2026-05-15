import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, User, Car, Truck, Bike } from 'lucide-react'

const API = 'http://localhost:8000'

const TYPE_ICONS = {
  person: User,
  car: Car,
  truck: Truck,
  motorcycle: Bike,
  bicycle: Bike,
  bus: Car,
}

const THREAT_COLORS = {
  HIGH:   { color: '#ff1a3c', bg: 'rgba(255,26,60,0.08)'  },
  MEDIUM: { color: '#ff6b00', bg: 'rgba(255,107,0,0.08)' },
  LOW:    { color: '#00f5ff', bg: 'rgba(0,245,255,0.05)' },
}

export default function DetectionHistory() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API}/detections`)
        const data = await res.json()
        setHistory(data.history || [])
      } catch (_) {}
    }
    poll()
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="cyber-panel rounded-lg flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <History size={14} className="neon-cyan" />
          <span className="font-display text-xs font-bold neon-cyan tracking-wider">DETECTION LOG</span>
        </div>
        <span className="font-mono text-[10px] text-cyber-cyan2 opacity-40">{history.length} EVENTS</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="font-mono text-[10px] text-cyber-cyan2 opacity-30">NO DETECTIONS YET</p>
            </div>
          ) : (
            history.map((item, i) => {
              const Icon = TYPE_ICONS[item.label] || User
              const cfg = THREAT_COLORS[item.threat_level] || THREAT_COLORS.LOW
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-2 px-3 py-2 border-b border-cyber-border/50 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="p-1 rounded flex-shrink-0" style={{ background: cfg.bg }}>
                    <Icon size={10} style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold" style={{ color: cfg.color }}>
                        {item.label?.toUpperCase()}
                      </span>
                      <span className="font-mono text-[9px] text-cyber-cyan2 opacity-40">{item.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-[9px] text-cyber-cyan2 opacity-50">
                        {(item.confidence * 100).toFixed(0)}% conf
                      </span>
                      <span className="font-mono text-[9px]" style={{ color: `${cfg.color}60` }}>
                        {item.threat_level}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

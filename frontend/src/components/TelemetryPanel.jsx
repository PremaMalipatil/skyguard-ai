import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Battery, Navigation, Zap, Signal, MapPin, Cpu, Clock, Target } from 'lucide-react'

const API = 'http://localhost:8000'

export default function TelemetryPanel() {
  const [telem, setTelem] = useState({
    battery: 87, altitude: 120, speed: 24, signal: 95,
    lat: 12.9716, lon: 77.5946, mode: 'PATROL', uptime: 0, threats_detected: 0
  })

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API}/telemetry`)
        const data = await res.json()
        setTelem(data)
      } catch (_) {}
    }
    poll()
    const interval = setInterval(poll, 1000)
    return () => clearInterval(interval)
  }, [])

  const batteryColor = telem.battery > 50 ? 'green' : telem.battery > 20 ? 'orange' : 'red'

  return (
    <div className="cyber-panel rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <Cpu size={14} className="neon-cyan" />
          <span className="font-display text-xs font-bold neon-cyan tracking-wider">TELEMETRY</span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#00ff88', boxShadow: '0 0 6px #00ff88' }}
          />
          <span className="font-mono text-[10px] neon-green font-bold">{telem.mode}</span>
        </div>
      </div>

      <div className="flex-1 p-3 grid grid-cols-2 gap-2 overflow-auto">
        <TelemetryRow
          icon={Battery}
          label="BATTERY"
          value={`${telem.battery.toFixed(0)}%`}
          color={batteryColor}
          bar={telem.battery / 100}
        />
        <TelemetryRow
          icon={Navigation}
          label="ALTITUDE"
          value={`${telem.altitude.toFixed(0)}m`}
          color="cyan"
          subtitle="AGL"
        />
        <TelemetryRow
          icon={Zap}
          label="SPEED"
          value={`${telem.speed.toFixed(1)}`}
          unit="m/s"
          color="blue"
        />
        <TelemetryRow
          icon={Signal}
          label="SIGNAL"
          value={`${telem.signal.toFixed(0)}%`}
          color="green"
          bar={telem.signal / 100}
        />
        <TelemetryRow
          icon={MapPin}
          label="LATITUDE"
          value={`${telem.lat.toFixed(4)}°`}
          color="cyan"
          subtitle="N"
        />
        <TelemetryRow
          icon={MapPin}
          label="LONGITUDE"
          value={`${telem.lon.toFixed(4)}°`}
          color="cyan"
          subtitle="E"
        />
        <TelemetryRow
          icon={Clock}
          label="UPTIME"
          value={formatUptime(telem.uptime)}
          color="blue"
        />
        <TelemetryRow
          icon={Target}
          label="DETECTED"
          value={telem.threats_detected}
          color="red"
          subtitle="TOTAL"
        />
      </div>
    </div>
  )
}

function TelemetryRow({ icon: Icon, label, value, unit, color = 'cyan', bar, subtitle }) {
  const colors = {
    cyan:   '#00f5ff',
    green:  '#00ff88',
    red:    '#ff1a3c',
    orange: '#ff6b00',
    blue:   '#0080ff',
  }
  const c = colors[color] || colors.cyan

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded p-2 border"
      style={{ borderColor: `${c}20`, background: `${c}05` }}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={10} style={{ color: `${c}80` }} />
        <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: `${c}60` }}>
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-sm font-bold" style={{ color: c, textShadow: `0 0 8px ${c}40` }}>
          {value}
        </span>
        {unit && <span className="font-mono text-[9px]" style={{ color: `${c}50` }}>{unit}</span>}
        {subtitle && <span className="font-mono text-[9px] ml-auto" style={{ color: `${c}40` }}>{subtitle}</span>}
      </div>
      {bar !== undefined && (
        <div className="mt-1.5 h-0.5 rounded-full" style={{ background: `${c}15` }}>
          <motion.div
            animate={{ width: `${bar * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${c}60, ${c})` }}
          />
        </div>
      )}
    </motion.div>
  )
}

function formatUptime(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

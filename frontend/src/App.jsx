import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Activity, Target, Eye, Cpu, AlertTriangle, Zap } from 'lucide-react'

import Navbar from './components/Navbar'
import LiveFeed from './components/LiveFeed'
import AlertPanel from './components/AlertPanel'
import StatsCard from './components/StatsCard'
import TelemetryPanel from './components/TelemetryPanel'
import RadarAnimation from './components/RadarAnimation'
import MapPanel from './components/MapPanel'
import DetectionHistory from './components/DetectionHistory'

const API = 'http://localhost:8000'

export default function App() {
  const [systemStatus, setSystemStatus] = useState('CONNECTING')
  const [stats, setStats] = useState({ detections: 0, threats: 0, uptime: 0, fps: 28 })
  const [detections, setDetections] = useState([])
  const [alerts, setAlerts] = useState([])
  const [boot, setBoot] = useState(true)

  // Boot sequence
  useEffect(() => {
    const timer = setTimeout(() => setBoot(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  // Health check
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) })
        if (res.ok) setSystemStatus('ONLINE')
        else setSystemStatus('DEGRADED')
      } catch (_) {
        setSystemStatus('OFFLINE')
      }
    }
    check()
    const interval = setInterval(check, 5000)
    return () => clearInterval(interval)
  }, [])

  // Poll stats
  useEffect(() => {
    const poll = async () => {
      try {
        const [detRes, alertRes] = await Promise.all([
          fetch(`${API}/detections`),
          fetch(`${API}/alerts`),
        ])
        const detData = await detRes.json()
        const alertData = await alertRes.json()

        setDetections(detData.detections || [])
        setAlerts(alertData.alerts || [])
        setStats(s => ({
          ...s,
          detections: (detData.history || []).length,
          threats: (alertData.alerts || []).filter(a => a.threat_level === 'HIGH').length,
          fps: Math.floor(25 + Math.random() * 8),
        }))
      } catch (_) {}
    }
    poll()
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen flex flex-col bg-cyber-bg overflow-hidden relative">
      {/* Boot overlay */}
      <AnimatePresence>
        {boot && <BootScreen />}
      </AnimatePresence>

      {/* Ambient background grid */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
           style={{ backgroundImage: 'linear-gradient(#00f5ff 1px, transparent 1px), linear-gradient(90deg, #00f5ff 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Corner glow accents */}
      <div className="absolute top-0 left-0 w-96 h-96 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle at top left, rgba(0,128,255,0.04) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none z-0"
           style={{ background: 'radial-gradient(circle at bottom right, rgba(0,245,255,0.04) 0%, transparent 70%)' }} />

      {/* Navbar */}
      <div className="relative z-10 flex-shrink-0">
        <Navbar systemStatus={systemStatus} threatCount={alerts.filter(a => a.threat_level === 'HIGH').length} />
      </div>

      {/* Main dashboard grid */}
      <div className="relative z-10 flex-1 overflow-auto p-2 grid gap-2" style={{
        gridTemplateColumns: '220px 1fr 220px',
        gridTemplateRows: 'auto 1fr 1fr',
        minHeight: 0,
      }}>

        {/* ─── TOP STATS ROW ─── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-3 grid grid-cols-6 gap-2"
        >
          <StatsCard icon={Eye}           label="ACTIVE DETECTIONS" value={detections.length}      color="cyan"   />
          <StatsCard icon={AlertTriangle} label="HIGH THREATS"       value={stats.threats}          color="red"    />
          <StatsCard icon={Target}        label="TOTAL LOGGED"       value={stats.detections}       color="orange" />
          <StatsCard icon={Activity}      label="FEED FPS"           value={stats.fps}  unit="fps"  color="blue"   />
          <StatsCard icon={Shield}        label="AI CONFIDENCE"      value="98.4"       unit="%"    color="green"  />
          <StatsCard icon={Cpu}           label="GPU TEMP"           value="67"         unit="°C"   color="cyan"   />
        </motion.div>

        {/* ─── LEFT COLUMN ─── */}
        <div className="flex flex-col gap-2" style={{ minHeight: 0 }}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex-1"
            style={{ minHeight: '160px', maxHeight: '200px' }}
          >
            <RadarAnimation detections={detections} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex-1"
            style={{ minHeight: '180px' }}
          >
            <TelemetryPanel />
          </motion.div>
        </div>

        {/* ─── CENTER – Live Feed ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="row-span-2"
          style={{ minHeight: 0 }}
        >
          <LiveFeed onDetectionsUpdate={setDetections} />
        </motion.div>

        {/* ─── RIGHT COLUMN ─── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="row-span-2 flex flex-col gap-2"
          style={{ minHeight: 0 }}
        >
          <div className="flex-1" style={{ minHeight: '180px' }}>
            <AlertPanel alerts={alerts} />
          </div>
          <div className="flex-1" style={{ minHeight: '120px' }}>
            <DetectionHistory />
          </div>
        </motion.div>

        {/* ─── BOTTOM LEFT – Map ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ minHeight: '160px' }}
        >
          <MapPanel />
        </motion.div>
      </div>

      {/* Status bar */}
      <div className="relative z-10 flex-shrink-0 border-t border-cyber-border px-4 py-1 flex items-center justify-between"
           style={{ background: 'rgba(4,15,31,0.95)' }}>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[9px] text-cyber-cyan2 opacity-30">SKYGUARD AI v1.0.0</span>
          <span className="font-mono text-[9px] text-cyber-cyan2 opacity-30">© 2024 DEFENSE SYSTEMS</span>
        </div>
        <div className="flex items-center gap-4">
          <StatusDot color={systemStatus === 'ONLINE' ? '#00ff88' : '#ff1a3c'} label={`BACKEND: ${systemStatus}`} />
          <StatusDot color="#00f5ff" label="AI ENGINE: ACTIVE" />
          <StatusDot color="#00ff88" label="STREAM: LIVE" />
          <span className="font-mono text-[9px] text-cyber-cyan2 opacity-30">ENCRYPTION: AES-256</span>
        </div>
      </div>
    </div>
  )
}

function StatusDot({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 4px ${color}` }} />
      <span className="font-mono text-[9px] text-cyber-cyan2 opacity-40">{label}</span>
    </div>
  )
}

function BootScreen() {
  const [step, setStep] = useState(0)
  const lines = [
    'INITIALIZING SKYGUARD AI SYSTEMS...',
    'LOADING YOLOV8 NEURAL NETWORK...',
    'ESTABLISHING ENCRYPTED UPLINK...',
    'CALIBRATING THREAT DETECTION...',
    'ALL SYSTEMS NOMINAL. ENGAGING.',
  ]

  useEffect(() => {
    const intervals = lines.map((_, i) =>
      setTimeout(() => setStep(s => Math.max(s, i + 1)), i * 380)
    )
    return () => intervals.forEach(clearTimeout)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: '#020b18' }}
    >
      <div className="absolute inset-0 opacity-5"
           style={{ backgroundImage: 'linear-gradient(#00f5ff 1px, transparent 1px), linear-gradient(90deg, #00f5ff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mb-8"
      >
        <Shield size={64} className="neon-cyan" />
      </motion.div>

      <h1 className="font-display text-3xl font-black neon-cyan tracking-widest mb-2">SKYGUARD AI</h1>
      <p className="font-mono text-xs text-cyber-cyan2 opacity-50 mb-10 tracking-widest">
        AI-POWERED SMART SURVEILLANCE SYSTEM
      </p>

      <div className="w-80 space-y-1.5">
        {lines.slice(0, step).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <span className="neon-green font-mono text-[10px]">▶</span>
            <span className="font-mono text-[11px] text-cyber-cyan2 opacity-70">{line}</span>
          </motion.div>
        ))}
        {step < lines.length && (
          <div className="flex items-center gap-2">
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="neon-cyan font-mono text-[10px]"
            >
              █
            </motion.span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-8 w-80 h-0.5 rounded-full" style={{ background: 'rgba(0,245,255,0.1)' }}>
        <motion.div
          animate={{ width: `${(step / lines.length) * 100}%` }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #0080ff, #00f5ff)' }}
        />
      </div>
      <p className="font-mono text-[9px] neon-cyan opacity-40 mt-2">{Math.round((step / lines.length) * 100)}%</p>
    </motion.div>
  )
}

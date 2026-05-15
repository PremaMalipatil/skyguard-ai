import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Power, Camera, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react'

const API = 'http://localhost:8000'

export default function LiveFeed({ onDetectionsUpdate }) {
  const [feedOn, setFeedOn] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [key, setKey] = useState(0)
  const [fps, setFps] = useState(28)

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(Math.floor(25 + Math.random() * 8))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const toggleFeed = async () => {
    try {
      await fetch(`${API}/camera/${feedOn ? 'stop' : 'start'}`, { method: 'POST' })
    } catch (_) {}
    setFeedOn(p => !p)
    setKey(k => k + 1)
  }

  return (
    <div className="cyber-panel rounded-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <Camera size={14} className="neon-cyan" />
          <span className="font-display text-xs font-bold neon-cyan tracking-wider">LIVE FEED</span>
          <span className="font-mono text-[10px] text-cyber-cyan2 opacity-50">CAM-01 / DRONE-ALPHA</span>
        </div>
        <div className="flex items-center gap-2">
          {feedOn && (
            <div className="flex items-center gap-1.5">
              <div className="recording-dot" />
              <span className="font-mono text-[10px] neon-red">REC</span>
              <span className="font-mono text-[10px] text-cyber-cyan2 opacity-50 ml-2">{fps} FPS</span>
            </div>
          )}
          <button
            onClick={() => setZoom(z => Math.max(0.8, z - 0.2))}
            className="p-1 rounded border border-cyber-border text-cyber-cyan2 hover:border-cyber-cyan hover:text-cyber-cyan transition-colors"
          >
            <ZoomOut size={12} />
          </button>
          <button
            onClick={() => setZoom(z => Math.min(2, z + 0.2))}
            className="p-1 rounded border border-cyber-border text-cyber-cyan2 hover:border-cyber-cyan hover:text-cyber-cyan transition-colors"
          >
            <ZoomIn size={12} />
          </button>
          <button
            onClick={() => { setZoom(1); setKey(k => k + 1) }}
            className="p-1 rounded border border-cyber-border text-cyber-cyan2 hover:border-cyber-cyan hover:text-cyber-cyan transition-colors"
          >
            <RotateCcw size={12} />
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFeed}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono text-[11px] font-bold transition-all ${
              feedOn
                ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:border-red-400'
                : 'border-cyber-cyan/50 bg-cyber-cyan/10 neon-cyan hover:border-cyber-cyan'
            }`}
          >
            <Power size={11} />
            {feedOn ? 'STOP' : 'START'}
          </motion.button>
        </div>
      </div>

      {/* Video area */}
      <div className="relative flex-1 bg-black overflow-hidden" style={{ minHeight: '260px' }}>
        <AnimatePresence mode="wait">
          {feedOn ? (
            <motion.div
              key={`feed-${key}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* MJPEG stream */}
              <img
                src={`${API}/video?t=${key}`}
                alt="Live surveillance feed"
                className="w-full h-full object-cover"
                style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
              />

              {/* Scan line */}
              <div className="scan-line" />

              {/* Corner brackets */}
              <Corner pos="top-2 left-2" rotate="" />
              <Corner pos="top-2 right-2" rotate="rotate-90" />
              <Corner pos="bottom-2 left-2" rotate="-rotate-90" />
              <Corner pos="bottom-2 right-2" rotate="rotate-180" />

              {/* HUD overlays */}
              <div className="absolute top-2 left-2 font-mono text-[10px] text-cyber-cyan opacity-70 pointer-events-none select-none">
                <div>ZOOM: {zoom.toFixed(1)}x</div>
              </div>
              <div className="absolute bottom-2 right-2 font-mono text-[10px] text-cyber-cyan opacity-70 pointer-events-none select-none text-right">
                <div>1920×1080 | H.264</div>
                <div>ENCRYPTED</div>
              </div>

              {/* Vignette */}
              <div className="absolute inset-0 pointer-events-none"
                   style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(2,11,24,0.7) 100%)' }} />
            </motion.div>
          ) : (
            <motion.div
              key="feed-off"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #020b18, #040f1f)' }}
            >
              {/* Grid background */}
              <div className="absolute inset-0 opacity-10"
                   style={{ backgroundImage: 'linear-gradient(#00f5ff1a 1px, transparent 1px), linear-gradient(90deg, #00f5ff1a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Power size={48} className="neon-red mb-4" />
              </motion.div>
              <p className="font-display text-xl font-bold neon-red tracking-widest">LIVE FEED OFFLINE</p>
              <p className="font-mono text-xs text-cyber-cyan2 opacity-50 mt-2 tracking-wider">CAMERA SYSTEM DISABLED</p>
              <p className="font-mono text-[10px] text-cyber-cyan2 opacity-30 mt-1">PRESS START TO RESUME SURVEILLANCE</p>

              {/* Static noise effect */}
              <div className="absolute inset-0 pointer-events-none opacity-5"
                   style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer bar */}
      <div className="px-3 py-1.5 border-t border-cyber-border flex items-center justify-between">
        <span className="font-mono text-[10px] text-cyber-cyan2 opacity-40">BANDWIDTH: 4.2 MB/s</span>
        <span className={`font-mono text-[10px] font-bold ${feedOn ? 'neon-green' : 'neon-red'}`}>
          ● {feedOn ? 'TRANSMITTING' : 'DISCONNECTED'}
        </span>
        <span className="font-mono text-[10px] text-cyber-cyan2 opacity-40">LATENCY: 18ms</span>
      </div>
    </div>
  )
}

function Corner({ pos, rotate }) {
  return (
    <div className={`absolute ${pos} w-5 h-5 pointer-events-none`}>
      <div className={`w-full h-full border-t-2 border-l-2 border-cyber-cyan opacity-70 ${rotate}`} />
    </div>
  )
}

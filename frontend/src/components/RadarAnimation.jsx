import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Radio } from 'lucide-react'

export default function RadarAnimation({ detections = [] }) {
  const canvasRef = useRef(null)
  const animRef = useRef(null)
  const angleRef = useRef(0)
  const [blips, setBlips] = useState([])

  // Generate blips from detections
  useEffect(() => {
    if (detections.length === 0) {
      // Simulate some blips
      setBlips(Array.from({ length: 3 }, (_, i) => ({
        id: i,
        angle: (i * 120 + Math.random() * 60) * Math.PI / 180,
        dist: 0.3 + Math.random() * 0.5,
        threat: ['LOW', 'MEDIUM', 'HIGH'][i % 3],
        age: Math.random(),
      })))
    } else {
      setBlips(detections.slice(0, 8).map((d, i) => ({
        id: i,
        angle: (i * 45 + Math.random() * 20) * Math.PI / 180,
        dist: 0.2 + Math.random() * 0.6,
        threat: d.threat_level || 'LOW',
        age: 0,
      })))
    }
  }, [detections])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const r = size / 2 - 8

    const draw = () => {
      ctx.clearRect(0, 0, size, size)

      // Background
      ctx.fillStyle = '#020b18'
      ctx.fillRect(0, 0, size, size)

      // Concentric rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (r * i) / 4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,245,255,${0.06 + i * 0.02})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Cross lines
      ctx.strokeStyle = 'rgba(0,245,255,0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r)
      ctx.stroke()

      // Diagonal cross
      ctx.strokeStyle = 'rgba(0,245,255,0.04)'
      ctx.beginPath()
      const d = r * 0.707
      ctx.moveTo(cx - d, cy - d); ctx.lineTo(cx + d, cy + d)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx + d, cy - d); ctx.lineTo(cx - d, cy + d)
      ctx.stroke()

      // Radar sweep
      const sweepAngle = angleRef.current
      const gradient = ctx.createConicalGradient
        ? ctx.createConicalGradient(cx, cy, sweepAngle)
        : null

      // Draw sweep manually as a wide arc
      const sweepWidth = Math.PI / 3 // 60 degree sweep
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, sweepAngle - sweepWidth, sweepAngle)
      ctx.closePath()
      const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
      radGrad.addColorStop(0, 'rgba(0,245,255,0)')
      radGrad.addColorStop(0.6, 'rgba(0,245,255,0.03)')
      radGrad.addColorStop(1, 'rgba(0,245,255,0.08)')
      ctx.fillStyle = radGrad
      ctx.fill()
      ctx.restore()

      // Leading edge line
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(
        cx + Math.cos(sweepAngle) * r,
        cy + Math.sin(sweepAngle) * r
      )
      ctx.strokeStyle = 'rgba(0,245,255,0.8)'
      ctx.lineWidth = 1.5
      ctx.shadowColor = '#00f5ff'
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.restore()

      // Blips
      blips.forEach(blip => {
        const bx = cx + Math.cos(blip.angle) * blip.dist * r
        const by = cy + Math.sin(blip.angle) * blip.dist * r
        const colors = { HIGH: '#ff1a3c', MEDIUM: '#ff6b00', LOW: '#00f5ff' }
        const col = colors[blip.threat] || '#00f5ff'

        ctx.save()
        ctx.beginPath()
        ctx.arc(bx, by, 3, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.shadowColor = col
        ctx.shadowBlur = 10
        ctx.fill()

        // Pulse ring
        const pulseFade = (1 - (Date.now() % 2000) / 2000) * 0.6
        ctx.beginPath()
        ctx.arc(bx, by, 3 + 6 * (1 - pulseFade), 0, Math.PI * 2)
        ctx.strokeStyle = `${col}${Math.floor(pulseFade * 255).toString(16).padStart(2, '0')}`
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
      })

      // Center dot
      ctx.save()
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#00f5ff'
      ctx.shadowColor = '#00f5ff'
      ctx.shadowBlur = 10
      ctx.fill()
      ctx.restore()

      // Outer ring
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0,245,255,0.3)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Degree markers
      for (let deg = 0; deg < 360; deg += 30) {
        const rad = (deg * Math.PI) / 180
        const innerR = r - 6
        const outerR = r + 0
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(rad) * innerR, cy + Math.sin(rad) * innerR)
        ctx.lineTo(cx + Math.cos(rad) * outerR, cy + Math.sin(rad) * outerR)
        ctx.strokeStyle = 'rgba(0,245,255,0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      angleRef.current = (angleRef.current + 0.025) % (Math.PI * 2)
      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [blips])

  return (
    <div className="cyber-panel rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          >
            <Radio size={14} className="neon-cyan" />
          </motion.div>
          <span className="font-display text-xs font-bold neon-cyan tracking-wider">RADAR</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-cyber-cyan2 opacity-40">RANGE: 500m</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff1a3c', boxShadow: '0 0 4px #ff1a3c' }} />
            <span className="font-mono text-[9px] text-red-400">HIGH</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ff6b00', boxShadow: '0 0 4px #ff6b00' }} />
            <span className="font-mono text-[9px] text-orange-400">MED</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-3">
        <canvas
          ref={canvasRef}
          width={200}
          height={200}
          className="rounded-full"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      </div>

      <div className="px-3 py-1.5 border-t border-cyber-border">
        <p className="font-mono text-[10px] text-cyber-cyan2 opacity-30 text-center">
          {blips.length} CONTACTS DETECTED
        </p>
      </div>
    </div>
  )
}

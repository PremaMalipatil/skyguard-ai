import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Map as MapIcon, Navigation } from 'lucide-react'

const API = 'http://localhost:8000'

export default function MapPanel() {
  const mapRef = useRef(null)
  const leafletMap = useRef(null)
  const droneMarker = useRef(null)
  const threatMarkers = useRef([])
  const [mapReady, setMapReady] = useState(false)
  const [pos, setPos] = useState({ lat: 12.9716, lon: 77.5946 })

  useEffect(() => {
    // Dynamically import Leaflet
    import('leaflet').then(L => {
      if (leafletMap.current || !mapRef.current) return

      const map = L.map(mapRef.current, {
        center: [12.9716, 77.5946],
        zoom: 14,
        zoomControl: false,
        attributionControl: true,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OSM',
        maxZoom: 19,
      }).addTo(map)

      // Custom drone icon
      const droneIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:24px;height:24px;
          background:rgba(0,245,255,0.2);
          border:2px solid #00f5ff;
          border-radius:50%;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 0 12px #00f5ff, 0 0 24px #00f5ff40;
          animation:ping-custom 1.5s ease-out infinite;
        ">
          <div style="width:8px;height:8px;background:#00f5ff;border-radius:50%;box-shadow:0 0 6px #00f5ff;"></div>
        </div>
        <style>@keyframes ping-custom{0%{transform:scale(1);opacity:0.8}70%,100%{transform:scale(2.2);opacity:0}}</style>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([12.9716, 77.5946], { icon: droneIcon })
        .addTo(map)
        .bindPopup('<div style="font-family:monospace;font-size:11px;color:#00f5ff;background:#020b18;border:1px solid #00f5ff40;padding:6px;border-radius:4px">🛸 DRONE-ALPHA<br>STATUS: PATROL</div>')

      droneMarker.current = marker
      leafletMap.current = map
      setMapReady(true)
    })

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove()
        leafletMap.current = null
      }
    }
  }, [])

  // Poll telemetry and update marker
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${API}/telemetry`)
        const data = await res.json()
        setPos({ lat: data.lat, lon: data.lon })

        if (droneMarker.current && leafletMap.current) {
          droneMarker.current.setLatLng([data.lat, data.lon])
        }
      } catch (_) {}
    }
    poll()
    const interval = setInterval(poll, 2000)
    return () => clearInterval(interval)
  }, [])

  // Poll detections and add threat markers
  useEffect(() => {
    if (!mapReady) return

    const poll = async () => {
      try {
        const res = await fetch(`${API}/detections`)
        const data = await res.json()

        import('leaflet').then(L => {
          // Remove old threat markers
          threatMarkers.current.forEach(m => m.remove())
          threatMarkers.current = []

          const colors = { HIGH: '#ff1a3c', MEDIUM: '#ff6b00', LOW: '#00f5ff' }

          ;(data.history || []).slice(0, 10).forEach((det, i) => {
            const lat = 12.9716 + (Math.random() - 0.5) * 0.01
            const lon = 77.5946 + (Math.random() - 0.5) * 0.01
            const col = colors[det.threat_level] || '#00f5ff'

            const icon = L.divIcon({
              className: '',
              html: `<div style="
                width:14px;height:14px;
                background:${col}30;
                border:1.5px solid ${col};
                border-radius:2px;
                box-shadow:0 0 8px ${col};
                transform:rotate(45deg);
              "></div>`,
              iconSize: [14, 14],
              iconAnchor: [7, 7],
            })

            if (leafletMap.current) {
              const m = L.marker([lat, lon], { icon })
                .addTo(leafletMap.current)
                .bindPopup(`<div style="font-family:monospace;font-size:10px;color:${col};background:#020b18;border:1px solid ${col}40;padding:5px;border-radius:3px">
                  ⚠ ${det.label?.toUpperCase()}<br>
                  CONF: ${(det.confidence * 100).toFixed(0)}%<br>
                  THREAT: ${det.threat_level}
                </div>`)
              threatMarkers.current.push(m)
            }
          })
        })
      } catch (_) {}
    }

    poll()
    const interval = setInterval(poll, 5000)
    return () => clearInterval(interval)
  }, [mapReady])

  return (
    <div className="cyber-panel rounded-lg overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyber-border">
        <div className="flex items-center gap-2">
          <MapIcon size={14} className="neon-cyan" />
          <span className="font-display text-xs font-bold neon-cyan tracking-wider">TACTICAL MAP</span>
        </div>
        <div className="flex items-center gap-2">
          <Navigation size={11} className="text-cyber-cyan2 opacity-50" />
          <span className="font-mono text-[10px] text-cyber-cyan2 opacity-60">
            {pos.lat.toFixed(4)}°N {pos.lon.toFixed(4)}°E
          </span>
        </div>
      </div>

      <div className="relative flex-1" style={{ minHeight: '200px' }}>
        <div ref={mapRef} className="absolute inset-0" />

        {/* Overlay corners */}
        <div className="absolute top-2 left-2 z-[1000] pointer-events-none">
          <div className="w-4 h-4 border-t-2 border-l-2 border-cyber-cyan opacity-60" />
        </div>
        <div className="absolute top-2 right-2 z-[1000] pointer-events-none">
          <div className="w-4 h-4 border-t-2 border-r-2 border-cyber-cyan opacity-60" />
        </div>
        <div className="absolute bottom-2 left-2 z-[1000] pointer-events-none">
          <div className="w-4 h-4 border-b-2 border-l-2 border-cyber-cyan opacity-60" />
        </div>
        <div className="absolute bottom-2 right-2 z-[1000] pointer-events-none">
          <div className="w-4 h-4 border-b-2 border-r-2 border-cyber-cyan opacity-60" />
        </div>

        {/* Map mode label */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <span className="font-mono text-[9px] neon-cyan opacity-60 bg-black/50 px-2 py-0.5 rounded">
            BENGALURU SECTOR
          </span>
        </div>
      </div>

      <div className="px-3 py-1.5 border-t border-cyber-border flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: '#00f5ff', boxShadow: '0 0 4px #00f5ff' }} />
          <span className="font-mono text-[9px] text-cyber-cyan2 opacity-50">DRONE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rotate-45 rounded-sm" style={{ background: '#ff1a3c', boxShadow: '0 0 4px #ff1a3c' }} />
          <span className="font-mono text-[9px] text-cyber-cyan2 opacity-50">HIGH</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rotate-45 rounded-sm" style={{ background: '#ff6b00', boxShadow: '0 0 4px #ff6b00' }} />
          <span className="font-mono text-[9px] text-cyber-cyan2 opacity-50">MED</span>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useCallback, useRef, useState, useEffect, useMemo } from "react"
import type { AnimalData } from "@/lib/food-web-data"
import { getConnections } from "@/lib/food-web-data"
import {
  WolfIcon, RabbitIcon, DeerIcon, EagleIcon,
  SnakeIcon, MouseIcon, FrogIcon, BearIcon, FoxIcon, FishIcon
} from "./cave-painting-icons"

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  wolf: WolfIcon, rabbit: RabbitIcon, deer: DeerIcon, eagle: EagleIcon,
  snake: SnakeIcon, mouse: MouseIcon, frog: FrogIcon, bear: BearIcon,
  fox: FoxIcon, fish: FishIcon,
}

interface PlacedAnimal {
  animal: AnimalData
  x: number
  y: number
}

interface CrumblingConnection {
  id: string
  from: { x: number; y: number }
  to: { x: number; y: number }
  path: string
}

interface CrumblingNode {
  id: string
  x: number
  y: number
  animal: AnimalData
}

interface CaveCanvasProps {
  placedAnimals: Map<string, PlacedAnimal>
  onDrop: (animalId: string, x: number, y: number) => void
  onRemove: (animalId: string) => void
  draggedAnimal: AnimalData | null
}

function generateScratchLines(count: number, width: number, height: number) {
  const lines: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = []
  const rng = (seed: number) => {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647 }
  }
  const rand = rng(42)
  for (let i = 0; i < count; i++) {
    const x = rand() * width
    const y = rand() * height
    const angle = rand() * Math.PI
    const len = 30 + rand() * 120
    lines.push({
      x1: x,
      y1: y,
      x2: x + Math.cos(angle) * len,
      y2: y + Math.sin(angle) * len,
      opacity: 0.03 + rand() * 0.06,
    })
  }
  return lines
}

function makeBrushPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy)
  if (len === 0) return `M ${x1} ${y1} L ${x2} ${y2}`

  const nx = -dy / len
  const ny = dx / len
  const wobble = Math.min(len * 0.12, 20)

  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const cx = mx + nx * wobble * 0.6
  const cy = my + ny * wobble * 0.6

  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
}

export function CaveCanvas({ placedAnimals, onDrop, onRemove, draggedAnimal }: CaveCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [dragOver, setDragOver] = useState(false)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [crumblingConnections, setCrumblingConnections] = useState<CrumblingConnection[]>([])
  const [crumblingNodes, setCrumblingNodes] = useState<CrumblingNode[]>([])
  const [newNodes, setNewNodes] = useState<Set<string>>(new Set())
  const [newConnections, setNewConnections] = useState<Set<string>>(new Set())

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }
    updateDimensions()
    const observer = new ResizeObserver(updateDimensions)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const scratches = useMemo(() => generateScratchLines(60, dimensions.width, dimensions.height), [dimensions])

  const connections = useMemo(() => {
    const ids = Array.from(placedAnimals.keys())
    return getConnections(ids)
  }, [placedAnimals])

  const prevConnectionsRef = useRef<Set<string>>(new Set())
  useEffect(() => {
    const currentKeys = new Set(connections.map(c => `${c.from}-${c.to}`))
    const fresh = new Set<string>()
    currentKeys.forEach(key => {
      if (!prevConnectionsRef.current.has(key)) fresh.add(key)
    })
    if (fresh.size > 0) {
      setNewConnections(fresh)
      const timer = setTimeout(() => setNewConnections(new Set()), 600)
      return () => clearTimeout(timer)
    }
    prevConnectionsRef.current = currentKeys
  }, [connections])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const animalId = e.dataTransfer.getData('text/plain')
    if (!animalId || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    onDrop(animalId, x, y)
    setNewNodes(prev => new Set(prev).add(animalId))
    setTimeout(() => {
      setNewNodes(prev => {
        const next = new Set(prev)
        next.delete(animalId)
        return next
      })
    }, 500)
  }, [onDrop])

  const handleNodeMouseDown = useCallback((e: React.MouseEvent, animalId: string) => {
    e.stopPropagation()
    e.preventDefault()
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const placed = placedAnimals.get(animalId)
    if (!placed) return
    setDraggingNode(animalId)
    setDragOffset({
      x: e.clientX - rect.left - placed.x,
      y: e.clientY - rect.top - placed.y,
    })
  }, [placedAnimals])

  const handleMouseMoveCanvas = useCallback((e: React.MouseEvent) => {
    if (!draggingNode || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragOffset.x
    const y = e.clientY - rect.top - dragOffset.y
    const clampedX = Math.max(40, Math.min(rect.width - 40, x))
    const clampedY = Math.max(40, Math.min(rect.height - 40, y))
    onDrop(draggingNode, clampedX, clampedY)
  }, [draggingNode, dragOffset, onDrop])

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null)
  }, [])

  const handleRemove = useCallback((animalId: string) => {
    const placed = placedAnimals.get(animalId)
    if (!placed) return

    const dyingConnections: CrumblingConnection[] = connections
      .filter(c => c.from === animalId || c.to === animalId)
      .map(c => {
        const fromAnimal = placedAnimals.get(c.from)
        const toAnimal = placedAnimals.get(c.to)
        if (!fromAnimal || !toAnimal) return null
        return {
          id: `${c.from}-${c.to}`,
          from: { x: fromAnimal.x, y: fromAnimal.y },
          to: { x: toAnimal.x, y: toAnimal.y },
          path: makeBrushPath(fromAnimal.x, fromAnimal.y, toAnimal.x, toAnimal.y),
        }
      })
      .filter(Boolean) as CrumblingConnection[]

    setCrumblingConnections(prev => [...prev, ...dyingConnections])
    setCrumblingNodes(prev => [...prev, { id: animalId, x: placed.x, y: placed.y, animal: placed.animal }])

    setTimeout(() => {
      setCrumblingConnections(prev => prev.filter(c => !dyingConnections.some(d => d.id === c.id)))
      setCrumblingNodes(prev => prev.filter(n => n.id !== animalId))
    }, 600)

    onRemove(animalId)
  }, [placedAnimals, connections, onRemove])

  const tierGlow: Record<string, string> = {
    apex: 'rgba(200,135,58,0.4)',
    predator: 'rgba(160,122,74,0.3)',
    prey: 'rgba(139,107,58,0.25)',
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 h-full overflow-hidden select-none"
      style={{
        background: `radial-gradient(ellipse at center, #2a1f14 0%, #1e160d 60%, #120d07 100%)`,
        cursor: dragOver ? 'copy' : draggingNode ? 'grabbing' : 'default',
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseMove={handleMouseMoveCanvas}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          opacity: 0.3,
          mixBlendMode: 'overlay',
        }}
      />

      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
        style={{ pointerEvents: 'none' }}
      >
        <defs>
          <filter id="charcoal">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
          </filter>
          <filter id="paintGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="roughEdge">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
          </filter>
        </defs>

        {/* Scratch marks */}
        {scratches.map((s, i) => (
          <line
            key={i}
            x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
            stroke="#8b7355"
            strokeWidth="0.5"
            opacity={s.opacity}
            strokeLinecap="round"
          />
        ))}

        {/* Active connections */}
        {connections.map((conn) => {
          const from = placedAnimals.get(conn.from)
          const to = placedAnimals.get(conn.to)
          if (!from || !to) return null
          const key = `${conn.from}-${conn.to}`
          const path = makeBrushPath(from.x, from.y, to.x, to.y)
          const isNew = newConnections.has(key)
          const isHovered = hoveredNode === conn.from || hoveredNode === conn.to
          return (
            <g key={key}>
              {/* Shadow stroke */}
              <path
                d={path}
                fill="none"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="6"
                strokeLinecap="round"
                filter="url(#charcoal)"
                style={{
                  ...(isNew ? {
                    strokeDasharray: 300,
                    animation: 'strokeDraw 0.5s ease-out forwards',
                  } : {}),
                }}
              />
              {/* Main brush stroke */}
              <path
                d={path}
                fill="none"
                stroke={isHovered ? '#d4a84b' : '#a07a4a'}
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#charcoal)"
                opacity={isHovered ? 0.95 : 0.7}
                style={{
                  transition: 'stroke 0.3s, opacity 0.3s',
                  ...(isNew ? {
                    strokeDasharray: 300,
                    animation: 'strokeDraw 0.5s ease-out forwards',
                  } : {}),
                }}
              />
              {/* Arrow head near prey */}
              <circle
                cx={to.x + (from.x - to.x) * 0.08}
                cy={to.y + (from.y - to.y) * 0.08}
                r="4"
                fill={isHovered ? '#d4a84b' : '#a07a4a'}
                opacity={isHovered ? 0.9 : 0.6}
                filter="url(#charcoal)"
              />
            </g>
          )
        })}

        {/* Crumbling connections */}
        {crumblingConnections.map((conn) => (
          <path
            key={`crumble-${conn.id}`}
            d={conn.path}
            fill="none"
            stroke="#a07a4a"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#charcoal)"
            strokeDasharray="8 4"
            style={{
              animation: 'crumble 0.6s ease-out forwards',
            }}
          />
        ))}
      </svg>

      {/* Placed animal nodes */}
      {Array.from(placedAnimals.values()).map(({ animal, x, y }) => {
        const Icon = iconMap[animal.id]
        const isNew = newNodes.has(animal.id)
        const isHovered = hoveredNode === animal.id
        const isDragging = draggingNode === animal.id

        return (
          <div
            key={animal.id}
            className="absolute flex flex-col items-center"
            style={{
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              zIndex: isDragging ? 50 : isHovered ? 40 : 10,
              cursor: isDragging ? 'grabbing' : 'grab',
              ...(isNew ? { animation: 'fadeInPaint 0.5s ease-out forwards' } : {}),
            }}
            onMouseDown={(e) => handleNodeMouseDown(e, animal.id)}
            onMouseEnter={() => setHoveredNode(animal.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <div
              className="relative flex items-center justify-center"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${tierGlow[animal.tier]}, transparent 70%)`,
                filter: isHovered
                  ? `drop-shadow(0 0 12px ${tierGlow[animal.tier]})`
                  : `drop-shadow(0 0 4px rgba(200,135,58,0.15))`,
                transition: 'filter 0.3s',
              }}
            >
              {Icon && (
                <Icon className="w-11 h-11" />
              )}
            </div>

            <span
              className="text-[10px] font-mono tracking-widest uppercase mt-1"
              style={{
                color: isHovered ? '#d4a84b' : '#a07a4a',
                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                transition: 'color 0.3s',
              }}
            >
              {animal.name}
            </span>

            {/* Remove button */}
            <button
              className="absolute -top-1 -right-1 flex items-center justify-center transition-opacity duration-200"
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: '#5a2a1a',
                border: '1px solid #8b3a2a',
                color: '#d4a84b',
                fontSize: 10,
                opacity: isHovered ? 1 : 0,
                pointerEvents: isHovered ? 'auto' : 'none',
                cursor: 'pointer',
              }}
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(animal.id)
              }}
              aria-label={`Remove ${animal.name}`}
            >
              {'x'}
            </button>
          </div>
        )
      })}

      {/* Crumbling nodes */}
      {crumblingNodes.map((node) => {
        const Icon = iconMap[node.id]
        return (
          <div
            key={`crumble-node-${node.id}`}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: node.x,
              top: node.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 100,
              animation: 'crumbleNode 0.6s ease-out forwards',
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: `radial-gradient(circle at 30% 30%, ${tierGlow[node.animal.tier]}, transparent 70%)`,
              }}
            >
              {Icon && <Icon className="w-11 h-11" />}
            </div>
            <span
              className="text-[10px] font-mono tracking-widest uppercase mt-1"
              style={{ color: '#a07a4a', textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
            >
              {node.animal.name}
            </span>
          </div>
        )
      })}

      {/* Drop zone hint */}
      {dragOver && draggedAnimal && (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(200,135,58,0.06) 0%, transparent 50%)',
          }}
        >
          <p
            className="text-sm font-mono tracking-widest uppercase"
            style={{
              color: 'rgba(200,135,58,0.3)',
              textShadow: '0 0 10px rgba(200,135,58,0.2)',
            }}
          >
            {'Release to paint on the wall'}
          </p>
        </div>
      )}

      {/* Empty state */}
      {placedAnimals.size === 0 && !dragOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <svg width="80" height="60" viewBox="0 0 80 60" className="mb-4" opacity="0.15">
            <path d="M10 50 L20 30 L25 35 L30 20 L40 40 L45 25 L50 35 L55 15 L60 30 L70 50"
              stroke="#a07a4a" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="25" cy="25" r="3" fill="#a07a4a" />
            <circle cx="55" cy="20" r="3" fill="#a07a4a" />
          </svg>
          <p
            className="text-sm font-mono tracking-[0.25em] uppercase"
            style={{ color: 'rgba(160,122,74,0.25)' }}
          >
            Drag creatures onto the cave wall
          </p>
          <p
            className="text-xs font-mono tracking-wider mt-2"
            style={{ color: 'rgba(160,122,74,0.15)' }}
          >
            Build a food web to see connections
          </p>
        </div>
      )}
    </div>
  )
}

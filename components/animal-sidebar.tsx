"use client"

import type { AnimalData } from "@/lib/food-web-data"
import {
  WolfIcon, RabbitIcon, DeerIcon, EagleIcon,
  SnakeIcon, MouseIcon, FrogIcon, BearIcon, FoxIcon, FishIcon
} from "./cave-painting-icons"

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  wolf: WolfIcon,
  rabbit: RabbitIcon,
  deer: DeerIcon,
  eagle: EagleIcon,
  snake: SnakeIcon,
  mouse: MouseIcon,
  frog: FrogIcon,
  bear: BearIcon,
  fox: FoxIcon,
  fish: FishIcon,
}

const tierColors: Record<string, string> = {
  apex: '#c8873a',
  predator: '#a07a4a',
  prey: '#8b6b3a',
}

interface AnimalSidebarProps {
  animals: AnimalData[]
  placedAnimalIds: Set<string>
  onDragStart: (animal: AnimalData) => void
}

export function AnimalSidebar({ animals, placedAnimalIds, onDragStart }: AnimalSidebarProps) {
  return (
    <aside
      className="flex flex-col h-full overflow-y-auto"
      style={{
        width: 160,
        minWidth: 160,
        background: '#1e160d',
        borderRight: '2px solid #3a2a1a',
      }}
    >
      <div className="px-3 pt-4 pb-2">
        <h2
          className="text-xs font-mono tracking-[0.2em] uppercase text-center"
          style={{ color: '#a07a4a' }}
        >
          Creatures
        </h2>
        <div className="mt-2 h-px" style={{ background: 'linear-gradient(90deg, transparent, #5a4030, transparent)' }} />
      </div>

      <div className="flex flex-col gap-2 px-2 pb-4 pt-1">
        {animals.map((animal) => {
          const Icon = iconMap[animal.id]
          const isPlaced = placedAnimalIds.has(animal.id)

          return (
            <div
              key={animal.id}
              draggable={!isPlaced}
              onDragStart={(e) => {
                if (isPlaced) return
                e.dataTransfer.setData('text/plain', animal.id)
                onDragStart(animal)
              }}
              className="relative select-none transition-all duration-200"
              style={{
                opacity: isPlaced ? 0.3 : 1,
                cursor: isPlaced ? 'default' : 'grab',
                background: isPlaced ? '#2a1f14' : '#3a2518',
                border: `1.5px solid ${isPlaced ? '#3a2a1a' : tierColors[animal.tier]}`,
                borderRadius: 4,
                padding: '8px 6px',
                boxShadow: isPlaced
                  ? 'none'
                  : 'inset 0 1px 0 rgba(200,135,58,0.1), 0 2px 6px rgba(0,0,0,0.4), 1px 1px 0 #2a1f14, -1px -1px 0 #4a3525',
                filter: isPlaced ? 'grayscale(0.5)' : 'none',
              }}
              title={isPlaced ? `${animal.name} is on the canvas` : `Drag ${animal.name} onto the cave wall`}
            >
              <div className="flex flex-col items-center gap-1">
                {Icon && (
                  <Icon className="w-8 h-8" />
                )}
                <span
                  className="text-[10px] font-mono tracking-wider uppercase"
                  style={{ color: tierColors[animal.tier] }}
                >
                  {animal.name}
                </span>
              </div>
              {!isPlaced && (
                <div
                  className="absolute inset-0 rounded opacity-0 hover:opacity-100 transition-opacity duration-200"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(200,135,58,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

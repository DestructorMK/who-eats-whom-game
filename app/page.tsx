"use client"

import { useState, useCallback } from "react"
import { animals, type AnimalData } from "@/lib/food-web-data"
import { AnimalSidebar } from "@/components/animal-sidebar"
import { CaveCanvas } from "@/components/cave-canvas"

interface PlacedAnimal {
  animal: AnimalData
  x: number
  y: number
}

export default function FoodWebExhibit() {
  const [placedAnimals, setPlacedAnimals] = useState<Map<string, PlacedAnimal>>(new Map())
  const [draggedAnimal, setDraggedAnimal] = useState<AnimalData | null>(null)

  const placedAnimalIds = new Set(placedAnimals.keys())

  const handleDragStart = useCallback((animal: AnimalData) => {
    setDraggedAnimal(animal)
  }, [])

  const handleDrop = useCallback((animalId: string, x: number, y: number) => {
    const animal = animals.find(a => a.id === animalId)
    if (!animal) return
    setPlacedAnimals(prev => {
      const next = new Map(prev)
      next.set(animalId, { animal, x, y })
      return next
    })
    setDraggedAnimal(null)
  }, [])

  const handleRemove = useCallback((animalId: string) => {
    setPlacedAnimals(prev => {
      const next = new Map(prev)
      next.delete(animalId)
      return next
    })
  }, [])

  return (
    <main className="flex h-screen w-screen overflow-hidden" style={{ background: '#1e160d' }}>
      <AnimalSidebar
        animals={animals}
        placedAnimalIds={placedAnimalIds}
        onDragStart={handleDragStart}
      />
      <CaveCanvas
        placedAnimals={placedAnimals}
        onDrop={handleDrop}
        onRemove={handleRemove}
        draggedAnimal={draggedAnimal}
      />
    </main>
  )
}

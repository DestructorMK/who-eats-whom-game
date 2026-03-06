export interface AnimalData {
  id: string
  name: string
  tier: 'apex' | 'predator' | 'prey'
  eats: string[]
}

export const animals: AnimalData[] = [
  { id: 'wolf', name: 'Wolf', tier: 'apex', eats: ['rabbit', 'deer', 'mouse', 'fish'] },
  { id: 'bear', name: 'Bear', tier: 'apex', eats: ['deer', 'fish', 'rabbit', 'fox'] },
  { id: 'eagle', name: 'Eagle', tier: 'predator', eats: ['rabbit', 'snake', 'mouse', 'fish', 'frog'] },
  { id: 'fox', name: 'Fox', tier: 'predator', eats: ['rabbit', 'mouse', 'frog', 'fish'] },
  { id: 'snake', name: 'Snake', tier: 'predator', eats: ['mouse', 'frog'] },
  { id: 'deer', name: 'Deer', tier: 'prey', eats: [] },
  { id: 'rabbit', name: 'Rabbit', tier: 'prey', eats: [] },
  { id: 'mouse', name: 'Mouse', tier: 'prey', eats: [] },
  { id: 'frog', name: 'Frog', tier: 'prey', eats: [] },
  { id: 'fish', name: 'Fish', tier: 'prey', eats: [] },
]

export function getConnections(placedIds: string[]): { from: string; to: string }[] {
  const connections: { from: string; to: string }[] = []
  const placedSet = new Set(placedIds)

  for (const animal of animals) {
    if (!placedSet.has(animal.id)) continue
    for (const preyId of animal.eats) {
      if (placedSet.has(preyId)) {
        connections.push({ from: animal.id, to: preyId })
      }
    }
  }
  return connections
}

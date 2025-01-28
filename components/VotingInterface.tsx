"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

type ChaosEffect = {
  id: string
  name: string
  description: string
  votes: number
}

export default function VotingInterface() {
  const [effects, setEffects] = useState<ChaosEffect[]>([
    { id: "1", name: "Pawn Jump", description: "Pawns can jump over one square", votes: 0 },
    { id: "2", name: "Knight Lines", description: "Knights can move in straight lines", votes: 0 },
    { id: "3", name: "Bishop Teleport", description: "Bishops can teleport to any square", votes: 0 },
  ])

  const handleVote = (effectId: string) => {
    setEffects(effects.map((effect) => (effect.id === effectId ? { ...effect, votes: effect.votes + 1 } : effect)))
  }

  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Chaos Effects</CardTitle>
        <CardDescription>Vote for the next chaos effect</CardDescription>
      </CardHeader>
      <CardContent>
        {effects.map((effect) => (
          <div key={effect.id} className="mb-4">
            <h3 className="font-semibold">{effect.name}</h3>
            <p className="text-sm text-gray-500">{effect.description}</p>
            <div className="flex justify-between items-center mt-2">
              <span>Votes: {effect.votes}</span>
              <Button onClick={() => handleVote(effect.id)}>Vote</Button>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-gray-500">Voting ends in 30 seconds</p>
      </CardFooter>
    </Card>
  )
}

